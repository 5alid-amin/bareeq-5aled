import React, { useState } from "react";
import { Plus, Edit2, Search, Package, ChevronDown } from "lucide-react";
import { products as initialProducts, Product } from "../../data/mockData";

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
              <h2 className="text-slate-700 text-base">{product ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-lg">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5">اسم المنتج</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اسم المنتج الكامل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5">الفئة</label>
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
                <label className="block text-slate-600 text-sm mb-1.5">سعر التكلفة (ج.م)</label>
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
                <label className="block text-slate-600 text-sm mb-1.5">سعر البيع (ج.م)</label>
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
                <label className="block text-slate-600 text-sm mb-1.5">الباركود</label>
                <input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="628100XXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">الكمية المتاحة</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">إلغاء</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700">حفظ المنتج</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function InventoryPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("الكل");

  const categories = ["الكل", ...Array.from(new Set(productList.map((p) => p.category)))];

  const filtered = productList.filter((p) => {
    const matchSearch = p.name.includes(search) || p.id.includes(search) || p.barcode.includes(search);
    const matchCat = filterCat === "الكل" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (data: Partial<Product>) => {
    if (editProduct) {
      setProductList(productList.map((p) => p.id === editProduct.id ? { ...p, ...data } : p));
    } else {
      const newProd: Product = {
        id: `PRD-${String(productList.length + 1).padStart(3, "0")}`,
        name: data.name ?? "",
        category: data.category ?? "",
        costPrice: data.costPrice ?? 0,
        sellingPrice: data.sellingPrice ?? 0,
        barcode: data.barcode ?? "",
        quantity: data.quantity ?? 0,
        minQuantity: 20,
      };
      setProductList([...productList, newProd]);
    }
  };

  return (
    <div className="space-y-5">
      {(showModal || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن منتج أو باركود..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <div className="relative">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-8 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          إضافة منتج
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الأصناف", value: productList.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "مخزون جيد", value: productList.filter(p => p.quantity >= p.minQuantity * 2).length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "مخزون منخفض", value: productList.filter(p => p.quantity < p.minQuantity).length, color: "text-red-600", bg: "bg-red-50" },
          { label: "قيمة المخزون", value: `${productList.reduce((s, p) => s + p.quantity * p.costPrice, 0).toLocaleString("ar-EG")} ج.م`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-white shadow-sm`}>
            <p className={`text-lg ${s.color} truncate`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-700 text-base">المخزون الرئيسي ({filtered.length} صنف)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-slate-500 text-xs px-4 py-3">رقم المنتج</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">اسم المنتج</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">الفئة</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">سعر التكلفة</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">سعر البيع</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">الباركود</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">الكمية</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">الحالة</th>
                <th className="text-right text-slate-500 text-xs px-4 py-3">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const isLow = p.quantity < p.minQuantity;
                const isMid = p.quantity >= p.minQuantity && p.quantity < p.minQuantity * 2;
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isLow ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded">{p.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-blue-500" />
                        </div>
                        <span className="text-slate-700 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{p.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{p.costPrice} ج.م</td>
                    <td className="px-4 py-3.5 text-emerald-600 text-sm">{p.sellingPrice} ج.م</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs" dir="ltr">{p.barcode}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${isLow ? "text-red-600" : isMid ? "text-yellow-600" : "text-slate-700"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full ${isLow ? "bg-red-100 text-red-600" : isMid ? "bg-yellow-100 text-yellow-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {isLow ? "منخفض" : isMid ? "متوسط" : "جيد"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setEditProduct(p)}
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                      >
                        <Edit2 size={12} />
                        تعديل
                      </button>
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
