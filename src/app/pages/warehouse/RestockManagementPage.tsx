import React, { useState, useEffect } from "react";
import { RefreshCw, Clock, CheckCircle, Package, Search, AlertCircle } from "lucide-react";
import axios from "axios";

// تعريف الـ URL بتاع الباك إند (غيره حسب السيرفر عندك)
const API_BASE_URL = "https://localhost:7280/api/RefillRequests";

// خريطة لتحويل الحالات من نصوص لأرقام والأسماء
const STATUS_MAP: Record<string, number> = {
    "معلق": 0,
    "موافق": 1,
    "تم التسليم": 2,
    "مرفوض": 3
};

export function RestockManagementPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("معلق");
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<number | null>(null);

    // 1. ميثود جلب البيانات من الباك إند
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const statusNumber = STATUS_MAP[statusFilter];
            const response = await axios.get(API_BASE_URL, {
                params: { 
                    status: statusNumber,
                    search: searchTerm 
                }
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // جلب البيانات عند تحميل الصفحة أو تغيير الفلاتر
    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    // البحث بعد التوقف عن الكتابة (Debounce بسيط)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchRequests();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // 2. ميثود تنفيذ الأكشن (موافقة / رفض / تسليم)
    const handleAction = async (requestId: number, newStatus: number) => {
        setLoadingAction(requestId);
        try {
            const response = await axios.put(`${API_BASE_URL}/update-status`, {
                requestId: requestId,
                newStatus: newStatus,
                adminNotes: "تم التحديث من لوحة التحكم"
            });
            
            // نجاح العملية: إعادة تحميل البيانات
            await fetchRequests();
            alert(response.data); 
        } catch (error: any) {
            alert(error.response?.data || "حدث خطأ أثناء التحديث");
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={24} className="text-emerald-600" />
                        إدارة طلبات التعبئة (Live API)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">مراجعة طلبات التعبئة ومعالجتها من الداتابيز مباشرة</p>
                </div>
            </div>

            {/* Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setStatusFilter("معلق")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "معلق" ? "bg-amber-500 border-amber-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "معلق" ? "text-white" : "text-amber-600"}`}>
                        <Clock size={16} />
                        <span className="text-sm font-medium">طلبات معلقة</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "معلق" ? "text-white" : "text-amber-700"}`}>
                        {statusFilter === "معلق" ? requests.length : "..."}
                    </div>
                </button>

                <button 
                  onClick={() => setStatusFilter("موافق")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "موافق" ? "bg-emerald-500 border-emerald-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "موافق" ? "text-white" : "text-emerald-600"}`}>
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">بانتظار التسليم</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "موافق" ? "text-white" : "text-emerald-700"}`}>
                        {statusFilter === "موافق" ? requests.length : "..."}
                    </div>
                </button>

                <button 
                  onClick={() => setStatusFilter("تم التسليم")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "تم التسليم" ? "bg-blue-500 border-blue-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "تم التسليم" ? "text-white" : "text-blue-600"}`}>
                        <Package size={16} />
                        <span className="text-sm font-medium">تم تسليمه</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "تم التسليم" ? "text-white" : "text-blue-700"}`}>
                        {statusFilter === "تم التسليم" ? requests.length : "..."}
                    </div>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="relative">
                    <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم الطلب أو اسم العربية..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg pr-12 pl-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <RefreshCw className="animate-spin text-emerald-600" size={40} />
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">الطلب</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">المركبة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">المنتج</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية المطلوبة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية بالسيارة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-bold text-slate-700">#{req.requestId}</td>
                                        <td className="px-6 py-4 text-sm">{req.vehicleName} ({req.plateNumber})</td>
                                        <td className="px-6 py-4 text-sm">{req.productName}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-700">{req.requestedQuantity}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600 bg-blue-50/30">{req.vehicleCurrentQuantity}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {new Date(req.requestDate).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {req.status === 0 && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(req.requestId, 1)}
                                                            className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600 hover:text-white"
                                                        >موافقة</button>
                                                        <button 
                                                            onClick={() => handleAction(req.requestId, 3)}
                                                            className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-600 hover:text-white"
                                                        >رفض</button>
                                                    </>
                                                )}
                                                {req.status === 1 && (
                                                    <button 
                                                        disabled={loadingAction === req.requestId}
                                                        onClick={() => handleAction(req.requestId, 2)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-2"
                                                    >
                                                        {loadingAction === req.requestId ? <RefreshCw size={14} className="animate-spin" /> : <Package size={14} />}
                                                        تأكيد التسليم
                                                    </button>
                                                )}
                                                {req.status === 2 && (
                                                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs">تمت العملية ✅</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}