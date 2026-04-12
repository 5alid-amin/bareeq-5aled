import React, { useState, useMemo } from "react";
import { ClipboardCheck, ArrowDownRight, Truck, Info, CheckCircle, X } from "lucide-react";
import { vans, vanInventory } from "../../data/mockData";

interface SendQtyModalProps {
  item: {
    productId: string;
    productName: string;
    difference: number;
    quantity: number;
    standard: number;
  };
  onClose: () => void;
  onConfirm: (qty: number) => void;
}

function SendQtyModal({ item, onClose, onConfirm }: SendQtyModalProps) {
  const [qty, setQty] = useState(item.difference.toString());
  const parsed = parseInt(qty);
  const isValid = parsed > 0;

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
              <span>الكمية الحالية: <strong className="text-slate-700">{item.quantity}</strong></span>
              <span>•</span>
              <span>المعدل القياسي: <strong className="text-slate-700">{item.standard}</strong></span>
              <span>•</span>
              <span>الفرق الناقص: <strong className="text-red-600">{item.difference}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-sm mb-1.5">
              الكمية المرسلة
              <span className="text-slate-400 text-xs mr-2">(اختياري — الافتراضي هو الفرق الكامل)</span>
            </label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              min="1"
              max={item.difference}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
              autoFocus
            />
            {parsed > item.difference && (
              <p className="text-xs text-orange-500 mt-1">الكمية أكبر من الفرق الناقص ({item.difference} وحدة)</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">إلغاء</button>
            <button
              onClick={() => isValid && onConfirm(parsed)}
              disabled={!isValid}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Truck size={15} />
              تأكيد الإرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehicleDiscrepancyPage() {
  const [selectedVan, setSelectedVan] = useState<string>("VAN-001");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<any | null>(null);

  const currentVanInventory = vanInventory[selectedVan] || [];

  const discrepancies = useMemo(() => {
    return currentVanInventory
      .filter(item => item.quantity < item.minQuantity)
      .map(item => ({
        ...item,
        difference: item.minQuantity - item.quantity,
        standard: item.minQuantity,
      }));
  }, [currentVanInventory]);

  const handleConfirmSend = (productId: string, productName: string, qty: number) => {
    setSendModal(null);
    setActionSuccess(`تم إرسال ${qty} وحدة من "${productName}" إلى السيارة بنجاح`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {sendModal && (
        <SendQtyModal
          item={sendModal}
          onClose={() => setSendModal(null)}
          onConfirm={(qty) => handleConfirmSend(sendModal.productId, sendModal.productName, qty)}
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
            value={selectedVan}
            onChange={(e) => setSelectedVan(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {vans.map(v => (
              <option key={v.id} value={v.id}>{v.id} - {v.driverName}</option>
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
                  <p className="text-xs text-slate-400 mt-0.5">{item.productId}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-md bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{item.standard} وحدة</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                    <ArrowDownRight size={14} />
                    {item.difference} وحدة
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
