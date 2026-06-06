import React, { useState, useEffect } from "react";
import { Plus, Edit2, Search, Package, ChevronDown, AlertTriangle, Trash2, Settings2, Loader2 } from "lucide-react";
import axios from "axios";

// المتغير اللي شايل البيز بتاع الـ URL
const API_BASE_URL = "https://pareeq.runasp.net/api/Inventory";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Product {
  productId: number;
  productName: string;
  categoryName: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  currentQuantity: number;
  minThreshold: number;
  status: string;
}

interface Category {
  categoryId?: number;
  categoryName: string;
}

// ─── Category Management Modal ───────────────────────────────────────────────────
function CategoryModal({
  categories,
  onClose,
  onRefresh
}: {
  categories: Category[],
  onClose: () => void,
  onRefresh: () => void
}) {
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const handleSaveCategory = async () => {
    if (!newCat.trim()) return;
    try {
      if (editingCat) {
        await axios.put(`${API_BASE_URL}/categories`, { categoryId: editingCat.categoryId, categoryName: newCat });
      } else {
        await axios.post(`${API_BASE_URL}/categories`, { categoryName: newCat });
      }
      setNewCat("");
      setEditingCat(null);
      onRefresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-slate-700 text-base font-bold flex items-center gap-2">
            <Settings2 size={18} /> إدارة الفئات
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder={editingCat ? "تعديل الفئة..." : "اسم الفئة الجديدة..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={handleSaveCategory} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">
              {editingCat ? "تعديل" : "إضافة"}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="flex items-center justify-between p-3 hover:bg-slate-50">
                <span className="text-slate-700 text-sm font-medium">{cat.categoryName}</span>
                <button
                  onClick={() => { setEditingCat(cat); setNewCat(cat.categoryName); }}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Modal ──────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave, categories }: { product?: Product | null; onClose: () => void; onSave: () => void; categories: Category[] }) {
  const [form, setForm] = useState({
    productName: product?.productName ?? "",
    categoryId: categories.find(c => c.categoryName === product?.categoryName)?.categoryId ?? (categories[0]?.categoryId || 0),
    purchasePrice: product?.purchasePrice ?? 0,
    salePrice: product?.salePrice ?? 0,
    barcode: product?.barcode ?? "",
    initialQuantity: product?.currentQuantity ?? 0,
    minThresholdMainStock: product?.minThreshold ?? 20,
    minThresholdVehicle: 5,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await axios.put(`${API_BASE_URL}/${product.productId}`, form);
      } else {
        await axios.post(API_BASE_URL, form);
      }
      setSaved(true);
      onSave();
      setTimeout(() => onClose(), 1300);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">اسم المنتج</label>
                <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الفئة</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">سعر الشراء</label>
                <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">سعر البيع</label>
                <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الباركود</label>
                <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">الكمية الافتتاحية</label>
                <input type="number" disabled={!!product} value={form.initialQuantity} onChange={(e) => setForm({ ...form, initialQuantity: parseInt(e.target.value) })} className="w-full disabled:bg-slate-200 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">حد المخزن الرئيسي</label>
                <input type="number" value={form.minThresholdMainStock} onChange={(e) => setForm({ ...form, minThresholdMainStock: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-bold">حد السيارة</label>
                <input type="number" value={form.minThresholdVehicle} onChange={(e) => setForm({ ...form, minThresholdVehicle: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold">إلغاء</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "حفظ المنتج"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Inventory Page (Main) ──────────────────────────────────────────────────────
export function InventoryPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState({ totalProducts: 0, goodStockCount: 0, lowStockCount: 0 });
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<number | string>("الكل");
  const [filterMode, setFilterMode] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.name = search;
      if (filterCat !== "الكل") params.categoryId = filterCat;
      if (filterMode) params.status = filterMode === "low" ? "منخفض" : "جيد";

      const res = await axios.get(API_BASE_URL, { params });
      setProductList(res.data.data);
      setSummary(res.data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterCat, filterMode]);

  return (
    <div className="space-y-5">
      {(showModal || editProduct) && (
        <ProductModal
          categories={categories}
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={fetchData}
        />
      )}

      {showCatModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCatModal(false)}
          onRefresh={fetchCategories}
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
              placeholder="بحث..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm w-56 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-8 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="الكل">كل الفئات</option>
              {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
            <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowCatModal(true)} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200">
            <Settings2 size={16} /> إدارة الفئات
          </button>
          <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold">
            <Plus size={16} /> إضافة منتج
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => setFilterMode("")} className={`${filterMode === "" ? "bg-blue-100 ring-2 ring-blue-400" : "bg-blue-50"} rounded-xl p-3.5 text-right transition-all`}>
          <p className="text-lg font-bold text-blue-600">{summary.totalProducts}</p>
          <p className="text-slate-500 text-xs font-bold">إجمالي الأصناف</p>
        </button>
        <button onClick={() => setFilterMode("good")} className={`${filterMode === "good" ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-emerald-50"} rounded-xl p-3.5 text-right transition-all`}>
          <p className="text-lg font-bold text-emerald-600">{summary.goodStockCount}</p>
          <p className="text-slate-500 text-xs font-bold">مخزون جيد</p>
        </button>
        <button onClick={() => setFilterMode("low")} className={`${filterMode === "low" ? "bg-red-100 ring-2 ring-red-400" : "bg-red-50"} rounded-xl p-3.5 text-right transition-all`}>
          <p className="text-lg font-bold text-red-600">{summary.lowStockCount}</p>
          <p className="text-slate-500 text-xs font-bold">مخزون منخفض</p>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-slate-500 text-xs font-bold px-4 py-3">المنتج</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الفئة</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">سعر البيع</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الكمية</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3">الحالة</th>
                <th className="text-slate-500 text-xs font-bold px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : productList.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-blue-500" />
                      <div>
                        <p className="text-slate-700 text-sm font-bold">{p.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.barcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600">{p.categoryName}</td>
                  <td className="px-4 py-4 text-emerald-600 text-sm font-bold">{p.salePrice} ج.م</td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-black ${p.status === "منخفض" ? "text-red-600" : "text-emerald-600"}`}>{p.currentQuantity}</span>
                    <span className="text-[10px] text-slate-400 mr-2">/ حد: {p.minThreshold}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${p.status === "منخفض" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => setEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}