import React, { useState } from "react";
import { Search, Package, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { vanInventory } from "../../data/mockData";

interface Props {
    onNavigate?: (page: string) => void;
}

export function VehicleInventory({ onNavigate }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();

    const assignedVanId = user?.assignedVanId || "VAN-001";
    const inventory = vanInventory[assignedVanId] || [];

    const filteredInventory = inventory.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Package size={24} className="text-blue-600" />
                    مخزون المركبة ({assignedVanId})
                </h2>
                <div className="relative">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم أو اسم الصنف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم الصنف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">اسم الصنف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية المتاحة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">سعر البيع (للوحدة)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item) => (
                                    <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                {item.productId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700 font-medium">{item.productName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold px-2.5 py-1 rounded-md ${item.quantity < 10
                                                    ? "bg-red-50 text-red-600 border border-red-100"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                    }`}>
                                                    {item.quantity}
                                                </span>
                                                {item.quantity < 10 && (
                                                    <span title="كمية منخفضة" className="text-red-500 flex items-center">
                                                        <AlertTriangle size={16} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            ج.م {item.sellingPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {item.quantity <= item.minQuantity && (
                                                <button
                                                    onClick={() => onNavigate?.("rep-restock")}
                                                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <RefreshCw size={12} />
                                                    طلب تعبئة
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        لا توجد أصناف تطابق بحثك أو أن المركبة فارغة.
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
