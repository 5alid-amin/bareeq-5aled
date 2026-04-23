import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, TrendingUp, TrendingDown, DollarSign, PieChart, Car, ArrowUpRight, Crown, Wallet, Timer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { KPICard } from "../../components/KPICard";

export function GeneralLedgerPage() {
  // حالة الفلتر الحالي
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // الحالات لتخزين بيانات الـ API (مع قيم افتراضية عشان الكود ما يضربش)
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
  const [expenseData, setExpenseData] = useState<{ total: number; details: Array<{ name: string; value: number }>; percentages: number[] }>({ total: 0, details: [], percentages: [] });
  const [topVehicle, setTopVehicle] = useState({ vehicleName: "---", totalRevenue: 0 });
  const [loading, setLoading] = useState(false);

  // ميثود جلب البيانات من الـ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const params: { day?: number; month?: number; year?: number } = {};
      
      // تجهيز البارامترز حسب اختيارك
      if (filter === 'day') params.day = now.getDate();
      if (filter === 'month') params.month = now.getMonth() + 1;
      if (filter === 'year') params.year = now.getFullYear();
      // ملاحظة: الأسبوع محتاج لوجيك إضافي بس هنبعت السنة كديفولت حالياً
      if (filter === 'week') params.year = now.getFullYear(); 

      const [resSummary, resAnalytics, resVehicle] = await Promise.all([
        axios.get("https://localhost:7280/api/Dashboard/summary", { params }),
        axios.get("https://localhost:7280/api/Dashboard/expenses-analytics", { params }),
        axios.get("https://localhost:7280/api/Dashboard/top-performing-vehicle", { params })
      ]);

      //       const [resSummary, resAnalytics, resVehicle] = await Promise.all([
      //   axios.get("${import.meta.env.VITE_API_URL}/Dashboard/summary", { params }),
      //   axios.get("${import.meta.env.VITE_API_URL}/Dashboard/expenses-analytics", { params }),
      //   axios.get("${import.meta.env.VITE_API_URL}/Dashboard/top-performing-vehicle", { params })
      // ]);

      setSummary(resSummary.data);
      setExpenseData(resAnalytics.data);
      setTopVehicle(resVehicle.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];
  // تأكد إن فيه قيمة عشان ما يحصلش Divide by zero
  const totalExp = expenseData.total || 0;

  return (
    <div className="space-y-8 pb-10 select-none" dir="rtl">
      {/* Header - Glassmorphism Effect */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">دفتر الأستاذ</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500'} animate-pulse`}></span>
              <p className="text-sm font-medium text-slate-500">متابعة الأداء المالي المباشر</p>
            </div>
          </div>
        </div>

        {/* أزرار الفلترة التفاعلية */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
          {[
            { id: 'day', label: 'يوم' },
            { id: 'week', label: 'أسبوع' },
            { id: 'month', label: 'شهر' },
            { id: 'year', label: 'سنة' }
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                filter === btn.id 
                  ? 'bg-white text-indigo-600 shadow-sm scale-105' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPIs - Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="إجمالي الإيرادات" value={`${(summary.totalRevenue || 0).toLocaleString()} ج.م`} icon={<TrendingUp size={24} />} color="green" />
        <KPICard title="إجمالي المصروفات" value={`${(summary.totalExpenses || 0).toLocaleString()} ج.م`} icon={<TrendingDown size={24} />} color="red" />
        <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <KPICard title="صافي الربح" value={`${(summary.netProfit || 0).toLocaleString()} ج.م`} icon={<DollarSign size={24} />} color="blue" />
        </div>
      </div>

      {/* The "Power Three" Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Donut Chart */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center group relative">
          <h3 className="w-full text-right font-black text-slate-800 text-lg mb-2">توزيع المصروفات</h3>
          
          <div className="relative w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={expenseData.details || []} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value" stroke="none">
                  {(expenseData.details || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">إجمالي</span>
              <span className="text-2xl font-black text-slate-800">{(totalExp).toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full space-y-3 mt-4">
            {(expenseData.details || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-black text-slate-400">{totalExp > 0 ? ((item.value/totalExp)*100).toFixed(0) : 0}%</span>
                   <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: COLORS[i % COLORS.length], width: `${totalExp > 0 ? (item.value/totalExp)*100 : 0}%` }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Expenses - "The Dark Mode List" */}
        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl shadow-indigo-900/20 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white">الأكثر إنفاقاً</h3>
              <Wallet className="text-indigo-400" size={24} />
            </div>
            
            <div className="space-y-6 relative z-10">
              {(expenseData.details || []).slice(0, 3).map((item, i) => (
                <div key={i} className="relative group/line">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-400 text-sm font-medium">{item.name}</span>
                    <span className="text-white font-black text-lg">{(item.value || 0).toLocaleString()} <small className="text-[10px] text-slate-500 font-normal">ج.م</small></span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalExp > 0 ? (item.value/totalExp)*100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
             <Timer size={18} className="text-indigo-400" />
             <p className="text-xs text-slate-400 font-medium italic">يتم التحديث بناءً على فلتر: {filter === 'day' ? 'اليوم' : filter === 'week' ? 'الأسبوع' : filter === 'month' ? 'الشهر' : 'السنة'}</p>
          </div>
        </div>

        {/* 3. Top Vehicle - "The Trophy Card" */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[3rem] p-8 text-white shadow-2xl shadow-emerald-200/50 flex flex-col justify-between relative overflow-hidden group">
          <Car className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Crown size={28} className="text-yellow-300 drop-shadow-md" />
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">الملك للفترة</span>
              </div>
            </div>
            
            <h4 className="text-sm font-bold text-emerald-100 mt-6 uppercase tracking-wider">المركبة الأعلى أداءً</h4>
            <h2 className="text-3xl font-black mt-1 leading-tight">{topVehicle.vehicleName || "---"}</h2>
          </div>

          <div className="relative z-10 mt-10">
            <div className="text-xs font-bold text-emerald-100/80 mb-1">إجمالي الإيرادات المحققة</div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tighter">{(topVehicle.totalRevenue || 0).toLocaleString()}</span>
              <span className="text-lg font-bold mb-1 opacity-80">ج.م</span>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-black/10 w-fit px-4 py-2 rounded-xl border border-white/10">
              <ArrowUpRight size={14} className="text-yellow-300" />
              <span>أداء متميز للفترة المختارة</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}