import React from "react";
import { Package, Truck, DollarSign, Activity, ShoppingCart, List, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { KPICard } from "../../components/KPICard";
import { vans, vanInventory, invoices } from "../../data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
    onNavigate: (page: string) => void;
}

export function RepresentativeDashboard({ onNavigate }: Props) {
    const { user } = useAuth();

    // Get rep's van data
    const assignedVanId = user?.assignedVanId || "VAN-001";
    const myVan = vans.find((v) => v.id === assignedVanId);
    const myInventory = vanInventory[assignedVanId] || [];

    // Calculate KPIs
    const totalItemsInVan = myInventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = myInventory.filter((item) => item.quantity <= item.minQuantity);
    const myInvoices = invoices.filter((inv) => inv.vanId === assignedVanId);

    // Calculate today's sales for this van (based on mock sales data or van.totalSalesToday)
    const todaySalesValue = myVan ? myVan.totalSalesToday : 0;

    // Chart data (mocking the last 7 days for this van)
    const myChartData = [
        { label: "السبت", sales: 1200 },
        { label: "الأحد", sales: 2100 },
        { label: "الاثنين", sales: 1800 },
        { label: "الثلاثاء", sales: 2400 },
        { label: "الأربعاء", sales: 1600 },
        { label: "الخميس", sales: 2900 },
        { label: "اليوم", sales: todaySalesValue },
    ];

    if (!myVan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Truck size={48} className="mb-4 text-slate-300" />
                <h2 className="text-xl font-medium text-slate-700">لم يتم تعيين مركبة</h2>
                <p className="mt-2 text-sm">يرجى التواصل مع الإدارة لتعيين مركبة لك.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Low Stock Alert Banner */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="text-amber-800 font-medium text-sm">تنبيه: مخزون منخفض</h4>
                            <p className="text-amber-600 text-xs mt-0.5">لديك {lowStockItems.length} أصناف أوشكت على النفاذ في المركبة.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate("rep-restock")}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                        <RefreshCw size={14} />
                        طلب تعبئة الآن
                    </button>
                </div>
            )}

            {/* Top section: Welcome & Vehicle Info */}
            <div className="bg-gradient-to-l from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">مرحباً، {user?.name}</h2>
                        <p className="text-cyan-100/80 text-sm flex items-center gap-2">
                            <Truck size={16} />
                            مركبة التوزيع: {myVan.id} — لوحة: {myVan.plate}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onNavigate("rep-sale")}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            تسجيل فاتورة بيع
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="مبيعات اليوم"
                    value={`ج.م ${todaySalesValue.toLocaleString()}`}
                    icon={<DollarSign size={20} />}
                    trend={{ value: "12%", positive: true }}
                    color="green"
                />
                <KPICard
                    title="إجمالي القطع بالمركبة"
                    value={totalItemsInVan.toLocaleString()}
                    icon={<Package size={20} />}
                    color="blue"
                />
                <KPICard
                    title="عهدتي (نقود)"
                    value={`ج.م ${myVan.openingBalance.toLocaleString()}`}
                    icon={<DollarSign size={20} />}
                    color="orange"
                />
                <KPICard
                    title="عمليات البيع اليوم"
                    value={myInvoices.length.toString()}
                    icon={<Activity size={20} />}
                    color="purple"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-800 font-medium">مبيعاتي آخر 7 أيام</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={myChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                    formatter={(value: number) => [`${value} ج.م`, "المبيعات"]}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Shortcuts */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-slate-800 font-medium mb-6">إجراءات سريعة</h3>
                    <div className="space-y-3">
                        <button onClick={() => onNavigate("rep-inventory")} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Package size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-700 font-medium text-sm">مخزون المركبة</p>
                                    <p className="text-slate-400 text-xs mt-0.5">استعراض الأصناف المحملة</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => onNavigate("rep-sale")} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <ShoppingCart size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-700 font-medium text-sm">فاتورة بيع</p>
                                    <p className="text-slate-400 text-xs mt-0.5">تسجيل عملية بيع جديدة</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => onNavigate("rep-history")} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <List size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-700 font-medium text-sm">سجل المبيعات</p>
                                    <p className="text-slate-400 text-xs mt-0.5">مراجعة الفواتير السابقة</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => onNavigate("rep-restock")} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <RefreshCw size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-700 font-medium text-sm">طلبات إعادة التعبئة</p>
                                    <p className="text-slate-400 text-xs mt-0.5">طلب بضاعة من المخزن الرئيسي</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
