import React, { useState } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle, Package, ArrowLeftRight, Search, Filter } from "lucide-react";
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
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.representativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.vanId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (reqId: string, newStatus: RestockRequest["status"]) => {
        setLoadingAction(reqId);

        // Find the request
        const req = requests.find(r => r.id === reqId);
        if (!req) return;

        setTimeout(() => {
            // Update request status
            const updatedRequests = requests.map(r =>
                r.id === reqId ? { ...r, status: newStatus } : r
            );
            setRequests(updatedRequests);

            // If fulfilled, update inventory and create records
            if (newStatus === "تم التسليم") {
                req.items.forEach(item => {
                    // 1. Update Warehouse Inventory (-)
                    const productIndex = products.findIndex(p => p.id === item.productId);
                    if (productIndex > -1) {
                        products[productIndex].quantity -= item.requestedQty;
                    }

                    // 2. Update Vehicle Inventory (+)
                    const vanInv = vanInventory[req.vanId];
                    if (vanInv) {
                        const invItemIndex = vanInv.findIndex(i => i.productId === item.productId);
                        if (invItemIndex > -1) {
                            vanInv[invItemIndex].quantity += item.requestedQty;
                        } else {
                            // Add new item to van if not existing
                            const product = products.find(p => p.id === item.productId);
                            vanInv.push({
                                productId: item.productId,
                                productName: item.productName,
                                quantity: item.requestedQty,
                                sellingPrice: product?.sellingPrice || 0,
                                minQuantity: 10 // default
                            });
                        }
                    }

                    // 3. Create Stock Movement record
                    const movement: StockMovement = {
                        id: `MOV-${String(stockMovements.length + 1).padStart(3, "0")}`,
                        restockRequestId: req.id,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.requestedQty,
                        toVanId: req.vanId,
                        date: new Date().toISOString()
                    };
                    stockMovements.push(movement);

                    // 4. Create Transfer record
                    const van = vans.find(v => v.id === req.vanId);
                    const transfer: Transfer = {
                        id: `TRF-${String(transfers.length + 1).padStart(3, "0")}`,
                        date: new Date().toISOString().split('T')[0],
                        vanId: req.vanId,
                        vanName: `${req.vanId} - ${van?.driverName || "مندوب"}`,
                        productName: item.productName,
                        quantity: item.requestedQty,
                        status: "مكتمل"
                    };
                    transfers.push(transfer);
                });
            }

            setLoadingAction(null);
        }, 1000);
    };

    const getStatusStyle = (status: RestockRequest["status"]) => {
        switch (status) {
            case "معلق": return "bg-amber-50 text-amber-700 border-amber-100";
            case "موافق": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "مرفوض": return "bg-rose-50 text-rose-700 border-rose-100";
            case "تم التسليم": return "bg-blue-50 text-blue-700 border-blue-100";
            default: return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={24} className="text-emerald-600" />
                        إدارة طلبات التعبئة
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">مراجعة ومعالجة طلبات البضاعة المقدمة من المناديب</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم الطلب، المندوب، أو الفان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none min-w-[140px]"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="معلق">معلق</option>
                        <option value="موافق">موافق عليه</option>
                        <option value="مرفوض">مرفوض</option>
                        <option value="تم التسليم">تم التسليم</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الطلب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المندوب والفان</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المنتجات المطلوبة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 block">{req.id}</span>
                                            {req.notes && <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[120px]" title={req.notes}>{req.notes}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-700">{req.representativeName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{req.vanId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-600">{item.productName}</span>
                                                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.requestedQty}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(req.requestDate).toLocaleDateString("ar-EG")}
                                            <div className="text-[10px] text-slate-300">{new Date(req.requestDate).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {req.status === "معلق" && (
                                                    <>
                                                        <button
                                                            disabled={loadingAction !== null}
                                                            onClick={() => handleAction(req.id, "موافق")}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="موافقة"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            disabled={loadingAction !== null}
                                                            onClick={() => handleAction(req.id, "مرفوض")}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="رفض"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === "موافق" && (
                                                    <button
                                                        disabled={loadingAction !== null}
                                                        onClick={() => handleAction(req.id, "تم التسليم")}
                                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                                                    >
                                                        {loadingAction === req.id ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            <Package size={14} />
                                                        )}
                                                        تسليم بضاعة
                                                    </button>
                                                )}
                                                {(req.status === "تم التسليم" || req.status === "مرفوض") && (
                                                    <span className="text-xs text-slate-300 italic">لا توجد إجراءات</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                                        لا توجد طلبات تطابق معايير البحث.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-amber-600 mb-1">
                        <Clock size={16} />
                        <span className="text-sm font-medium">طلبات معلقة</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">
                        {requests.filter(r => r.status === "معلق").length}
                    </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-emerald-600 mb-1">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">طلبات بانتظار التسليم</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                        {requests.filter(r => r.status === "موافق").length}
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-blue-600 mb-1">
                        <Package size={16} />
                        <span className="text-sm font-medium">تم تسليمه اليوم</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                        {requests.filter(r => r.status === "تم التسليم").length}
                    </div>
                </div>
            </div>
        </div>
    );
}
