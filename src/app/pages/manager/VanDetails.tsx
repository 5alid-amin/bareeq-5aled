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
              <p className="text-blue-200 text-sm">أمين العهدة (المندوب): {van.representativeName || "غير محدد"}</p>
              <p className="text-blue-300 text-xs mt-0.5">السائق: {van.driverName} • {van.plate}</p>
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

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Driver/Representative Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-700 text-base mb-4 font-bold">معلومات الطاقم</h2>
            
            {van.representativeName && (
              <div className="flex items-center gap-4 mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg">
                  {van.representativeName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-blue-500 font-medium mb-0.5">مسؤول المبيعات (المندوب)</p>
                  <p className="text-slate-800 font-bold">{van.representativeName}</p>
                </div>
              </div>
            )}
            
            <div className={`flex items-center gap-4 ${!van.representativeName ? 'mb-4' : ''}`}>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-lg">
                {van.driverName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">سائق المركبة</p>
                <p className="text-slate-700 font-semibold">{van.driverName}</p>
                <p className="text-slate-400 text-sm mt-0.5" dir="ltr">{van.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">لوحة السيارة</p>
              <p className="text-slate-700 text-sm font-bold">{van.plate}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">الحالة</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${STATUS_DOT[van.status]}`}></div>
                <p className="text-slate-700 text-sm font-bold">{van.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-blue-500" />
            <h2 className="text-slate-700 text-base font-bold">الموقع الحالي</h2>
          </div>
          <div className="bg-slate-50 rounded-xl flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden min-h-[160px]">
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
            <MapPin size={32} className="text-blue-400 mb-2 drop-shadow-md" />
            <p className="text-slate-600 font-bold z-10">{van.location}</p>
            <p className="text-slate-400 text-xs mt-1 z-10">آخر تحديث: منذ 3 دقائق</p>
          </div>
        </div>
      </div>

      {/* Inventory Full Width */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-slate-800 text-lg font-bold">مخزون المركبة</h2>
              <p className="text-slate-500 text-xs">الأصناف الحالية المتاحة للبيع بالمركبة</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 flex-1 sm:flex-none text-center">
              <span className="text-blue-600 font-bold text-lg">{inventory.length}</span>
              <span className="text-blue-500 text-xs mr-1 block sm:inline">أصناف مختلفة</span>
            </div>
          </div>
        </div>
        
        {inventory.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center">
             <Package size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-medium text-lg">لا يوجد مخزون حالياً في هذه المركبة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">المنتج</th>
                  <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">الكمية</th>
                  <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">سعر البيع</th>
                  <th className="text-right text-slate-500 font-medium text-sm px-6 py-4">إجمالي القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-semibold">{item.productName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.productId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold">
                        {item.quantity} وحدة
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{item.sellingPrice} ج.م</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">
                      {(item.quantity * item.sellingPrice).toLocaleString("ar-EG")} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 border-t border-slate-100">
                  <td className="px-6 py-4 text-slate-600 font-bold text-sm" colSpan={3}>إجمالي قيمة المخزون الحالي بالمركبة</td>
                  <td className="px-6 py-4 text-emerald-700 font-bold text-lg">{inventoryValue.toLocaleString("ar-EG")} ج.م</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
