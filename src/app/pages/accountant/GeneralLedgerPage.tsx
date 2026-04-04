import React, { useState } from "react";
import { BookOpen, TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart as RechartsPieChart, Pie, Cell
} from "recharts";
import { KPICard } from "../../components/KPICard";
import { journalEntries } from "../../data/mockData";

export function GeneralLedgerPage() {
  const totalRevenues = journalEntries.filter(e => e.accountType === "إيرادات").reduce((sum, e) => sum + e.debit + e.credit, 0);
  const totalExpenses = journalEntries.filter(e => e.accountType === "مصروفات").reduce((sum, e) => sum + e.debit + e.credit, 0);
  const totalAssets = journalEntries.filter(e => e.accountType === "أصول").reduce((sum, e) => sum + e.debit, 0);
  const totalLiabilities = journalEntries.filter(e => e.accountType === "خصوم").reduce((sum, e) => sum + e.credit, 0);

  // Mock data for charts
  const monthlyData = [
    { month: "يناير", revenues: 120000, expenses: 85000 },
    { month: "فبراير", revenues: 135000, expenses: 90000 },
    { month: "مارس", revenues: 110000, expenses: 75000 },
  ];

  const expenseBreakdown = [
    { name: "رواتب", value: 45000 },
    { name: "صيانة أسطول", value: 15000 },
    { name: "بنزين", value: 10000 },
    { name: "أخرى", value: 5000 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">دفتر الأستاذ العام</h2>
          <p className="text-sm text-slate-500">نظرة عامة على الإيرادات والمصروفات والأصول</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="إجمالي الإيرادات" value={`${totalRevenues.toLocaleString()} ج.م`} icon={<TrendingUp size={24} />} color="green" />
        <KPICard title="إجمالي المصروفات" value={`${totalExpenses.toLocaleString()} ج.م`} icon={<TrendingDown size={24} />} color="red" />
        <KPICard title="إجمالي الأصول" value={`${totalAssets.toLocaleString()} ج.م`} icon={<DollarSign size={24} />} color="blue" />
        <KPICard title="إجمالي الخصوم" value={`${totalLiabilities.toLocaleString()} ج.م`} icon={<Activity size={24} />} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">الإيرادات مقابل المصروفات</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenues" name="الإيرادات" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <PieChart size={16} /> توزيع المصروفات
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ج.م`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseBreakdown.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">أحدث القيود اليومية</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs text-right">
                <th className="px-5 py-3 font-medium">رقم القيد</th>
                <th className="px-5 py-3 font-medium">التاريخ</th>
                <th className="px-5 py-3 font-medium">البيان</th>
                <th className="px-5 py-3 font-medium">النوع</th>
                <th className="px-5 py-3 font-medium text-emerald-600">مدين (Debit)</th>
                <th className="px-5 py-3 font-medium text-red-500">دائن (Credit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journalEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 text-sm">
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">{entry.id}</td>
                  <td className="px-5 py-3 text-slate-600">{entry.date}</td>
                  <td className="px-5 py-3 text-slate-800">{entry.description}</td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">
                      {entry.accountType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-emerald-600 font-medium">
                    {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                  </td>
                  <td className="px-5 py-3 text-red-500 font-medium">
                    {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
