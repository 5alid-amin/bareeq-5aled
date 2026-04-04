import React, { useState } from "react";
import { Truck, CheckCircle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { vans, products, loadingOrders, Product, LoadingOrder, LoadingOrderItem } from "../../data/mockData";

export function VehicleLoadingPage() {
  const [orderList, setOrderList] = useState<LoadingOrder[]>(loadingOrders);
  const [selectedVan, setSelectedVan] = useState("");
  const [items, setItems] = useState<{ product: string; quantity: string }[]>([
    { product: "", quantity: "" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [{ product: "", quantity: "" }]);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedVan) {
      setError("يرجى اختيار الفان");
      return;
    }

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
        setSelectedVan("");
        setItems([{ product: "", quantity: "" }]);
      }, 2500);
    }, 1000);
  };

  const selectedVanData = vans.find((v) => v.id === selectedVan);

  // Calculate invoice summary
  let invoiceTotal = 0;
  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;
  items.forEach(item => {
    if (item.product && parseInt(item.quantity) > 0) {
      const prod = products.find(p => p.id === item.product);
      if (prod) {
        invoiceTotal += prod.sellingPrice * parseInt(item.quantity);
      }
    }
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
        {/* Create Loading Order Form */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck size={17} className="text-blue-500" />
              <h2 className="text-slate-700 text-base">إصدار طلب تحميل</h2>
            </div>
            {invoiceTotal > 0 && (
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-medium">
                الإجمالي: {invoiceTotal.toLocaleString("ar-EG")} ج.م
              </div>
            )}
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-slate-700 text-lg mb-1">تم إصدار طلب التحميل!</h3>
                <p className="text-slate-400 text-sm">تم تحميل البضاعة بنجاح إلى الفان</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Van selector */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">اختر الفان (السيارة)</label>
                  <div className="relative">
                    <select
                      value={selectedVan}
                      onChange={(e) => setSelectedVan(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- اختر فان --</option>
                      {vans.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.id} — {v.driverName} ({v.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedVanData && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className={`w-2 h-2 rounded-full ${selectedVanData.status === "نشطة" ? "bg-emerald-500" : selectedVanData.status === "تحميل" ? "bg-yellow-400" : "bg-red-500"}`}></div>
                      <span>{selectedVanData.location}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-600 text-sm font-medium">الأصناف المراد تحميلها</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-md"
                    >
                      <Plus size={14} /> إضافة صنف
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const selectedProductData = products.find(p => p.id === item.product);
                      const isLowStock = selectedProductData ? selectedProductData.quantity < parseInt(item.quantity) : false;
                      
                      return (
                        <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <div className="relative">
                                  <select
                                    value={item.product}
                                    onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                    className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">-- اختر منتجاً --</option>
                                    {products.map((p) => (
                                      <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                                        {p.name} (متاح: {p.quantity})
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                                  placeholder="الكمية"
                                  min="1"
                                  max={selectedProductData?.quantity}
                                  className={`w-full bg-white border ${isLowStock ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'} rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  dir="ltr"
                                />
                              </div>
                            </div>
                            
                            {selectedProductData && item.quantity && !isLowStock && (
                              <div className="flex justify-between items-center text-xs text-slate-500 px-1 border-t border-slate-200/60 pt-2">
                                <span>سعر الوحدة: {selectedProductData.sellingPrice} ج.م</span>
                                <span className="font-medium text-emerald-600">
                                  المجموع: {(selectedProductData.sellingPrice * parseInt(item.quantity)).toLocaleString("ar-EG")} ج.م
                                </span>
                              </div>
                            )}
                            
                            {isLowStock && (
                              <p className="text-xs text-red-500 px-1">الكمية المطلوبة أكبر من المتاح في المخزن!</p>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                            title="حذف الصنف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <Trash2 size={16} className="text-red-500" />
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || invoiceTotal === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
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
                        إصدار طلب التحميل ({validItemsCount} أصناف)
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Loading History */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-slate-700 text-base font-medium">سجل التحميلات</h2>
            <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full">{orderList.length} طلب</span>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {orderList.map((order) => (
              <div key={order.id} className="border border-slate-100 rounded-xl p-4 hover:border-blue-100 hover:shadow-sm transition-all bg-white relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-blue-600 font-medium text-sm">{order.id}</span>
                    <p className="text-slate-400 text-xs mt-0.5">{new Date(order.date).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-full border border-emerald-100">
                    {order.status}
                  </span>
                </div>
                
                <p className="text-slate-700 text-sm mb-2 font-medium">{order.vanName}</p>
                
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 mb-3">
                  <p className="text-xs text-slate-500 mb-2 border-b border-slate-200 pb-1">الأصناف ({order.items.length}):</p>
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-600 truncate max-w-[140px]">{item.productName}</span>
                      <span className="text-slate-500 font-medium" dir="ltr">{item.quantity} x</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-slate-400 pt-1">+ {order.items.length - 2} أصناف أخرى</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">إجمالي القيمة:</span>
                  <span className="font-semibold text-slate-700">{order.totalValue.toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
