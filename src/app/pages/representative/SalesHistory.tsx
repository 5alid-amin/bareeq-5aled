import React, { useState } from "react";
import { List, Search, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { invoices } from "../../data/mockData";

export function SalesHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";

    const myInvoices = invoices.filter((i) => i.vanId === assignedVanId);

    const filteredInvoices = myInvoices.filter((invoice) =>
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.items.some((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">تفاصيل الأصناف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">طريقة الدفع</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
                                                {invoice.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                                <Calendar size={13} className="text-slate-400" />
                                                {new Date(invoice.date).toLocaleString("ar-EG")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {invoice.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="text-xs text-slate-700">
                                                        {item.quantity}x {item.productName}
                                                    </span>
                                                ))}
                                                {invoice.items.length > 2 && (
                                                    <span className="text-xs text-slate-400">+{invoice.items.length - 2} أصناف أخرى</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700 px-2.5 py-1 rounded-md bg-slate-100">
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            ج.م {invoice.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
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
