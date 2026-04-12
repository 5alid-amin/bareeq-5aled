import React, { useState, useMemo, useRef } from "react";
import {
    List, Search, Calendar, Printer, Pencil, Trash2, X, Filter, ChevronDown,
    TrendingUp, FileText, DollarSign, Check, AlertCircle
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

// ─── Print Invoice ──────────────────────────────────────────────────────
function printInvoice(invoice: Invoice) {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const itemsRows = invoice.items
        .map(
            (item) => `
        <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155">${item.productName}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;text-align:center">${item.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;text-align:center">ج.م ${item.unitPrice.toFixed(2)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;text-align:center">ج.م ${item.total.toFixed(2)}</td>
        </tr>`
        )
        .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.id}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; background:#fff; padding:40px; color:#1e293b; direction:rtl; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid #6366f1; }
            .logo { font-size:28px; font-weight:800; color:#6366f1; }
            .logo span { color:#0f172a; }
            .invoice-id { font-size:14px; color:#64748b; margin-top:4px; }
            .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
            .info-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; }
            .info-label { font-size:12px; color:#94a3b8; margin-bottom:4px; }
            .info-value { font-size:15px; font-weight:600; color:#1e293b; }
            table { width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:24px; }
            thead { background:linear-gradient(135deg, #6366f1, #8b5cf6); }
            th { padding:12px 14px; font-size:13px; font-weight:600; color:#fff; text-align:right; }
            th:not(:first-child) { text-align:center; }
            .total-row { background:#f1f5f9; }
            .total-row td { padding:14px; font-size:16px; font-weight:800; color:#6366f1; }
            .footer { text-align:center; color:#94a3b8; font-size:12px; margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; }
            @media print { body { padding:20px; } }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="logo">بريق <span>للتوزيع</span></div>
                <div class="invoice-id">فاتورة رقم: ${invoice.id}</div>
            </div>
            <div style="text-align:left">
                <div style="font-size:13px;color:#64748b">التاريخ</div>
                <div style="font-size:15px;font-weight:600;color:#1e293b">${new Date(invoice.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</div>
                <div style="font-size:13px;color:#64748b;margin-top:2px">${new Date(invoice.date).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
        </div>
        <div class="info-grid">
            <div class="info-card">
                <div class="info-label">طريقة الدفع</div>
                <div class="info-value">${invoice.paymentMethod}</div>
            </div>
            <div class="info-card">
                <div class="info-label">السيارة</div>
                <div class="info-value">${invoice.vanId}</div>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
                <tr class="total-row">
                    <td colspan="3" style="padding:14px;font-size:16px;font-weight:800;color:#1e293b">الإجمالي الكلي</td>
                    <td style="text-align:center">ج.م ${invoice.total.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <div class="footer">
            مطبوع من نظام بريق لإدارة التوزيع — ${new Date().toLocaleDateString("ar-EG")}
        </div>
    </body>
    </html>`);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 300);
}

// ─── Edit Modal ─────────────────────────────────────────────────────────
function EditInvoiceModal({
    invoice,
    onClose,
    onSave,
}: {
    invoice: Invoice;
    onClose: () => void;
    onSave: (updated: Invoice) => void;
}) {
    const [items, setItems] = useState<InvoiceItem[]>(invoice.items.map((i) => ({ ...i })));
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(invoice.paymentMethod);

    const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i !== idx) return item;
                const updated = { ...item, [field]: value };
                if (field === "quantity") {
                    updated.total = Number(updated.quantity) * Number(updated.unitPrice);
                }
                return updated;
            })
        );
    };

    const total = items.reduce((s, i) => s + i.total, 0);

    const handleSave = () => {
        onSave({
            ...invoice,
            items,
            paymentMethod,
            total,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-in"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "slideUp 0.3s ease-out" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-purple-50 to-white">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Pencil size={18} className="text-purple-600" />
                        تعديل الفاتورة {invoice.id}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Payment Method */}
                    <div>
                        <label className="block text-slate-600 text-sm font-medium mb-2">طريقة الدفع</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                        >
                            <option value="كاش">كاش</option>
                            <option value="فيزا">فيزا</option>
                            <option value="فودافون كاش">فودافون كاش</option>
                            <option value="إنستاباي">إنستاباي</option>
                        </select>
                    </div>

                    {/* Items Table */}
                    <div>
                        <label className="block text-slate-600 text-sm font-medium mb-2">الأصناف</label>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500">الصنف</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-24">الكمية</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-28">السعر</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-28">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm text-slate-700">{item.productName}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center text-sm text-slate-700">
                                                ج.م {item.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-800 text-center">
                                                ج.م {item.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between bg-gradient-to-l from-purple-50 to-slate-50 rounded-xl px-5 py-3 border border-purple-100">
                        <span className="text-sm font-bold text-slate-700">الإجمالي الكلي</span>
                        <span className="text-lg font-extrabold text-purple-700">ج.م {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Check size={16} />
                        حفظ التعديلات
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirmation ────────────────────────────────────────────────
function DeleteConfirmModal({
    invoice,
    onClose,
    onConfirm,
}: {
    invoice: Invoice;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "slideUp 0.3s ease-out" }}
            >
                <div className="p-6 text-center space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">حذف الفاتورة</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        هل أنت متأكد من حذف الفاتورة <span className="font-bold text-slate-700">{invoice.id}</span>؟
                        <br />
                        بقيمة <span className="font-bold text-red-600">ج.م {invoice.total.toFixed(2)}</span>
                        <br />
                        هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                </div>
                <div className="flex border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-l border-slate-100"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        نعم، احذف
                    </button>
                </div>
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
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";

    const myInvoices = invoices.filter((i) => i.vanId === assignedVanId);

    // Get available years from data
    const availableYears = useMemo(() => {
        const years = new Set(myInvoices.map((i) => new Date(i.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [myInvoices]);

    // ─── Date Filtering ─────────────────────────────────────────────
    const dateFilteredInvoices = useMemo(() => {
        return myInvoices.filter((invoice) => {
            const d = new Date(invoice.date);
            if (filterMode === "day" && selectedDay) {
                const [y, m, dd] = selectedDay.split("-").map(Number);
                return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === dd;
            }
            if (filterMode === "month" && selectedMonth && selectedYear) {
                return d.getFullYear() === Number(selectedYear) && d.getMonth() === Number(selectedMonth);
            }
            if (filterMode === "year" && selectedYear) {
                return d.getFullYear() === Number(selectedYear);
            }
            return true; // "all"
        });
    }, [myInvoices, filterMode, selectedDay, selectedMonth, selectedYear]);

    // ─── Search Filtering ───────────────────────────────────────────
    const filteredInvoices = useMemo(() => {
        if (!searchTerm) return dateFilteredInvoices;
        const term = searchTerm.toLowerCase();
        return dateFilteredInvoices.filter(
            (inv) =>
                inv.id.toLowerCase().includes(term) ||
                inv.paymentMethod.toLowerCase().includes(term) ||
                inv.items.some((item) => item.productName.toLowerCase().includes(term))
        );
    }, [dateFilteredInvoices, searchTerm]);

    // ─── Summary Stats ─────────────────────────────────────────────
    const totalSales = filteredInvoices.reduce((s, i) => s + i.total, 0);
    const totalInvoiceCount = filteredInvoices.length;
    const totalItems = filteredInvoices.reduce((s, i) => s + i.items.reduce((ss, it) => ss + it.quantity, 0), 0);

    // ─── Filter Label ───────────────────────────────────────────────
    const filterLabel = useMemo(() => {
        if (filterMode === "day" && selectedDay) {
            return new Date(selectedDay).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
        if (filterMode === "month" && selectedMonth && selectedYear) {
            return `${MONTHS_AR[Number(selectedMonth)]} ${selectedYear}`;
        }
        if (filterMode === "year" && selectedYear) {
            return `سنة ${selectedYear}`;
        }
        return "الإجمالي الكلي";
    }, [filterMode, selectedDay, selectedMonth, selectedYear]);

    // ─── Handlers ───────────────────────────────────────────────────
    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
    };

    const handleSaveEdit = (updated: Invoice) => {
        const idx = invoices.findIndex((i) => i.id === updated.id);
        if (idx !== -1) {
            invoices[idx] = updated;
        }
        setEditingInvoice(null);
        setMessage({ type: "success", text: `تم تعديل الفاتورة ${updated.id} بنجاح.` });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = (invoice: Invoice) => {
        setDeletingInvoice(invoice);
    };

    const handleConfirmDelete = () => {
        if (!deletingInvoice) return;
        const idx = invoices.findIndex((i) => i.id === deletingInvoice.id);
        if (idx !== -1) {
            invoices.splice(idx, 1);
        }
        setMessage({ type: "success", text: `تم حذف الفاتورة ${deletingInvoice.id}.` });
        setDeletingInvoice(null);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleResetFilter = () => {
        setFilterMode("all");
        setSelectedDay("");
        setSelectedMonth("");
        setSelectedYear("");
    };

    const handleSetToday = () => {
        setFilterMode("day");
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        setSelectedDay(`${y}-${m}-${d}`);
    };

    const handleSetThisMonth = () => {
        setFilterMode("month");
        const today = new Date();
        setSelectedYear(String(today.getFullYear()));
        setSelectedMonth(String(today.getMonth()));
    };

    const handleSetThisYear = () => {
        setFilterMode("year");
        setSelectedYear(String(new Date().getFullYear()));
    };

    return (
        <div className="space-y-5">
            {/* CSS for animation */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${
                        message.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                    {message.type === "success" ? (
                        <Check size={20} className="mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                </div>
            )}

            {/* ─── Header ─────────────────────────────────────────── */}
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
                        className="w-full md:w-80 bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                    />
                </div>
            </div>

            {/* ─── Filter Bar ─────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Filter size={16} className="text-purple-500" />
                    فلترة حسب التاريخ
                </div>

                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleResetFilter}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            filterMode === "all"
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={handleSetToday}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            filterMode === "day"
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            يوم
                        </span>
                    </button>
                    <button
                        onClick={handleSetThisMonth}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            filterMode === "month"
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                    >
                        شهر
                    </button>
                    <button
                        onClick={handleSetThisYear}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            filterMode === "year"
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                    >
                        سنة
                    </button>
                </div>

                {/* Date Pickers */}
                {filterMode === "day" && (
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-500">اختر اليوم:</label>
                        <input
                            type="date"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                        />
                    </div>
                )}

                {filterMode === "month" && (
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-xs text-slate-500">اختر الشهر:</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                        >
                            {MONTHS_AR.map((m, idx) => (
                                <option key={idx} value={idx}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {filterMode === "year" && (
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-500">اختر السنة:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* ─── Summary Cards ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-purple-200 text-xs font-medium">{filterLabel}</span>
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight">ج.م {totalSales.toFixed(2)}</div>
                    <div className="text-purple-200 text-xs mt-1">إجمالي المبيعات</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-200 text-xs font-medium">{filterLabel}</span>
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight">{totalInvoiceCount}</div>
                    <div className="text-blue-200 text-xs mt-1">عدد الفواتير</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-emerald-200 text-xs font-medium">{filterLabel}</span>
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight">{totalItems}</div>
                    <div className="text-emerald-200 text-xs mt-1">إجمالي القطع المباعة</div>
                </div>
            </div>

            {/* ─── Invoices Table ──────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500">رقم الفاتورة</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500">تفاصيل الأصناف</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500">طريقة الدفع</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500">الإجمالي</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
                                                {invoice.id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-slate-700 font-medium">
                                                    {new Date(invoice.date).toLocaleDateString("ar-EG", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(invoice.date).toLocaleTimeString("ar-EG", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1">
                                                {invoice.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="text-xs text-slate-700">
                                                        {item.quantity}x {item.productName}
                                                    </span>
                                                ))}
                                                {invoice.items.length > 2 && (
                                                    <span className="text-xs text-slate-400">
                                                        +{invoice.items.length - 2} أصناف أخرى
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                                                    PAYMENT_BADGE_COLORS[invoice.paymentMethod] || "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}
                                            >
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-800">
                                            ج.م {invoice.total.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => printInvoice(invoice)}
                                                    title="طباعة"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-60 group-hover:opacity-100"
                                                >
                                                    <Printer size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    title="تعديل"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all opacity-60 group-hover:opacity-100"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice)}
                                                    title="حذف"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-60 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <FileText size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 text-sm">لا توجد فواتير بيع تطابق بحثك أو الفلتر المحدد.</p>
                                            {filterMode !== "all" && (
                                                <button
                                                    onClick={handleResetFilter}
                                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    إزالة الفلتر وعرض الكل
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {/* Summary Footer */}
                        {filteredInvoices.length > 0 && (
                            <tfoot>
                                <tr className="bg-gradient-to-l from-purple-50 to-slate-50 border-t border-slate-200">
                                    <td colSpan={4} className="px-5 py-4 text-sm font-bold text-slate-700">
                                        إجمالي {filterLabel} ({totalInvoiceCount} فاتورة)
                                    </td>
                                    <td className="px-5 py-4 text-base font-extrabold text-purple-700">
                                        ج.م {totalSales.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ─── Modals ─────────────────────────────────────────── */}
            {editingInvoice && (
                <EditInvoiceModal
                    invoice={editingInvoice}
                    onClose={() => setEditingInvoice(null)}
                    onSave={handleSaveEdit}
                />
            )}
            {deletingInvoice && (
                <DeleteConfirmModal
                    invoice={deletingInvoice}
                    onClose={() => setDeletingInvoice(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
}
