import React, { useState } from "react";
import { ArrowUpFromLine, Search, Plus, DollarSign, Droplet, Wrench, Wallet } from "lucide-react";
import { expenseRecords, ExpenseRecord } from "../../data/mockData";
import { KPICard } from "../../components/KPICard";

export function AccountsPayablePage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(expenseRecords);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
    category: "بنزين",
    amount: 0,
    notes: "",
    date: new Date().toISOString().split("T")[0],
    status: "مدفوع"
  });

  const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0);
  const fuelTotal = expenses.filter(r => r.category === "بنزين").reduce((sum, r) => sum + r.amount, 0);
  const advancesTotal = expenses.filter(r => r.category === "سلف").reduce((sum, r) => sum + r.amount, 0);
  const damageTotal = expenses.filter(r => r.category === "تالف").reduce((sum, r) => sum + r.amount, 0);

  const filteredExpenses = expenses.filter(r => 
    r.category.includes(searchTerm) || r.notes.includes(searchTerm) || r.id.includes(searchTerm)
  );

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    const expense: ExpenseRecord = {
      id: `EXP-00${expenses.length + 1}`,
      date: newExpense.date as string,
      category: newExpense.category as any,
      amount: Number(newExpense.amount),
      notes: newExpense.notes || "",
      status: newExpense.status as any,
    };

    setExpenses([expense, ...expenses]);
    setShowModal(false);
    setNewExpense({
      category: "بنزين",
      amount: 0,
      notes: "",
      date: new Date().toISOString().split("T")[0],
      status: "مدفوع"
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <ArrowUpFromLine size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">الدائنون (المصروفات)</h2>
            <p className="text-sm text-slate-500">إدارة وتسجيل النفقات الصادرة من الشركة</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          تسجيل مصروف جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="إجمالي المصروفات" value={`${totalExpenses.toLocaleString()} ج.م`} icon={<DollarSign size={24} />} color="red" />
        <KPICard title="إجمالي البنزين" value={`${fuelTotal.toLocaleString()} ج.م`} icon={<Droplet size={24} />} color="orange" />
        <KPICard title="إجمالي السلف" value={`${advancesTotal.toLocaleString()} ج.م`} icon={<Wallet size={24} />} color="cyan" />
        <KPICard title="إجمالي التوالف" value={`${damageTotal.toLocaleString()} ج.م`} icon={<Wrench size={24} />} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
             <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
             <input
                 type="text"
                 placeholder="بحث بالفئة أو الملاحظات..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
             />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-right whitespace-nowrap">
             <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم المصروف</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">الفئة</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">البيان / الملاحظات</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">المبلغ</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                 {filteredExpenses.map((expense) => (
                     <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 text-sm font-medium text-slate-600 font-mono">{expense.id}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{expense.date}</td>
                         <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg text-xs border border-slate-200">
                                {expense.category}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-700">{expense.notes}</td>
                         <td className="px-6 py-4 text-sm font-bold text-red-600">
                             {expense.amount.toLocaleString()} ج.م
                         </td>
                         <td className="px-6 py-4">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                               expense.status === "مدفوع" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"
                             }`}>
                               {expense.status}
                             </span>
                         </td>
                     </tr>
                 ))}
                 {filteredExpenses.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-slate-500">لم يتم العثور على مصروفات تطابق بحثك.</td>
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
              <h3 className="font-bold text-slate-800">تسجيل مصروف جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">فئة المصروف</label>
                <select 
                  required
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 appearance-none bg-white"
                >
                  <option value="بنزين">بنزين</option>
                  <option value="تالف">تالف</option>
                  <option value="مستلزمات سيارات">مستلزمات سيارات</option>
                  <option value="سلف">سلف عاملين</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">المبلغ (ج.م)</label>
                  <input 
                    type="number" required min="1"
                    value={newExpense.amount || ""}
                    onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">التاريخ</label>
                  <input 
                    type="date" required
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">البيان / تفاصيل المصروف</label>
                <textarea 
                  rows={2} required
                  value={newExpense.notes}
                  onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="مثال: فاتورة بنزين لسيارة VAN-002"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  حفظ المصروف
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
