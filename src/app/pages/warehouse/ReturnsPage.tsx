import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { RotateCcw, CheckCircle, ChevronDown, Trash2, Calendar, Package, Truck, Info, Plus } from "lucide-react";

// الأنواع المتوقعة من الـ API
interface Vehicle {
  vehicleId: number;
  plateNumber: string;
  driverName: string;
}

interface VehicleProduct {
  productId: number;
  productName: string;
  currentQuantity: number;
}

const REASONS = ["فائض المخزون", "تالف", "منتهي الصلاحية", "خطأ في التحميل", "مرتجع من بيع", "أخرى"];

export function ReturnsPage() {
  // States للبيانات الحقيقية
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableProducts, setAvailableProducts] = useState<VehicleProduct[]>([]);
  
  // Form States
  const [selectedVan, setSelectedVan] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<{ product: string; quantity: string; reason: string; notes: string }>([
    { product: "", quantity: "", reason: "فائض المخزون", notes: "" }
  ]);

  // UI States
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. جلب قائمة السيارات عند فتح الصفحة
  useEffect(() => {
    axios.get('/api/Returns/vehicles')
      .then(res => setVehicles(res.data))
      .catch(err => console.error("Error fetching vehicles", err));
  }, []);

  // 2. جلب بضاعة السيارة لما نختار سيارة معينة
  useEffect(() => {
    if (selectedVan) {
      axios.get(`/api/Returns/vehicle-available-products/${selectedVan}`)
        .then(res => setAvailableProducts(res.data))
        .catch(err => {
          setAvailableProducts([]);
          console.error("No inventory found for this vehicle", err);
        });
    } else {
      setAvailableProducts([]);
    }
  }, [selectedVan]);

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: "", reason: "فائض المخزون", notes: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ product: "", quantity: "", reason: "فائض المخزون", notes: "" });
    }
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;

    // تشيك على الكمية المتاحة في العربية
    if (field === "quantity" || field === "product") {
      const selectedProd = availableProducts.find(p => p.productId === parseInt(item.product));
      if (selectedProd) {
        if (parseInt(item.quantity) > selectedProd.currentQuantity) {
          item.quantity = selectedProd.currentQuantity.toString();
        }
      }
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedVan) {
      setError("يرجى اختيار السيارة أولاً");
      return;
    }

    const validItems = items.filter(item => item.product && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل بكمية صحيحة");
      return;
    }

    setLoading(true);
    
    // تجهيز الداتا للـ API حسب الـ DTO اللي عملناه في الباك
    const requestBody = {
      vehicleId: parseInt(selectedVan),
      items: validItems.map(item => ({
        productId: parseInt(item.product),
        quantity: parseInt(item.quantity),
        reason: item.reason,
        notes: item.notes
      }))
    };

    try {
      await axios.post('/api/Returns/confirm', requestBody);
      setSubmitted(true);
      
      // ريست للفورم بعد النجاح
      setTimeout(() => {
        setSubmitted(false);
        setSelectedVan("");
        setItems([{ product: "", quantity: "", reason: "فائض المخزون", notes: "" }]);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data || "حدث خطأ أثناء حفظ المرتجع");
    } finally {
      setLoading(false);
    }
  };

  // حسابات الـ Summary
  const selectedVanData = vehicles.find(v => v.vehicleId === parseInt(selectedVan));
  const validItemsCount = items.filter(i => i.product && parseInt(i.quantity) > 0).length;
  const totalUnitsCount = items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  const vanStockUnits = availableProducts.reduce((acc, item) => acc + item.currentQuantity, 0);

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-2xl font-bold text-slate-800">مرتجع من سيارة (بريق)</h1>
        <p className="text-sm text-slate-500">نظام إدارة المرتجعات وتحديث المخزن الرئيسي</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <RotateCcw size={18} />
            </span>
            بيانات المرتجع الفعلي
          </h2>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 relative">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-slate-800 text-xl mb-2 font-bold">تم تأكيد المرتجع بنجاح!</h3>
              <p className="text-slate-500 text-sm">تم تحديث عهدة السيارة ومخزن المنظفات الرئيسي.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* الجزء الخاص باختيار السيارة */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-2">السيارة / المندوب</label>
                    <div className="relative">
                      <select
                        value={selectedVan}
                        onChange={(e) => setSelectedVan(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        <option value="">-- اختر السيارة --</option>
                        {vehicles.map((v) => (
                          <option key={v.vehicleId} value={v.vehicleId}>{v.plateNumber} — {v.driverName}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-2">تاريخ الاستلام</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* كارت معلومات السيارة */}
                <div className="lg:col-span-4">
                  {selectedVanData ? (
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-md">
                      <h4 className="text-orange-400 text-xs font-bold mb-3 flex items-center gap-2">
                        <Truck size={14} /> حالة العهدة الحالية
                      </h4>
                      <div className="space-y-1">
                        <div className="text-lg font-bold">{selectedVanData.driverName}</div>
                        <div className="text-slate-400 text-sm">إجمالي بضاعة السيارة: {vanStockUnits} قطعة</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center p-4 text-slate-400 text-xs">
                      يرجى اختيار سيارة لعرض تفاصيل العهدة
                    </div>
                  )}
                </div>
              </div>

              {/* جدول الأصناف */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 border-b pb-2">الأصناف المرتجعة للمخزن</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right text-slate-600">الصنف</th>
                        <th className="px-4 py-3 text-right text-slate-600">السبب</th>
                        <th className="px-4 py-3 text-right text-slate-600">الكمية</th>
                        <th className="px-4 py-3 text-center text-slate-600">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => {
                        const maxQty = availableProducts.find(p => p.productId === parseInt(item.product))?.currentQuantity || 0;
                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <select
                                value={item.product}
                                onChange={(e) => handleChangeItem(index, "product", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none"
                              >
                                <option value="">-- اختر منتجاً --</option>
                                {availableProducts.map(p => (
                                  <option key={p.productId} value={p.productId}>{p.productName} (متاح: {p.currentQuantity})</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={item.reason}
                                onChange={(e) => handleChangeItem(index, "reason", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
                              >
                                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                                max={maxQty}
                                min="1"
                                className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-center outline-none"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button type="button" onClick={() => handleRemoveItem(index)} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 border-t">
                    <button type="button" onClick={handleAddItem} className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">
                      <Plus size={16} /> إضافة صنف آخر
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100">
                  <Info size={18} /> {error}
                </div>
              )}

              {/* الخلاصة وزر الحفظ */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">الأصناف</div>
                    <div className="text-xl font-bold">{validItemsCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">إجمالي القطع</div>
                    <div className="text-xl font-bold">{totalUnitsCount}</div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || validItemsCount === 0}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "جاري الحفظ..." : "تأكيد المرتجع وتحديث المخازن"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}