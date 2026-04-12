import React, { useState } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle, Package, Search } from "lucide-react";
import {
    restockRequests as initialRequests,
    vans,
    products,
    vanInventory,
    transfers,
    stockMovements,
    RestockRequest,
    Transfer,
    StockMovement
} from "../../data/mockData";

export function RestockManagementPage() {
    const [requests, setRequests] = useState<RestockRequest[]>(initialRequests);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("معلق"); // Default to pending
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.vanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            req.representativeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleQuantityChange = (reqId: string, itemIdx: number, newQty: number) => {
        if (newQty < 1) newQty = 1;
        setRequests(prev => prev.map(req => {
            if (req.id === reqId) {
                const newItems = [...req.items];
                newItems[itemIdx] = { ...newItems[itemIdx], requestedQty: newQty };
                return { ...req, items: newItems };
            }
            return req;
        }));
    };

    const handleAction = (reqId: string, newStatus: RestockRequest["status"]) => {
        setLoadingAction(reqId);

        const req = requests.find(r => r.id === reqId);
        if (!req) return;

        setTimeout(() => {
            const updatedRequests = requests.map(r =>
                r.id === reqId ? { ...r, status: newStatus } : r
            );
            setRequests(updatedRequests);

            if (newStatus === "تم التسليم") {
                req.items.forEach(item => {
                    // Update main inventory
                    const productIndex = products.findIndex(p => p.id === item.productId);
                    if (productIndex > -1) {
                        products[productIndex].quantity -= item.requestedQty;
                    }

                    // Update van inventory
                    const vanInv = vanInventory[req.vanId];
                    if (vanInv) {
                        const invItemIndex = vanInv.findIndex(i => i.productId === item.productId);
                        if (invItemIndex > -1) {
                            vanInv[invItemIndex].quantity += item.requestedQty;
                        } else {
                            const product = products.find(p => p.id === item.productId);
                            vanInv.push({
                                productId: item.productId,
                                productName: item.productName,
                                quantity: item.requestedQty,
                                sellingPrice: product?.sellingPrice || 0,
                                minQuantity: 10
                            });
                        }
                    }

                    // Records
                    stockMovements.push({
                        id: `MOV-${String(stockMovements.length + 1).padStart(3, "0")}`,
                        restockRequestId: req.id,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.requestedQty,
                        toVanId: req.vanId,
                        date: new Date().toISOString()
                    });

                    const van = vans.find(v => v.id === req.vanId);
                    transfers.push({
                        id: `TRF-${String(transfers.length + 1).padStart(3, "0")}`,
                        date: new Date().toISOString().split('T')[0],
                        vanId: req.vanId,
                        vanName: `${req.vanId} - ${van?.driverName || "مندوب"}`,
                        productName: item.productName,
                        quantity: item.requestedQty,
                        status: "مكتمل"
                    });
                });
            }

            setLoadingAction(null);
        }, 1000);
    };

    const stats = {
        pending: requests.filter(r => r.status === "معلق").length,
        approved: requests.filter(r => r.status === "موافق").length,
        delivered: requests.filter(r => r.status === "تم التسليم").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={24} className="text-emerald-600" />
                        إدارة طلبات التعبئة
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">مراجعة طلبات التعبئة الخاصة بالسيارات ومعالجتها</p>
                </div>
            </div>

            {/* Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setStatusFilter("معلق")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "معلق" ? "bg-amber-500 border-amber-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "معلق" ? "text-white" : "text-amber-600"}`}>
                        <Clock size={16} />
                        <span className="text-sm font-medium">طلبات معلقة</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "معلق" ? "text-white" : "text-amber-700"}`}>
                        {stats.pending}
                    </div>
                </button>

                <button 
                  onClick={() => setStatusFilter("موافق")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "موافق" ? "bg-emerald-500 border-emerald-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "موافق" ? "text-white" : "text-emerald-600"}`}>
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">طلبات بانتظار التسليم</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "موافق" ? "text-white" : "text-emerald-700"}`}>
                        {stats.approved}
                    </div>
                </button>

                <button 
                  onClick={() => setStatusFilter("تم التسليم")}
                  className={`p-4 rounded-2xl text-right transition-all border ${statusFilter === "تم التسليم" ? "bg-blue-500 border-blue-600 shadow-md transform -translate-y-1" : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${statusFilter === "تم التسليم" ? "text-white" : "text-blue-600"}`}>
                        <Package size={16} />
                        <span className="text-sm font-medium">تم تسليمه</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusFilter === "تم التسليم" ? "text-white" : "text-blue-700"}`}>
                        {stats.delivered}
                    </div>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="relative">
                    <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم الطلب أو المركبة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg pr-12 pl-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الطلب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المركبة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المنتجات المطلوبة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top pt-5">
                                            <span className="text-sm font-bold text-slate-700 block">{req.id}</span>
                                            {req.notes && <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[120px]" title={req.notes}>{req.notes}</span>}
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                              <span className="text-sm font-bold text-slate-700">{req.vanId}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4" colSpan={2}>
                                            <div className="space-y-2">
                                                {req.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 grid grid-cols-4 w-full max-w-sm">
                                                        <div className="col-span-3 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 truncate">
                                                            {item.productName}
                                                        </div>
                                                        <div className="col-span-1">
                                                            <input 
                                                                type="number"
                                                                min="1"
                                                                value={item.requestedQty}
                                                                onChange={(e) => handleQuantityChange(req.id, idx, parseInt(e.target.value) || 1)}
                                                                disabled={req.status === "تم التسليم" || req.status === "مرفوض"}
                                                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-50"
                                                                dir="ltr"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-500 align-top pt-5">
                                            {new Date(req.requestDate).toLocaleDateString("ar-EG")}
                                            <div className="text-[10px] text-slate-400 mt-1">{new Date(req.requestDate).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            <div className="flex items-center gap-2">
                                                {req.status === "معلق" && (
                                                    <>
                                                        <button
                                                            disabled={loadingAction !== null}
                                                            onClick={() => handleAction(req.id, "موافق")}
                                                            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="موافقة"
                                                        >
                                                            <CheckCircle size={14} /> موافقة
                                                        </button>
                                                        <button
                                                            disabled={loadingAction !== null}
                                                            onClick={() => handleAction(req.id, "مرفوض")}
                                                            className="flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="رفض"
                                                        >
                                                            <XCircle size={14} /> رفض
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === "موافق" && (
                                                    <button
                                                        disabled={loadingAction !== null}
                                                        onClick={() => handleAction(req.id, "تم التسليم")}
                                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
                                                    >
                                                        {loadingAction === req.id ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            <Package size={14} />
                                                        )}
                                                        تأكيد التسليم
                                                    </button>
                                                )}
                                                {req.status === "تم التسليم" && (
                                                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                                                        <CheckCircle size={14} /> اكتمل التسليم
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3 text-slate-400">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">لا توجد طلبات تطابق الفلتر الحالي</p>
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
