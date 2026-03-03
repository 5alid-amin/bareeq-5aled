import React, { useState } from "react";
import { AlertTriangle, ShoppingCart, CheckCircle, TrendingDown, Package } from "lucide-react";
import { products, Product } from "../../data/mockData";

const SUPPLIERS: Record<string, string> = {
  "منظفات سائلة": "شركة الخليج للمنظفات",
  "مساحيق الغسيل": "مصنع النقاء للمساحيق",
  "منظفات عامة": "شركة الخليج للمنظفات",
  "منظفات السيارات": "مؤسسة الصفاء التجارية",
  "منظفات الحمام": "شركة الخليج للمنظفات",
  "معطرات": "شركة العطور والمنظفات",
  "منظفات شخصية": "مصنع النقاء للمساحيق",
  "منظفات المطبخ": "شركة الخليج للمنظفات",
};

interface OrderState {
  productId: string;
  ordered: boolean;
  quantity: number;
}

export function ReorderAlertsPage() {
  const lowStockList = products.filter((p) => p.quantity < p.minQuantity);
  const medStockList = products.filter((p) => p.quantity >= p.minQuantity && p.quantity < p.minQuantity * 1.5);

  const [orders, setOrders] = useState<Record<string, OrderState>>({});
  const [bulkOrdered, setBulkOrdered] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(lowStockList.map((p) => [p.id, p.minQuantity * 3]))
  );

  const handleOrder = (product: Product) => {
    setOrders((prev) => ({
      ...prev,
      [product.id]: { productId: product.id, ordered: true, quantity: quantities[product.id] ?? product.minQuantity * 3 },
    }));
  };

  const handleBulkOrder = () => {
    const newOrders: Record<string, OrderState> = {};
    lowStockList.forEach((p) => {
      newOrders[p.id] = { productId: p.id, ordered: true, quantity: quantities[p.id] ?? p.minQuantity * 3 };
    });
    setOrders(newOrders);
    setBulkOrdered(true);
  };

  const orderedCount = Object.values(orders).filter((o) => o.ordered).length;

  return (
    <div className="space-y-5">
      {/* Header alert */}
      <div className="bg-gradient-to-l from-red-600 to-rose-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-lg">تنبيهات إعادة الطلب</h1>
              <p className="text-red-200 text-sm">
                {lowStockList.length} صنف تحت الحد الأدنى للمخزون
              </p>
            </div>
          </div>
          {!bulkOrdered && lowStockList.length > 0 && (
            <button
              onClick={handleBulkOrder}
              className="flex items-center gap-2 bg-white text-red-600 px-4 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              <ShoppingCart size={16} />
              طلب جميع الأصناف المنخفضة
            </button>
          )}
          {bulkOrdered && (
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5 text-sm">
              <CheckCircle size={16} className="text-white" />
              <span>تم إرسال جميع الطلبات</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl text-red-600">{lowStockList.length}</p>
          <p className="text-slate-500 text-sm mt-1">صنف منخفض المخزون</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl text-yellow-600">{medStockList.length}</p>
          <p className="text-slate-500 text-sm mt-1">صنف مخزون متوسط</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl text-emerald-600">{orderedCount}</p>
          <p className="text-slate-500 text-sm mt-1">طلب تم إرساله</p>
        </div>
      </div>

      {/* Critical - Low Stock */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100 bg-red-50">
          <TrendingDown size={17} className="text-red-500" />
          <h2 className="text-red-700 text-base">أصناف تحت الحد الأدنى — طلب عاجل</h2>
          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full mr-1">{lowStockList.length}</span>
        </div>
        <div className="divide-y divide-slate-50">
          {lowStockList.map((p) => {
            const pct = Math.round((p.quantity / p.minQuantity) * 100);
            const isOrdered = orders[p.id]?.ordered;
            const qty = quantities[p.id] ?? p.minQuantity * 3;

            return (
              <div key={p.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${isOrdered ? "opacity-70" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOrdered ? "bg-emerald-50" : "bg-red-50"}`}>
                  {isOrdered ? (
                    <CheckCircle size={20} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={20} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-700 text-sm">{p.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{p.id}</span>
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-red-500">{p.quantity} متبقي (الحد: {p.minQuantity})</span>
                    <span className="text-xs text-slate-400">المورد: {SUPPLIERS[p.category] ?? "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isOrdered && (
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQuantities({ ...quantities, [p.id]: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dir="ltr"
                      min="1"
                    />
                  )}
                  {isOrdered ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs">
                      <CheckCircle size={13} />
                      تم الطلب ({orders[p.id].quantity} وحدة)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOrder(p)}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      <ShoppingCart size={13} />
                      طلب من المورد
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medium Stock Warning */}
      {medStockList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-yellow-100 bg-yellow-50">
            <Package size={17} className="text-yellow-600" />
            <h2 className="text-yellow-700 text-base">أصناف ستحتاج إعادة طلب قريباً</h2>
            <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full mr-1">{medStockList.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {medStockList.map((p) => {
              const pct = Math.round((p.quantity / (p.minQuantity * 2)) * 100);
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50">
                  <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm mb-1">{p.name}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-yellow-600">{p.quantity} وحدة متبقية</span>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg flex-shrink-0">
                    تحذير مبكر
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
