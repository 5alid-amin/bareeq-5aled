import React, { useState, useMemo } from "react";
import { RotateCcw, CheckCircle, ChevronDown, Trash2, Search, Filter, Plus, FileText, Info, Package, Truck, Calendar } from "lucide-react";
import { vans, products, returnOrders, ReturnOrder, ReturnOrderItem, vanInventory, stockMovements } from "../../data/mockData";

const REASONS = ["تالف", "منتهي الصلاحية", "خطأ في التحميل", "فائض المخزون", "مرتجع من بيع", "أخرى"];

const getReasonStyle = (reason: string) => {
  switch (reason) {
    case "تالف": return "bg-red-50 text-red-600 border-red-200";
    case "منتهي الصلاحية": return "bg-orange-50 text-orange-600 border-orange-200";
    case "خطأ في التحميل": return "bg-yellow-50 text-yellow-600 border-yellow-200";
    case "فائض المخزون": return "bg-blue-50 text-blue-600 border-blue-200";
    case "مرتجع من بيع": return "bg-emerald-50 text-emerald-600 border-emerald-200";
    default: return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

export function ReturnsPage() {
  const [orderList, setOrderList] = useState<ReturnOrder[]>(returnOrders);
  const [selectedVan, setSelectedVan] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<{ product: string; quantity: string; reason: string; notes: string }>([
    { product: "", quantity: "", reason: "تالف", notes: "" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter state
  const [filterVan, setFilterVan] = useState("الكل");
  const [filterReason, setFilterReason] = useState("الكل");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const availableProducts = useMemo(() => {
    if (!selectedVan) return [];
    return vanInventory[selectedVan] || [];
  }, [selectedVan]);

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: "", reason: "تالف", notes: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ product: "", quantity: "", reason: "تالف", notes: "" });
    }
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity" | "reason" | "notes", value: string) => {
    const newItems = [...items];
    newItems[index][field as keyof typeof newItems[0]] = value;
    
    // Auto-adjust quantity if it exceeds max
    if (field === "quantity" && selectedVan && newItems[index].product) {
      const maxQuantity = availableProducts.find(p => p.productId === newItems[index].product)?.quantity || 0;
      if (parseInt(value) > maxQuantity) {
        newItems[index].quantity = maxQuantity.toString();
      }
    }
    // Auto-adjust quantity if changed product
    if (field === "product" && selectedVan) {
        const productVal = parseInt(newItems[index].quantity);
        const maxQuantity = availableProducts.find(p => p.productId === value)?.quantity || 5;
        if(productVal > maxQuantity) {
            newItems[index].quantity = maxQuantity.toString();
        }
    }

    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedVan) {
      setError("يرجى اختيار المندوب");
      return;
    }

    const validItems = items.filter(item => item.product && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل مع إدخال كمية صحيحة");
      return;
    }

    const van = vans.find((v) => v.id === selectedVan);
    if (!van) return;

    setLoading(true);
    setTimeout(() => {
      const orderItems: ReturnOrderItem[] = validItems.map(item => {
        let productName = availableProducts.find(p => p.productId === item.product)?.productName;
        if (!productName) {
           productName = products.find(p => p.id === item.product)?.name || "—";
        }
        return {
          productId: item.product,
          productName: productName,
          quantity: parseInt(item.quantity),
          reason: item.reason,
          notes: item.notes
        };
      });

      const newOrder: ReturnOrder = {
        id: `RO-${String(orderList.length + 1).padStart(3, "0")}`,
        date: returnDate + "T" + new Date().toISOString().split("T")[1],
        vanId: van.id,
        vanName: `${van.id} - ${van.driverName}`,
        items: orderItems,
        status: "مكتمل",
      };

      orderItems.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const beforeQty = prod.quantity;
          const isDamaged = item.reason === "تالف" || item.reason === "منتهي الصلاحية";
          if (!isDamaged) {
              prod.quantity += item.quantity;
          }
          const afterQty = prod.quantity;

          stockMovements.push({
            id: `MOV-${String(stockMovements.length + 1).padStart(3, "0")}`,
            date: new Date().toISOString(),
            type: isDamaged ? "هالك" : "مرتجع",
            productId: prod.id,
            productName: prod.name,
            quantity: item.quantity,
            balanceBefore: beforeQty,
            balanceAfter: afterQty,
            referenceId: newOrder.id,
            vanId: van.id,
            vanName: `${van.id} - ${van.driverName}`,
            notes: item.notes ? `${item.reason}: ${item.notes}` : item.reason
          });
        }
      });

      setOrderList([newOrder, ...orderList]);
      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setSubmitted(false);
        setSelectedVan("");
        setItems([{ product: "", quantity: "", reason: "تالف", notes: "" }]);
      }, 3000);
    }, 1200);
  };

  const selectedVanData = vans.find((v) => v.id === selectedVan);
  const validItems = items.filter(i => i.product && parseInt(i.quantity) > 0);
  const validItemsCount = validItems.length;
  const totalUnitsCount = validItems.reduce((acc, item) => acc + parseInt(item.quantity || "0"), 0);

  const vanStockUnits = availableProducts.reduce((acc, item) => acc + item.quantity, 0);

  const filteredOrders = useMemo(() => {
     let filtered = orderList;
     if (filterVan !== "الكل") {
       filtered = filtered.filter(order => order.vanId === filterVan);
     }
     if (filterReason !== "الكل") {
       filtered = filtered.filter(order => order.items.some(i => i.reason === filterReason));
     }
     if (filterFrom) {
       filtered = filtered.filter(order => order.date.split("T")[0] >= filterFrom);
     }
     if (filterTo) {
       filtered = filtered.filter(order => order.date.split("T")[0] <= filterTo);
     }
     if (searchQuery.trim()) {
       const q = searchQuery.toLowerCase();
       filtered = filtered.filter(order => 
         order.id.toLowerCase().includes(q) || 
         order.items.some(i => i.productName.toLowerCase().includes(q) || i.productId.toLowerCase().includes(q))
       );
     }
     return filtered;
  }, [orderList, filterVan, filterReason, filterFrom, filterTo, searchQuery]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1) Page Header */}
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-2xl font-bold text-slate-800">مرتجع من سيارة</h1>
        <p className="text-sm text-slate-500">تسجيل أصناف راجعة من مخزون السيارة إلى المخزن الرئيسي</p>
      </div>

      {/* 2) Main Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-stretch">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                 <RotateCcw size={18} />
              </span>
              بيانات المرتجع
            </h2>
            {selectedVanData && (
                 <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                     تحديث المخزون تلقائياً
                 </span>
            )}
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-50"></div>
                  <CheckCircle size={40} className="text-emerald-500 relative z-10" />
                </div>
                <h3 className="text-slate-800 text-xl mb-2 font-bold">تم تأكيد المرتجع بنجاح!</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  تم استلام الأصناف وتسجيلها في المخزن الرئيسي النظام. سيتم تحديث عهدة السيارة تلقائياً وإخطار المحاسب.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Vehicle & Reference */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px]">1</span>
                      بيانات المندوب والمرجع
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">المندوب</label>
                        <div className="relative">
                          <select
                            value={selectedVan}
                            onChange={(e) => setSelectedVan(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[46px] text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          >
                            <option value="">-- اختر المندوب المرتجع منه --</option>
                            {vans.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.id} — {v.driverName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">تاريخ العملية</label>
                        <div className="relative">
                           <input
                             type="date"
                             value={returnDate}
                             onChange={(e) => setReturnDate(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[46px] pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                             dir="rtl"
                           />
                           <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side Info Card (Modified) */}
                  <div className="lg:col-span-4">
                     <div className="h-full">
                        {selectedVanData ? (
                          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-md h-full flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                             
                             <h4 className="text-slate-300 text-xs font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Truck size={14} className="text-orange-400" />
                                معلومات المندوب الحالية
                             </h4>
                             
                             <div className="space-y-4 relative z-10">
                                <div>
                                   <div className="text-slate-400 text-xs mb-1 text-center">المندوب / السائق</div>
                                   <div className="font-bold text-base text-center">{selectedVanData.driverName} <span className="text-slate-400 text-sm font-normal">({selectedVanData.id})</span></div>
                                </div>
                                <div className="grid grid-cols-1 mt-4">
                                   <div className="bg-white/10 rounded-lg p-4 border border-white/5 flex flex-col items-center">
                                      <div className="text-slate-400 text-xs mb-1">الكمية الإجمالية</div>
                                      <div className="font-bold text-2xl">{vanStockUnits} <span className="text-sm font-normal text-slate-400">وحدة</span></div>
                                   </div>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="h-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3 min-h-[160px]">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                               <Package size={20} className="text-slate-300" />
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-600 mb-1">لا يوجد مندوب محدد</p>
                               <p className="text-xs text-slate-400">اختر مندوباً لعرض معلومات المخزون الأصلي</p>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Section 2: Items Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px]">2</span>
                    الأصناف المرتجعة
                  </h3>
                  
                  <div className="border border-slate-200 rounded-xl overflow-visible bg-white shadow-sm flex flex-col">
                     <div className="overflow-x-auto min-h-[150px]">
                       <table className="w-full text-sm">
                         <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600 w-1/3">الصنف</th>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600 w-1/5">السبب</th>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600 w-[15%]">الكمية</th>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600">ملاحظات إضافية</th>
                             <th className="px-4 py-3 text-center font-semibold text-slate-600 w-[60px]">إجراء</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {items.map((item, index) => {
                              const maxQuantity = availableProducts.find(p => p.productId === item.product)?.quantity || 0;
                              const isProductSelected = item.product !== "";
                              
                              return (
                                <tr key={index} className={`bg-white transition-colors hover:bg-slate-50/50 ${!isProductSelected ? "bg-slate-50/20" : ""}`}>
                                  <td className="px-4 py-3 align-top">
                                     <div className="relative">
                                       <select
                                         value={item.product}
                                         onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                         className={`w-full appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${!item.product && error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                                       >
                                         <option value="">-- اختر منتجاً --</option>
                                         {(selectedVan ? availableProducts : []).map((p) => (
                                           <option key={p.productId} value={p.productId}>{p.productName} (متاح: {p.quantity})</option>
                                         ))}
                                       </select>
                                       <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                                     </div>
                                      {!selectedVan && (
                                          <p className="text-[10px] text-slate-400 mt-1 pl-1">الرجاء اختيار مندوب أولاً</p>
                                      )}
                                  </td>
                                  
                                  <td className="px-4 py-3 align-top">
                                     <div className="relative">
                                       <select
                                         value={item.reason}
                                         onChange={(e) => handleChangeItem(index, "reason", e.target.value)}
                                         disabled={!isProductSelected}
                                         className="w-full appearance-none border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                                       >
                                         {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                       </select>
                                       <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                                     </div>
                                  </td>

                                  <td className="px-4 py-3 align-top">
                                     <input
                                       type="number"
                                       value={item.quantity}
                                       onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                                       placeholder="الكمية"
                                       min="1"
                                       max={selectedVan ? maxQuantity : undefined}
                                       disabled={!isProductSelected}
                                       className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                                       dir="ltr"
                                     />
                                     {isProductSelected && maxQuantity > 0 && (
                                         <p className="text-[10px] text-slate-500 mt-1 text-right">أقصى: {maxQuantity}</p>
                                     )}
                                  </td>

                                  <td className="px-4 py-3 align-top">
                                     <input
                                       type="text"
                                       value={item.notes}
                                       onChange={(e) => handleChangeItem(index, "notes", e.target.value)}
                                       placeholder="أسباب التلف، رقم التشغيلة..."
                                       disabled={!isProductSelected}
                                       className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                                     />
                                  </td>

                                  <td className="px-4 py-3 align-top">
                                      <div className="flex justify-center mt-1">
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف الصنف"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                      </div>
                                  </td>
                                </tr>
                              );
                            })}
                         </tbody>
                       </table>
                     </div>
                     <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center">
                       <button 
                         type="button" 
                         onClick={handleAddItem}
                         disabled={!selectedVan}
                         className="text-orange-600 hover:text-orange-700 disabled:text-slate-400 text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-orange-50 disabled:hover:bg-transparent transition-colors"
                       >
                         <Plus size={18} /> 
                         <span>إضافة صنف آخر</span>
                       </button>
                     </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
                    <Info size={18} className="text-red-500" />
                    {error}
                  </div>
                )}

                {/* Section 3: Summary & Action */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-8 shadow-sm">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-px bg-slate-200 rounded-lg overflow-hidden">
                       <div className="bg-slate-50 flex flex-col items-center px-6 py-2 min-w-[120px]">
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">عدد الأصناف</span>
                         <span className="font-bold text-2xl text-slate-800">{validItemsCount}</span>
                       </div>
                       <div className="bg-slate-50 flex flex-col items-center px-6 py-2 min-w-[120px]">
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">إجمالي الوحدات</span>
                         <span className="font-bold text-2xl text-slate-800" dir="ltr">{totalUnitsCount}</span>
                       </div>
                       <div className="bg-slate-50 flex flex-col items-center px-6 py-2 min-w-[140px]">
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">حالة العملية</span>
                         <span className={`text-sm font-bold mt-1 ${validItemsCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                           {validItemsCount > 0 ? "جاهز للتأكيد" : "بانتظار الإدخال"}
                         </span>
                       </div>
                     </div>

                     <button
                        type="submit"
                        disabled={loading || validItemsCount === 0 || !selectedVan}
                        className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-500/20 text-white px-10 py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-50 disabled:hover:bg-orange-500 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <RotateCcw size={20} />
                            تأكيد استلام المرتجع
                          </>
                        )}
                      </button>
                   </div>
                </div>

              </form>
            )}
          </div>
      </div>
    </div>
  );
}