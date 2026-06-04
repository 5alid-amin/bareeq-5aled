import React, { useState, useEffect } from "react";
import { Truck, TrendingUp, DollarSign, Activity, Star, Calendar } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { KPICard } from "../../components/KPICard";

// الـ Base URL الخاص بالباك إند بتاعك
const API_BASE = "http://pareeq.runasp.net/api/manager/ManagerDashborad";

export function ManagerDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [chartMode, setChartMode] = useState<"daily" | "monthly">("daily");
  const [timeFilter, setTimeFilter] = useState("اليوم");

  // States لتخزين البيانات الحقيقية
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [topVans, setTopVans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب ملخص الداشبورد (Summary)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_BASE}/dashboard-summary?timeframe=${timeFilter}`);
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, [timeFilter]);

  // 2. جلب بيانات الرسم البياني (Chart)
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${API_BASE}/sales-chart?mode=${chartMode}`);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
    fetchChartData();
  }, [chartMode]);

  // 3. جلب أفضل الفانات (Top Vans)
  useEffect(() => {
    const fetchTopVans = async () => {
      try {
        const response = await fetch(`${API_BASE}/top-vans?count=4`);
        const data = await response.json();
        setTopVans(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top vans:", error);
        setLoading(false);
      }
    };
    fetchTopVans();
  }, []);

  if (loading || !summary) return <div className="p-10 text-center">جاري تحميل بيانات شركة بريق...</div>;

  return (
    <div className="space-y-6">
      {/* Top Bar with Time Filter */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">نظرة عامة</h1>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <Calendar size={16} className="text-slate-400 ml-2" />
          {["اليوم", "الأسبوع", "الشهر", "السنة"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${timeFilter === filter ? "bg-white text-blue-600 shadow-sm font-medium" : "text-slate-500 hover:text-slate-700"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي الفانات"
          value={summary.totalVans}
          subtitle="في الأسطول"
          icon={<Truck size={22} />}
          color="blue"
          trend={{ value: "محدث", positive: true }}
        />
        <KPICard
          title="فانات نشطة"
          value={`${summary.activeVans} / ${summary.totalVans}`}
          subtitle="في الميدان الآن"
          icon={<Activity size={22} />}
          color="green"
          trend={{ value: "مباشر", positive: true }}
        />
        <KPICard
          title="إجمالي المبيعات"
          value={`${summary.totalSales.toLocaleString("ar-EG")} ج.م`}
          subtitle={`خلال ${timeFilter}`}
          icon={<TrendingUp size={22} />}
          color="purple"
          trend={{ value: "تحليل حي", positive: true }}
        />
        <KPICard
          title="صافي الأرباح"
          value={`${summary.netProfit.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`}
          subtitle="بعد خصم التكاليف"
          icon={<DollarSign size={22} />}
          color="orange"
          trend={{ value: "صافي", positive: true }}
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
        </div>

        {/* Vehicle Status Summary from API */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-slate-700 text-base mb-4">حالة المركبات</h2>
          <div className="space-y-3">
            {summary.statusDistribution.map((item: any) => (
              <div key={item.label} className={`flex items-center gap-3 ${item.label === "نشطة" ? "bg-emerald-100" : "bg-red-50"} rounded-lg p-3`}>
                <div className={`w-2.5 h-2.5 rounded-full ${item.label === "نشطة" ? "bg-emerald-500" : "bg-red-500"} flex-shrink-0`}></div>
                <span className={`text-sm flex-1 ${item.label === "نشطة" ? "text-emerald-700" : "text-red-700"}`}>{item.label}</span>
                <span className={`text-lg ${item.label === "نشطة" ? "text-emerald-700" : "text-red-700"}`}>{item.count}</span>
                <span className="text-xs text-slate-400">فان</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl text-blue-600">{summary.activeVans > 0 ? Math.round(summary.totalSales / summary.activeVans).toLocaleString("ar-EG") : 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">متوسط مبيعات الفان</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-emerald-600">{Math.round((summary.activeVans / summary.totalVans) * 100) || 0}%</p>
              <p className="text-xs text-slate-400 mt-0.5">كفاءة التشغيل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Vans Table from API */}
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
                <th className="text-right text-slate-500 text-xs px-5 py-3">اسم الفان</th>
                {/* <th className="text-right text-slate-500 text-xs px-5 py-3">المندوب</th> */}
                <th className="text-right text-slate-500 text-xs px-5 py-3">المبيعات</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">عدد الرحلات</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">الكفاءة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">التقييم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topVans.map((van: any, i) => (
                <tr key={van.vehicleId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-600" : "bg-slate-300"}`}>
                        {i + 1}
                      </span>
                      <span className="text-slate-700 text-sm">{van.vehicleName}</span>
                    </div>
                  </td>
                  {/* <td className="px-5 py-3.5 text-slate-700 text-sm">{van.salesRepName || "بدون مندوب"}</td> */}
                  <td className="px-5 py-3.5 text-emerald-600 text-sm">{van.totalSales.toLocaleString("ar-EG")} ج.م</td>
                  <td className="px-5 py-3.5 text-slate-600 text-sm">{van.tripsCount} رحلة</td>
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