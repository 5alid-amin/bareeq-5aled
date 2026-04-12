import React, { useState } from "react";
import { Truck, CheckCircle, ChevronDown, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp, ArrowRight, X } from "lucide-react";
import { vans, products, loadingOrders, LoadingOrder, LoadingOrderItem, vanInventory, VanInventoryItem } from "../../data/mockData";

// ─── Vehicle Loading Modal / Drawer ──────────────────────────────────────────
function VehicleLoadingForm({ selectedVan, onClose }: { selectedVan: string, onClose: () => void }) {
  const [orderList, setOrderList] = useState<LoadingOrder[]>(loadingOrders);
  const [items, setItems] = useState<{ product: string; quantity: string }[]>([
    { product: "", quantity: "" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ensureEmptyRow = (newItems: typeof items) => {
    const last = newItems[newItems.length - 1];
    if (last && last.product !== "") {
      return [...newItems, { product: "", quantity: "" }];
    }
    return newItems;
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [{ product: "", quantity: "" }]);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(field === "product" ? ensureEmptyRow(newItems) : newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter(item => item.product && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل مع كمية صحيحة");
      return;
    }

    const van = vans.find((v) => v.id === selectedVan);
    if (!van) return;

    setLoading(true);
    setTimeout(() => {
      let totalValue = 0;
      const orderItems: LoadingOrderItem[] = validItems.map(item => {
        const prod = products.find(p => p.id === item.product)!;
        const qty = parseInt(item.quantity);
        const itemTotal = prod.sellingPrice * qty;
        totalValue += itemTotal;
        return {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice: prod.sellingPrice,
          totalPrice: itemTotal
        };
      });

      const newOrder: LoadingOrder = {
        id: `LO-${String(orderList.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString(),
        vanId: van.id,
        vanName: `${van.id} - ${van.driverName}`,
        items: orderItems,
        totalValue,
        status: "مكتمل",
      };

      setOrderList([newOrder, ...orderList]);
      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setSubmitted(false);
        setItems([{ product: "", quantity: "" }]);
        // onClose(); // Uncomment if you want it to close automatically after success
      }, 2500);
    }, 1000);
  };

  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;

  let invoiceTotal = 0;
  items.forEach(item => {
    if (item.product && parseInt(item.quantity) > 0) {
      const prod = products.find(p => p.id === item.product);
      if (prod) invoiceTotal += prod.sellingPrice * parseInt(item.quantity);
    }
  });

  return (
    <>
      {/* Backdrop (Semi-transparent so table behind is visible) */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Side Drawer (Left Side) */}
      <div className="fixed top-0 bottom-0 left-0 w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col border-r border-slate-100 overflow-hidden transform transition-transform">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-slate-700 text-base font-medium">تحميل إلى المركبة</h2>
              <p className="text-xs text-slate-500">إضافة بضائع جديدة لمخزون هذه السيارة</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {submitted ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-slate-800 text-xl font-medium mb-2">تم الإصدار بنجاح!</h3>
              <p className="text-slate-500 text-sm">تم تحميل البضاعة بنجاح وتسجيلها في مخزون الفان</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {invoiceTotal > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 xl rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium">إجمالي القيمة المضافة:</span>
                  <span className="font-bold text-lg">{invoiceTotal.toLocaleString("ar-EG")} ج.م</span>
                </div>
              )}

              {/* Items — always has an empty row at bottom */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3">الأصناف المراد تحميلها</label>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const selectedProductData = products.find(p => p.id === item.product);
                    const isLowStock = selectedProductData ? selectedProductData.quantity < parseInt(item.quantity) : false;
                    const isEmptyRow = !item.product;

                    return (
                      <div key={index} className={`flex gap-2 items-start p-3.5 rounded-xl border transition-colors relative ${isEmptyRow ? "bg-slate-50/50 border-dashed border-slate-300" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                              <select
                                value={item.product}
                                onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- اختر منتجاً لتضيفه --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                                    {p.name} (متاح: {p.quantity})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                            </div>
                            
                            {!isEmptyRow && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                                    placeholder="الكمية المطلوبة"
                                    min="1"
                                    max={selectedProductData?.quantity}
                                    className={`w-full bg-slate-50 border ${isLowStock ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'} rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    dir="ltr"
                                  />
                                </div>
                                <div className="flex flex-col justify-center bg-slate-50 rounded-lg px-3 border border-slate-100">
                                  {selectedProductData && item.quantity && !isLowStock && (
                                    <>
                                      <span className="text-[10px] text-slate-500">القيمة:</span>
                                      <span className="font-medium text-emerald-600 text-sm">
                                        {(selectedProductData.sellingPrice * parseInt(item.quantity)).toLocaleString("ar-EG")} ج.م
                                      </span>
                                    </>
                                  )}
                                  {isLowStock && (
                                    <span className="text-xs text-red-500 font-medium">يتخطى المتاح!</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isEmptyRow && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-slate-200 shadow-sm text-red-500 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                            title="حذف الصنف"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                  <AlertTriangle size={16} className="text-red-500" />
                  {error}
                </div>
              )}
            </form>
          )}
        </div>
        
        {/* Footer sticky area */}
        {!submitted && (
          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || invoiceTotal === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جارٍ الإصدار...
                </>
              ) : (
                <>
                  <Truck size={18} />
                  تأكيد وإصدار طلب التحميل
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}


// ─── Van Inventory List (Inside Van Detail) ───────────────────────────────────
function VanInventoryList({ currentInventory }: { currentInventory: VanInventoryItem[] }) {
  if (currentInventory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">
        <Package size={28} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">لا يوجد مخزون مسجل لهذه السيارة</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-4">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-slate-700 text-sm font-medium">مخزون السيارة الحالي ({currentInventory.length} صنف)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">المنتج</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الكمية الحالية</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الحد الأدنى</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">سعر البيع</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">القيمة</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentInventory.map(item => {
              const isLow = item.quantity < item.minQuantity;
              return (
                <tr key={item.productId} className={`hover:bg-slate-50/50 transition-colors ${isLow ? "bg-red-50/20" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">{item.productName}</p>
                        <p className="text-xs text-slate-400">{item.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-medium ${isLow ? "text-red-600" : "text-slate-700"}`}>{item.quantity}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{item.minQuantity}</td>
                  <td className="px-5 py-3.5 text-emerald-600 text-sm">{item.sellingPrice} ج.م</td>
                  <td className="px-5 py-3.5 text-slate-600 text-sm">{(item.quantity * item.sellingPrice).toLocaleString("ar-EG")} ج.م</td>
                  <td className="px-5 py-3.5">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        <TrendingDown size={11} /> منخفض
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
                        <TrendingUp size={11} /> جيد
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── Main Page ───────────────────────────────────────────────────────────────
export function VehicleLoadingPage() {
  const [selectedVan, setSelectedVan] = useState<string | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);

  const currentVan = selectedVan ? vans.find(v => v.id === selectedVan) : null;
  const currentInventory: VanInventoryItem[] = selectedVan ? (vanInventory[selectedVan] || []) : [];

  const totalValue = currentInventory.reduce((s, i) => s + i.quantity * i.sellingPrice, 0);
  const lowItems = currentInventory.filter(i => i.quantity < i.minQuantity).length;
  const goodItems = currentInventory.filter(i => i.quantity >= i.minQuantity).length;
  const totalItems = currentInventory.length;

  if (selectedVan && currentVan) {
    return (
      <div className="space-y-4 relative">
        {showLoadingModal && (
          <VehicleLoadingForm selectedVan={selectedVan} onClose={() => setShowLoadingModal(false)} />
        )}

        {/* Back + Van name */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedVan(null)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <ArrowRight size={14} />
              رجوع للسيارات
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${currentVan.status === "نشطة" ? "bg-emerald-500" : currentVan.status === "تحميل" ? "bg-yellow-400" : "bg-red-400"}`} />
              <span className="text-slate-700 font-medium text-sm">{currentVan.id} — {currentVan.driverName}</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowLoadingModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Truck size={15} />
            تحميل للسيارة
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الأصناف", value: totalItems, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "أصناف جيدة", value: goodItems, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "أصناف منخفضة", value: lowItems, color: "text-red-600", bg: "bg-red-50" },
            { label: "إجمالي القيمة", value: `${totalValue.toLocaleString("ar-EG")} ج.م`, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-white shadow-sm`}>
              <p className={`text-base font-semibold ${s.color} truncate`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <VanInventoryList currentInventory={currentInventory} />
      </div>
    );
  }

  // All vans cards view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">اختر سيارة لعرض مخزونها وإصدار أمر تحميل جديد</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vans.map(van => {
          const inv: VanInventoryItem[] = vanInventory[van.id] || [];
          const vanLow = inv.filter(i => i.quantity < i.minQuantity).length;
          const vanTotal = inv.reduce((s, i) => s + i.quantity * i.sellingPrice, 0);
          const statusColor = van.status === "نشطة" ? "bg-emerald-500" : van.status === "تحميل" ? "bg-yellow-400" : "bg-red-400";
          const statusText = van.status;

          return (
            <button
              key={van.id}
              onClick={() => setSelectedVan(van.id)}
              className="bg-white border border-slate-100 rounded-xl p-4 text-right hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors`}>
                  <Truck size={16} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                  <span className="text-xs text-slate-500">{statusText}</span>
                </div>
              </div>

              <p className="text-slate-700 font-medium text-sm">{van.id}</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{van.driverName}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-blue-600 font-semibold text-sm">{inv.length}</p>
                  <p className="text-slate-400 text-[10px]">صنف</p>
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${vanLow > 0 ? "text-red-500" : "text-emerald-500"}`}>{vanLow}</p>
                  <p className="text-slate-400 text-[10px]">منخفض</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-600 font-semibold text-xs">{vanTotal > 0 ? `${(vanTotal / 1000).toFixed(1)}k` : "—"}</p>
                  <p className="text-slate-400 text-[10px]">قيمة</p>
                </div>
              </div>

              {vanLow > 0 && (
                <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
                  <AlertTriangle size={11} />
                  <span>{vanLow} صنف منخفض</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
