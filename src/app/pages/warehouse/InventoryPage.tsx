import React, { useState } from "react";
import { Plus, Edit2, Search, Package, ChevronDown, AlertTriangle, Trash2 } from "lucide-react";
import { products as initialProducts, Product, stockMovements } from "../../data/mockData";

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (p: Partial<Product>) => void;
}

const CATEGORIES = ["منظفات سائلة", "مساحيق الغسيل", "منظفات عامة", "منظفات السيارات", "منظفات الحمام", "معطرات", "منظفات شخصية", "منظفات المطبخ"];

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? CATEGORIES[0],
    costPrice: product?.costPrice?.toString() ?? "",
    sellingPrice: product?.sellingPrice?.toString() ?? "",
    barcode: product?.barcode ?? "",
    quantity: product?.quantity?.toString() ?? "",
    minQuantity: product?.minQuantity?.toString() ?? "20",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      category: form.category,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      barcode: form.barcode,
      quantity: parseInt(form.quantity),
      minQuantity: parseInt(form.minQuantity) || 20,
    });
    setSaved(true);
    setTimeout(() => onClose(), 1300);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h3 className="text-slate-700 text-lg">{product ? "تم التحديث" : "تمت الإضافة"} بنجاح!</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base font-bold">{product ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-lg">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">اسم المنتج</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اسم المنتج الكامل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الفئة</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">سعر الشراء (ج.م)</label>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">سعر البيع (ج.م)</label>
                <input
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الباركود</label>
                <input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="628100XXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الكمية المتاحة</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">
                  الحد الأدنى للمخزون
                  <span className="text-slate-400 text-xs mr-2 font-normal">— عند النزول تحته يُصبح المنتج "منخفض"</span>
                </label>
                <input
                  type="number"
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                  placeholder="20"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50">إلغاء</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex justify-center items-center gap-2">حفظ المنتج</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Damage Registration Modal ──────────────────────────────────────────────────────────
function DamageRegistrationModal({ onClose, onSave, productsList, preselectedProductId }: { onClose: () => void, onSave: (productId: string, qty: number, notes: string) => void, productsList: Product[], preselectedProductId?: string }) {
    const [selectedProduct, setSelectedProduct] = useState(preselectedProductId || "");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    const activeProduct = productsList.find(p => p.id === selectedProduct);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!activeProduct) { setError("يرجى اختيار منتج"); return; }
        const q = parseInt(quantity);
        if (isNaN(q) || q <= 0) { setError("يرجى إدخال كمية صحيحة أكبر من الصفر"); return; }
        if (q > activeProduct.quantity) { setError("الكمية المدخلة أكبر من الرصيد المتاح من هذا المنتج!"); return; }
        
        onSave(selectedProduct, q, notes);
        setSaved(true);
        setTimeout(() => onClose(), 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={!saved ? onClose : undefined}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {saved ? (
                    <div className="p-10 text-center bg-rose-50">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={30} className="text-rose-500" />
                        </div>
                        <h3 className="text-slate-800 text-lg font-bold">تم تسجيل الهالك بنجاح وخُصم من المخزون!</h3>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50 text-rose-800">
                            <h2 className="font-bold flex items-center gap-2">
                                <AlertTriangle size={18} className="text-rose-600" />
                                تسجيل بضاعة تالفة / هالك
                            </h2>
                            <button onClick={onClose} className="w-8 h-8 rounded-lg text-rose-500 bg-rose-100 hover:bg-rose-200 flex items-center justify-center text-lg transition-colors">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-slate-700 text-sm font-bold mb-1.5">اختر المنتج التالف</label>
                                <div className="relative">
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="">-- اختر منتجاً --</option>
                                        {productsList.map((p) => (
                                            <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                                {p.name} (المتاح: {p.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-slate-700 text-sm font-bold mb-1.5 flex items-center justify-between">
                                    <span>الكمية التالفة</span>
                                    {activeProduct && <span className="text-xs text-rose-600 font-medium">أقصى حد: {activeProduct.quantity}</span>}
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="مثال: 2"
                                    min="1"
                                    max={activeProduct?.quantity}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 text-sm font-bold mb-1.5">سبب التلف وملاحظات</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="شرح مبسط للسوء والتلف..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            {error && (
                                <div className="bg-rose-50 text-rose-600 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 border border-rose-100">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition-colors">إلغاء</button>
                                <button type="submit" className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors flex justify-center items-center gap-2">
                                    <Trash2 size={16} /> خصم التالف
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

type FilterMode = "all" | "good" | "low";

export function InventoryPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageTargetId, setDamageTargetId] = useState<string | undefined>(undefined);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("الكل");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const categories = ["الكل", ...Array.from(new Set(productList.map((p) => p.category)))];

  const totalCount = productList.length;
  const goodCount = productList.filter(p => p.quantity >= p.minQuantity).length;
  const lowCount = productList.filter(p => p.quantity < p.minQuantity).length;

  const filtered = productList.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchCat = filterCat === "الكل" || p.category === filterCat;
    const matchMode =
      filterMode === "all" ? true :
      filterMode === "good" ? p.quantity >= p.minQuantity :
      p.quantity < p.minQuantity;
    return matchSearch && matchCat && matchMode;
  });

  const handleSaveProduct = (data: Partial<Product>) => {
    // Also updating initialProducts memory so it persists across views
    if (editProduct) {
      const updated = productList.map((p) => {
          if(p.id === editProduct.id) {
             const m = { ...p, ...data } as Product;
             const index = initialProducts.findIndex(ip => ip.id === p.id);
             if (index > -1) initialProducts[index] = m;
             return m;
          }
          return p;
      });
      setProductList(updated);
    } else {
      const newProd: Product = {
        id: `PRD-${String(productList.length + 1).padStart(3, "0")}`,
        name: data.name ?? "",
        category: data.category ?? "",
        costPrice: data.costPrice ?? 0,
        sellingPrice: data.sellingPrice ?? 0,
        barcode: data.barcode ?? "",
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? 20,
      };
      initialProducts.push(newProd);
      setProductList([...initialProducts]);
    }
  };

  const handleSaveDamage = (productId: string, qty: number, notes: string) => {
      const mockProduct = initialProducts.find(m => m.id === productId);
      if (mockProduct) {
          const beforeQty = mockProduct.quantity;
          mockProduct.quantity -= qty;
          const afterQty = mockProduct.quantity;
          
          stockMovements.push({
              id: `MOV-${String(stockMovements.length + 1).padStart(3, "0")}`,
              date: new Date().toISOString(),
              type: "هالك",
              productId: mockProduct.id,
              productName: mockProduct.name,
              quantity: qty,
              balanceBefore: beforeQty,
              balanceAfter: afterQty,
              notes: notes || "تسجيل هالك من المستودع"
          });
          
          // Re-render
          setProductList([...initialProducts]);
      }
  };

  const openDamageModal = (preselectId?: string) => {
      setDamageTargetId(preselectId);
      setShowDamageModal(true);
  };

  const summaryCards = [
    {
      label: "إجمالي الأصناف",
      value: totalCount,
      color: "text-blue-600",
      bg: filterMode === "all" ? "bg-blue-100 ring-2 ring-blue-400" : "bg-blue-50 hover:bg-blue-100",
      mode: "all" as FilterMode,
    },
    {
      label: "مخزون جيد",
      value: goodCount,
      color: "text-emerald-600",
      bg: filterMode === "good" ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-emerald-50 hover:bg-emerald-100",
      mode: "good" as FilterMode,
    },
    {
      label: "مخزون منخفض",
      value: lowCount,
      color: "text-red-600",
      bg: filterMode === "low" ? "bg-red-100 ring-2 ring-red-400" : "bg-red-50 hover:bg-red-100",
      mode: "low" as FilterMode,
    },
  ];

  return (
    <div className="space-y-5">
      {(showModal || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}

      {showDamageModal && (
        <DamageRegistrationModal 
          preselectedProductId={damageTargetId}
          productsList={productList}
          onClose={() => setShowDamageModal(false)}
          onSave={handleSaveDamage}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن منتج أو باركود..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-shadow"
            />
          </div>
          <div className="relative">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-8 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow min-w-[140px]"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={() => openDamageModal()}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2.5 rounded-xl text-sm font-bold border border-rose-100 transition-colors"
            >
                <AlertTriangle size={16} />
                تسجيل هالك
            </button>
            <button
                onClick={() => { setEditProduct(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
                <Plus size={16} />
                إضافة منتج
            </button>
        </div>
      </div>

      {/* Summary Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summaryCards.map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterMode(s.mode)}
            className={`${s.bg} rounded-xl p-3.5 border border-white shadow-sm text-right transition-all duration-150 cursor-pointer`}
          >
            <p className={`text-lg font-bold ${s.color} truncate`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5 font-bold">{s.label}</p>
            {filterMode === s.mode && (
              <p className={`text-[10px] mt-1 ${s.color} opacity-80 font-bold`}>● معروض الآن</p>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-slate-800 font-bold text-base">قائمة الأصناف ({filtered.length})</h2>
          {filterMode !== "all" && (
            <button
              onClick={() => setFilterMode("all")}
              className="text-xs text-slate-500 font-bold hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              عرض الكل ✕
            </button>
          )}
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-slate-500 text-xs font-bold px-4 py-3 whitespace-nowrap">رقم المنتج</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">اسم المنتج</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الفئة</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3 whitespace-nowrap">سعر الشراء</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3 whitespace-nowrap">سعر البيع</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الكمية والمخزون</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الحالة</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3 w-[150px] text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const isLow = p.quantity < p.minQuantity;
                const isMid = p.quantity >= p.minQuantity && p.quantity < p.minQuantity * 2;
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? "bg-red-50/20" : ""}`}>
                    <td className="px-4 py-4 align-top">
                      <span className="text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded font-mono">{p.id}</span>
                      <div className="text-[10px] text-slate-400 mt-1 block font-mono" dir="ltr">{p.barcode}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-blue-500" />
                        </div>
                        <span className="text-slate-700 text-sm font-bold pt-1 leading-tight">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-xs bg-slate-100 font-bold text-slate-600 px-2.5 py-1 rounded-md">{p.category}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm font-medium align-top whitespace-nowrap">{p.costPrice} ج.م</td>
                    <td className="px-4 py-4 text-emerald-600 text-sm font-bold align-top whitespace-nowrap">{p.sellingPrice} ج.م</td>
                    
                    <td className="px-4 py-4 align-top text-center">
                        <div className="flex flex-col items-center gap-1 w-20">
                            <span className={`text-base font-black ${isLow ? "text-red-600" : isMid ? "text-yellow-600" : "text-emerald-600"}`}>
                                {p.quantity}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded w-full border border-slate-200 shadow-sm" title="الحد الأدنى">أدنى: {p.minQuantity}</span>
                        </div>
                    </td>
                    
                    <td className="px-4 py-4 align-top">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${isLow ? "bg-red-50 text-red-600 border-red-100" : isMid ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                        {isLow ? "منخفض" : isMid ? "متوسط" : "جيد"}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDamageModal(p.id)}
                            className="bg-white border border-slate-200 text-rose-500 px-2 py-1.5 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
                            title="تسجيل هالك"
                          >
                            <AlertTriangle size={14} />
                          </button>
                          <button
                            onClick={() => setEditProduct(p)}
                            className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm"
                          >
                            <Edit2 size={13} />
                            تعديل
                          </button>
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
