import React, { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, RefreshCw, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// واجهة البيانات
interface VehicleStockResponse {
    productId: number;
    productName: string;
    currentQuantity: number;
    minThresholdVehicle: number;
    salePrice: number;
}

interface Props {
    onNavigate?: (page: string) => void;
}

export function VehicleInventory({ onNavigate }: Props) {
    const { user } = useAuth();
    const BASE_URL = "https://localhost:7280/api/CarInventory";
    const VEHICLE_ID = user?.vehicleId ?? 1; // مأخوذ من الـ JWT Token

    const [inventory, setInventory] = useState<VehicleStockResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // State للتحكم في النافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<VehicleStockResponse | null>(null);
    const [requestQuantity, setRequestQuantity] = useState<number>(50);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/inventory/${VEHICLE_ID}`);
            if (response.ok) {
                const data = await response.json();
                setInventory(data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [VEHICLE_ID]);

    // فتح النافذة وتحديد المنتج
    const openRefillModal = (product: VehicleStockResponse) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // إرسال الطلب النهائي للباك إند
    const handleConfirmRequest = async () => {
        if (!selectedProduct) return;

        try {
            const response = await fetch(`${BASE_URL}/refill-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.productId,
                    requestedQuantity: requestQuantity,
                    vehicleId: VEHICLE_ID
                })
            });

            if (response.ok) {
                alert(`تم إرسال طلب تعبئة لمنتج ${selectedProduct.productName} بكمية ${requestQuantity} بنجاح!`);
                setIsModalOpen(false);
            }
        } catch (error) {
            alert("حدث خطأ أثناء إرسال الطلب");
        }
    };

    const filteredInventory = inventory.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 relative">
            {/* Table Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Package size={24} className="text-blue-600" />
                    مخزون المركبة {user?.vehicleName ? `— ${user.vehicleName}` : `(#${VEHICLE_ID})`}
                </h2>
                <div className="relative">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث برقم أو اسم الصنف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">رقم الصنف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">اسم الصنف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">الكمية المتاحة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">سعر البيع</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">جاري التحميل...</td></tr>
                            ) : filteredInventory.map((item) => (
                                <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.productId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.productName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold px-2.5 py-1 rounded-md ${item.currentQuantity <= item.minThresholdVehicle ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"} border`}>
                                                    {item.currentQuantity}
                                                </span>
                                                {item.currentQuantity <= item.minThresholdVehicle && <AlertTriangle size={16} className="text-red-500" />}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mr-1">الحد الأدنى: {item.minThresholdVehicle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">ج.م {item.salePrice.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {item.currentQuantity <= item.minThresholdVehicle && (
                                            <button onClick={() => openRefillModal(item)} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                                <RefreshCw size={12} /> طلب تعبئة
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal النافذة الصغيرة */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">تحديد كمية التعبئة</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-xl">
                                <p className="text-xs text-blue-600 mb-1">المنتج المختار:</p>
                                <p className="text-sm font-bold text-blue-900">{selectedProduct?.productName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">الكمية المطلوبة</label>
                                <input
                                    type="number"
                                    value={requestQuantity}
                                    onChange={(e) => setRequestQuantity(parseInt(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="أدخل الكمية..."
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                            <button onClick={handleConfirmRequest} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">إرسال الطلب</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}