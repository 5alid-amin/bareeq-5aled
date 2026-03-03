import React, { useState } from "react";
import { Check, AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { vanInventory, sales } from "../../data/mockData";

export function RecordSale() {
    const { user } = useAuth();
    const assignedVanId = user?.assignedVanId || "VAN-001";
    const myInventory = vanInventory[assignedVanId] || [];

    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const productItem = myInventory.find(i => i.productId === selectedProduct);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productItem) {
            setMessage({ type: "error", text: "يرجى اختيار صنف." });
            return;
        }
        if (quantity <= 0) {
            setMessage({ type: "error", text: "الكمية يجب أن تكون أكبر من صفر." });
            return;
        }
        if (quantity > productItem.quantity) {
            setMessage({ type: "error", text: `الكمية المتاحة فقط هي ${productItem.quantity}` });
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // 1. Create a sale record
            const newSale = {
                id: `SAL-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
                date: new Date().toISOString(),
                vanId: assignedVanId,
                representativeId: user?.id || "USR-003",
                productId: productItem.productId,
                productName: productItem.productName,
                quantity: quantity,
                unitPrice: productItem.sellingPrice,
                total: quantity * productItem.sellingPrice,
            };

            // Update mock sales array
            sales.unshift(newSale); // add to beginning

            // 2. Reduce inventory in mock data
            productItem.quantity -= quantity;

            setMessage({ type: "success", text: "تم تسجيل الفاتورة بنجاح." });
            setQuantity(1);
            setSelectedProduct("");
            setLoading(false);

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8">
                <ShoppingCart size={24} className="text-emerald-600" />
                تسجيل فاتورة بيع جديدة
            </h2>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                    {message.type === "success" ? <Check size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-slate-700 text-sm font-medium mb-2">اختر الصنف</label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled>-- قائمة أصناف المركبة --</option>
                        {myInventory.map(item => (
                            <option key={item.productId} value={item.productId} disabled={item.quantity === 0}>
                                {item.productName} (متاح: {item.quantity})
                            </option>
                        ))}
                    </select>
                </div>

                {productItem && (
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                        <div>
                            <label className="block text-slate-500 text-xs mb-1">الكمية المطلوبة للبيع</label>
                            <input
                                type="number"
                                min="1"
                                max={productItem.quantity}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 text-slate-700 text-lg font-semibold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-xs mb-1">الإجمالي</label>
                            <div className="h-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 font-bold text-lg">
                                ج.م {(quantity * productItem.sellingPrice).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => { setSelectedProduct(""); setQuantity(1); setMessage(null); }}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedProduct || loading}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        تأكيد البيع
                    </button>
                </div>
            </form>
        </div>
    );
}
