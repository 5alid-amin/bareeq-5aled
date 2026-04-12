import React, { useState } from "react";
import { RotateCcw, CheckCircle, ChevronDown, Trash2, Search, Filter } from "lucide-react";
import { vans, products, returnOrders, ReturnOrder, ReturnOrderItem } from "../../data/mockData";

const REASONS = ["تالف", "منتهي الصلاحية", "خطأ في التحميل", "فائض المخزون"];

export function ReturnsPage() {
  const [orderList, setOrderList] = useState<ReturnOrder[]>(returnOrders);
  const [selectedVan, setSelectedVan] = useState("");
  const [items, setItems] = useState<{ product: string; quantity: string; reason: string }[]>([
    { product: "", quantity: "", reason: "تالف" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter state
  const [filterVan, setFilterVan] = useState("الكل");
  const [filterReason, setFilterReason] = useState("الكل");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Auto-add empty row when last row gets a product selected
  const ensureEmptyRow = (newItems: typeof items) => {
    const last = newItems[newItems.length - 1];
    if (last && last.product !== "") {
      return [...newItems, { product: "", quantity: "", reason: "تالف" }];
    }
    return newItems;
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    const result = newItems.length ? newItems : [{ product: "", quantity: "", reason: "تالف" }];
    setItems(result);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity" | "reason", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(field === "product" ? ensureEmptyRow(newItems) : newItems);
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

  // Filter history
  const filteredOrders = orderList.filter(order => {
    const matchVan = filterVan === "الكل" || order.vanId === filterVan;
    const orderDate = new Date(order.date).toISOString().split("T")[0];
    const matchFrom = !filterFrom || orderDate >= filterFrom;
    const matchTo = !filterTo || orderDate <= filterTo;
    const matchReason = filterReason === "الكل" || order.items.some(i => i.reason === filterReason);
    return matchVan && matchFrom && matchTo && matchReason;
  });

  const hasActiveFilters = filterVan !== "الكل" || filterReason !== "الكل" || filterFrom || filterTo;

  const clearFilters = () => {
    setFilterVan("الكل");
    setFilterReason("الكل");
    setFilterFrom("");
    setFilterTo("");
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Create Return Order Form - Centered at the top */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <RotateCcw size={17} className="text-orange-500" />
              <h2 className="text-slate-700 text-base font-semibold">تسجيل مرتجع من سيارة</h2>
            </div>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-slate-700 text-lg mb-1 font-medium">تم إرجاع البضاعة بنجاح!</h3>
                <p className="text-slate-400 text-sm">تم تسلم المرتجع وتسجيله في المخزن الرئيسي</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Van selector */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">اختر الفان (السيارة)</label>
                  <div className="relative">
                    <select
                      value={selectedVan}
                      onChange={(e) => setSelectedVan(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">-- اختر الفان المرتجع منه --</option>
                      {vans.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.id} — {v.driverName} ({v.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedVanData && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-fit">
                      <div className={`w-2 h-2 rounded-full ${selectedVanData.status === "نشطة" ? "bg-emerald-500" : selectedVanData.status === "تحميل" ? "bg-yellow-400" : "bg-red-500"}`}></div>
                      <span>{selectedVanData.location}</span>
                    </div>
                  )}
                </div>

                {/* Items — always has an empty row at bottom */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-3">الأصناف المرتجعة</label>
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const isEmptyRow = !item.product;
                      return (
                        <div key={index} className={`flex gap-3 items-start p-3.5 rounded-xl border transition-colors ${isEmptyRow ? "bg-slate-50/50 border-dashed border-slate-200" : "bg-white border-slate-200 shadow-sm"}`}>
                          <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <div className="relative">
                                  <select
                                    value={item.product}
                                    onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  >
                                    <option value="">-- اختر منتجاً --</option>
                                    {products.map((p) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
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
                                  disabled={isEmptyRow}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
                                  dir="ltr"
                                />
                              </div>
                              <div>
                                <div className="relative">
                                  <select
                                    value={item.reason}
                                    onChange={(e) => handleChangeItem(index, "reason", e.target.value)}
                                    disabled={isEmptyRow}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
                                  >
                                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {!isEmptyRow && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                              title="حذف الصنف"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {isEmptyRow && <div className="w-10" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                    <Trash2 size={16} className="text-red-500" />
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || validItemsCount === 0}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
      </div>

      {/* Returns History Table (Matches InventoryPage styling) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* History Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-slate-700 text-base font-semibold">سجل المرتجعات ({filteredOrders.length})</h2>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
              عرض الكل ✕
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center bg-slate-50">
          <Filter size={15} className="text-slate-400 flex-shrink-0" />

          {/* Van Filter */}
          <div className="relative">
            <select
              value={filterVan}
              onChange={(e) => setFilterVan(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pl-8 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[150px]"
            >
              <option value="الكل">كل السيارات</option>
              {vans.map(v => (
                <option key={v.id} value={v.id}>{v.id} – {v.driverName}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Reason Filter */}
          <div className="relative">
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pl-8 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[150px]"
            >
              <option value="الكل">كل الأسباب</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-400">
            <span className="text-sm text-slate-400">من</span>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="text-sm text-slate-600 outline-none w-auto bg-transparent border-none"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-400">
            <span className="text-sm text-slate-400">إلى</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="text-sm text-slate-600 outline-none w-auto bg-transparent border-none"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">رقم العملية</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">المركبة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">التاريخ</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">الأصناف المرتجعة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <p className="text-sm">لا توجد مرتجعات تطابق الفلاتر المحددة</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <span className="text-orange-600 font-bold text-sm block">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm text-slate-700 font-medium">{order.vanName}</div>
                      <div className="text-xs text-slate-400 mt-1">{order.vanId}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm text-slate-600">
                        {new Date(order.date).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 max-w-sm">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-700 font-medium">{item.productName}</span>
                              {item.reason && (
                                <span className="text-orange-600 text-[10px] mt-0.5 font-medium">{item.reason}</span>
                              )}
                            </div>
                            <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-600" dir="ltr">{item.quantity} وحدة</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-100">
                        <CheckCircle size={12} />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
