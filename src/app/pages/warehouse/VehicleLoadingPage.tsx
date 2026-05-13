import React, { useState, useEffect } from "react";
import axios from "axios"; // تأكد من تثبيت axios
import { Truck, CheckCircle, ChevronDown, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp, ArrowRight, X } from "lucide-react";

// إعداد عنوان الـ API الرئيسي
const API_BASE_URL = "https://localhost:7280/api/CarLoad"; // غير البورت حسب مشروعك

// --- الـ Interfaces حسب الـ DTOs اللي عملناها في الباك إند ---
interface VehicleSummary {
  vehicleId: number;
  vehicleName: string;
  plateNumber: string;
  status: string;
  driverName: string;
  totalItemsCount: number;
  lowStockItemsCount: number;
  totalStockValue: number;
}

interface VehicleInventoryPage {
  totalItems: number;
  goodStockCount: number;
  lowStockCount: number;
  totalStockValue: number;
  items: VehicleInventoryItem[];
}

interface VehicleInventoryItem {
  productId: number;
  productBarcode: string;
  productName: string;
  currentQuantity: number;
  minThreshold: number;
  salePrice: number;
  totalLineValue: number;
  status: string;
}

interface AvailableProduct {
  productId: number;
  productName: string;
  salePrice: number;
  availableInMainStock: number;
}

// ─── Vehicle Loading Modal / Drawer ──────────────────────────────────────────
function VehicleLoadingForm({ selectedVanId, onClose, onRefresh }: { selectedVanId: number, onClose: () => void, onRefresh: () => void }) {
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [items, setItems] = useState<{ productId: string; quantity: string }[]>([
    { productId: "", quantity: "" }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // جلب المنتجات المتاحة من المخزن الرئيسي
  useEffect(() => {
    axios.get(`${API_BASE_URL}/available-products`)
      .then(res => setAvailableProducts(res.data))
      .catch(() => setError("فشل في تحميل قائمة المنتجات المتاحة"));
  }, []);

  const ensureEmptyRow = (newItems: typeof items) => {
    const last = newItems[newItems.length - 1];
    if (last && last.productId !== "") {
      return [...newItems, { productId: "", quantity: "" }];
    }
    return newItems;
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [{ productId: "", quantity: "" }]);
  };

  const handleChangeItem = (index: number, field: "productId" | "quantity", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(field === "productId" ? ensureEmptyRow(newItems) : newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter(item => item.productId && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("يرجى إضافة صنف واحد على الأقل مع كمية صحيحة");
      return;
    }

    setLoading(true);
    try {
      // إرسال البيانات للـ API بالـ DTO المطلوب
      await axios.post(`${API_BASE_URL}/load-vehicle`, {
        vehicleId: selectedVanId,
        items: validItems.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity)
        }))
      });

      setSubmitted(true);
      onRefresh(); // تحديث بيانات الجدول في الخلفية
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data || "حدث خطأ أثناء عملية التحميل");
    } finally {
      setLoading(false);
    }
  };

  let invoiceTotal = 0;
  items.forEach(item => {
    if (item.productId && parseInt(item.quantity) > 0) {
      const prod = availableProducts.find(p => p.productId.toString() === item.productId);
      if (prod) invoiceTotal += prod.salePrice * parseInt(item.quantity);
    }
  });

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-0 bottom-0 left-0 w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col border-r border-slate-100 overflow-hidden transform transition-transform">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-slate-700 text-base font-medium">تحميل إلى المركبة</h2>
              <p className="text-xs text-slate-500">إضافة بضائع جديدة من المخزن الرئيسي</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {submitted ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-slate-800 text-xl font-medium mb-2">تم التحميل بنجاح!</h3>
              <p className="text-slate-500 text-sm">تم تحديث مخزون السيارة والمخزن الرئيسي</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {invoiceTotal > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium">إجمالي القيمة المضافة:</span>
                  <span className="font-bold text-lg">{invoiceTotal.toLocaleString("ar-EG")} ج.م</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3">الأصناف المراد تحميلها</label>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const selectedProd = availableProducts.find(p => p.productId.toString() === item.productId);
                    const isExceeding = selectedProd ? parseInt(item.quantity) > selectedProd.availableInMainStock : false;
                    const isEmptyRow = !item.productId;

                    return (
                      <div key={index} className={`flex gap-2 items-start p-3.5 rounded-xl border transition-colors relative ${isEmptyRow ? "bg-slate-50/50 border-dashed border-slate-300" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                              <select
                                value={item.productId}
                                onChange={(e) => handleChangeItem(index, "productId", e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- اختر منتجاً (من المخزن الرئيسي) --</option>
                                {availableProducts.map((p) => (
                                  <option key={p.productId} value={p.productId} disabled={p.availableInMainStock <= 0}>
                                    {p.productName} (متاح: {p.availableInMainStock})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                            </div>

                            {!isEmptyRow && (
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                                  placeholder="الكمية"
                                  className={`w-full bg-slate-50 border ${isExceeding ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'} rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none`}
                                />
                                <div className="flex flex-col justify-center bg-slate-50 rounded-lg px-3 border border-slate-100">
                                  {isExceeding ? (
                                    <span className="text-xs text-red-500 font-medium">يتخطى المتاح!</span>
                                  ) : selectedProd && item.quantity && (
                                    <span className="font-medium text-emerald-600 text-sm">
                                      {(selectedProd.salePrice * parseInt(item.quantity)).toLocaleString("ar-EG")} ج.م
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {!isEmptyRow && (
                          <button type="button" onClick={() => handleRemoveItem(index)} className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                  <AlertTriangle size={16} className="text-red-500" />
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

        {!submitted && (
          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleSubmit}
              disabled={loading || invoiceTotal === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "جارٍ الإصدار..." : "تأكيد وإصدار طلب التحميل"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function VehicleLoadingPage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [selectedVanId, setSelectedVanId] = useState<number | null>(null);
  const [inventoryPage, setInventoryPage] = useState<VehicleInventoryPage | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // 1. جلب ملخص السيارات عند فتح الصفحة
  const fetchVehicles = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/vehicles-summary`)
      .then(res => setVehicles(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 2. جلب تفاصيل مخزون السيارة عند اختيار واحدة
  const fetchInventory = (id: number) => {
    axios.get(`${API_BASE_URL}/vehicle-inventory/${id}`)
      .then(res => setInventoryPage(res.data));
  };

  useEffect(() => {
    if (selectedVanId) fetchInventory(selectedVanId);
  }, [selectedVanId]);

  const currentVan = vehicles.find(v => v.vehicleId === selectedVanId);

  if (selectedVanId && currentVan && inventoryPage) {
    return (
      <div className="space-y-4 relative">
        {showLoadingModal && (
          <VehicleLoadingForm
            selectedVanId={selectedVanId}
            onClose={() => setShowLoadingModal(false)}
            onRefresh={() => fetchInventory(selectedVanId)}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedVanId(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              <ArrowRight size={14} /> رجوع للسيارات
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${currentVan.status === "نشطة" ? "bg-emerald-500" : "bg-yellow-400"}`} />
              <span className="text-slate-700 font-medium text-sm">{currentVan.vehicleName} — {currentVan.driverName}</span>
            </div>
          </div>
          <button onClick={() => setShowLoadingModal(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Truck size={15} /> تحميل للسيارة
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الأصناف", value: inventoryPage.totalItems, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "أصناف جيدة", value: inventoryPage.goodStockCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "أصناف منخفضة", value: inventoryPage.lowStockCount, color: "text-red-600", bg: "bg-red-50" },
            { label: "إجمالي القيمة", value: `${inventoryPage.totalStockValue.toLocaleString("ar-EG")} ج.م`, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-white shadow-sm`}>
              <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* الجدول باستخدام داتا الـ API */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-right text-slate-500 text-xs font-medium">
                  <th className="px-5 py-3">المنتج</th>
                  <th className="px-5 py-3 text-center">الكمية</th>
                  <th className="px-5 py-3">السعر</th>
                  <th className="px-5 py-3">القيمة</th>
                  <th className="px-5 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventoryPage.items.map(item => {
                  const isLow = item.currentQuantity <= item.minThreshold;
                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-slate-700">{item.productName}</p>
                            <p className="text-[10px] text-slate-400">{item.productBarcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-base font-bold ${isLow ? "text-red-600" : "text-emerald-600"}`}>
                            {item.currentQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            / حد: {item.minThreshold}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-emerald-600 text-sm font-medium">{item.salePrice} ج.م</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm font-medium">{item.totalLineValue.toLocaleString("ar-EG")} ج.م</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium ${isLow ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                          {isLow ? (
                            <>
                              <TrendingDown size={12} /> منخفض
                            </>
                          ) : (
                            <>
                              <TrendingUp size={12} /> جيد
                            </>
                          )}
                        </span>
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

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm">اختر سيارة لعرض مخزونها وإصدار أمر تحميل جديد</p>
      {loading ? (
        <div className="text-center py-10 text-slate-400">جارٍ تحميل السيارات...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map(van => (
            <button
              key={van.vehicleId}
              onClick={() => setSelectedVanId(van.vehicleId)}
              className="bg-white border border-slate-100 rounded-xl p-4 text-right hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <Truck size={16} className="text-blue-500" />
                <span className="text-xs text-slate-500">{van.status}</span>
              </div>
              <p className="text-slate-700 font-medium text-sm">{van.vehicleName}</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{van.driverName}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-blue-600 font-semibold text-sm">{van.totalItemsCount}</p>
                  <p className="text-slate-400 text-[10px]">صنف</p>
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${van.lowStockItemsCount > 0 ? "text-red-500" : "text-emerald-500"}`}>{van.lowStockItemsCount}</p>
                  <p className="text-slate-400 text-[10px]">منخفض</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-600 font-semibold text-xs">{(van.totalStockValue).toFixed(1)}k</p>
                  <p className="text-slate-400 text-[10px]">قيمة</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}