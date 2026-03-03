import React from "react";
import { Package, AlertTriangle, ArrowLeftRight, ShoppingCart, TrendingDown, Clock } from "lucide-react";
import { KPICard } from "../../components/KPICard";
import { products, transfers, lowStockProducts, vans } from "../../data/mockData";

const totalQty = products.reduce((s, p) => s + p.quantity, 0);
const todayTransfers = transfers.filter((t) => t.date === "2026-03-03").length;

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
          title="أصناف منخفضة المخزون"
          value={lowStockProducts.length}
          subtitle="تحتاج إعادة طلب"
          icon={<AlertTriangle size={22} />}
          color="red"
          trend={{ value: `${lowStockProducts.length} صنف`, positive: false }}
        />
        <KPICard
          title="تحويلات اليوم"
          value={todayTransfers}
          subtitle="إلى الفانات"
          icon={<ArrowLeftRight size={22} />}
          color="green"
        />
        <KPICard
          title="طلبات إعادة الطلب"
          value={lowStockProducts.length}
          subtitle="في انتظار الموافقة"
          icon={<ShoppingCart size={22} />}
          color="orange"
        />
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Low Stock Alert */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-red-500" />
              <h2 className="text-slate-700 text-base">تنبيهات المخزون المنخفض</h2>
            </div>
            <button onClick={() => onNavigate("reorder")} className="text-blue-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {lowStockProducts.map((p) => {
              const pct = Math.round((p.quantity / p.minQuantity) * 100);
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50">
                  <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingDown size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct < 50 ? "bg-red-500" : "bg-yellow-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{p.quantity} / {p.minQuantity} وحدة</span>
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

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-slate-700 text-base mb-4">ملخص المخزون</h2>
          <div className="space-y-3">
            {[
              { label: "إجمالي الأصناف", value: products.length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "مخزون كافٍ", value: products.filter(p => p.quantity >= p.minQuantity * 2).length, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "مخزون متوسط", value: products.filter(p => p.quantity >= p.minQuantity && p.quantity < p.minQuantity * 2).length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "مخزون منخفض", value: lowStockProducts.length, color: "text-red-600", bg: "bg-red-50" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between ${item.bg} rounded-lg px-3 py-2.5`}>
                <span className="text-slate-600 text-sm">{item.label}</span>
                <span className={`text-lg ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-xs mb-2">القيمة الإجمالية للمخزون</p>
            <p className="text-2xl text-blue-600">
              {products.reduce((s, p) => s + p.quantity * p.costPrice, 0).toLocaleString("ar-EG")} ج.م
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transfers + Van Inventory Snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Transfers */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={17} className="text-emerald-500" />
              <h2 className="text-slate-700 text-base">آخر التحويلات</h2>
            </div>
            <button onClick={() => onNavigate("transfers")} className="text-blue-600 text-sm hover:underline">عرض الكل</button>
          </div>
          <div className="divide-y divide-slate-50">
            {transfers.slice(0, 5).map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowLeftRight size={14} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm truncate">{t.productName}</p>
                  <p className="text-slate-400 text-xs">{t.vanName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-blue-600 text-sm">{t.quantity} وحدة</p>
                  <p className="text-slate-400 text-xs">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Van Inventory Snapshot */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Clock size={17} className="text-blue-500" />
            <h2 className="text-slate-700 text-base">حالة الفانات النشطة</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {vans.filter(v => v.status === "نشطة" || v.status === "تحميل").map((van) => (
              <div key={van.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${van.status === "نشطة" ? "bg-emerald-500 animate-pulse" : "bg-yellow-400"}`}></div>
                  <div>
                    <p className="text-slate-700 text-sm">{van.id}</p>
                    <p className="text-slate-400 text-xs">{van.driverName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 text-sm">{van.totalSalesToday.toLocaleString("ar-EG")} ج.م</p>
                  <p className="text-slate-400 text-xs">{van.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
