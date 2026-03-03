import React, { useState } from "react";
import { FileText, Download, TrendingUp, Package, DollarSign, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { dailySalesData, monthlySalesData, products, vans } from "../../data/mockData";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

const categoryData = [
  { name: "منظفات سائلة", value: 35 },
  { name: "مساحيق الغسيل", value: 28 },
  { name: "منظفات عامة", value: 18 },
  { name: "معطرات", value: 10 },
  { name: "أخرى", value: 9 },
];

const profitData = monthlySalesData.map((m) => ({
  label: m.label,
  revenue: m.sales,
  cost: Math.round(m.sales * 0.55),
  expenses: Math.round(m.sales * 0.09),
  profit: m.profit,
}));

const REPORT_TYPES = [
  { id: "daily", label: "تقرير المبيعات اليومي", icon: <TrendingUp size={18} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { id: "monthly", label: "تقرير المبيعات الشهري", icon: <BarChart2 size={18} />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { id: "inventory", label: "تقرير المخزون", icon: <Package size={18} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { id: "profit", label: "تقرير الأرباح والخسائر", icon: <DollarSign size={18} />, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
];

export function Reports() {
  const [activeReport, setActiveReport] = useState("daily");

  const totalRevenue = monthlySalesData.reduce((s, m) => s + m.sales, 0);
  const totalProfit = monthlySalesData.reduce((s, m) => s + m.profit, 0);
  const totalCost = Math.round(totalRevenue * 0.55);
  const totalExpenses = Math.round(totalRevenue * 0.09);

  return (
    <div className="space-y-5">
      {/* Report type selector */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm transition-all text-right ${activeReport === r.id ? `${r.bg} ${r.border} shadow-md` : "bg-white border-slate-100 hover:shadow-sm"}`}
          >
            <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center ${r.color} flex-shrink-0`}>
              {r.icon}
            </div>
            <div>
              <p className={`text-sm ${activeReport === r.id ? r.color : "text-slate-700"}`}>{r.label}</p>
              <p className="text-slate-400 text-xs mt-0.5">عرض التقرير</p>
            </div>
          </button>
        ))}
      </div>

      {/* Daily Sales Report */}
      {activeReport === "daily" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-700 text-base">تقرير المبيعات اليومي — الأسبوع الحالي</h2>
            <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm hover:bg-slate-50">
              <Download size={14} />
              تصدير
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailySalesData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f8fafc", fontSize: 12 }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString("ar-EG")} ج.م`, name === "sales" ? "المبيعات" : "الأرباح"]}
                />
                <Bar dataKey="sales" fill="#3b82f6" name="sales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-700 text-sm">تفصيل مبيعات الفانات اليوم</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-right text-slate-400 text-xs px-5 py-3">الفان</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">السائق</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">المبيعات</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vans.map((van) => (
                  <tr key={van.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700 text-sm">{van.id}</td>
                    <td className="px-5 py-3 text-slate-600 text-sm">{van.driverName}</td>
                    <td className="px-5 py-3 text-emerald-600 text-sm">
                      {van.totalSalesToday > 0 ? `${van.totalSalesToday.toLocaleString("ar-EG")} ج.م` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${van.status === "نشطة" ? "bg-emerald-100 text-emerald-700" : van.status === "تحميل" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                        {van.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Sales Report */}
      {activeReport === "monthly" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-700 text-base">تقرير المبيعات الشهري — 2025/2026</h2>
            <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm hover:bg-slate-50">
              <Download size={14} />
              تصدير PDF
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "إجمالي الإيرادات", value: `${(totalRevenue / 1000).toFixed(0)}k ج.م`, color: "text-blue-600" },
              { label: "إجمالي الأرباح", value: `${(totalProfit / 1000).toFixed(0)}k ج.م`, color: "text-emerald-600" },
              { label: "هامش الربح", value: `${Math.round((totalProfit / totalRevenue) * 100)}%`, color: "text-purple-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                <p className={`text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlySalesData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f8fafc", fontSize: 12 }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString("ar-EG")} ج.م`, name === "sales" ? "المبيعات" : "الأرباح"]}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} name="sales" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} name="profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {activeReport === "inventory" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-700 text-base">تقرير المخزون الرئيسي</h2>
            <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm hover:bg-slate-50">
              <Download size={14} />
              تصدير Excel
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-700 text-sm mb-4">توزيع المنتجات حسب الفئة</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-slate-700 text-sm">المنتجات وحالة المخزون</h3>
              </div>
              <div className="overflow-y-auto max-h-64">
                <table className="w-full">
                  <thead className="sticky top-0">
                    <tr className="bg-slate-50">
                      <th className="text-right text-slate-400 text-xs px-4 py-2.5">المنتج</th>
                      <th className="text-right text-slate-400 text-xs px-4 py-2.5">الكمية</th>
                      <th className="text-right text-slate-400 text-xs px-4 py-2.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-700 text-xs">{p.name}</td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs">{p.quantity}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.quantity < p.minQuantity ? "bg-red-100 text-red-600" : p.quantity < p.minQuantity * 2 ? "bg-yellow-100 text-yellow-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {p.quantity < p.minQuantity ? "منخفض" : p.quantity < p.minQuantity * 2 ? "متوسط" : "جيد"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit Report */}
      {activeReport === "profit" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-700 text-base">تقرير الأرباح والخسائر</h2>
            <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm hover:bg-slate-50">
              <Download size={14} />
              تصدير
            </button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الإيرادات", value: totalRevenue, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "تكلفة البضاعة", value: totalCost, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "المصروفات التشغيلية", value: totalExpenses, color: "text-red-500", bg: "bg-red-50" },
              { label: "صافي الأرباح", value: totalProfit, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
                <p className={`text-xl ${s.color}`}>{(s.value / 1000).toFixed(0)}k ج.م</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                <p className="text-slate-400 text-xs">{Math.round((s.value / totalRevenue) * 100)}% من الإيرادات</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-600 text-sm mb-4">تحليل الأرباح الشهري</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={profitData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f8fafc", fontSize: 12 }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString("ar-EG")} ج.م`,
                    name === "revenue" ? "الإيرادات" : name === "cost" ? "التكلفة" : name === "expenses" ? "المصروفات" : "الأرباح"
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="revenue" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="profit" fill="#10b981" name="profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
