import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, RefreshCw, Clock, CheckCircle, XCircle, Send, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// الإعدادات الأساسية للـ API
const BASE_URL = "http://pareeq.runasp.net/api/CarInventory";

// تعريف الأنواع (Interfaces) بناءً على الـ DTOs في الباك اند
interface ProductLookup {
    productId: number;
    productName: string;
}

interface PendingRequest {
    requestId: number;
    productName: string;
    requestedQuantity: number;
    requestDate: string;
    status: number;
    adminNotes?: string;
}

export function RestockRequestPage() {
    const { user } = useAuth();
    // رقم المركبة مأخوذ من الـ JWT Token
    const vehicleId = user?.vehicleId ?? 1;

    // States
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [products, setProducts] = useState<ProductLookup[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | "">("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. جلب المنتجات (Lookup) والطلبات المعلقة عند التحميل
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setFetching(true);
        try {
            const [productsRes, requestsRes] = await Promise.all([
                axios.get(`${BASE_URL}/products-lookup`),
                axios.get(`${BASE_URL}/pending-requests/${vehicleId}`)
            ]);
            setProducts(productsRes.data);
            setRequests(requestsRes.data);
            setError(null);
        } catch (err) {
            setError("حدث خطأ أثناء جلب البيانات من الخادم");
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleOpenForm = () => {
        setEditingRequestId(null);
        setSelectedProductId("");
        setQuantity("");
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingRequestId(null);
        setError(null);
    };

    // 2. إرسال طلب جديد أو تحديث طلب قائم
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !quantity) return;

        setLoading(true);
        try {
            if (editingRequestId) {
                // تحديث (PUT)
                await axios.put(`${BASE_URL}/update-request/${editingRequestId}`, {
                    productId: Number(selectedProductId),
                    requestedQuantity: Number(quantity)
                });
            } else {
                // إنشاء جديد (POST)
                await axios.post(`${BASE_URL}/refill-request`, {
                    vehicleId: vehicleId,
                    productId: Number(selectedProductId),
                    requestedQuantity: Number(quantity)
                });
            }

            await fetchInitialData(); // إعادة تحديث القائمة
            handleCloseForm();
        } catch (err: any) {
            setError(err.response?.data?.message || "فشل في حفظ الطلب");
        } finally {
            setLoading(false);
        }
    };

    // 3. تحضير التعديل
    const handleEdit = (req: PendingRequest) => {
        // نجد الـ ID الخاص بالمنتج من القائمة بناءً على الاسم (أو يفضل لو الـ API يرجع الـ ID)
        // ملاحظة: الـ DTO بتاعك يرجع الاسم، هحاول أعمل Match بسيط هنا
        const product = products.find(p => p.productName === req.productName);

        setEditingRequestId(req.requestId);
        setSelectedProductId(product?.productId || "");
        setQuantity(req.requestedQuantity.toString());
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getStatusText = (status: number) => {
        return status === 0 ? "قيد الانتظار" : "تم المعالجة";
    };

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={24} className="text-blue-600" />
                        طلبات إعادة التعبئة (مركبة #{vehicleId})
                    </h2>
                </div>
                {!showForm && (
                    <button
                        onClick={handleOpenForm}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        طلب جديد
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-slate-700 font-medium">
                            {editingRequestId ? "تعديل الطلب" : "إنشاء طلب جديد"}
                        </h3>
                        <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                            <XCircle size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-600 text-sm mb-1.5">المنتج</label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">-- اختر المنتج من المخزن --</option>
                                    {products.map(p => (
                                        <option key={p.productId} value={p.productId}>{p.productName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-600 text-sm mb-1.5">الكمية المطلوبة</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="px-4 py-2 text-slate-600">إلغاء</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "جاري الحفظ..." : "إرسال الطلب"}
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-slate-800 font-medium">الطلبات المعلقة الحالية</h3>
                    {fetching && <RefreshCw size={16} className="animate-spin text-blue-500" />}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المنتج</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{req.productName}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600 font-bold">{req.requestedQuantity}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {new Date(req.requestDate).toLocaleString("ar-EG")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                                                <Clock size={12} /> {getStatusText(req.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleEdit(req)}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                                        {fetching ? "جاري التحميل..." : "لا توجد طلبات معلقة حالياً"}
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