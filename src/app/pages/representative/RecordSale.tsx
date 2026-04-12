import React, { useState } from "react";
import { Check, AlertCircle, ShoppingCart, Loader2, Plus, Trash2, Upload, CreditCard, Banknote, Smartphone, X, Printer } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { vanInventory, invoices, PaymentMethod, InvoiceItem, Invoice } from "../../data/mockData";

interface CartItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    available: number;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "كاش", label: "كاش", icon: <Banknote size={18} />, color: "emerald" },
    { value: "فيزا", label: "فيزا", icon: <CreditCard size={18} />, color: "blue" },
    { value: "فودافون كاش", label: "فودافون كاش", icon: <Smartphone size={18} />, color: "red" },
    { value: "إنستاباي", label: "إنستاباي", icon: <Smartphone size={18} />, color: "purple" },
];

// ─── Print Invoice Helper ────────────────────────────────────────────────
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
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid #10b981; }
            .logo { font-size:28px; font-weight:800; color:#10b981; }
            .logo span { color:#0f172a; }
            .invoice-id { font-size:14px; color:#64748b; margin-top:4px; }
            .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
            .info-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; }
            .info-label { font-size:12px; color:#94a3b8; margin-bottom:4px; }
            .info-value { font-size:15px; font-weight:600; color:#1e293b; }
            table { width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:24px; }
            thead { background:linear-gradient(135deg, #10b981, #059669); }
            th { padding:12px 14px; font-size:13px; font-weight:600; color:#fff; text-align:right; }
            th:not(:first-child) { text-align:center; }
            .total-row { background:#f1f5f9; }
            .total-row td { padding:14px; font-size:16px; font-weight:800; color:#10b981; }
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

export function RecordSale() {
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";
    const myInventory = vanInventory[assignedVanId] || [];

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("كاش");
    const [transferImage, setTransferImage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

    const productItem = myInventory.find(i => i.productId === selectedProduct);

    // Calculate how much is already in cart for this product
    const getCartQuantity = (productId: string) =>
        cart.find(c => c.productId === productId)?.quantity || 0;

    const availableForProduct = (productId: string) => {
        const inv = myInventory.find(i => i.productId === productId);
        if (!inv) return 0;
        return inv.quantity - getCartQuantity(productId);
    };

    // --- Add to cart ---
    const handleAddToCart = () => {
        if (!productItem) {
            setMessage({ type: "error", text: "يرجى اختيار صنف." });
            return;
        }
        if (quantity <= 0) {
            setMessage({ type: "error", text: "الكمية يجب أن تكون أكبر من صفر." });
            return;
        }
        const avail = availableForProduct(productItem.productId);
        if (quantity > avail) {
            setMessage({ type: "error", text: `الكمية المتاحة فقط هي ${avail}` });
            return;
        }
        setMessage(null);

        const existing = cart.find(c => c.productId === productItem.productId);
        if (existing) {
            setCart(cart.map(c =>
                c.productId === productItem.productId
                    ? { ...c, quantity: c.quantity + quantity }
                    : c
            ));
        } else {
            setCart([...cart, {
                productId: productItem.productId,
                productName: productItem.productName,
                quantity,
                unitPrice: productItem.sellingPrice,
                available: productItem.quantity,
            }]);
        }
        setSelectedProduct("");
        setQuantity(1);
    };

    // --- Remove from cart ---
    const handleRemove = (productId: string) => {
        setCart(cart.filter(c => c.productId !== productId));
    };

    // --- Cart total ---
    const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // --- Image upload ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setTransferImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const needsTransferImage = paymentMethod === "فودافون كاش" || paymentMethod === "إنستاباي";

    // --- Submit invoice ---
    const handleSubmit = () => {
        if (cart.length === 0) {
            setMessage({ type: "error", text: "السلة فارغة." });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const invoiceItems: InvoiceItem[] = cart.map(c => ({
                productId: c.productId,
                productName: c.productName,
                quantity: c.quantity,
                unitPrice: c.unitPrice,
                total: c.quantity * c.unitPrice,
            }));

            const newInvoice = {
                id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
                date: new Date().toISOString(),
                vanId: assignedVanId,
                representativeId: user?.id || "USR-003",
                items: invoiceItems,
                paymentMethod,
                transferImage: needsTransferImage ? transferImage : undefined,
                total: cartTotal,
            };

            invoices.unshift(newInvoice);
            setLastInvoice(newInvoice);

            // Deduct inventory
            cart.forEach(c => {
                const inv = myInventory.find(i => i.productId === c.productId);
                if (inv) inv.quantity -= c.quantity;
            });

            setMessage({ type: "success", text: `تم تسجيل الفاتورة ${newInvoice.id} بنجاح.` });
            setCart([]);
            setPaymentMethod("كاش");
            setTransferImage("");
            setLoading(false);
            setTimeout(() => setMessage(null), 4000);
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <ShoppingCart size={24} className="text-emerald-600" />
                تسجيل فاتورة بيع جديدة
            </h2>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                    {message.type === "success" ? <Check size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                    <div className="flex-1 flex items-center justify-between">
                        <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                        {message.type === "success" && lastInvoice && (
                            <button
                                onClick={() => printInvoice(lastInvoice)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm mr-3"
                            >
                                <Printer size={14} />
                                طباعة الفاتورة
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Add Item Row */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-slate-700 font-medium text-sm mb-1">إضافة صنف للسلة</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-6">
                        <label className="block text-slate-500 text-xs mb-1.5">اختر الصنف</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                            <option value="" disabled>-- قائمة أصناف المركبة --</option>
                            {myInventory.map(item => {
                                const avail = availableForProduct(item.productId);
                                return (
                                    <option key={item.productId} value={item.productId} disabled={avail <= 0}>
                                        {item.productName} (متاح: {avail})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-slate-500 text-xs mb-1.5">الكمية</label>
                        <input
                            type="number"
                            min="1"
                            max={productItem ? availableForProduct(productItem.productId) : 1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!selectedProduct}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Plus size={16} />
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>

            {/* Cart Table */}
            {cart.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-slate-700 font-medium text-sm flex items-center gap-2">
                            <ShoppingCart size={16} className="text-blue-500" />
                            السلة ({cart.length} صنف)
                        </h3>
                        <button
                            onClick={() => setCart([])}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                            إفراغ السلة
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">الصنف</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">الكمية</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">سعر الوحدة</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">الإجمالي</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {cart.map((item) => (
                                    <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-700 font-medium">{item.productName}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-medium text-slate-700 px-2.5 py-1 rounded-md bg-slate-100">{item.quantity}</span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-600">ج.م {item.unitPrice.toFixed(2)}</td>
                                        <td className="px-5 py-3 text-sm font-bold text-slate-800">ج.م {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                        <td className="px-5 py-3">
                                            <button onClick={() => handleRemove(item.productId)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gradient-to-l from-emerald-50 to-slate-50 border-t border-slate-200">
                                    <td colSpan={3} className="px-5 py-3 text-sm font-bold text-slate-700">الإجمالي الكلي</td>
                                    <td className="px-5 py-3 text-base font-bold text-emerald-700">ج.م {cartTotal.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Method + Submit */}
            {cart.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                    {/* Payment Method */}
                    <div>
                        <h3 className="text-slate-700 font-medium text-sm mb-3">طريقة الدفع</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {PAYMENT_METHODS.map(pm => {
                                const isSelected = paymentMethod === pm.value;
                                const colorMap: Record<string, string> = {
                                    emerald: isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200" : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50",
                                    blue: isSelected ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50",
                                    red: isSelected ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200" : "border-slate-200 hover:border-red-300 hover:bg-red-50/50",
                                    purple: isSelected ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200" : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50",
                                };
                                return (
                                    <button
                                        key={pm.value}
                                        type="button"
                                        onClick={() => { setPaymentMethod(pm.value); if (pm.value !== "فودافون كاش" && pm.value !== "إنستاباي") setTransferImage(""); }}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${colorMap[pm.color]}`}
                                    >
                                        {pm.icon}
                                        {pm.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Transfer Image Upload */}
                    {needsTransferImage && (
                        <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
                            <label className="block text-slate-600 text-sm font-medium">صورة إيصال التحويل</label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                                    <Upload size={16} />
                                    اختر صورة
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                                {transferImage && (
                                    <div className="relative">
                                        <img src={transferImage} alt="إيصال" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                                        <button
                                            onClick={() => setTransferImage("")}
                                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                        <div className="text-slate-700">
                            <span className="text-sm">الإجمالي: </span>
                            <span className="text-xl font-bold text-emerald-700">ج.م {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setCart([]); setPaymentMethod("كاش"); setTransferImage(""); setMessage(null); }}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                تأكيد الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
