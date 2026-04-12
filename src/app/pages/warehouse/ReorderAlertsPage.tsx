import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, Trash2, PlusSquare, TrendingDown } from "lucide-react";
import { products, Product } from "../../data/mockData";

export function ReorderAlertsPage() {
  const [items, setItems] = useState<{ product: string; quantity: string }[]>([
    { product: "", quantity: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const lowStockList = products.filter((p) => p.quantity < p.minQuantity);

  const ensureEmptyRow = (newItems: typeof items) => {
    const last = newItems[newItems.length - 1];
    if (last && last.product !== "") {
      return [...newItems, { product: "", quantity: "" }];
    }
    return newItems;
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [{ product: "", quantity: "" }]);
  };

  const handleChangeItem = (index: number, field: "product" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(field === "product" ? ensureEmptyRow(newItems) : newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter(item => item.product && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل مع كمية صحيحة");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Add quantity to main products inventory
      validItems.forEach(item => {
        const prod = products.find(p => p.id === item.product);
        if (prod) {
          prod.quantity += parseInt(item.quantity);
        }
      });

      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        setSubmitted(false);
        setItems([{ product: "", quantity: "" }]);
      }, 2500);
    }, 1000);
  };

  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <PlusSquare size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-slate-800 text-xl font-bold">تزويد المخزن</h1>
          <p className="text-slate-500 text-sm">أضف كميات جديدة للمخزون الرئيسي</p>
        </div>
      </div>

      {/* Restock Form - Centered at the top */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-slate-700 text-base font-semibold">إضافة كميات للمخزون</h2>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-slate-700 text-lg mb-1 font-medium">تم تزويد المخزن بنجاح!</h3>
                <p className="text-slate-400 text-sm">الكميات أضيفت إلى أرصدة المخزون الرئيسي</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const isEmptyRow = !item.product;
                      return (
                        <div key={index} className={`flex gap-3 items-start p-3.5 rounded-xl border transition-colors relative ${isEmptyRow ? "bg-slate-50/50 border-dashed border-slate-200" : "bg-white border-slate-200 shadow-sm"}`}>
                          <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <div className="relative">
                                  <select
                                    value={item.product}
                                    onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">-- اختر منتجاً --</option>
                                    {products.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} (الحالي: {p.quantity})
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
                                  placeholder="الكمية المضافة"
                                  min="1"
                                  disabled={isEmptyRow}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                  dir="ltr"
                                />
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
                    <AlertTriangle size={16} className="text-red-500" />
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || validItemsCount === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        جارٍ التزويد...
                      </>
                    ) : (
                      <>
                        <PlusSquare size={18} />
                        تأكيد التزويد ({validItemsCount} أصناف)
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-red-500" />
            <h2 className="text-red-700 text-base font-semibold">تنبيهات الأصناف المنخفضة</h2>
          </div>
          <span className="bg-white border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm whitespace-nowrap">
            {lowStockList.length} صنف يحتاج تزويد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">رقم المنتج</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">اسم المنتج</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">الفئة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">المتبقي بالمخزون</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">الحد الأدنى للمخزون</th>
                <th className="text-right text-slate-500 text-xs px-5 py-4 font-semibold">مؤشر المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <CheckCircle size={28} className="mx-auto mb-3 text-emerald-400" />
                    <p className="text-sm font-medium">لا توجد أصناف منخفضة</p>
                    <p className="text-xs mt-1">حالة المخزون ممتازة</p>
                  </td>
                </tr>
              ) : (
                lowStockList.map((p) => {
                  const pct = Math.round((p.quantity / p.minQuantity) * 100);
                  
                  return (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-5 py-4 align-middle">
                        <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">
                          {p.id}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm font-medium text-slate-800">{p.name}</span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm text-slate-500">{p.category}</span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm font-bold text-red-600">{p.quantity} وحدة</span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm text-slate-600">{p.minQuantity} وحدة</span>
                      </td>
                      <td className="px-5 py-4 align-middle w-48">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-500 shrink-0 font-medium whitespace-nowrap pt-0.5">
                            % {pct}
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
    </div>
  );
}
