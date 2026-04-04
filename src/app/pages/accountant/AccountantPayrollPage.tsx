import React, { useState } from "react";
import { DollarSign, FileText, CheckCircle, Wallet, Plus, Coins, TrendingDown, Users } from "lucide-react";
import { payrollRecords as initialRecords, PayrollRecord, users } from "../../data/mockData";
import { KPICard } from "../../components/KPICard";

export function AccountantPayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>(initialRecords);
  const [activeTab, setActiveTab] = useState<"overview" | "deductions" | "bonuses">("overview");
  const [showModal, setShowModal] = useState<"deduction" | "bonus" | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    amount: 0,
    reason: ""
  });

  const totalPayroll = records.reduce((sum, r) => sum + r.netPay, 0);
  const totalDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
  const totalBonuses = records.reduce((sum, r) => sum + r.bonuses, 0);

  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.amount) return;

    setRecords(records.map(record => {
      if (record.employeeId === formData.employeeId) {
        if (showModal === "deduction") {
          const newDeductions = record.deductions + formData.amount;
          return { ...record, deductions: newDeductions, netPay: (record.baseSalary + record.bonuses) - newDeductions };
        } else {
          const newBonuses = record.bonuses + formData.amount;
          return { ...record, bonuses: newBonuses, netPay: (record.baseSalary + newBonuses) - record.deductions };
        }
      }
      return record;
    }));

    setShowModal(null);
    setFormData({ employeeId: "", amount: 0, reason: "" });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">الرواتب والأجور</h2>
            <p className="text-sm text-slate-500">متابعة الرواتب، وتسجيل المكافآت والخصومات</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal("deduction")}
            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <TrendingDown size={16} />
            خصم جديد
          </button>
          <button 
            onClick={() => setShowModal("bonus")}
            className="bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Coins size={16} />
            مكافأة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="إجمالي الرواتب الصافية" value={`${totalPayroll.toLocaleString()} ج.م`} icon={<Wallet size={24} />} color="blue" />
        <KPICard title="إجمالي المكافآت" value={`${totalBonuses.toLocaleString()} ج.م`} icon={<DollarSign size={24} />} color="green" />
        <KPICard title="إجمالي الخصومات" value={`${totalDeductions.toLocaleString()} ج.م`} icon={<FileText size={24} />} color="red" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "overview" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            مسير الرواتب (نظرة عامة)
          </button>
          <button
            onClick={() => setActiveTab("bonuses")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "bonuses" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            المكافآت والبدلات
          </button>
          <button
            onClick={() => setActiveTab("deductions")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "deductions" ? "text-red-600 border-b-2 border-red-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            الخصومات والسلف
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "overview" && (
            <table className="w-full text-right whitespace-nowrap">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">الموظف</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">الراتب الأساسي</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">المكافآت</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">الخصومات</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">صافي الراتب</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
                                        <Users size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{record.employeeName}</p>
                                        <p className="text-xs text-slate-400">{record.role}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{record.baseSalary.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-emerald-600 font-medium">+{record.bonuses.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">-{record.deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">ج.م {record.netPay.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${record.status === "مدفوع" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                    {record.status === "مدفوع" && <CheckCircle size={14} />} {record.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}

          {activeTab === "bonuses" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">إجمالي المكافآت (الشهر الحالي)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.filter(r => r.bonuses > 0).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.employeeName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">+{record.bonuses.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "deductions" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">إجمالي الخصومات (الشهر الحالي)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.filter(r => r.deductions > 0).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.employeeName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">-{record.deductions.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${showModal === "deduction" ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
              <h3 className={`font-bold ${showModal === "deduction" ? "text-red-800" : "text-emerald-800"}`}>
                {showModal === "deduction" ? "تسجيل خصم جديد" : "تسجيل مكافأة جديدة"}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleAddAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">الموظف</label>
                <select 
                  required
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm appearance-none bg-white focus:ring-2 ${showModal === "deduction" ? "border-slate-200 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-500"}`}
                >
                  <option value="">-- اختر الموظف --</option>
                  {records.map(u => (
                    <option key={u.employeeId} value={u.employeeId}>{u.employeeName} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">المبلغ (ج.م)</label>
                <input 
                  type="number" required min="1"
                  value={formData.amount || ""}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ${showModal === "deduction" ? "border-slate-200 focus:ring-red-500 text-red-600" : "border-slate-200 focus:ring-emerald-500 text-emerald-600"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">السبب / البيان</label>
                <textarea 
                  rows={2} required
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 ${showModal === "deduction" ? "border-slate-200 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-500"}`}
                  placeholder={showModal === "deduction" ? "تأخير، غياب، سلفة..." : "أداء ممتاز، تحقيق التارجت..."}
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="submit" className={`flex-1 text-white py-2.5 rounded-xl text-sm font-medium transition-colors ${showModal === "deduction" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  حفظ 
                </button>
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
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
