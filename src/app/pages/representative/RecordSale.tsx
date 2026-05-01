import React, { useState, useEffect } from "react";
import { Check, AlertCircle, ShoppingCart, Loader2, Plus, Trash2, Upload, CreditCard, Banknote, Smartphone, X, Printer } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// ─── Interfaces ───
interface VehicleInventoryDto {
    productId: number;
    productName: string;
    currentQuantity: number;
    unitPrice: number;
}

interface CartItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    available: number;
}

const BASE_URL = "https://localhost:7280/api/SalesRecord";

// ─── Print Invoice Helper ────────────────────────────────────────────────
function printInvoice(invoice: any) {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const itemsRows = invoice.items
        .map((item: any) => `
        <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;">${item.productName}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">${item.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">ج.م ${item.unitPrice.toFixed(2)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:700;text-align:center">ج.م ${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>`).join("");

    printWindow.document.write(`<html><body dir="rtl" style="font-family:sans-serif; padding:20px;">
        <h2>فاتورة بيع رقم: ${invoice.id}</h2>
        <p>التاريخ: ${new Date().toLocaleString("ar-EG")}</p>
        <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background:#f8fafc;"><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
            <tbody>${itemsRows}</tbody>
        </table>
        <h3 style="text-align:left">الإجمالي الكلي: ج.م ${invoice.total.toFixed(2)}</h3>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
}

export function RecordSale() {
    const { user } = useAuth();
    // تحويل الـ AssignedVanId لرقم عشان يتوافق مع الـ Backend (int vehicleId)
    const vehicleId = user?.assignedVanId ? parseInt(user.assignedVanId.replace(/\D/g, "")) : 1;

    const [inventory, setInventory] = useState<VehicleInventoryDto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentMethod, setPaymentMethod] = useState("كاش");
    const [loading, setLoading] = useState(false);
    const [fetchingStock, setFetchingStock] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [lastInvoiceData, setLastInvoiceData] = useState<any>(null);

    // 1. جلب المخزون من السيرفر عند تحميل الصفحة
    useEffect(() => {
        fetchInventory();
    }, [vehicleId]);

    const fetchInventory = async () => {
        try {
            setFetchingStock(true);
            const response = await axios.get(`${BASE_URL}/inventory/${vehicleId}`);
            setInventory(response.data);
        } catch (error) {
            setMessage({ type: "error", text: "فشل في جلب بيانات المخزون من السيرفر." });
        } finally {
            setFetchingStock(false);
        }
    };

    const getCartQuantity = (productId: number) =>
        cart.find(c => c.productId === productId)?.quantity || 0;

    const availableForProduct = (productId: number) => {
        const item = inventory.find(i => i.productId === productId);
        return item ? item.currentQuantity - getCartQuantity(productId) : 0;
    };

    const handleAddToCart = () => {
        const product = inventory.find(i => i.productId === Number(selectedProduct));
        if (!product) return;

        const avail = availableForProduct(product.productId);
        if (quantity > avail) {
            setMessage({ type: "error", text: `الكمية المتاحة فقط هي ${avail}` });
            return;
        }

        const existing = cart.find(c => c.productId === product.productId);
        if (existing) {
            setCart(cart.map(c => c.productId === product.productId ? { ...c, quantity: c.quantity + quantity } : c));
        } else {
            setCart([...cart, {
                productId: product.productId,
                productName: product.productName,
                quantity,
                unitPrice: product.unitPrice,
                available: product.currentQuantity
            }]);
        }
        setSelectedProduct("");
        setQuantity(1);
        setMessage(null);
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // 2. إرسال الفاتورة للـ Backend
    const handleSubmit = async () => {
        if (cart.length === 0) return;

        // تحويل النص إلى أرقام (كاش=1، فيزا=2، محفظة=3)
        const paymentMap: { [key: string]: number } = { "كاش": 1, "فيزا": 2, "محفظة": 3 };

        setLoading(true);
        try {
            const invoiceDto = {
                vehicleId: vehicleId,
                paymentMethod: paymentMap[paymentMethod], // إرسال الرقم بدلاً من النص
                items: cart.map(c => ({
                    productId: c.productId,
                    quantity: c.quantity
                }))
            };

            const response = await axios.post(`${BASE_URL}/create`, invoiceDto);

            // لو النجاح تم
            setLastInvoiceData({ id: response.data.invoiceId, items: cart, total: cartTotal });
            setMessage({ type: "success", text: "تم تسجيل الفاتورة وتحديث المخزون بنجاح!" });
            setCart([]);
            fetchInventory(); // تحديث المخزون في الـ UI بعد البيع
        } catch (error: any) {
            const errorMsg = error.response?.data || "حدث خطأ أثناء حفظ الفاتورة.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <ShoppingCart size={24} className="text-emerald-600" />
                تسجيل فاتورة بيع - مركبة #{vehicleId}
            </h2>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {message.type === "success" ? <Check size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                    <div className="flex-1 flex items-center justify-between">
                        <p className="text-sm font-medium">{message.text}</p>
                        {message.type === "success" && lastInvoiceData && (
                            <button onClick={() => printInvoice(lastInvoiceData)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium mr-3">
                                <Printer size={14} /> طباعة
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Add Item Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                {fetchingStock ? (
                    <div className="flex items-center justify-center py-4 text-slate-500 gap-2">
                        <Loader2 className="animate-spin" size={20} /> جاري جلب المخزون...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-6">
                            <label className="block text-slate-500 text-xs mb-1.5">اختر الصنف من العربة</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5"
                            >
                                <option value="">-- اختر صنف --</option>
                                {inventory.map(item => (
                                    <option key={item.productId} value={item.productId} disabled={availableForProduct(item.productId) <= 0}>
                                        {item.productName} (متاح: {availableForProduct(item.productId)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-slate-500 text-xs mb-1.5">الكمية</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full border border-slate-200 text-sm rounded-xl px-4 py-2.5"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <button onClick={handleAddToCart} disabled={!selectedProduct} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50">
                                <Plus size={16} /> أضف
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Table */}
            {cart.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-xs text-slate-500">الصنف</th>
                                <th className="px-5 py-3 text-xs text-slate-500 text-center">الكمية</th>
                                <th className="px-5 py-3 text-xs text-slate-500 text-center">سعر الوحدة</th>
                                <th className="px-5 py-3 text-xs text-slate-500 text-center">الإجمالي</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cart.map((item) => (
                                <tr key={item.productId}>
                                    <td className="px-5 py-3 text-sm text-slate-700">{item.productName}</td>
                                    <td className="px-5 py-3 text-center text-sm">{item.quantity}</td>
                                    <td className="px-5 py-3 text-center text-sm">ج.م {item.unitPrice.toFixed(2)}</td>
                                    <td className="px-5 py-3 text-center text-sm font-bold">ج.م {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-left">
                                        <button onClick={() => setCart(cart.filter(c => c.productId !== item.productId))} className="text-red-400 p-1">
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payment & Submit */}
            {cart.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                    <div className="flex gap-2">
                        {["كاش", "فيزا", "محفظة"].map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === method ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100" : "border-slate-200 text-slate-600"}`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    <div className="border-t pt-4 flex items-center justify-between">
                        <div>
                            <span className="text-sm text-slate-500">الإجمالي الكلي:</span>
                            <div className="text-2xl font-bold text-emerald-700">ج.م {cartTotal.toFixed(2)}</div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-100"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            تأكيد وبيع
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}