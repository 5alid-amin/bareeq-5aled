import React, { useState } from "react";
import { RotateCcw, CheckCircle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { vans, products, returnOrders, Product, ReturnOrder, ReturnOrderItem } from "../../data/mockData";

export function ReturnsPage() {
  const [orderList, setOrderList] = useState<ReturnOrder[]>(returnOrders);
  const [selectedVan, setSelectedVan] = useState("");
  const [items, setItems] = useState<{ product: string; quantity: string; reason: string }>([
    { product: "", quantity: "", reason: "تالف" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const REASONS = ["تالف", "منتهي الصلاحية", "خطأ في التحميل", "فائض المخزون"];

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: "", reason: "تالف" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [{ product: "", quantity: "", reason: "تالف" }]);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity" | "reason", value: string) => {
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
      const orderItems: ReturnOrderItem[] = validItems.map(item => {
        const prod = products.find(p => p.id === item.product)!;
        return {
          productId: prod.id,
          productName: prod.name,
          quantity: parseInt(item.quantity),
          reason: item.reason
        };
      });

      const newOrder: ReturnOrder = {
        id: `RO-${String(orderList.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString(),
        vanId: van.id,
        vanName: `${van.id} - ${van.driverName}`,
        items: orderItems,
        status: "مكتمل",
      };

      setOrderList([newOrder, ...orderList]);
      setSubmitted(true);
      setLoading(false);
      
      setTimeout(() => {
        setSubmitted(false);
        setSelectedVan("");
        setItems([{ product: "", quantity: "", reason: "تالف" }]);
      }, 2500);
    }, 1000);
  };

  const selectedVanData = vans.find((v) => v.id === selectedVan);
  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
        {/* Create Return Order Form */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <RotateCcw size={17} className="text-orange-500" />
              <h2 className="text-slate-700 text-base">تسجيل مرتجع من سيارة</h2>
            </div>
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-slate-700 text-lg mb-1">تم إرجاع البضاعة بنجاح!</h3>
                <p className="text-slate-400 text-sm">تم تسلم المرتجع وتسجيله في المخزن الرئيسي</p>
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
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-600 text-sm font-medium">الأصناف المرتجعة</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-2 py-1 rounded-md"
                    >
                      <Plus size={14} /> إضافة صنف
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <div className="relative">
                                <select
                                  value={item.product}
                                  onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <option value="">-- اختر منتجاً --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
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
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                dir="ltr"
                              />
                            </div>
                            <div>
                              <div className="relative">
                                <select
                                  value={item.reason}
                                  onChange={(e) => handleChangeItem(index, "reason", e.target.value)}
                                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
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
                    ))}
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
                    disabled={loading || validItemsCount === 0}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        جارٍ التسجيل...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={18} />
                        تأكيد استلام المرتجع ({validItemsCount} أصناف)
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* History */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-slate-700 text-base font-medium">سجل المرتجعات</h2>
            <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full">{orderList.length} عملية</span>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {orderList.map((order) => (
              <div key={order.id} className="border border-slate-100 rounded-xl p-4 hover:border-orange-100 hover:shadow-sm transition-all bg-white relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-orange-600 font-medium text-sm">{order.id}</span>
                    <p className="text-slate-400 text-xs mt-0.5">{new Date(order.date).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-full border border-emerald-100">
                    {order.status}
                  </span>
                </div>
                
                <p className="text-slate-700 text-sm mb-2 font-medium">{order.vanName}</p>
                
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 mb-2">
                  <p className="text-xs text-slate-500 border-b border-slate-200 pb-1">الأصناف المرتجعة ({order.items.length}):</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-slate-600 max-w-[150px] truncate">{item.productName}</span>
                        <span className="text-orange-500 text-[10px] mt-0.5">{item.reason}</span>
                      </div>
                      <span className="text-slate-500 font-medium bg-white px-2 py-1 rounded" dir="ltr">{item.quantity} وحدة</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
