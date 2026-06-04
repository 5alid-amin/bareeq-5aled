import React, { useState, useEffect } from "react";
import { ArrowUpFromLine, Search, Plus, CheckCircle, X, Edit2, Trash2, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "http://pareeq.runasp.net/api";

export function AccountsPayablePage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [newCategoryName, setNewCategoryName] = useState("");

  const [isVehicleLinked, setIsVehicleLinked] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterDay, setFilterDay] = useState<string>("");

  // --- إضافة حالات الـ Pagination ---
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = ["2024", "2025", "2026"];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // 1. استلام الداتا من الـ API مع الباجينيشن
  const fetchExpenses = async () => {
    setLoading(true);
    try {

      const response = await axios.get(`${API_BASE_URL}/Expense/GetAll`, {
        params: {
          search: searchTerm,
          day: filterDay || null,
          month: filterMonth || null,
          year: filterYear || null,
          pageNumber: pageNumber,
          pageSize: pageSize
        }
      });
      setExpenses(response.data.data);
      setTotalAmount(response.data.totalAmount);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Expense/GetLookupData`);
      if (response.data) {
        setCategories(response.data.employees || []);
        setVehicles(response.data.vehicles || []);
      }
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [searchTerm, filterDay, filterMonth, filterYear, pageNumber]);

  useEffect(() => {
    fetchLookups();
  }, []);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف نهائياً؟")) {
      try {
        await axios.delete(`${API_BASE_URL}/Expense/Delete?id=${id}`);
        fetchExpenses();
      } catch (error) {
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await axios.post(`${API_BASE_URL}/Expense/CreateCategory`, {
          categoryName: newCategoryName.trim()
        });
        await fetchLookups();
        setNewCategoryName("");
        setShowCategoryModal(false);
      } catch (error) {
        alert("خطأ في إضافة الفئة");
      }
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      categoryId: parseInt(formData.get("categoryId") as string),
      vehicleId: isVehicleLinked ? parseInt(formData.get("vehicleId") as string) : null,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date"),
      statement: formData.get("statement")
    };

    try {
      if (editingExpense) {
        await axios.put(`${API_BASE_URL}/Expense/Update?id=${editingExpense.id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/Expense/Create`, payload);
      }
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      alert("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsVehicleLinked(!!expense.vehiclePlate && expense.vehiclePlate !== "بدون عربية");
    setShowModal(true);
  };

  return (
    <div className="space-y-6 relative text-right" dir="rtl">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <ArrowUpFromLine size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">الدائنون (المصروفات)</h2>
            <p className="text-sm text-slate-500">إدارة وتسجيل النفقات الصادرة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm font-sans">
            <select value={filterDay} onChange={(e) => { setFilterDay(e.target.value); setPageNumber(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none">
              <option value="">اليوم</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setPageNumber(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none">
              <option value="">الشهر</option>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPageNumber(1); }} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer outline-none">
              <option value="">السنة</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setEditingExpense(null); setIsVehicleLinked(false); setShowModal(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            مصروف جديد
          </button>
        </div>
      </div>

      {/* البانر الإجمالي */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between px-4">
          <div className="flex flex-col">
            <p className="text-red-100 text-sm font-medium mb-1">إجمالي المصروفات الصادرة</p>
            <h3 className="text-5xl font-black">
              {totalAmount.toLocaleString()}
              <span className="text-xl font-normal opacity-80 mr-2">ج.م</span>
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold leading-tight">{totalRecords}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">عملية مسجلة حالياً</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 text-right">
          <div className="relative max-w-md mr-0 ml-auto">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالفئة أو الملاحظات..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[200px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
          )}
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                <th className="px-6 py-4 text-xs text-slate-500">رقم المصروف</th>
                <th className="px-6 py-4 text-xs text-slate-500">التاريخ</th>
                <th className="px-6 py-4 text-xs text-slate-500">الفئة</th>
                <th className="px-6 py-4 text-xs text-slate-500">البيان / الملاحظات</th>
                <th className="px-6 py-4 text-xs text-slate-500">المبلغ</th>
                <th className="px-6 py-4 text-xs text-slate-500 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 font-mono">EXP-{expense.id.toString().padStart(3, '0')}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(expense.date).toLocaleDateString('en-CA')}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs border border-slate-200 font-medium">
                      {expense.categoryName}
                    </span>
                    {expense.vehiclePlate !== "بدون عربية" && (
                      <span className="mr-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] border border-blue-100 font-bold">
                        {expense.vehiclePlate}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 italic">{expense.statement}</td>
                  <td className="px-6 py-4 text-sm font-black text-red-600 text-lg">
                    {expense.amount.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && expenses.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              لا توجد مصروفات تطابق اختياراتك.
            </div>
          )}
        </div>

        {/* --- تعديل: جزء التحكم في الصفحات (Pagination UI) ليكون في المنتصف --- */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2" dir="ltr">
            <button
              disabled={pageNumber <= 1 || loading}
              onClick={() => setPageNumber(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all bg-white"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPageNumber(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pageNumber === num
                      ? "bg-red-600 text-white shadow-md shadow-red-100"
                      : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              disabled={pageNumber >= totalPages || loading}
              onClick={() => setPageNumber(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all bg-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-medium">
            عرض {(pageNumber - 1) * pageSize + 1} إلى {Math.min(pageNumber * pageSize, totalRecords)} من {totalRecords} عملية
          </div>
        </div>
      </div>

      {/* Modal تسجيل مصروف */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-right" dir="rtl">
              <h3 className="text-lg font-bold text-slate-800">
                {editingExpense ? "تعديل بيانات المصروف" : "تسجيل مصروف جديد"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <form className="p-6 space-y-4 text-right" dir="rtl" onSubmit={handleSaveExpense}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mr-1">الفئة</label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    defaultValue={editingExpense?.categoryId || ""}
                    required
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-slate-50/50"
                  >
                    <option value="">-- اختر الفئة --</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
                    title="إضافة فئة جديدة"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">ربط المصروف بسيارة؟</label>
                  <input
                    type="checkbox"
                    checked={isVehicleLinked}
                    onChange={(e) => setIsVehicleLinked(e.target.checked)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>
                <select
                  name="vehicleId"
                  disabled={!isVehicleLinked}
                  defaultValue={editingExpense?.vehicleId || ""}
                  required={isVehicleLinked}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none transition-all ${isVehicleLinked ? "bg-white border-red-200 focus:ring-2 focus:ring-red-500" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <option value="">-- اختر السيارة --</option>
                  {vehicles.map(v => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.plateNumber || v.vehicleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">المبلغ (ج.م)</label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    required
                    defaultValue={editingExpense?.amount || ""}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">التاريخ</label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={editingExpense ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mr-1">البيان / تفاصيل المصروف</label>
                <textarea
                  name="statement"
                  rows={3}
                  placeholder="اكتب تفاصيل المصروف هنا..."
                  defaultValue={editingExpense?.statement || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">
                  {editingExpense ? "تحديث المصروف" : "حفظ المصروف"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal إضافة فئة جديدة */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-xl p-5 text-right" dir="rtl">
            <h4 className="font-bold text-slate-800 mb-4">إضافة فئة مصروفات</h4>
            <input
              type="text"
              autoFocus
              placeholder="اسم الفئة (مثلاً: إيجار)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors"
              >
                حفظ
              </button>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}