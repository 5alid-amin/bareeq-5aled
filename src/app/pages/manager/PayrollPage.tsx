import React, { useState } from "react";
import { Search, DollarSign, Calendar, FileText, CheckCircle, Download, CreditCard } from "lucide-react";
import { payrollRecords } from "../../data/mockData";
import { KPICard } from "../../components/KPICard";

export function PayrollPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState("2026-02");

    const records = payrollRecords.filter((r) => r.month === filterMonth);
    const filteredRecords = records.filter((r) =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPayroll = records.reduce((sum, r) => sum + r.netPay, 0);
    const totalDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
    const totalBonuses = records.reduce((sum, r) => sum + r.bonuses, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">إدارة الرواتب (مسير الرواتب)</h2>
                        <p className="text-sm text-slate-500">متابعة رواتب الموظفين والمكافآت والخصومات</p>
                    </div>
                </div>

                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                    <Download size={16} />
                    تصدير كشف الرواتب
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="إجمالي الرواتب" value={`ج.م ${totalPayroll.toLocaleString()}`} icon={<CreditCard size={24} />} color="blue" />
                <KPICard title="إجمالي المكافآت" value={`ج.م ${totalBonuses.toLocaleString()}`} icon={<DollarSign size={24} />} color="green" />
                <KPICard title="إجمالي الخصومات" value={`ج.م ${totalDeductions.toLocaleString()}`} icon={<FileText size={24} />} color="red" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث باسم الموظف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pr-10 pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                            >
                                <option value="2026-03">مارس 2026</option>
                                <option value="2026-02">فبراير 2026</option>
                                <option value="2026-01">يناير 2026</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الموظف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الدور</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الراتب الأساسي</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المكافآت</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الخصومات</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">صافي الراتب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {record.employeeName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{record.employeeName}</p>
                                                    <p className="text-xs text-slate-400">{record.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                {record.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {record.baseSalary.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-emerald-600 font-medium">
                                            +{record.bonuses.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-red-600 font-medium">
                                            -{record.deductions.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            ج.م {record.netPay.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${record.status === "مدفوع" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}>
                                                {record.status === "مدفوع" && <CheckCircle size={14} />}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        لا توجد سجلات رواتب تطابق بحثك.
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
