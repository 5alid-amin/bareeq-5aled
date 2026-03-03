import React, { useState } from "react";
import { List, Search, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sales } from "../../data/mockData";

export function SalesHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";

    const mySales = sales.filter((s) => s.vanId === assignedVanId);

    const filteredSales = mySales.filter((sale) =>
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <List size={24} className="text-purple-600" />
                    سجل المبيعات
                </h2>
                <div className="relative">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم الفاتورة أو الصنف..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم الفاتورة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الصنف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">سعر الوحدة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
                                                {sale.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                                <Calendar size={13} className="text-slate-400" />
                                                {new Date(sale.date).toLocaleString("ar-EG")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700 font-medium">{sale.productName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700 px-2.5 py-1 rounded-md bg-slate-100">
                                                {sale.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            ج.م {sale.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            ج.م {sale.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        لا توجد فواتير بيع تطابق بحثك.
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
