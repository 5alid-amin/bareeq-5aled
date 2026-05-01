import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { ClipboardCheck, ArrowDownRight, Truck, Info, CheckCircle, X } from "lucide-react";

// --- التغيير هنا: الـ DTO اللي الباك إند مستنيه ---
interface SendQtyModalProps {
  item: {
    productId: number;
    productName: string;
    currentQuantity: number;
    minThreshold: number;
  };
  vehicleId: number;
  onClose: () => void;
  onRefresh: () => void; // عشان نحدث الجدول بعد الشحن
}

function SendQtyModal({ item, vehicleId, onClose, onRefresh }: SendQtyModalProps) {
  const difference = item.minThreshold - item.currentQuantity;
  const [qty, setQty] = useState(difference.toString());
  const [loading, setLoading] = useState(false);
  const parsed = parseInt(qty);
  const isValid = parsed > 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // نداء الـ API بتاع التحميل اللي عملناه (POST)
      await axios.post("/api/CarLoad/load-vehicle", {
        vehicleId: vehicleId,
        items: [{ productId: item.productId, quantity: parsed }]
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error loading item:", error);
      alert("حدث خطأ أثناء تحميل البضاعة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-blue-500" />
            <h3 className="text-slate-700 text-sm font-medium">إرسال للسيارة</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-slate-700 text-sm font-medium">{item.productName}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span>الكمية الحالية: <strong className="text-slate-700">{item.currentQuantity}</strong></span>
              <span>•</span>
              <span>المعدل القياسي: <strong className="text-slate-700">{item.minThreshold}</strong></span>
              <span>•</span>
              <span>الفرق الناقص: <strong className="text-red-600">{difference}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-sm mb-1.5">الكمية المرسلة</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">إلغاء</button>
            <button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "جاري الإرسال..." : "تأكيد الإرسال"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehicleDiscrepancyPage() {
  const [vehicles, setVehicles] = useState<any[]>([]); // قائمة السيارات من الباك
  const [selectedVan, setSelectedVan] = useState<number | null>(null);
  const [inventory, setInventory] = useState<any[]>([]); // مخزون السيارة المختارة
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<any | null>(null);

  // 1. جلب قائمة السيارات عند فتح الصفحة
  useEffect(() => {
    axios.get("/api/CarLoad/vehicles-summary")
      .then(res => {
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVan(res.data[0].vehicleId);
      });
  }, []);

  // 2. جلب مخزون السيارة عند تغيير السيارة المختارة
  const fetchInventory = () => {
    if (selectedVan) {
      axios.get(`/api/CarLoad/vehicle-inventory/${selectedVan}`)
        .then(res => setInventory(res.data.items));
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedVan]);

  // 3. فلترة النواقص بناءً على الحسبة اللي اتفقنا عليها
  const discrepancies = useMemo(() => {
    return inventory.filter(item => item.currentQuantity < item.minThreshold);
  }, [inventory]);

  const handleRefresh = () => {
    fetchInventory();
    setActionSuccess(`تم تحديث المخزن وتحميل البضاعة بنجاح`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {sendModal && (
        <SendQtyModal
          item={sendModal}
          vehicleId={selectedVan!}
          onClose={() => setSendModal(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Header & Van Selection */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="text-slate-700 font-medium">مراجعة مخزون المركبات</h2>
            <p className="text-slate-400 text-xs mt-0.5">الأصناف الناقصة عن المعدل القياسي للسيارة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">السيارة:</label>
          <select
            value={selectedVan || ""}
            onChange={(e) => setSelectedVan(Number(e.target.value))}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {vehicles.map(v => (
              <option key={v.vehicleId} value={v.vehicleId}>{v.plateNumber} - {v.driverName}</option>
            ))}
          </select>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-sm">
          <CheckCircle size={16} />
          {actionSuccess}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowDownRight size={16} className="text-red-500" />
            <h3 className="text-slate-700 text-sm font-medium">الأصناف الناقصة</h3>
            <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-100">{discrepancies.length} صنف</span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">المنتج</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الكمية الحالية</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">المعدل القياسي</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الفرق الناقص</th>
              <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {discrepancies.map((item) => (
              <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700 font-medium">{item.productName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.productBarcode}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-md bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                    {item.currentQuantity}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{item.minThreshold} وحدة</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                    <ArrowDownRight size={14} />
                    {item.minThreshold - item.currentQuantity} وحدة
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setSendModal(item)}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Truck size={14} />
                    إرسال للسيارة
                  </button>
                </td>
              </tr>
            ))}

            {discrepancies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mb-3">
                    <Info size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">لا توجد أصناف ناقصة</h3>
                  <p className="text-xs text-slate-400 mt-1">جميع الأصناف تجاوزت المعدل القياسي</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}