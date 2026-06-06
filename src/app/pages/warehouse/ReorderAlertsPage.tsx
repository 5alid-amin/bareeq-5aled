import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, Trash2, PlusSquare, Search, Filter, Plus, Info, Package } from "lucide-react";
import axios from "axios";

// --- Interfaces المطابقة للـ DTOs في الباك إند ---
interface ProductSimple {
  productId: number;
  productName: string;
  currentQuantity: number;
}

interface LowStockProduct {
  productId: number;
  productName: string;
  currentQuantity: number;
  minThreshold: number;
  stockPercentage: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

interface OrderItem {
  productId: number | "";
  addedQuantity: number | "";
  notes: string;
}

export function ReorderAlertsPage() {
  // --- States ---
  const [items, setItems] = useState<OrderItem[]>([{ productId: "", addedQuantity: "", notes: "تزويد مخزن" }]);
  const [allProducts, setAllProducts] = useState<ProductSimple[]>([]);
  const [lowStockList, setLowStockList] = useState<LowStockProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  // تأكد من تغيير اللينك حسب الدومين بتاعك (Somee / MonsterASP)
  const API_BASE = "https://pareeq.runasp.net/api/InventoryLoad";

  // --- Functions: Fetch Data ---
  const fetchData = async () => {
    try {
      const [prodsRes, lowRes, catsRes] = await Promise.all([
        axios.get(`${API_BASE}/AllProducts`),
        axios.get(`${API_BASE}/LowStock?search=${searchQuery}${selectedCatId !== "all" ? `&categoryId=${selectedCatId}` : ""}`),
        axios.get(`${API_BASE}/Categories`)
      ]);
      setAllProducts(prodsRes.data);
      setLowStockList(lowRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCatId]);

  // --- Logic: Form Actions ---
  const handleAddItem = () => {
    setItems([...items, { productId: "", addedQuantity: "", notes: "تزويد مخزن" }]);
    setActiveRowIndex(items.length);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length === 0 ? [{ productId: "", addedQuantity: "", notes: "تزويد مخزن" }] : newItems);
    setActiveRowIndex(Math.max(0, index - 1));
  };

  const handleChangeItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    setActiveRowIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = items.filter(i => i.productId !== "" && Number(i.addedQuantity) > 0);

    if (payload.length === 0) {
      setError("يرجى اختيار صنف واحد على الأقل وإدخال كمية أكبر من الصفر");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/ProcessSupply`, payload);
      setSubmitted(true);
      await fetchData(); // تحديث الأرصدة فوراً

      setTimeout(() => {
        setSubmitted(false);
        setItems([{ productId: "", addedQuantity: "", notes: "تزويد مخزن" }]);
        setActiveRowIndex(0);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data || "فشل الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const activeItem = items[activeRowIndex];
  const activeProductData = allProducts.find(p => p.productId === activeItem?.productId);

  return (
    <div className="space-y-8 pb-10 px-2" dir="rtl">
      {/* الهيدر */}
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-2xl font-bold text-slate-800">تزويد المخزن الرئيسي</h1>
        <p className="text-sm text-slate-500">إدارة التوريدات وتحديث أرصدة "بريق للمنظفات" مباشرة</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <PlusSquare size={18} />
            </span>
            تسجيل توريد بضاعة
          </h2>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-1.5">
            <CheckCircle size={14} /> الربط المباشر بجدول Stock
          </span>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-12 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-slate-800 text-xl font-bold">تم تسجيل التوريد بنجاح!</h3>
              <p className="text-slate-500 text-sm mt-2">تم تحديث الأرصدة وتسجيل الحركة في الـ Audit Trail</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* الجزء الأول: اختيار المنتج */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                    <div className="sm:col-span-8">
                      <label className="block text-slate-700 text-sm font-medium mb-2">اختر المنتج من القائمة</label>
                      <div className="relative">
                        <select
                          value={activeItem?.productId || ""}
                          onChange={(e) => handleChangeItem(activeRowIndex, "productId", Number(e.target.value))}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="">-- ابحث عن منتج --</option>
                          {allProducts.map(p => (
                            <option key={p.productId} value={p.productId}>{p.productName}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-slate-700 text-sm font-medium mb-2">الكمية المضافة (+)</label>
                      <input
                        type="number"
                        value={activeItem?.addedQuantity || ""}
                        onChange={(e) => handleChangeItem(activeRowIndex, "addedQuantity", e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-3 text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* كارت المعلومات الأسود */}
                <div className="lg:col-span-4">
                  <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg h-full flex flex-col justify-center">
                    <h4 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Package size={14} className="text-blue-400" /> تفاصيل المنتج الحالي
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 text-[10px] mb-1">اسم الصنف:</div>
                        <div className="font-bold text-sm truncate">{activeProductData?.productName || "لم يتم التحديد"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="text-[10px] text-slate-400">الرصيد الحالي</div>
                          <div className="font-bold text-lg">{activeProductData?.currentQuantity || 0}</div>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/20">
                          <div className="text-[10px] text-blue-300">بعد الزيادة</div>
                          <div className="font-bold text-lg text-blue-400">
                            {(activeProductData?.currentQuantity || 0) + (Number(activeItem?.addedQuantity) || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول الأصناف المختارة */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600">المنتج</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-600">الكمية</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-600 w-16">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        onClick={() => setActiveRowIndex(index)}
                        className={`cursor-pointer transition-colors ${activeRowIndex === index ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
                      >
                        <td className="px-6 py-3 font-bold text-slate-700">
                          {allProducts.find(p => p.productId === item.productId)?.productName || "بانتظار الاختيار..."}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-blue-600">{item.addedQuantity || 0}</td>
                        <td className="px-6 py-3 text-center">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={handleAddItem} className="w-full p-3 text-blue-600 bg-slate-50 hover:bg-blue-50 border-t border-slate-200 font-bold flex items-center justify-center gap-2 transition-colors">
                  <Plus size={18} /> إضافة صنف توريد آخر
                </button>
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3 font-bold animate-pulse"><Info size={18} /> {error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {loading ? "جاري المعالجة..." : <><PlusSquare size={20} /> اعتماد التزويد وتحديث المخزن</>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* قسم النواقص (مربوط بالـ API مباشرة) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600" /> تنبيهات النواقص (أقل من حد الأمان)
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث سريع..."
                className="text-xs border rounded-lg pr-8 pl-3 py-1.5 focus:ring-1 outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="text-xs border rounded-lg px-2 py-1.5 outline-none"
              onChange={(e) => setSelectedCatId(e.target.value)}
            >
              <option value="all">كل الأقسام</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-slate-500 font-medium">اسم المنتج</th>
                <th className="px-6 py-4 text-center text-slate-500 font-medium">الرصيد الحالي</th>
                <th className="px-6 py-4 text-center text-slate-500 font-medium">حد الأمان</th>
                <th className="px-6 py-4 text-slate-500 font-medium">حالة المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockList.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{p.productName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold">
                      {p.currentQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-medium">{p.minThreshold}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 w-40">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${p.stockPercentage < 30 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(p.stockPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{p.stockPercentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lowStockList.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">لا توجد نواقص حالياً، كل الأرصدة فوق حد الأمان.</div>
          )}
        </div>
      </div>
    </div>
  );
}