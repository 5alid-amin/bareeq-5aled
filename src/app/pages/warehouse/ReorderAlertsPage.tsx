import React, { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, Trash2, PlusSquare, Search, Filter, Plus, FileText, Info, Package, Inbox, Calendar, SearchCheck, X, Tags, DollarSign } from "lucide-react";
import { products, Product, stockMovements } from "../../data/mockData";

export function ReorderAlertsPage() {
  const [items, setItems] = useState<{ product: string; quantity: string }>([
    { product: "", quantity: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");

  // State to track which product's info to show in the black card (last interacted row)
  const [activeRowIndex, setActiveRowIndex] = useState(0);

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
  }, [filterCategory, searchQuery, products, submitted]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products.length]);

  const handleAddItem = () => {
    const newIndex = items.length;
    setItems([...items, { product: "", quantity: "" }]);
    setActiveRowIndex(newIndex);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ product: "", quantity: "" });
    }
    setItems(newItems);
    setActiveRowIndex(Math.max(0, index - 1));
  };

  const handleChangeItem = (index: number, field: "product" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    setActiveRowIndex(index);
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

    products.push(newProduct);

    const emptyRowIndex = items.findIndex(i => !i.product);
    if (emptyRowIndex >= 0) {
       const newItems = [...items];
       newItems[emptyRowIndex].product = newId;
       setItems(newItems);
       setActiveRowIndex(emptyRowIndex);
    } else {
       setItems([...items, { product: newId, quantity: "" }]);
       setActiveRowIndex(items.length);
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
            notes: "تزويد مخزن"
          });
        }
      });

      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setSubmitted(false);
        setItems([{ product: "", quantity: "" }]);
        setActiveRowIndex(0);
      }, 3000);
    }, 1200);
  };

  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;
  const totalUnitsAdded = items.filter(i => i.product && parseInt(i.quantity) > 0).reduce((acc, item) => acc + parseInt(item.quantity || "0"), 0);

  const totalWarehouseProducts = products.length;
  const totalLowStock = products.filter((p) => p.quantity < p.minQuantity).length;

  // Get active product data for the black card
  const activeItem = items[activeRowIndex];
  const activeProductData = products.find(p => p.id === activeItem?.product);

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
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Section 1: Product Selection (New Layout) */}
                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">1</span>
                      اختيار الصنف والكمية
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                      <div className="sm:col-span-8">
                        <label className="block text-slate-700 text-sm font-medium mb-2">اسم المنتج</label>
                        <div className="relative">
                          <select
                            value={activeItem?.product || ""}
                            onChange={(e) => handleChangeItem(activeRowIndex, "product", e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[46px] pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option value="">-- اختر منتجاً من القائمة --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-slate-700 text-sm font-medium mb-2">الكمية المضافة (+)</label>
                        <input
                          type="number"
                          value={activeItem?.quantity || ""}
                          onChange={(e) => handleChangeItem(activeRowIndex, "quantity", e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-3 min-h-[46px] text-blue-700 font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Side Info Card (Updated Black Card) */}
                  <div className="lg:col-span-4">
                      <div className="h-full">
                          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-md h-full flex flex-col justify-center relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                               
                               <h4 className="text-slate-300 text-xs font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
                                 <Package size={14} className="text-blue-400" />
                                 تفاصيل الصنف الحالي
                               </h4>
                               
                               <div className="space-y-4 relative z-10">
                                 <div>
                                     <div className="text-slate-400 text-xs mb-1">اسم الصنف</div>
                                     <div className="font-bold text-base truncate">
                                       {activeProductData ? activeProductData.name : "لم يتم اختيار صنف"}
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                       <div className="text-slate-400 text-[10px] mb-1">الرصيد بالمخزن</div>
                                       <div className="font-bold text-base" dir="ltr">
                                         {activeProductData ? activeProductData.quantity : 0} <span className="text-[10px] font-normal text-slate-400">وحدة</span>
                                       </div>
                                    </div>
                                    <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/20">
                                       <div className="text-blue-200 text-[10px] mb-1">الكمية المضافة</div>
                                       <div className="font-bold text-base text-blue-400">
                                         {activeItem?.quantity || 0} <span className="text-[10px] font-normal opacity-75">+ وحدة</span>
                                       </div>
                                    </div>
                                 </div>
                               </div>
                          </div>
                      </div>
                  </div>
                </div>

                {/* Section 2: Items Table Summary */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-visible bg-white shadow-sm flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-right font-semibold text-slate-600">الصنف</th>
                              <th className="px-6 py-3 text-center font-semibold text-slate-600">الكمية</th>
                              <th className="px-6 py-3 text-center font-semibold text-slate-600 w-[80px]">إجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {items.map((item, index) => {
                               const product = products.find(p => p.id === item.product);
                               return (
                                 <tr 
                                   key={index} 
                                   onClick={() => setActiveRowIndex(index)}
                                   className={`cursor-pointer transition-colors ${activeRowIndex === index ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
                                 >
                                   <td className="px-6 py-3">
                                       <span className="font-bold text-slate-700">{product ? product.name : "صنف لم يحدد"}</span>
                                   </td>
                                   <td className="px-6 py-3 text-center font-bold text-blue-600">{item.quantity || 0}</td>
                                   <td className="px-6 py-3 text-center">
                                       <button
                                         type="button"
                                         onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }}
                                         className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                       >
                                         <Trash2 size={16} />
                                       </button>
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
                          className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Plus size={18} /> 
                          <span>إضافة صنف آخر من المخزون</span>
                        </button>
                      </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
                    <span className="text-red-500"><Info size={18} /></span>
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
          <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-9 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[160px] pl-8"
                >
                  <option value="الكل">كل الأقسام</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                <Filter size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right text-slate-500 font-semibold px-6 py-4">كود المنتج</th>
                <th className="text-right text-slate-500 font-semibold px-6 py-4">الاسم</th>
                <th className="text-center text-slate-500 font-semibold px-6 py-4">الرصيد</th>
                <th className="text-right text-slate-500 font-semibold px-6 py-4">مؤشر النفاذ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockList.map((p) => {
                const pct = Math.round((p.quantity / p.minQuantity) * 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg font-bold ${pct < 50 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-full max-w-[150px]">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${pct < 50 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}