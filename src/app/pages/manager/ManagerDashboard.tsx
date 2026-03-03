import React, { useState } from "react";
import { Truck, TrendingUp, DollarSign, Activity, Star } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { KPICard } from "../../components/KPICard";
import { vans, topVans, dailySalesData, monthlySalesData } from "../../data/mockData";

const activeVans = vans.filter((v) => v.status === "نشطة").length;
const totalSales = vans.reduce((sum, v) => sum + v.totalSalesToday, 0);

export function ManagerDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [chartMode, setChartMode] = useState<"daily" | "monthly">("daily");
  const chartData = chartMode === "daily" ? dailySalesData : monthlySalesData;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي الفانات"
          value={vans.length}
          subtitle="في الأسطول"
          icon={<Truck size={22} />}
          color="blue"
          trend={{ value: "1 فان جديدة", positive: true }}
        />
        <KPICard
          title="فانات نشطة"
          value={`${activeVans} / ${vans.length}`}
          subtitle="في الميدان الآن"
          icon={<Activity size={22} />}
          color="green"
          trend={{ value: "2 زيادة", positive: true }}
        />
        <KPICard
          title="إجمالي المبيعات اليوم"
          value={`${totalSales.toLocaleString("ar-EG")} ج.م`}
          subtitle="من جميع الفانات"
          icon={<TrendingUp size={22} />}
          color="purple"
          trend={{ value: "12.4%", positive: true }}
        />
        <KPICard
          title="صافي الأرباح"
          value={`${(totalSales * 0.36).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`}
          subtitle="الهامش 36%"
          icon={<DollarSign size={22} />}
          color="orange"
          trend={{ value: "8.1%", positive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-700 text-base">تقرير المبيعات</h2>
              <p className="text-slate-400 text-xs">المبيعات والأرباح</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setChartMode("daily")}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${chartMode === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                يومي
              </button>
              <button
                onClick={() => setChartMode("monthly")}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${chartMode === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                شهري
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f8fafc", fontSize: 12 }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString("ar-EG")} ج.م`,
                  name === "sales" ? "المبيعات" : "الأرباح",
                ]}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGrad)" name="sales" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profitGrad)" name="profit" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded bg-blue-500"></div>
              <span className="text-xs text-slate-500">المبيعات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded bg-emerald-500"></div>
              <span className="text-xs text-slate-500">الأرباح</span>
            </div>
          </div>
        </div>

        {/* Van Status Donut Summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-slate-700 text-base mb-4">حالة الأسطول</h2>
          <div className="space-y-3">
            {[
              { label: "نشطة", count: vans.filter(v => v.status === "نشطة").length, color: "bg-emerald-500", textColor: "text-emerald-700", barColor: "bg-emerald-100" },
              { label: "تحميل", count: vans.filter(v => v.status === "تحميل").length, color: "bg-yellow-400", textColor: "text-yellow-700", barColor: "bg-yellow-50" },
              { label: "متوقفة", count: vans.filter(v => v.status === "متوقفة").length, color: "bg-red-500", textColor: "text-red-700", barColor: "bg-red-50" },
              { label: "صيانة", count: vans.filter(v => v.status === "صيانة").length, color: "bg-slate-400", textColor: "text-slate-600", barColor: "bg-slate-100" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 ${item.barColor} rounded-lg p-3`}>
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`}></div>
                <span className={`text-sm flex-1 ${item.textColor}`}>{item.label}</span>
                <span className={`text-lg ${item.textColor}`}>{item.count}</span>
                <span className="text-xs text-slate-400">فان</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl text-blue-600">{Math.round(totalSales / activeVans).toLocaleString("ar-EG")}</p>
              <p className="text-xs text-slate-400 mt-0.5">متوسط مبيعات الفان</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-emerald-600">94%</p>
              <p className="text-xs text-slate-400 mt-0.5">كفاءة الأسطول</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Vans Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Star size={17} className="text-yellow-500" />
            <h2 className="text-slate-700 text-base">أفضل الفانات أداءً</h2>
          </div>
          <button
            onClick={() => onNavigate("fleet")}
            className="text-blue-600 text-sm hover:text-blue-700 hover:underline"
          >
            عرض الكل
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-slate-500 text-xs px-5 py-3">رقم الفان</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">السائق</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">المبيعات اليوم</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">عدد الرحلات</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">الكفاءة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">التقييم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topVans.map((van, i) => (
                <tr key={van.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-600" : "bg-slate-300"}`}>
                        {i + 1}
                      </span>
                      <span className="text-slate-700 text-sm">{van.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 text-sm">{van.driver}</td>
                  <td className="px-5 py-3.5 text-emerald-600 text-sm">{van.sales.toLocaleString("ar-EG")} ج.م</td>
                  <td className="px-5 py-3.5 text-slate-600 text-sm">{van.trips} رحلة</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${van.efficiency}%` }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs">{van.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= Math.round(van.efficiency / 20) ? "text-yellow-400" : "text-slate-200"}`}>★</span>
                      ))}
                    </div>
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
