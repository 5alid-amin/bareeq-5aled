import React, { useState, useMemo } from "react";
import { ClipboardList, ArrowUpRight, ArrowDownRight, Truck, Info, CheckCircle } from "lucide-react";
import { vans, vanInventory, products } from "../../data/mockData";

export function VehicleDiscrepancyPage() {
  const [activeTab, setActiveTab] = useState<"below" | "above">("below");
  const [selectedVanDetails, setSelectedVanDetails] = useState<string>("VAN-001");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Group discrepancies for the selected van
  const currentVanInventory = vanInventory[selectedVanDetails] || [];
  
  // Actually, standard inventory should ideally have all assigned products.
  // We'll calculate discrepancies based on currentVanInventory
  const discrepancies = useMemo(() => {
    const below: any[] = [];
    const above: any[] = [];

    currentVanInventory.forEach(item => {
      const difference = item.quantity - item.minQuantity;
      
      if (difference < 0) {
        below.push({
          ...item,
          difference: Math.abs(difference),
          standard: item.minQuantity
        });
      } else if (difference > 0) {
        above.push({
          ...item,
          difference,
          standard: item.minQuantity
        });
      }
    });

    return { below, above };
  }, [currentVanInventory]);

  const handleAction = (productId: string, actionDesc: string) => {
    setActionSuccess(`تم ${actionDesc} بنجاح للصنف ${productId}`);
    setTimeout(() => {
      setActionSuccess(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Van Selection */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-slate-700 font-medium">فروقات جرد السيارات</h2>
            <p className="text-slate-400 text-xs mt-0.5">مقارنة المخزون الفعلي بالمعدل القياسي للسيارة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">السيارة:</label>
          <select
            value={selectedVanDetails}
            onChange={(e) => setSelectedVanDetails(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {vans.map(v => (
              <option key={v.id} value={v.id}>{v.id} - {v.driverName}</option>
            ))}
          </select>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={16} />
          {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("below")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === "below" ? "text-red-600 bg-red-50/30" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ArrowDownRight size={16} className={activeTab === "below" ? "text-red-500" : "text-slate-400"} />
            ناقص عن المعدل ({discrepancies.below.length})
            {activeTab === "below" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>}
          </button>
          <button
            onClick={() => setActiveTab("above")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === "above" ? "text-emerald-600 bg-emerald-50/30" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ArrowUpRight size={16} className={activeTab === "above" ? "text-emerald-500" : "text-slate-400"} />
            زائد عن المعدل ({discrepancies.above.length})
            {activeTab === "above" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">المنتج</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الكمية الحالية</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">المعدل القياسي</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">الفرق</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === "below" && discrepancies.below.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700 font-medium">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.productId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.standard} وحدة</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-lg">
                      <ArrowDownRight size={14} />
                      {item.difference} وحدة
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleAction(item.productId, "إرسال البضاعة")}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Truck size={14} />
                      إرسال للسيارة
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab === "above" && discrepancies.above.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700 font-medium">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.productId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.standard} وحدة</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight size={14} />
                      +{item.difference} وحدة
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleAction(item.productId, "سحب البضاعة")}
                      className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ArrowDownRight size={14} />
                      سحب من السيارة
                    </button>
                  </td>
                </tr>
              ))}

              {((activeTab === "below" && discrepancies.below.length === 0) || 
                (activeTab === "above" && discrepancies.above.length === 0)) && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-3">
                      <Info size={20} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-600">لا توجد فروقات</h3>
                    <p className="text-xs text-slate-400 mt-1">جميع الأصناف مطابقة للمعدل القياسي ({activeTab === "below" ? "لا يوجد نقص" : "لا توجد زيادة"})</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
