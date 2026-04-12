import React, { useState, useMemo } from "react";
import {
    List, Search, Calendar, Printer, Pencil, Trash2, X, Filter,
    TrendingUp, FileText, DollarSign, Check, AlertCircle, Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { invoices, Invoice, InvoiceItem, PaymentMethod } from "../../data/mockData";

type FilterMode = "all" | "day" | "month" | "year";

const MONTHS_AR = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const PAYMENT_BADGE_COLORS: Record<string, string> = {
    "كاش": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "فيزا": "bg-blue-50 text-blue-700 border-blue-200",
    "فودافون كاش": "bg-red-50 text-red-700 border-red-200",
    "إنستاباي": "bg-purple-50 text-purple-700 border-purple-200",
};

// ─── View Invoice Details Modal ──────────────────────────────────────────
function ViewInvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">تفاصيل الفاتورة</h3>
                        <p className="text-indigo-100 text-sm">{invoice.id} #</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">التاريخ</span>
                            <span className="font-semibold">{new Date(invoice.date).toLocaleDateString("ar-EG")}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">اسم السيارة</span>
                            <span className="font-semibold text-indigo-600">{invoice.vanId}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">طريقة الدفع</span>
                            <span className="font-semibold">{invoice.paymentMethod}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">السائق</span>
                            <span className="font-semibold">محمد أحمد (تجريبي)</span>
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
                                    {invoice.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 text-slate-700">{item.productName}</td>
                                            <td className="p-3 text-center font-medium">{item.quantity}</td>
                                            <td className="p-3 text-left font-bold text-slate-900">ج.م {item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <span className="font-bold text-indigo-900">الإجمالي الكلي</span>
                        <span className="text-xl font-black text-indigo-700">ج.م {invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Print Invoice Function ──────────────────────────────────────────────
function printInvoice(invoice: Invoice) {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const itemsRows = invoice.items
        .map((item) => `
        <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155">${item.productName}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;text-align:center">${item.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;text-align:center">ج.م ${item.unitPrice.toFixed(2)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;text-align:center">ج.م ${item.total.toFixed(2)}</td>
        </tr>`).join("");

    printWindow.document.write(`
    <html lang="ar" dir="rtl">
    <head><title>فاتورة ${invoice.id}</title><style>body{font-family:Tahoma;padding:40px;direction:rtl;} .header{display:flex;justify-content:space-between;border-bottom:2px solid #6366f1;padding-bottom:20px;margin-bottom:20px;} table{width:100%;border-collapse:collapse;} th{background:#f8fafc;padding:10px;border:1px solid #e2e8f0;} td{padding:10px;border:1px solid #e2e8f0;}</style></head>
    <body>
        <div class="header"><div><h1>بريق للتوزيع</h1><p>رقم الفاتورة: ${invoice.id}</p></div><div><p>التاريخ: ${new Date(invoice.date).toLocaleDateString("ar-EG")}</p><p>السيارة: ${invoice.vanId}</p></div></div>
        <table><thead><tr><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${itemsRows}</tbody></table>
        <div style="margin-top:20px;text-align:left;"><h2>الإجمالي: ج.م ${invoice.total.toFixed(2)}</h2></div>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// ─── Edit Modal ─────────────────────────────────────────────────────────
function EditInvoiceModal({ invoice, onClose, onSave }: { invoice: Invoice; onClose: () => void; onSave: (updated: Invoice) => void; }) {
    const [items, setItems] = useState<InvoiceItem[]>(invoice.items.map((i) => ({ ...i })));
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(invoice.paymentMethod);
    const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            if (field === "quantity") updated.total = Number(updated.quantity) * Number(updated.unitPrice);
            return updated;
        }));
    };
    const total = items.reduce((s, i) => s + i.total, 0);
    const handleSave = () => onSave({ ...invoice, items, paymentMethod, total });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Pencil size={18} className="text-purple-600" /> تعديل الفاتورة {invoice.id}</h3>
                    <button onClick={onClose}><X size={18} /></button>
                </div>
                <div className="space-y-4">
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full border p-2.5 rounded-xl">
                        <option value="كاش">كاش</option><option value="فيزا">فيزا</option><option value="فودافون كاش">فودافون كاش</option><option value="إنستاباي">إنستاباي</option>
                    </select>
                    <table className="w-full text-right border rounded-xl overflow-hidden">
                        <thead className="bg-slate-50"><tr><th className="p-3 text-xs">الصنف</th><th className="p-3 text-xs">الكمية</th><th className="p-3 text-xs">الإجمالي</th></tr></thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="p-3 text-sm">{item.productName}</td>
                                    <td className="p-3"><input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="w-20 border rounded p-1 text-center" /></td>
                                    <td className="p-3 font-bold text-sm">ج.م {item.total.toFixed(2)}</td>
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

// ─── Delete Confirmation ────────────────────────────────────────────────
function DeleteConfirmModal({ invoice, onClose, onConfirm }: { invoice: Invoice; onClose: () => void; onConfirm: () => void; }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4"><AlertCircle size={28} className="text-red-500" /></div>
                <h3 className="text-lg font-bold mb-2">حذف الفاتورة</h3>
                <p className="text-slate-500 mb-6">هل أنت متأكد من حذف الفاتورة {invoice.id}؟</p>
                <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2 border rounded-xl">إلغاء</button><button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-xl">نعم، احذف</button></div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────
export function SalesHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    
    // Modals state
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";
    const myInvoices = invoices.filter((i) => i.vanId === assignedVanId);

    const availableYears = useMemo(() => {
        const years = new Set(myInvoices.map((i) => new Date(i.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [myInvoices]);

    const filteredInvoices = useMemo(() => {
        return myInvoices.filter((inv) => {
            const d = new Date(inv.date);
            let matchesDate = true;
            if (filterMode === "day" && selectedDay) {
                const [y, m, dd] = selectedDay.split("-").map(Number);
                matchesDate = d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === dd;
            } else if (filterMode === "month" && selectedMonth && selectedYear) {
                matchesDate = d.getFullYear() === Number(selectedYear) && d.getMonth() === Number(selectedMonth);
            } else if (filterMode === "year" && selectedYear) {
                matchesDate = d.getFullYear() === Number(selectedYear);
            }

            const term = searchTerm.toLowerCase();
            const matchesSearch = inv.id.toLowerCase().includes(term) || inv.paymentMethod.toLowerCase().includes(term);

            return matchesDate && matchesSearch;
        });
    }, [myInvoices, filterMode, selectedDay, selectedMonth, selectedYear, searchTerm]);

    // Pagination Logic
    const recordsPerPage = 10;
    const totalPages = Math.ceil(filteredInvoices.length / recordsPerPage);
    const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const totalSales = filteredInvoices.reduce((s, i) => s + i.total, 0);
    const totalInvoiceCount = filteredInvoices.length;
    const totalItems = filteredInvoices.reduce((s, i) => s + i.items.reduce((ss, it) => ss + it.quantity, 0), 0);

    const handleSaveEdit = (updated: Invoice) => {
        const idx = invoices.findIndex((i) => i.id === updated.id);
        if (idx !== -1) invoices[idx] = updated;
        setEditingInvoice(null);
        setMessage({ type: "success", text: `تم تعديل الفاتورة ${updated.id} بنجاح.` });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleConfirmDelete = () => {
        if (!deletingInvoice) return;
        const idx = invoices.findIndex((i) => i.id === deletingInvoice.id);
        if (idx !== -1) invoices.splice(idx, 1);
        setDeletingInvoice(null);
        setMessage({ type: "success", text: "تم حذف الفاتورة بنجاح." });
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="space-y-5 pb-10">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <List size={24} className="text-purple-600" /> سجل المبيعات
                </h2>
                <div className="relative">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full md:w-80 bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm" />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between mb-2 text-purple-200 text-xs font-medium"><span>إجمالي المبيعات</span><DollarSign size={18}/></div>
                    <div className="text-2xl font-black">ج.م {totalSales.toFixed(2)}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between mb-2 text-blue-200 text-xs font-medium"><span>عدد الفواتير</span><FileText size={18}/></div>
                    <div className="text-2xl font-black">{totalInvoiceCount}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between mb-2 text-emerald-200 text-xs font-medium"><span>إجمالي القطع</span><TrendingUp size={18}/></div>
                    <div className="text-2xl font-black">{totalItems}</div>
                </div>
            </div>

            {/* Invoices Table */}
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
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-purple-600">{inv.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(inv.date).toLocaleDateString("ar-EG")}
                                        <span className="block text-[10px] text-slate-400">{new Date(inv.date).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${PAYMENT_BADGE_COLORS[inv.paymentMethod] || "bg-slate-100 text-slate-600"}`}>
                                            {inv.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-800 text-center">ج.م {inv.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setViewingInvoice(inv)} title="عرض التفاصيل" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => setEditingInvoice(inv)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => printInvoice(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <Printer size={16} />
                                            </button>
                                            <button onClick={() => setDeletingInvoice(inv)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">عرض صفحة {currentPage} من {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50">السابق</button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs border rounded-lg bg-white disabled:opacity-50">التالي</button>
                    </div>
                </div>
            </div>

            {/* Modals Render */}
            {viewingInvoice && <ViewInvoiceModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
            {editingInvoice && <EditInvoiceModal invoice={editingInvoice} onClose={() => setEditingInvoice(null)} onSave={handleSaveEdit} />}
            {deletingInvoice && <DeleteConfirmModal invoice={deletingInvoice} onClose={() => setDeletingInvoice(null)} onConfirm={handleConfirmDelete} />}
        </div>
    );
}