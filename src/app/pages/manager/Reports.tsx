import React, { useState } from "react";
import { Download, TrendingUp, Package, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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

const profitDataMonthly = monthlySalesData.map((m) => ({
  label: m.label,
  revenue: m.sales,
  profit: m.profit,
  loss: Math.round(m.sales * 0.1), // Mocked loss for visualization
}));

const profitDataWeekly = [
  { label: "الأسبوع الأول", revenue: 85000, profit: 24000, loss: 8000 },
  { label: "الأسبوع الثاني", revenue: 92000, profit: 27500, loss: 8500 },
  { label: "الأسبوع الثالث", revenue: 78000, profit: 21500, loss: 7200 },
  { label: "الأسبوع الرابع", revenue: 105000, profit: 32000, loss: 9500 },
];

const profitDataYearly = [
  { label: "يناير", revenue: 425000, profit: 142000, loss: 42500 },
  { label: "فبراير", revenue: 398000, profit: 131000, loss: 39800 },
  { label: "مارس", revenue: 142000, profit: 48000, loss: 14200 },
  { label: "أبريل", revenue: 160000, profit: 54000, loss: 16000 },
  { label: "مايو", revenue: 210000, profit: 70000, loss: 21000 },
  { label: "يونيو", revenue: 250000, profit: 82000, loss: 25000 },
  { label: "يوليو", revenue: 290000, profit: 94000, loss: 29000 },
  { label: "أغسطس", revenue: 320000, profit: 98000, loss: 32000 },
  { label: "سبتمبر", revenue: 285000, profit: 85000, loss: 28500 },
  { label: "أكتوبر", revenue: 350000, profit: 112000, loss: 35000 },
  { label: "نوفمبر", revenue: 410000, profit: 138000, loss: 41000 },
  { label: "ديسمبر", revenue: 390000, profit: 125000, loss: 39000 },
];

const profitDataDaily = dailySalesData.map((d) => ({
  label: d.label,
  revenue: d.sales,
  profit: d.profit,
  loss: Math.round(d.sales * 0.08), // Mocked loss
}));

export function Reports() {
  const [activeTab, setActiveTab] = useState<"sales" | "inventory">("sales");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year">("week");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Determine which data to show based on filter
  let chartData;
  switch (timeFilter) {
    case "today":
      chartData = [profitDataDaily[profitDataDaily.length - 1]];
      break;
    case "week":
      chartData = profitDataDaily; // Daily data for the week
      break;
    case "month":
      chartData = profitDataWeekly; // 4 weeks of the month
      break;
    case "year":
    default:
      chartData = profitDataYearly; // 12 months of the year
  }

  const currentTotalSales = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Top Main Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-right shadow-sm ${
            activeTab === "sales"
              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.01]"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === "sales" ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${activeTab === "sales" ? "text-white" : "text-slate-800"}`}>تقارير المبيعات</h2>
            <p className={`text-sm ${activeTab === "sales" ? "text-blue-100" : "text-slate-500"}`}>أرباح، خسائر، ومبيعات الفانات</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-right shadow-sm ${
            activeTab === "inventory"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.01]"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-emerald-300"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === "inventory" ? "bg-white/20" : "bg-emerald-50 text-emerald-600"}`}>
            <Package size={28} />
          </div>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${activeTab === "inventory" ? "text-white" : "text-slate-800"}`}>تقارير المخزون</h2>
            <p className={`text-sm ${activeTab === "inventory" ? "text-emerald-100" : "text-slate-500"}`}>توزيع الفئات وكميات الأصناف</p>
          </div>
        </button>
      </div>

      {/* 1. SALES REPORT */}
      {activeTab === "sales" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main KPI & Filters Row */}
          <div className="flex flex-col xl:flex-row gap-4 items-stretch">
            {/* KPI Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-1 min-w-[300px]">
              <p className="text-slate-500 text-sm font-medium mb-2">إجمالي قيمة المبيعات (للفترة المحددة)</p>
              <p className="text-4xl font-bold text-blue-600">{currentTotalSales.toLocaleString("ar-EG")} <span className="text-lg text-slate-400 font-normal">ج.م</span></p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-[2] flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                 {["today", "week", "month", "year"].map((filter) => {
                   const labels: Record<string, string> = { today: "اليوم", week: "آخر أسبوع", month: "آخر شهر", year: "آخر سنة" };
                   return (
                     <button
                        key={filter}
                        onClick={() => setTimeFilter(filter as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          timeFilter === filter ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-600 bg-slate-50 border border-transparent hover:bg-slate-100"
                        }`}
                     >
                        {labels[filter]}
                     </button>
                   );
                 })}
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex-1 flex items-center gap-2">
                    <label className="text-slate-500 text-sm whitespace-nowrap">من:</label>
                    <div className="relative flex-1">
                      <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-700" />
                    </div>
                 </div>
                 <div className="flex-1 flex items-center gap-2">
                    <label className="text-slate-500 text-sm whitespace-nowrap">إلى:</label>
                    <div className="relative flex-1">
                      <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-700" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Profit/Loss Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 line-chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-800 font-bold text-lg">مقارنة الأرباح والخسائر</h3>
              <button className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-sm hover:bg-blue-100 transition-colors">
                <Download size={16} />
                تصدير PDF
              </button>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} tickFormatter={(value) => `${(value / 1000)}k`} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString('ar-EG')} ج.م`,
                      name === 'الأرباح' ? 'الأرباح' : 'الخسائر'
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="profit" name="الأرباح" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="loss" name="الخسائر" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Van Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-slate-800 font-bold text-lg">مبيعات السيارات (للفترة المحددة)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">المركبة (Van ID)</th>
                    <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">المندوب</th>
                    <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">إجمالي المبيعات</th>
                    <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">النسبة من الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vans.map((van) => {
                    const percentage = currentTotalSales > 0 ? (van.totalSalesToday / currentTotalSales) * 100 : 0;
                    return (
                      <tr key={van.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <TrendingUp size={18} />
                            </div>
                            <span className="font-bold text-slate-700">{van.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{van.representativeName || van.driverName}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{van.totalSalesToday.toLocaleString("ar-EG")} ج.م</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-500 w-10">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY REPORT */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-1 min-w-[320px]">
               <h3 className="text-slate-800 font-bold text-lg mb-6">توزيع المنتجات حسب الفئة</h3>
               <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" stroke="none" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight={600}>
                          {`${value}%`}
                        </text>
                      );
                    }}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
               </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-[2] overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-slate-800 font-bold text-lg">كل الأصناف بالمخزن الرئيسي حالياً</h3>
                <button className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-sm hover:bg-emerald-100 transition-colors">
                  <Download size={16} />
                  تصدير Excel
                </button>
              </div>
              <div className="overflow-y-auto max-h-[400px] flex-1 custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 border-b border-slate-100">
                    <tr>
                      <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">الصنف</th>
                      <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">الفئة</th>
                      <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">الكمية المتاحة</th>
                      <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">سعر البيع</th>
                      <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const isLow = product.quantity < product.minQuantity;
                      const isMedium = product.quantity < product.minQuantity * 2 && !isLow;
                      const statusColor = isLow ? "bg-red-50 text-red-600 border-red-200" : isMedium ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-emerald-50 text-emerald-600 border-emerald-200";
                      const statusText = isLow ? "منخفض جداً" : isMedium ? "متوسط" : "مخزون آمن";

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-700">{product.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{product.id} • {product.barcode}</p>
                          </td>
                          <td className="px-6 py-3.5 text-slate-600 text-sm">{product.category}</td>
                          <td className="px-6 py-3.5">
                             <span className="font-bold text-slate-700">{product.quantity}</span> <span className="text-xs text-slate-400">قطعة</span>
                          </td>
                          <td className="px-6 py-3.5 font-medium text-slate-600">{product.sellingPrice} ج.م</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
