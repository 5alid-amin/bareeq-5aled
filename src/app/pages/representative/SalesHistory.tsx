import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
    List, Search, Calendar, Printer, Pencil, Trash2, X, Filter,
    TrendingUp, FileText, DollarSign, Check, AlertCircle, Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// --- الإعدادات الأساسية ---
const BASE_URL = "http://pareeq.runasp.net/api/SalesHistory";

// --- التحويلات (Mapping) لتطابق الـ Backend ---
const MAP_PAYMENT_TEXT: Record<number, string> = { 1: "كاش", 2: "فيزا", 3: "محفظة" };
const MAP_PAYMENT_ID: Record<string, number> = { "كاش": 1, "فيزا": 2, "محفظة": 3, "فودافون كاش": 3, "إنستاباي": 3 };

const PAYMENT_BADGE_COLORS: Record<string, string> = {
    "كاش": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "فيزا": "bg-blue-50 text-blue-700 border-blue-200",
    "محفظة": "bg-purple-50 text-purple-700 border-purple-200",
};

// ─── View Invoice Details Modal ──────────────────────────────────────────
function ViewInvoiceModal({ invoiceId, vehicleId, onClose }: { invoiceId: number; vehicleId: number; onClose: () => void }) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BASE_URL}/${invoiceId}/vehicle/${vehicleId}`)
            .then(res => setDetails(res.data))
            .finally(() => setLoading(false));
    }, [invoiceId, vehicleId]);

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">تفاصيل الفاتورة</h3>
                        <p className="text-indigo-100 text-sm">{details.invoiceId} #</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">التاريخ</span>
                            <span className="font-semibold">{new Date(details.invoiceDate).toLocaleDateString("ar-EG")}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">اسم السيارة</span>
                            <span className="font-semibold text-indigo-600">{details.vehicleName}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">طريقة الدفع</span>
                            <span className="font-semibold">{details.paymentMethod}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">المندوب</span>
                            <span className="font-semibold">{details.representativeName}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 border-r-4 border-indigo-500 pr-2">الأصناف المباعة</h4>
                        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 font-semibold text-slate-500">الصنف</th>
                                        <th className="p-3 text-center font-semibold text-slate-500">الكمية</th>
                                        <th className="p-3 text-left font-semibold text-slate-500">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {details.items.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-3 text-slate-700">{item.productName}</td>
                                            <td className="p-3 text-center font-medium">{item.quantity}</td>
                                            <td className="p-3 text-left font-bold text-slate-900">ج.م {item.subTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <span className="font-bold text-indigo-900">الإجمالي الكلي</span>
                        <span className="text-xl font-black text-indigo-700">ج.م {details.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Modal ─────────────────────────────────────────────────────────
function EditInvoiceModal({ invoiceId, vehicleId, onClose, onSave }: { invoiceId: number; vehicleId: number; onClose: () => void; onSave: () => void; }) {
    const [items, setItems] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<string>("كاش");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BASE_URL}/${invoiceId}/vehicle/${vehicleId}`).then(res => {
            // هنا تم الاعتماد على productId القادم من الـ DTO الجديد مباشرة
            setItems(res.data.items.map((i: any) => ({ ...i })));
            setPaymentMethod(res.data.paymentMethod);
            setLoading(false);
        });
    }, [invoiceId, vehicleId]);

    const updateItem = (idx: number, val: number) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: val, subTotal: val * item.unitPrice } : item));
    };

    const total = items.reduce((s, i) => s + (i.subTotal || 0), 0);

    const handleSave = async () => {
        try {
            const payload = {
                paymentMethod: MAP_PAYMENT_ID[paymentMethod] || 1,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
            };
            await axios.put(`${BASE_URL}/${invoiceId}/vehicle/${vehicleId}`, payload);
            onSave();
        } catch (err) { alert("حدث خطأ أثناء التعديل"); }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Pencil size={18} className="text-purple-600" /> تعديل الفاتورة {invoiceId}</h3>
                    <button onClick={onClose}><X size={18} /></button>
                </div>
                <div className="space-y-4">
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border p-2.5 rounded-xl">
                        <option value="كاش">كاش</option><option value="فيزا">فيزا</option><option value="محفظة">محفظة</option>
                    </select>
                    <table className="w-full text-right border rounded-xl overflow-hidden">
                        <thead className="bg-slate-50"><tr><th className="p-3 text-xs">الصنف</th><th className="p-3 text-xs">الكمية</th><th className="p-3 text-xs">الإجمالي</th></tr></thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="p-3 text-sm">{item.productName}</td>
                                    <td className="p-3"><input type="number" value={item.quantity} onChange={(e) => updateItem(idx, Number(e.target.value))} className="w-20 border rounded p-1 text-center" /></td>
                                    <td className="p-3 font-bold text-sm">ج.م {item.subTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl font-bold"><span>الإجمالي الجديد</span><span>ج.م {total.toFixed(2)}</span></div>
                    <div className="flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 border rounded-xl">إلغاء</button><button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-xl">حفظ</button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────
export function SalesHistory() {
    const { user } = useAuth();
    const vehicleId = user?.vehicleId ?? 1; // مأخوذ من الـ JWT Token

    const [invoices, setInvoices] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalSales: 0, totalInvoices: 0, totalItemsCount: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [viewId, setViewId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        try {
            let url = `${BASE_URL}/vehicle/${vehicleId}?searchTerm=${searchTerm}`;
            if (selectedDate) url += `&date=${selectedDate}`;

            const res = await axios.get(url);
            setInvoices(res.data.invoices);
            setSummary(res.data.summary);
        } catch (err) { console.error("Error fetching sales history", err); }
    };

    useEffect(() => { fetchData(); }, [searchTerm, selectedDate]);

    const handleDelete = async () => {
        if (!deleteId) return;
        await axios.delete(`${BASE_URL}/${deleteId}/vehicle/${vehicleId}`);
        setDeleteId(null);
        fetchData();
    };

    const recordsPerPage = 10;
    const paginatedInvoices = invoices.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
    const totalPages = Math.ceil(invoices.length / recordsPerPage);

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <List size={24} className="text-purple-600" /> سجل المبيعات
                </h2>
                <div className="flex gap-2">
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" />
                    <div className="relative">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                        <input type="text" placeholder="بحث برقم الفاتورة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-purple-500 rounded-2xl p-5 shadow-sm group">
                    <div className="flex justify-between mb-2 text-purple-600 text-xs font-bold uppercase tracking-wider"><span>إجمالي المبيعات</span><DollarSign size={18} /></div>
                    <div className="text-2xl font-black text-purple-700">ج.م {summary.totalSales.toFixed(2)}</div>
                </div>
                <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-sm group">
                    <div className="flex justify-between mb-2 text-blue-600 text-xs font-bold uppercase tracking-wider"><span>عدد الفواتير</span><FileText size={18} /></div>
                    <div className="text-2xl font-black text-blue-700">{summary.totalInvoices}</div>
                </div>
                <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-sm group">
                    <div className="flex justify-between mb-2 text-emerald-600 text-xs font-bold uppercase tracking-wider"><span>إجمالي القطع</span><TrendingUp size={18} /></div>
                    <div className="text-2xl font-black text-emerald-700">{summary.totalItemsCount}</div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">رقم الفاتورة</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">طريقة الدفع</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الإجمالي</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedInvoices.map((inv) => (
                                <tr key={inv.invoiceId} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-purple-600">{inv.invoiceId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(inv.invoiceDate).toLocaleDateString("ar-EG")}
                                        <span className="block text-[10px] text-slate-400">{new Date(inv.invoiceDate).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${PAYMENT_BADGE_COLORS[inv.paymentMethod] || "bg-slate-100 text-slate-600"}`}>
                                            {inv.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-800 text-center">ج.م {inv.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setViewId(inv.invoiceId)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button onClick={() => setEditId(inv.invoiceId)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><Pencil size={16} /></button>
                                            <button onClick={() => setDeleteId(inv.invoiceId)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">عرض صفحة {currentPage} من {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50">السابق</button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50">التالي</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {viewId && <ViewInvoiceModal invoiceId={viewId} vehicleId={vehicleId} onClose={() => setViewId(null)} />}
            {editId && <EditInvoiceModal invoiceId={editId} vehicleId={vehicleId} onClose={() => setEditId(null)} onSave={() => { setEditId(null); fetchData(); }} />}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4"><AlertCircle size={28} className="text-red-500" /></div>
                        <h3 className="text-lg font-bold mb-2">حذف الفاتورة</h3>
                        <p className="text-slate-500 mb-6">هل أنت متأكد من حذف هذه الفاتورة؟ سيتم رد الكميات للمخزون.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border rounded-xl">إلغاء</button>
                            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl">نعم، احذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}