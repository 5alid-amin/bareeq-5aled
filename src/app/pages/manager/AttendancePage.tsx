import React, { useState } from "react";
import { Users, Search, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { attendanceRecords } from "../../data/mockData";
import { KPICard } from "../../components/KPICard";

export function AttendancePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("2026-03-03");

    const records = attendanceRecords.filter((r) => r.date === filterDate);
    const filteredRecords = records.filter((r) =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = records.filter(r => r.status === "حاضر").length;
    const lateCount = records.filter(r => r.status === "متأخر").length;
    const absentCount = records.filter(r => r.status === "غائب").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Clock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">نظام تسجيل الحضور والانصراف</h2>
                    <p className="text-sm text-slate-500">متابعة دوام الموظفين والمندوبين اليومية</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="حاضر" value={presentCount.toString()} icon={<CheckCircle size={24} />} color="green" />
                <KPICard title="متأخر" value={lateCount.toString()} icon={<AlertTriangle size={24} />} color="orange" />
                <KPICard title="غائب" value={absentCount.toString()} icon={<XCircle size={24} />} color="red" />
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
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الموظف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">وقت الحضور</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">وقت الانصراف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {record.employeeName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{record.employeeName}</p>
                                                    <p className="text-xs text-slate-400">{record.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {record.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {record.checkIn || "---"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {record.checkOut || "---"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${record.status === "حاضر" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                record.status === "متأخر" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    "bg-red-50 text-red-700 border-red-200"
                                                }`}>
                                                {record.status === "حاضر" && <CheckCircle size={14} />}
                                                {record.status === "متأخر" && <AlertTriangle size={14} />}
                                                {record.status === "غائب" && <XCircle size={14} />}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        لا توجد سجلات حضور استناداً إلى بحثك.
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
