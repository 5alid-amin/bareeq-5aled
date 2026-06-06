import React, { useState, useEffect } from "react";
import { Package, Truck, DollarSign, Activity, ShoppingCart, List, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { KPICard } from "../../components/KPICard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

// بيانات وهمية "جميلة" للرسم البياني فقط
const dummyChartData = [
    { day: "السبت", amount: 1200 },
    { day: "الأحد", amount: 2100 },
    { day: "الاثنين", amount: 1800 },
    { day: "الثلاثاء", amount: 2400 },
    { day: "الأربعاء", amount: 1600 },
    { day: "الخميس", amount: 2900 },
    { day: "الجمعة", amount: 2200 },
];

interface DashboardData {
    representativeName: string;
    vehicleName: string;
    plateNumber: string;
    todaySales: number;
    todayInvoicesCount: number;
    totalItemsInVehicle: number;
    salesGrowthPercentage: number;
    // الـ salesChart موجود هنا بس مش هنستخدمه في الرسم عشان خاطر عيون الـ dummy data
}

export function RepresentativeDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const vehicleId = user?.vehicleId ?? 1; // مأخوذ من الـ JWT Token

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`https://pareeq.runasp.net/api/RepresentativeDashboard/${vehicleId}`);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [vehicleId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    // لو البيانات مجاتش، بنعرض واجهة فارغة بدل ما يضرب Error
    const displayData = data || {
        representativeName: "جاري التحميل...",
        vehicleName: "N/A",
        plateNumber: "N/A",
        todaySales: 0,
        todayInvoicesCount: 0,
        totalItemsInVehicle: 0,
        salesGrowthPercentage: 0
    };

    return (
        <div className="space-y-6">
            {/* Header: Welcome & Vehicle Info */}
            <div className="bg-gradient-to-l from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">مرحباً، {user?.name || displayData.representativeName}</h2>
                        <p className="text-cyan-100/80 text-sm flex items-center gap-2">
                            <Truck size={16} />
                            مركبة: {user?.vehicleName || displayData.vehicleName}
                            {displayData.plateNumber && ` — لوحة: ${displayData.plateNumber}`}
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate("rep-sale")}
                        className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2 w-fit"
                    >
                        <ShoppingCart size={16} />
                        تسجيل فاتورة بيع
                    </button>
                </div>
            </div>

            {/* KPIs - دي بيانات حقيقية من الباك اند */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                    title="مبيعات اليوم"
                    value={`ج.م ${displayData.todaySales.toLocaleString()}`}
                    icon={<DollarSign size={20} />}
                    trend={{
                        value: `${Math.abs(displayData.salesGrowthPercentage)}%`,
                        positive: displayData.salesGrowthPercentage >= 0
                    }}
                    color="green"
                />
                <KPICard
                    title="إجمالي القطع بالمركبة"
                    value={displayData.totalItemsInVehicle.toLocaleString()}
                    icon={<Package size={20} />}
                    color="blue"
                />
                <KPICard
                    title="عمليات البيع اليوم"
                    value={displayData.todayInvoicesCount.toString()}
                    icon={<Activity size={20} />}
                    color="purple"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart - هنا الرسم البياني الوهمي الجميل */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-slate-800 font-medium mb-6">إحصائيات المبيعات (أسبوعي)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dummyChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                    formatter={(value: number) => [`${value} ج.م`, "المبيعات"]}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-slate-800 font-medium mb-6">إجراءات سريعة</h3>
                    <div className="space-y-3">
                        <ActionBtn
                            icon={<Package size={20} />}
                            title="مخزون المركبة"
                            sub="الأصناف المحملة"
                            color="blue"
                            onClick={() => onNavigate("rep-inventory")}
                        />
                        <ActionBtn
                            icon={<ShoppingCart size={20} />}
                            title="فاتورة بيع"
                            sub="تسجيل عملية جديدة"
                            color="emerald"
                            onClick={() => onNavigate("rep-sale")}
                        />
                        <ActionBtn
                            icon={<List size={20} />}
                            title="سجل المبيعات"
                            sub="مراجعة الفواتير"
                            color="purple"
                            onClick={() => onNavigate("rep-history")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component صغير عشان الكود ميبقاش زحمة للأزرار
function ActionBtn({ icon, title, sub, color, onClick }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600",
        emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600",
        purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-600",
    };

    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group text-right">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:text-white transition-colors ${colors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-700 font-medium text-sm">{title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                </div>
            </div>
        </button>
    );
}