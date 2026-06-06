import React, { useState, useEffect } from "react";
import { ArrowDownToLine, Search, Plus, CheckCircle, X, Edit2, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

// تأكد من صحة مسار الـ API الخاص بك
// const API_BASE_URL = "${import.meta.env.VITE_API_URL}";
const API_BASE_URL = "https://pareeq.runasp.net/api";


interface ExtendedCashReceipt {
  receiptId: number;
  date: string;
  amount: number;
  statement: string;
  employeeName: string;
  vehiclePlate: string;
  employeeId?: number;
  vehicleId?: number;
}

export function AccountsReceivablePage() {
  const [receipts, setReceipts] = useState<ExtendedCashReceipt[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [editingReceipt, setEditingReceipt] = useState<ExtendedCashReceipt | null>(null);

  const [representatives, setRepresentatives] = useState<{ employeeId: number, fullName: string }[]>([]);
  const [cars, setCars] = useState<{ vehicleId: number, vehicleName: string }[]>([]);

  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterDay, setFilterDay] = useState<string>("");

  // --- حالات الباجينيشن الجديدة ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = ["2024", "2025", "2026"];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const fetchLookupData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Revenue/GetLookupData`);
      if (response.ok) {
        const data = await response.json();
        setRepresentatives(data.employees);
        setCars(data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterDay) queryParams.append('day', filterDay);
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);
      if (searchTerm) queryParams.append('search', searchTerm);

      // إرسال معلومات الصفحة
      queryParams.append('pageNumber', currentPage.toString());
      queryParams.append('pageSize', pageSize.toString());

      const response = await fetch(`${API_BASE_URL}/Revenue/GetAll?${queryParams.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setReceipts(result.data || []);

        // تحديث معلومات الصفحات من الـ API
        setTotalRecords(result.totalRecords || 0);
        setTotalPages(Math.ceil((result.totalRecords || 0) / pageSize));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLookupData();
    fetchReceipts();
  }, [filterDay, filterMonth, filterYear, searchTerm, currentPage]); // أضفنا currentPage هنا

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      employeeId: parseInt(formData.get("employeeId") as string),
      vehicleId: parseInt(formData.get("vehicleId") as string),
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date"),
      statement: formData.get("notes")
    };

    try {
      const url = editingReceipt
        ? `${API_BASE_URL}/Revenue/Update?id=${editingReceipt.receiptId}`
        : `${API_BASE_URL}/Revenue/Create`;

      const method = editingReceipt ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingReceipt(null);
        fetchReceipts();
      } else {
        const errorData = await response.json();
        alert("فشل الحفظ: " + (errorData.title || "خطأ غير معروف"));
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        const response = await fetch(`${API_BASE_URL}/Revenue/Delete?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchReceipts();
        }
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleEdit = (receipt: ExtendedCashReceipt) => {
    setEditingReceipt(receipt);
    setShowModal(true);
  };

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 relative text-right" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">المدينون (المقبوضات)</h2>
            <p className="text-sm text-slate-500">متابعة المبالغ والسيارات</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm font-sans flex-wrap">
            <select value={filterDay} onChange={(e) => { setFilterDay(e.target.value); setCurrentPage(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none flex-1 sm:flex-none">
              <option value="">اليوم</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none flex-1 sm:flex-none">
              <option value="">الشهر</option>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none flex-1 sm:flex-none">
              <option value="">السنة</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setEditingReceipt(null); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            <Plus size={18} />
            وارد جديد
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 px-4 text-center sm:text-right">
          <div className="flex flex-col">
            <p className="text-emerald-100 text-sm font-medium mb-1 text-center sm:text-right">إجمالي المبالغ المحصلة</p>
            <h3 className="text-4xl sm:text-5xl font-black break-all">
              {totalAmount.toLocaleString()}
              <span className="text-lg sm:text-xl font-normal opacity-80 mr-2">ج.م</span>
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center justify-center gap-3 border border-white/10 w-full sm:w-auto">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-2xl font-bold leading-tight">{totalRecords}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">إيصال كلي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md mr-auto ml-0">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              type="text"
              placeholder="بحث سريع..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-right"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                <th className="px-6 py-4 text-xs text-slate-500 text-right">رقم الإيصال</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-right">التاريخ</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-right">المندوب</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-right">السيارة</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-right">البيان</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-right">المبلغ</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">جاري تحميل البيانات...</td></tr>
              ) : receipts.map((receipt) => (
                <tr key={receipt.receiptId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">CR-{receipt.receiptId}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">{receipt.date ? receipt.date.split('T')[0] : "---"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 text-right">{receipt.employeeName || "غير معروف"}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium text-right">
                    <span className="bg-blue-50 px-2 py-1 rounded-md">{receipt.vehiclePlate || "---"}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">{receipt.statement || "لا يوجد بيان"}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 text-lg text-right">
                    {receipt.amount.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(receipt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(receipt.receiptId)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Pagination UI الجديد --- */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-center gap-2" dir="ltr">
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm border ${currentPage === page
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingReceipt ? "تعديل إيصال تحصيل" : "إضافة إيصال تحصيل جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">المندوب</label>
                  <select name="employeeId" required defaultValue={editingReceipt?.employeeId || ""} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right outline-none bg-slate-50/50">
                    <option value="">-- اختر المندوب --</option>
                    {representatives.map(rep => <option key={rep.employeeId} value={rep.employeeId}>{rep.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">السيارة</label>
                  <select name="vehicleId" required defaultValue={editingReceipt?.vehicleId || ""} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right outline-none bg-slate-50/50">
                    <option value="">-- اختر السيارة --</option>
                    {cars.map(car => <option key={car.vehicleId} value={car.vehicleId}>{car.vehicleName}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">المبلغ (ج.م)</label>
                  <input type="number" name="amount" required step="0.01" defaultValue={editingReceipt?.amount || ""} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">التاريخ</label>
                  <input type="date" name="date" required defaultValue={editingReceipt?.date ? editingReceipt.date.split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mr-1">البيان / ملاحظات</label>
                <textarea name="notes" rows={3} defaultValue={editingReceipt?.statement || ""} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right outline-none resize-none" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  {editingReceipt ? "تحديث البيانات" : "حفظ البيانات"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}