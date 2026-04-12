import React, { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, Trash2, PlusSquare, Search, Filter, Plus, FileText, Info, Package, Inbox, Calendar, SearchCheck, X, Tags, DollarSign } from "lucide-react";
import { products, Product, stockMovements } from "../../data/mockData";

export function ReorderAlertsPage() {
  const [items, setItems] = useState<{ product: string; quantity: string }>([
    { product: "", quantity: "" }
  ]);
  const [restockDate, setRestockDate] = useState(new Date().toISOString().split("T")[0]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");

  // New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    minQuantity: "10",
    barcode: ""
  });

  const lowStockList = useMemo(() => {
    let list = products.filter((p) => p.quantity < p.minQuantity);
    if (filterCategory !== "الكل") {
       list = list.filter(p => p.category === filterCategory);
    }
    if (searchQuery.trim()) {
       const q = searchQuery.toLowerCase();
       list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [filterCategory, searchQuery, products, submitted]); // Add submitted to re-calc when something is added

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products.length]); // Refresh when products grow

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ product: "", quantity: "" });
    }
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.category) return;

    const newId = `PRD-${String(products.length + 1).padStart(3, "0")}`;
    const newProduct: Product = {
      id: newId,
      name: newProductData.name,
      category: newProductData.category,
      costPrice: parseFloat(newProductData.costPrice) || 0,
      sellingPrice: parseFloat(newProductData.sellingPrice) || 0,
      barcode: newProductData.barcode || `628100${Math.floor(100000 + Math.random() * 900000)}`,
      quantity: 0,
      minQuantity: parseInt(newProductData.minQuantity) || 10
    };

    // Add to mock DB (mutates array for the current session)
    products.push(newProduct);

    // Auto-select in the first empty row or append
    const emptyRowIndex = items.findIndex(i => !i.product);
    if (emptyRowIndex >= 0) {
       const newItems = [...items];
       newItems[emptyRowIndex].product = newId;
       setItems(newItems);
    } else {
       setItems([...items, { product: newId, quantity: "" }]);
    }

    setShowNewProductModal(false);
    setNewProductData({ name: "", category: "", costPrice: "", sellingPrice: "", minQuantity: "10", barcode: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter(item => item.product && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل مع إدخال كمية صحيحة أكبر من الصفر");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Add quantity to main products inventory
      validItems.forEach(item => {
        const prod = products.find(p => p.id === item.product);
        if (prod) {
          const beforeQty = prod.quantity;
          prod.quantity += parseInt(item.quantity);
          const afterQty = prod.quantity;
          
          stockMovements.push({
            id: `MOV-${String(stockMovements.length + 1).padStart(3, "0")}`,
            date: new Date().toISOString(),
            type: "تزويد",
            productId: prod.id,
            productName: prod.name,
            quantity: parseInt(item.quantity),
            balanceBefore: beforeQty,
            balanceAfter: afterQty,
            notes: generalNotes || "تزويد مخزن"
          });
        }
      });

      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setSubmitted(false);
        setItems([{ product: "", quantity: "" }]);
        setGeneralNotes("");
      }, 3000);
    }, 1200);
  };

  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;
  const totalUnitsAdded = items.filter(i => i.product && parseInt(i.quantity) > 0).reduce((acc, item) => acc + parseInt(item.quantity || "0"), 0);

  const totalWarehouseProducts = products.length;
  const totalWarehouseUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalLowStock = products.filter((p) => p.quantity < p.minQuantity).length;

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1) Page Header */}
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-2xl font-bold text-slate-800">تزويد المخزن</h1>
        <p className="text-sm text-slate-500">تسجيل استلام بضاعة جديدة وتحديث أرصدة المنتجات في المخزن الرئيسي</p>
      </div>

      {/* 2) Main Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-stretch">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                 <PlusSquare size={18} />
              </span>
              بيانات إذن الاستلام
            </h2>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-1.5">
               <CheckCircle size={14} /> المزامنة المباشرة للأرصدة
            </span>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-50"></div>
                  <CheckCircle size={40} className="text-emerald-500 relative z-10" />
                </div>
                <h3 className="text-slate-800 text-xl mb-2 font-bold">تم إضافة الكميات بنجاح!</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  تم استلام الأصناف وتسجيل({totalUnitsAdded}) وحدة جديدة إلى المخزن وتحديث الأرصدة الفعلية في النظام.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Reference & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">1</span>
                      معلومات التزويد
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">تاريخ الاستلام</label>
                        <div className="relative">
                           <input
                             type="date"
                             value={restockDate}
                             onChange={(e) => setRestockDate(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[46px] pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             dir="rtl"
                           />
                           <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 text-sm font-medium mb-2">ملاحظات عامة (اختياري)</label>
                        <div className="relative">
                           <input
                             type="text"
                             value={generalNotes}
                             onChange={(e) => setGeneralNotes(e.target.value)}
                             placeholder="أي ملاحظات حول المورد، شركة الشحن..."
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[46px] pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                           />
                           <FileText size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side Info Card */}
                  <div className="lg:col-span-4">
                     <div className="h-full">
                          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-md h-full flex flex-col justify-center relative overflow-hidden">
                             {/* Accents */}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                             
                             <h4 className="text-slate-300 text-xs font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Inbox size={14} className="text-blue-400" />
                                إحصائيات المخزون المركزي
                             </h4>
                             
                             <div className="space-y-4 relative z-10">
                                <div>
                                   <div className="text-slate-400 text-xs mb-1">إجمالي المنتجات</div>
                                   <div className="font-bold text-base">{totalWarehouseProducts} <span className="text-slate-400 text-sm font-normal">صنف مسجل بالنظام</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                      <div className="text-slate-400 text-[10px] mb-1">الرصيد الكلي</div>
                                      <div className="font-bold text-base" dir="ltr">{totalWarehouseUnits} <span className="text-[10px] font-normal text-slate-400">وحدة</span></div>
                                   </div>
                                   <div className={`rounded-lg p-3 border ${totalLowStock > 0 ? "bg-red-500/20 border-red-500/20" : "bg-emerald-500/20 border-emerald-500/20"}`}>
                                      <div className={`text-[10px] mb-1 ${totalLowStock > 0 ? "text-red-200" : "text-emerald-200"}`}>تحتاج لتزويد</div>
                                      <div className={`font-bold text-base ${totalLowStock > 0 ? "text-red-400" : "text-emerald-400"}`}>{totalLowStock} <span className="text-[10px] font-normal opacity-75">نواقص</span></div>
                                   </div>
                                </div>
                             </div>
                          </div>
                     </div>
                  </div>
                </div>

                {/* Section 2: Items Table */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                     <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                       <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">2</span>
                       الأصناف المضافة (الاستلام)
                     </h3>
                     <button
                       type="button"
                       onClick={() => setShowNewProductModal(true)}
                       className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                     >
                       <Package size={14} className="text-blue-600" /> تعريف صنف جديد كلياً
                     </button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-visible bg-white shadow-sm flex flex-col">
                     <div className="overflow-x-auto min-h-[150px]">
                       <table className="w-full text-sm">
                         <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600 w-1/2">الصنف</th>
                             <th className="px-4 py-3 text-right font-semibold text-slate-600 w-1/3">الكمية المضافة (+)</th>
                             <th className="px-4 py-3 text-center font-semibold text-slate-600 w-[80px]">إجراء</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {items.map((item, index) => {
                              const productData = products.find(p => p.id === item.product);
                              const isProductSelected = item.product !== "";
                              
                              return (
                                <tr key={index} className={`bg-white transition-colors hover:bg-slate-50/50 ${!isProductSelected ? "bg-slate-50/20" : ""}`}>
                                  <td className="px-4 py-3 align-top">
                                     <div className="relative">
                                       <select
                                         value={item.product}
                                         onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                         className={`w-full appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${!item.product && error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                                       >
                                         <option value="">-- اختر منتجاً --</option>
                                         {products.map((p) => (
                                           <option key={p.id} value={p.id}>{p.name}</option>
                                         ))}
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
                                       disabled={!isProductSelected}
                                       className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:font-normal transition-colors"
                                       dir="ltr"
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
                         className="text-blue-600 hover:text-blue-700 disabled:text-slate-400 text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 disabled:hover:bg-transparent transition-colors"
                       >
                         <Plus size={18} /> 
                         <span>إضافة صنف آخر من المخزون</span>
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
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">الأصناف المضافة</span>
                         <span className="font-bold text-2xl text-slate-800">{validItemsCount}</span>
                       </div>
                       <div className="bg-slate-50 flex flex-col items-center px-6 py-2 min-w-[120px]">
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">إجمالي الوحدات</span>
                         <span className="font-bold text-2xl text-blue-700" dir="ltr">+{totalUnitsAdded}</span>
                       </div>
                       <div className="bg-slate-50 flex flex-col items-center px-6 py-2 min-w-[140px]">
                         <span className="text-slate-500 text-[11px] font-medium mb-1 uppercase tracking-wider">الحالة</span>
                         <span className={`text-sm font-bold mt-1 ${validItemsCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                           {validItemsCount > 0 ? "جاهز لإضافة الرصيد" : "يرجى ملء البيانات"}
                         </span>
                       </div>
                     </div>

                     <button
                        type="submit"
                        disabled={loading || validItemsCount === 0}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 text-white px-10 py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            جاري التنفيذ...
                          </>
                        ) : (
                          <>
                            <PlusSquare size={18} />
                            تأكيد تزويد المخزن
                          </>
                        )}
                      </button>
                   </div>
                </div>

              </form>
            )}
          </div>
      </div>

      {/* 3) Low Stock Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-8">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </span>
            النواقص وتنبيهات الأصناف المنخفضة
            <span className="bg-rose-100 text-rose-600 text-xs px-2.5 py-0.5 rounded-full font-bold ml-1">{lowStockList.length}</span>
          </h2>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
             <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
             <input 
                type="text"
                placeholder="بحث باسم المنتج، الرقم التعريفي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pr-9 pl-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
             />
          </div>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-9 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[160px] pl-8"
                >
                  <option value="الكل">كل الأقسام / الفئات</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                <Filter size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right text-slate-500 font-semibold px-6 py-4 w-[12%]">كود المنتج</th>
                <th className="text-right text-slate-500 font-semibold px-6 py-4 w-[25%]">اسم المنتج وتفاصيله</th>
                <th className="text-right text-slate-500 font-semibold px-6 py-4 w-[15%]">الفئة</th>
                <th className="text-center text-slate-500 font-semibold px-6 py-4 w-[10%]">الرصيد المتبقي</th>
                <th className="text-center text-slate-500 font-semibold px-6 py-4 w-[10%]">الحد الأدنى</th>
                <th className="text-right text-slate-500 font-semibold px-6 py-4 w-[28%]">مؤشر نفاذ المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                      <p className="text-lg font-bold text-slate-700 mb-1">لا توجد نواقص حالياً</p>
                      <p className="text-sm">حالة المخزون ممتازة، جميع الأرصدة أعلى من الحد الأدنى</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lowStockList.map((p) => {
                  const pct = Math.round((p.quantity / p.minQuantity) * 100);
                  const isVeryLow = pct < 50;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 align-middle">
                        <span className="inline-flex items-center justify-center font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200/60">
                           {p.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                           {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className={`text-sm font-bold px-2 py-1.5 rounded-lg ${isVeryLow ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                           {p.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="text-sm font-medium text-slate-500">
                           {p.minQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3 w-full max-w-[200px]">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isVeryLow ? 'bg-rose-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold shrink-0 w-8 text-left ${isVeryLow ? 'text-rose-600' : 'text-amber-600'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4) Modal: Create New Product */}
      {showNewProductModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                     <Package size={16} />
                   </div>
                   تعريف صنف جديد بالأنظمة
                 </h3>
                 <button onClick={() => setShowNewProductModal(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleCreateNewProduct} className="p-6 space-y-5">
                 <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم الصنف الجديد <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                         type="text" 
                         required 
                         value={newProductData.name}
                         onChange={e => setNewProductData({...newProductData, name: e.target.value})}
                         placeholder="مثال: مناديل ورقية 500 منديل" 
                         className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                      />
                      <Package size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">القسم / الفئة <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                           type="text" 
                           required 
                           list="categories"
                           value={newProductData.category}
                           onChange={e => setNewProductData({...newProductData, category: e.target.value})}
                           placeholder="مثال: ورقيات" 
                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-9"
                        />
                        <Tags size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <datalist id="categories">
                           {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">الباركود (اختياري)</label>
                      <div className="relative">
                        <input
                           type="text" 
                           value={newProductData.barcode}
                           onChange={e => setNewProductData({...newProductData, barcode: e.target.value})}
                           placeholder="يولد تلقائياً إن ترك فارغاً" 
                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                           dir="ltr"
                        />
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">سعر التكلفة</label>
                      <div className="relative">
                        <input
                           type="number" 
                           step="0.01"
                           value={newProductData.costPrice}
                           onChange={e => setNewProductData({...newProductData, costPrice: e.target.value})}
                           placeholder="0.00" 
                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pl-8"
                           dir="ltr"
                        />
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">سعر البيع</label>
                      <div className="relative">
                        <input
                           type="number" 
                           step="0.01"
                           value={newProductData.sellingPrice}
                           onChange={e => setNewProductData({...newProductData, sellingPrice: e.target.value})}
                           placeholder="0.00" 
                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pl-8"
                           dir="ltr"
                        />
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">تنبيه النواقص (الحد الأدنى للرصيد)</label>
                    <input
                       type="number" 
                       value={newProductData.minQuantity}
                       onChange={e => setNewProductData({...newProductData, minQuantity: e.target.value})}
                       className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       dir="ltr"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 px-1">سيبدأ النظام في تنبيهك عند وصول रصيد هذا المنتج لهذا الرقم.</p>
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setShowNewProductModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                      <CheckCircle size={16} /> حفظ وإضافة للإذن
                    </button>
                 </div>
              </form>
            </div>
         </div>
      )}

    </div>
  );
}
