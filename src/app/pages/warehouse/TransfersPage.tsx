import React, { useState } from "react";
import { ArrowLeftRight, CheckCircle, ChevronDown, Plus } from "lucide-react";
import { transfers as initialTransfers, vans, products, Transfer } from "../../data/mockData";

export function TransfersPage() {
  const [transferList, setTransferList] = useState<Transfer[]>(initialTransfers);
  const [selectedVan, setSelectedVan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedVan || !selectedProduct || !quantity || parseInt(quantity) <= 0) {
      setError("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }
    const van = vans.find((v) => v.id === selectedVan);
    const product = products.find((p) => p.id === selectedProduct);
    if (!van || !product) return;

    setLoading(true);
    setTimeout(() => {
      const newTransfer: Transfer = {
        id: `TRF-${String(transferList.length + 1).padStart(3, "0")}`,
        date: "2026-03-03",
        vanId: van.id,
        vanName: `${van.id} - ${van.driverName}`,
        productName: product.name,
        quantity: parseInt(quantity),
        status: "مكتمل",
      };
      setTransferList([newTransfer, ...transferList]);
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedVan("");
        setSelectedProduct("");
        setQuantity("");
      }, 2500);
    }, 1000);
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const selectedVanData = vans.find((v) => v.id === selectedVan);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
        {/* Create Transfer Form */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Plus size={17} className="text-blue-500" />
            <h2 className="text-slate-700 text-base">إصدار إذن تحويل</h2>
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-slate-700 text-lg mb-1">تم إصدار إذن التحويل!</h3>
                <p className="text-slate-400 text-sm">تم تحويل البضاعة بنجاح إلى الفان</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Van selector */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">اختر الفان</label>
                  <div className="relative">
                    <select
                      value={selectedVan}
                      onChange={(e) => setSelectedVan(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- اختر فان --</option>
                      {vans.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.id} — {v.driverName} ({v.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedVanData && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <div className={`w-2 h-2 rounded-full ${selectedVanData.status === "نشطة" ? "bg-emerald-500" : selectedVanData.status === "تحميل" ? "bg-yellow-400" : "bg-red-500"}`}></div>
                      <span>{selectedVanData.location}</span>
                    </div>
                  )}
                </div>

                {/* Product selector */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">اختر المنتج</label>
                  <div className="relative">
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- اختر منتجاً --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (متوفر: {p.quantity})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedProductData && (
                    <div className="mt-1.5 text-xs text-slate-400">
                      الكمية المتاحة: <span className={selectedProductData.quantity < selectedProductData.minQuantity ? "text-red-500" : "text-emerald-600"}>{selectedProductData.quantity} وحدة</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">الكمية</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="أدخل الكمية"
                    min="1"
                    max={selectedProductData?.quantity}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>

                {/* Transfer summary */}
                {selectedVan && selectedProduct && quantity && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-1.5">
                    <p className="text-blue-700 text-sm mb-2">ملخص إذن التحويل</p>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الفان:</span>
                      <span>{selectedVan}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>المنتج:</span>
                      <span className="truncate max-w-[160px]">{selectedProductData?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الكمية:</span>
                      <span>{quantity} وحدة</span>
                    </div>
                    {selectedProductData && quantity && (
                      <div className="flex justify-between text-xs text-emerald-600 border-t border-blue-200 pt-1.5 mt-1.5">
                        <span>قيمة التحويل:</span>
                        <span>{(selectedProductData.sellingPrice * parseInt(quantity)).toLocaleString("ar-EG")} ج.م</span>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      جارٍ الإصدار...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight size={16} />
                      إصدار إذن التحويل
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Transfer History */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={17} className="text-emerald-500" />
              <h2 className="text-slate-700 text-base">سجل التحويلات</h2>
            </div>
            <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full">{transferList.length} عملية</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-right text-slate-400 text-xs px-5 py-3">رقم التحويل</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">التاريخ</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">الفان</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">المنتج</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">الكمية</th>
                  <th className="text-right text-slate-400 text-xs px-5 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transferList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded">{t.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{t.date}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 text-sm">{t.vanId}</p>
                      <p className="text-slate-400 text-xs">{t.vanName.split(" - ")[1]}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm max-w-[180px] truncate">{t.productName}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-lg">{t.quantity} وحدة</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-emerald-600 text-xs">{t.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
