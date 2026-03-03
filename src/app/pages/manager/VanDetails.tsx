import React from "react";
import { Phone, MapPin, Truck, Package, DollarSign, TrendingUp, Wallet, Receipt } from "lucide-react";
import { vans, vanInventory } from "../../data/mockData";

interface VanDetailsProps {
  vanId: string;
  onNavigate: (page: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "نشطة": "bg-emerald-100 text-emerald-700",
  "تحميل": "bg-yellow-100 text-yellow-700",
  "متوقفة": "bg-red-100 text-red-700",
  "صيانة": "bg-slate-100 text-slate-600",
};

const STATUS_DOT: Record<string, string> = {
  "نشطة": "bg-emerald-500",
  "تحميل": "bg-yellow-400",
  "متوقفة": "bg-red-500",
  "صيانة": "bg-slate-400",
};

export function VanDetails({ vanId }: VanDetailsProps) {
  const van = vans.find((v) => v.id === vanId) ?? vans[0];
  const inventory = vanInventory[van.id] ?? [];
  const closingBalance = van.openingBalance + van.totalSalesToday - van.expenses;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);

  return (
    <div className="space-y-5">
      {/* Van Header */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white text-xl">{van.id}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[van.status]}`}>
                  {van.status}
                </span>
              </div>
              <p className="text-blue-200 text-sm">{van.driverName}</p>
              <p className="text-blue-300 text-xs mt-0.5">{van.plate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Phone size={14} className="text-blue-200" />
              <span className="text-sm" dir="ltr">{van.phone}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <MapPin size={14} className="text-blue-200" />
              <span className="text-sm">{van.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wallet size={18} className="text-blue-600" />
            </div>
            <p className="text-slate-500 text-xs">رصيد الافتتاح</p>
          </div>
          <p className="text-xl text-blue-600">{van.openingBalance.toLocaleString("ar-EG")} ج.م</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <p className="text-slate-500 text-xs">إجمالي المبيعات</p>
          </div>
          <p className="text-xl text-emerald-600">{van.totalSalesToday.toLocaleString("ar-EG")} ج.م</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Receipt size={18} className="text-orange-600" />
            </div>
            <p className="text-slate-500 text-xs">المصروفات</p>
          </div>
          <p className="text-xl text-orange-600">{van.expenses.toLocaleString("ar-EG")} ج.م</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-purple-600" />
            </div>
            <p className="text-slate-500 text-xs">رصيد الختام</p>
          </div>
          <p className={`text-xl ${closingBalance >= 0 ? "text-purple-600" : "text-red-600"}`}>
            {closingBalance.toLocaleString("ar-EG")} ج.م
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Inventory Inside Van */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Package size={17} className="text-blue-500" />
            <h2 className="text-slate-700 text-base">المخزون داخل الفان</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mr-1">
              {inventory.length} صنف
            </span>
          </div>
          {inventory.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">لا يوجد مخزون حالياً</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-right text-slate-400 text-xs px-5 py-3">المنتج</th>
                    <th className="text-right text-slate-400 text-xs px-5 py-3">الكمية</th>
                    <th className="text-right text-slate-400 text-xs px-5 py-3">سعر البيع</th>
                    <th className="text-right text-slate-400 text-xs px-5 py-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inventory.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="text-slate-700 text-sm">{item.productName}</p>
                        <p className="text-slate-400 text-xs">{item.productId}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg">
                          {item.quantity} وحدة
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-sm">{item.sellingPrice} ج.م</td>
                      <td className="px-5 py-3 text-emerald-600 text-sm">
                        {(item.quantity * item.sellingPrice).toLocaleString("ar-EG")} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-600 text-sm" colSpan={3}>إجمالي قيمة المخزون</td>
                    <td className="px-5 py-3 text-emerald-700 text-sm">{inventoryValue.toLocaleString("ar-EG")} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Driver Info + Map */}
        <div className="space-y-4">
          {/* Driver Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-slate-700 text-base mb-4">معلومات السائق</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                {van.driverName.charAt(0)}
              </div>
              <div>
                <p className="text-slate-700">{van.driverName}</p>
                <p className="text-slate-400 text-sm" dir="ltr">{van.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">لوحة السيارة</p>
                <p className="text-slate-700 text-sm">{van.plate}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">الحالة</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[van.status]}`}></div>
                  <p className="text-slate-700 text-sm">{van.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-blue-500" />
              <h2 className="text-slate-700 text-base">الموقع الحالي</h2>
            </div>
            <div className="bg-slate-50 rounded-xl h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {/* Grid pattern */}
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <MapPin size={28} className="text-blue-400 mb-2" />
              <p className="text-slate-600 text-sm">{van.location}</p>
              <p className="text-slate-400 text-xs mt-1">آخر تحديث: منذ 3 دقائق</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
