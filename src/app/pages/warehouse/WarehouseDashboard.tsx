import React, { useState, useEffect } from "react";
import { Package, AlertTriangle, ShoppingCart, TrendingDown, BarChart3, Coins, Zap } from "lucide-react";
import { KPICard } from "../../components/KPICard";
import axios from "axios"; // تأكد من تثبيت axios أو استخدم fetch

export function WarehouseDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استدعاء البيانات من الـ API
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://pareeq.runasp.net/api/InventoryDashboard/stats");
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[400px]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
          <Package className="absolute text-blue-600 animate-pulse" size={20} />
        </div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-red-50/50 rounded-2xl border border-red-100 max-w-md mx-auto mt-10">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-red-800 font-semibold text-base">حدث خطأ في تحميل البيانات</h3>
        <p className="text-red-600/80 text-sm text-center">يرجى التأكد من الاتصال بالخادم والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { summaryCards, lowStockAlerts, mostRequestedProducts } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <KPICard
            title="إجمالي المنتجات"
            value={summaryCards.totalProducts}
            subtitle={`${summaryCards.totalUnits.toLocaleString("ar-EG")} وحدة إجمالية`}
            icon={<Package size={22} />}
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "75ms" }}>
          <KPICard
            title="قيمة رأس المال"
            value={`${summaryCards.totalCapitalValue.toLocaleString("ar-EG")}`}
            subtitle="إجمالي قيمة المخزن"
            icon={<Coins size={22} />}
            color="green"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <KPICard
            title="أصناف منخفضة المخزون"
            value={summaryCards.lowStockItemsCount}
            subtitle="تحتاج إعادة طلب"
            icon={<AlertTriangle size={22} />}
            color="red"
            trend={{ value: `${summaryCards.lowStockItemsCount} صنف`, positive: false }}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "225ms" }}>
          <KPICard
            title="طلبات إعادة التعبئة"
            value={summaryCards.pendingRefillRequests}
            subtitle="في انتظار الموافقة"
            icon={<ShoppingCart size={22} />}
            color="orange"
          />
        </div>
      </div>

      {/* Main Content Composition */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Low Stock Alert (Takes 2/3 of width) */}
        <div 
          className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col animate-fade-in-up" 
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-red-500" />
              <h2 className="text-slate-700 text-base">تنبيهات المخزون المنخفض</h2>
            </div>
            <button onClick={() => onNavigate("reorder")} className="text-blue-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {lowStockAlerts.map((p, index) => {
              const pct = Math.round(p.percentage);
              return (
                <div key={index} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50">
                  <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingDown size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium">{p.productName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct < 40 ? "bg-red-500" : "bg-yellow-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{p.currentQuantity} / {p.minThreshold}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${pct < 40 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.currentQuantity} متبقي
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products (Takes 1/3 of width) */}
        <div 
          className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col animate-fade-in-up"
          style={{ animationDelay: "375ms" }}
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Zap size={17} className="text-amber-500" />
            <h2 className="text-slate-700 text-base">الأكثر طلباً (أسبوع)</h2>
          </div>
          <div className="p-5 space-y-4">
            {mostRequestedProducts.map((item, index) => (
              <div key={index} className="relative flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <span className="absolute -left-2 -bottom-2 text-5xl font-bold text-slate-200 opacity-20">#{index + 1}</span>

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? "bg-amber-100 text-amber-600" :
                      index === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"
                    }`}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{item.productName}</p>
                    <p className="text-slate-400 text-xs">{item.statusTag}</p>
                  </div>
                </div>

                <div className="text-right relative z-10">
                  <p className="text-blue-600 font-bold text-lg">{item.requestCount}</p>
                  <p className="text-slate-400 text-[10px]">مرة تحميل</p>
                </div>
              </div>
            ))}

            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-700 text-[11px] text-center leading-relaxed">
                تعتمد هذه البيانات على إجمالي حركات التحويل للفانات خلال الـ 7 أيام الماضية.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}