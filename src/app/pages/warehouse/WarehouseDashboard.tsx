import React from "react";
import { Package, AlertTriangle, ShoppingCart, TrendingDown, BarChart3, Coins, Zap } from "lucide-react";
import { KPICard } from "../../components/KPICard";
import { products, transfers, lowStockProducts } from "../../data/mockData";

// حساب إجمالي الكمية وقيمة رأس المال
const totalQty = products.reduce((s, p) => s + p.quantity, 0);
const totalCapital = products.reduce((s, p) => s + (p.quantity * p.costPrice), 0);

// حساب أكثر 3 منتجات طلباً (بناءً على عدد مرات التحويل)
const topProducts = products
  .map(p => ({
    name: p.name,
    count: transfers.filter(t => t.productName === p.name).length
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 3);

export function WarehouseDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي المنتجات"
          value={products.length}
          subtitle={`${totalQty.toLocaleString("ar-EG")} وحدة إجمالية`}
          icon={<Package size={22} />}
          color="blue"
        />
        <KPICard
          title="قيمة رأس المال"
          value={`${totalCapital.toLocaleString("ar-EG")}`}
          subtitle="إجمالي قيمة المخزن"
          icon={<Coins size={22} />}
          color="green"
        />
        <KPICard
          title="أصناف منخفضة المخزون"
          value={lowStockProducts.length}
          subtitle="تحتاج إعادة طلب"
          icon={<AlertTriangle size={22} />}
          color="red"
          trend={{ value: `${lowStockProducts.length} صنف`, positive: false }}
        />
        <KPICard
          title="طلبات إعادة الطلب"
          value={lowStockProducts.length}
          subtitle="في انتظار الموافقة"
          icon={<ShoppingCart size={22} />}
          color="orange"
        />
      </div>

      {/* Main Content Composition */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Low Stock Alert (Takes 2/3 of width) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
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
            {lowStockProducts.slice(0, 5).map((p) => {
              const pct = Math.round((p.quantity / p.minQuantity) * 100);
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50">
                  <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingDown size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct < 50 ? "bg-red-500" : "bg-yellow-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{p.quantity} / {p.minQuantity}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg flex-shrink-0">
                    {p.quantity} متبقي
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products (Takes 1/3 of width) - Replaces Inventory Summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Zap size={17} className="text-amber-500" />
            <h2 className="text-slate-700 text-base">الأكثر طلباً (أسبوع)</h2>
          </div>
          <div className="p-5 space-y-4">
            {topProducts.map((item, index) => (
              <div key={index} className="relative flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                {/* Decorative background number */}
                <span className="absolute -left-2 -bottom-2 text-5xl font-bold text-slate-200 opacity-20">#{index + 1}</span>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? "bg-amber-100 text-amber-600" : 
                    index === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{item.name}</p>
                    <p className="text-slate-400 text-xs">منتج عالي الحركة</p>
                  </div>
                </div>
                
                <div className="text-right relative z-10">
                  <p className="text-blue-600 font-bold text-lg">{item.count}</p>
                  <p className="text-slate-400 text-[10px]">مرة تحميل</p>
                </div>
              </div>
            ))}
            
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-700 text-xs text-center leading-relaxed">
                تعتمد هذه البيانات على إجمالي حركات التحويل للفانات خلال الـ 7 أيام الماضية.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}