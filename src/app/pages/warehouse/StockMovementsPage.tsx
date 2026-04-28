import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowLeftRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Archive, AlertTriangle, Calendar, ChevronDown, RefreshCw, Loader2 } from "lucide-react";
import axios from "axios";

// التعريفات المطابقة لـ Response الـ API اللي في الصورة
interface InventoryMovement {
  transactionId: number;
  createdDate: string;
  transactionType: string;
  productName: string;
  productCode: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  notes: string;
}

type MovementFilterGroup = "الكل" | "وارد" | "منصرف" | string;

export function StockMovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<MovementFilterGroup>("الكل");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // الرابط من واقع صورة الـ Swagger
  const API_URL = "https://localhost:7280/api/InventoryTransactions/GetTransactionsHistory";

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          searchTerm: searchTerm || undefined,
          type: filterType === "الكل" ? undefined : filterType,
          fromDate: dateFrom || undefined,
          toDate: dateTo || undefined
        }
      });
      setMovements(response.data);
    } catch (error) {
      console.error("Error fetching data from Bareeq API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMovements();
    }, 400); 
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType, dateFrom, dateTo]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "تزويد": return <ArrowUpRight size={16} />;
      case "صرف لسيارة": return <ArrowDownRight size={16} />;
      case "مرتجع": return <Archive size={16} />;
      case "هالك": return <AlertTriangle size={16} />;
      default: return <ArrowLeftRight size={16} />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "تزويد": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "صرف لسيارة": return "text-blue-600 bg-blue-50 border-blue-100";
      case "مرتجع": return "text-amber-600 bg-amber-50 border-amber-100";
      case "هالك": return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  // Stats (Calculated from fetched data)
  const totalCount = movements.length;
  const inCount = movements.filter(m => m.transactionType === "تزويد" || m.transactionType === "مرتجع").length;
  const outCount = movements.filter(m => m.transactionType === "صرف لسيارة" || m.transactionType === "هالك").length;

  const clearFilters = () => {
    setFilterType("الكل");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="text-blue-600" />
            حركات المخزون 
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            سجل شامل لكل حركات (الوارد والمنصرف) على أرصدة المخزن المركزي
          </p>
        </div>
        {(filterType !== "الكل" || dateFrom || dateTo || searchTerm) && (
            <button 
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <RefreshCw size={16} />
                مسح الفلاتر
            </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setFilterType("الكل")}
          className={`bg-white rounded-2xl p-5 border text-right transition-all outline-none ${filterType === 'الكل' ? 'border-slate-800 ring-2 ring-slate-800 shadow-md transform -translate-y-1' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:-translate-y-0.5'} flex items-center justify-between`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${filterType === 'الكل' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ArrowLeftRight size={24} />
                </div>
                <div>
                    <p className={`text-xs font-semibold mb-1 transition-colors ${filterType === 'الكل' ? 'text-slate-600' : 'text-slate-500'}`}>إجمالي الحركات المسجلة</p>
                    <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
                </div>
            </div>
            {filterType === 'الكل' && <div className="w-3 h-3 rounded-full bg-slate-800"></div>}
        </button>

        <button 
          onClick={() => setFilterType("وارد")}
          className={`bg-white rounded-2xl p-5 border text-right transition-all outline-none ${filterType === 'وارد' ? 'border-emerald-600 ring-2 ring-emerald-600 shadow-md transform -translate-y-1' : 'border-slate-200 hover:border-emerald-300 shadow-sm hover:-translate-y-0.5'} flex items-center justify-between`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${filterType === 'وارد' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className={`text-xs font-semibold mb-1 transition-colors ${filterType === 'وارد' ? 'text-emerald-700' : 'text-slate-500'}`}>حركات واردة (تزويد/مرتجع)</p>
                    <h3 className="text-2xl font-bold text-emerald-700">{inCount}</h3>
                </div>
            </div>
            {filterType === 'وارد' && <div className="w-3 h-3 rounded-full bg-emerald-600"></div>}
        </button>

        <button 
          onClick={() => setFilterType("منصرف")}
          className={`bg-white rounded-2xl p-5 border text-right transition-all outline-none ${filterType === 'منصرف' ? 'border-rose-600 ring-2 ring-rose-600 shadow-md transform -translate-y-1' : 'border-slate-200 hover:border-rose-300 shadow-sm hover:-translate-y-0.5'} flex items-center justify-between`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${filterType === 'منصرف' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
                    <TrendingDown size={24} />
                </div>
                <div>
                    <p className={`text-xs font-semibold mb-1 transition-colors ${filterType === 'منصرف' ? 'text-rose-700' : 'text-slate-500'}`}>حركات منصرفة (صرف/هالك)</p>
                    <h3 className="text-2xl font-bold text-rose-700">{outCount}</h3>
                </div>
            </div>
            {filterType === 'منصرف' && <div className="w-3 h-3 rounded-full bg-rose-600"></div>}
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث برقم الحركة، المنتج، أو المرجع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
              <span className="text-xs font-medium text-slate-500 w-6">من</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-[115px]" dir="rtl"/>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
              <span className="text-xs font-medium text-slate-500 w-6">إلى</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-[115px]" dir="rtl"/>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="relative">
              <select
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
                 className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px] pl-4 transition-colors"
              >
                  <option value="الكل">كل الحركات</option>
                  <option disabled>──────────</option>
                  <option value="وارد">كل الحركات الواردة</option>
                  <option value="منصرف">كل الحركات المنصرفة</option>
                  <option disabled>──────────</option>
                  <option value="تزويد">وارد - تزويد مخزن</option>
                  <option value="مرتجع">وارد - مرتجع سيارة</option>
                  <option value="صرف لسيارة">منصرف - للسيارات</option>
                  <option value="هالك">منصرف - هالك/تالف</option>
              </select>
              <Filter size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 pointer-events-none" />
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
               <Loader2 className="animate-spin mb-4" size={40} />
               <p className="text-sm font-medium">جاري تحديث بيانات "بريق"...</p>
            </div>
          ) : (
            <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">رقم الحركة</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">النوع</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">المنتج</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500">الكمية</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500">تغير الرصيد</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">المرجع</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {movements.length === 0 ? (
                       <tr>
                           <td colSpan={8} className="px-6 py-20 text-center">
                               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
                                   <Search size={32} />
                               </div>
                               <h3 className="text-slate-800 text-lg font-bold mb-1">لا توجد حركات</h3>
                               <p className="text-slate-500 text-sm">راجع معايير البحث والفلترة المختارة</p>
                           </td>
                       </tr>
                   ) : (
                       movements.map((mov) => {
                           const isPositive = mov.transactionType === "تزويد" || mov.transactionType === "مرتجع";
                           return (
                               <tr key={mov.transactionId} className="hover:bg-slate-50/70 transition-colors">
                                   <td className="px-5 py-4 align-top font-bold text-slate-700 text-sm">MOV-{mov.transactionId}</td>
                                   <td className="px-5 py-4 align-top">
                                       <div className="text-sm text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                                           <Calendar size={14} className="text-slate-400" />
                                           {new Date(mov.createdDate).toLocaleDateString('ar-EG')}
                                       </div>
                                       <div className="text-[10px] text-slate-400 mt-1.5 mr-5" dir="ltr">
                                           {new Date(mov.createdDate).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                                       </div>
                                   </td>
                                   <td className="px-5 py-4 align-top">
                                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getMovementColor(mov.transactionType)}`}>
                                           {getMovementIcon(mov.transactionType)}
                                           {mov.transactionType}
                                       </span>
                                   </td>
                                   <td className="px-5 py-4 align-top">
                                       <div className="font-semibold text-slate-700 text-sm">{mov.productName}</div>
                                       <div className="text-xs text-slate-500 mt-1.5 font-mono">{mov.productCode}</div>
                                   </td>
                                   <td className="px-5 py-4 align-top text-center">
                                       <div className={`font-black text-lg ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">
                                           {isPositive ? '+' : '-'}{mov.quantity}
                                       </div>
                                   </td>
                                   <td className="px-5 py-4 align-top">
                                       <div className="flex flex-col items-center gap-1 pb-1 w-20 mx-auto">
                                           <span className="text-xs text-slate-400 line-through decoration-slate-300">{mov.balanceBefore}</span>
                                           <span className={`text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-full text-center border-b-2 ${isPositive ? 'border-emerald-500' : 'border-rose-500'}`}>
                                               {mov.balanceAfter}
                                           </span>
                                       </div>
                                   </td>
                                   <td className="px-5 py-4 align-top text-xs font-semibold text-slate-600">
                                       {mov.reference || "-"}
                                   </td>
                                   <td className="px-5 py-4 align-top">
                                       <p className="text-xs text-slate-500 leading-relaxed min-w-[120px]" title={mov.notes}>
                                           {mov.notes || "-"}
                                       </p>
                                   </td>
                               </tr>
                           );
                       })
                   )}
                </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}