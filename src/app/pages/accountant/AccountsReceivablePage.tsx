import React, { useState } from "react";
import { ArrowDownToLine, Search, Plus, CheckCircle, Clock } from "lucide-react";
import { cashReceipts, CashReceipt } from "../../data/mockData";
import { KPICard } from "../../components/KPICard";

export function AccountsReceivablePage() {
  const [receipts, setReceipts] = useState<CashReceipt[]>(cashReceipts);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newReceipt, setNewReceipt] = useState<Partial<CashReceipt>>({
    representativeName: "",
    amount: 0,
    notes: "",
    date: new Date().toISOString().split("T")[0],
    status: "مكتمل"
  });

  const totalCollected = receipts.filter(r => r.status === "مكتمل").reduce((sum, r) => sum + r.amount, 0);
  const totalPending = receipts.filter(r => r.status === "معلق").reduce((sum, r) => sum + r.amount, 0);
  const completedCount = receipts.filter(r => r.status === "مكتمل").length;

  const filteredReceipts = receipts.filter(r => 
    r.representativeName.includes(searchTerm) || r.id.includes(searchTerm)
  );

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt.representativeName || !newReceipt.amount) return;

    const receipt: CashReceipt = {
      id: `CR-00${receipts.length + 1}`,
      date: newReceipt.date as string,
      representativeName: newReceipt.representativeName,
      amount: Number(newReceipt.amount),
      notes: newReceipt.notes || "",
      status: newReceipt.status as any,
    };

    setReceipts([receipt, ...receipts]);
    setShowModal(false);
    setNewReceipt({
      representativeName: "",
      amount: 0,
      notes: "",
      date: new Date().toISOString().split("T")[0],
      status: "مكتمل"
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">المدينون (المقبوضات)</h2>
            <p className="text-sm text-slate-500">إدارة النقدية المحصلة من المناديب والعملاء</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          إيصال استلام جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="إجمالي المحصل" value={`${totalCollected.toLocaleString()} ج.م`} icon={<CheckCircle size={24} />} color="green" />
        <KPICard title="مبالغ معلقة" value={`${totalPending.toLocaleString()} ج.م`} icon={<Clock size={24} />} color="orange" />
        <KPICard title="عدد الإيصالات المحصلة" value={completedCount} icon={<ArrowDownToLine size={24} />} color="blue" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
             <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
             <input
                 type="text"
                 placeholder="بحث باسم المندوب أو رقم الإيصال..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
             />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-right whitespace-nowrap">
             <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم الإيصال</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">المندوب</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">البيان</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">المبلغ</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                 {filteredReceipts.map((receipt) => (
                     <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 text-sm font-medium text-slate-600 font-mono">{receipt.id}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{receipt.date}</td>
                         <td className="px-6 py-4 text-sm text-slate-700">{receipt.representativeName}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{receipt.notes}</td>
                         <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                             {receipt.amount.toLocaleString()} ج.م
                         </td>
                         <td className="px-6 py-4">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                               receipt.status === "مكتمل" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"
                             }`}>
                               {receipt.status}
                             </span>
                         </td>
                     </tr>
                 ))}
                 {filteredReceipts.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-slate-500">لم يتم العثور على إيصالات تطابق بحثك.</td>
                   </tr>
                 )}
             </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">إيصال استلام كاش جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleAddReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم المندوب</label>
                <select 
                  required
                  value={newReceipt.representativeName}
                  onChange={e => setNewReceipt({...newReceipt, representativeName: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                >
                  <option value="">-- اختر المندوب --</option>
                  <option value="أحمد محمد السعيد">أحمد محمد السعيد (VAN-001)</option>
                  <option value="محمد علي البحيري">محمد علي البحيري (VAN-002)</option>
                  <option value="خالد إبراهيم سلامة">خالد إبراهيم سلامة (VAN-003)</option>
                  <option value="فيصل محمد الجمال">فيصل محمد الجمال (VAN-006)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">المبلغ (ج.م)</label>
                  <input 
                    type="number" required min="1"
                    value={newReceipt.amount || ""}
                    onChange={e => setNewReceipt({...newReceipt, amount: Number(e.target.value)})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">التاريخ</label>
                  <input 
                    type="date" required
                    value={newReceipt.date}
                    onChange={e => setNewReceipt({...newReceipt, date: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ملاحظات / البيان</label>
                <textarea 
                  rows={2} required
                  value={newReceipt.notes}
                  onChange={e => setNewReceipt({...newReceipt, notes: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="مثال: توريد مبيعات اليوم..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  حفظ الإيصال
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
