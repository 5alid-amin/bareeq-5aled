import React, { useState } from "react";
import { Plus, RefreshCw, Clock, CheckCircle, XCircle, Package, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { vanInventory, products, restockRequests as initialRequests, RestockRequest } from "../../data/mockData";

export function RestockRequestPage() {
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";
    const myInventory = vanInventory[assignedVanId] || [];

    const [requests, setRequests] = useState<RestockRequest[]>(
        initialRequests.filter(r => r.representativeId === user?.id || r.vanId === assignedVanId)
    );

    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !quantity || parseInt(quantity) <= 0) return;

        setLoading(true);
        const product = products.find(p => p.id === selectedProduct);

        setTimeout(() => {
            const newRequest: RestockRequest = {
                id: `REQ-${String(initialRequests.length + requests.length + 1).padStart(3, "0")}`,
                vanId: assignedVanId,
                representativeId: user?.id || "TEMP",
                representativeName: user?.name || "المندوب",
                items: [
                    {
                        productId: selectedProduct,
                        productName: product?.name || "غير معروف",
                        requestedQty: parseInt(quantity)
                    }
                ],
                requestDate: new Date().toISOString(),
                notes: notes,
                status: "معلق"
            };

            setRequests([newRequest, ...requests]);
            setLoading(false);
            setShowForm(false);
            setSelectedProduct("");
            setQuantity("");
            setNotes("");
        }, 800);
    };

    const getStatusBadge = (status: RestockRequest["status"]) => {
        switch (status) {
            case "معلق":
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"><Clock size={12} /> معلق</span>;
            case "موافق":
                return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"><CheckCircle size={12} /> تمت الموافقة</span>;
            case "مرفوض":
                return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"><XCircle size={12} /> مرفوض</span>;
            case "تم التسليم":
                return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"><Package size={12} /> تم التسليم</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={24} className="text-blue-600" />
                        طلبات إعادة التعبئة
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">طلب بضاعة إضافية للمركبة من المخزن الرئيسي</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        طلب جديد
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-slate-700 font-medium">إنشاء طلب تعبئة جديد</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <XCircle size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-600 text-sm mb-1.5">المنتج</label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    required
                                >
                                    <option value="">-- اختر المنتج --</option>
                                    {products.map(p => {
                                        const inVan = myInventory.find(item => item.productId === p.id);
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (المتوفر بالفان: {inVan?.quantity || 0})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-600 text-sm mb-1.5">الكمية المطلوبة</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="أدخل الكمية"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-600 text-sm mb-1.5">ملاحظات (اختياري)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="أي تفاصيل إضافية..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {loading ? "جاري الإرسال..." : "إرسال الطلب"}
                                {!loading && <Send size={16} />}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-slate-800 font-medium">سجل الطلبات السابقة</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم الطلب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">المنتجات</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الحالة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">ملاحظات الإدارة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                {req.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(req.requestDate).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.items.map((item, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="text-slate-700 font-medium">{item.productName}</span>
                                                    <span className="text-blue-600 font-bold mr-2">({item.requestedQty} وحدة)</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 italic">
                                            {req.notes || "—"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                                        لا توجد طلبات سابقة.
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
