import React, { useState } from "react";
import { ArrowUpFromLine, Search, Plus, CheckCircle, X } from "lucide-react";
import { expenseRecords, ExpenseRecord } from "../../data/mockData";

export function AccountsPayablePage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(expenseRecords);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // حالات فلترة التاريخ
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterDay, setFilterDay] = useState<string>("");

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = ["2024", "2025", "2026"];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // منطق الفلترة المدمج (بحث + تاريخ)
  const filteredExpenses = expenses.filter(r => {
    const matchesSearch = r.category.includes(searchTerm) || r.notes.includes(searchTerm) || r.id.includes(searchTerm);
    const [year, month, day] = r.date.split("-");
    
    const matchesYear = filterYear ? year === filterYear : true;
    const matchesMonth = filterMonth ? parseInt(month).toString() === filterMonth : true;
    const matchesDay = filterDay ? parseInt(day).toString() === filterDay : true;

    return matchesSearch && matchesYear && matchesMonth && matchesDay;
  });

  const totalExpenses = filteredExpenses.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 relative">
      {/* الهيدر: العنوان والفلترة والزرار */}
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

        {/* الفلترة وزرار الإضافة */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer">
              <option value="">اليوم</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer">
              <option value="">الشهر</option>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer">
              <option value="">السنة</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
             مصروف جديد
          </button>
        </div>
      </div>

      {/* تصميم الإجمالي العريض (نفس ستايل الواردات باللون الأحمر) */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between px-4">
          <div className="flex flex-col">
            <p className="text-red-100 text-sm font-medium mb-1">إجمالي المصروفات الصادرة</p>
            <h3 className="text-5xl font-black">
              {totalExpenses.toLocaleString()} 
              <span className="text-xl font-normal opacity-80 mr-2">ج.م</span>
            </h3>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
             </div>
             <div className="flex flex-col">
                <span className="text-2xl font-bold leading-tight">{filteredExpenses.length}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">عملية مسجلة حالياً</span>
             </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* الجدول والبحث */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 text-right">
          <div className="relative max-w-md mr-0 ml-auto">
             <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
             <input
                 type="text"
                 placeholder="بحث بالفئة أو الملاحظات..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
             <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                     <th className="px-6 py-4 text-xs text-slate-500">رقم المصروف</th>
                     <th className="px-6 py-4 text-xs text-slate-500">التاريخ</th>
                     <th className="px-6 py-4 text-xs text-slate-500">الفئة</th>
                     <th className="px-6 py-4 text-xs text-slate-500">البيان / الملاحظات</th>
                     <th className="px-6 py-4 text-xs text-slate-500">المبلغ</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                 {filteredExpenses.map((expense) => (
                     <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 text-sm font-bold text-slate-600 font-mono">{expense.id}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{expense.date}</td>
                         <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs border border-slate-200 font-medium">
                                {expense.category}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-700 italic">{expense.notes}</td>
                         <td className="px-6 py-4 text-sm font-black text-red-600 text-lg">
                             {expense.amount.toLocaleString()} ج.م
                         </td>
                     </tr>
                 ))}
             </tbody>
          </table>
          {filteredExpenses.length === 0 && (
             <div className="py-20 text-center text-slate-400">
                لا توجد مصروفات تطابق اختياراتك.
             </div>
          )}
        </div>
      </div>

      {/* Modal تسجيل مصروف جديد */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">تسجيل مصروف جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mr-1">الفئة</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-slate-50/50">
                   <option value="بنزين">بنزين</option>
                   <option value="تالف">تالف</option>
                   <option value="مستلزمات سيارات">مستلزمات سيارات</option>
                   <option value="سلف">سلف عاملين</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">المبلغ (ج.م)</label>
                  <input type="number" placeholder="0.00" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 mr-1">التاريخ</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mr-1">البيان / تفاصيل المصروف</label>
                <textarea rows={3} placeholder="اكتب تفاصيل المصروف هنا..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">حفظ المصروف</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}