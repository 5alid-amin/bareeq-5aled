import React, { useState } from "react";
import { Search, Filter, ArrowLeftRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Archive, AlertTriangle, Calendar, ChevronDown, RefreshCw } from "lucide-react";
import { stockMovements, StockMovementType } from "../../data/mockData";

type MovementFilterGroup = "الكل" | "وارد" | "منصرف" | StockMovementType;

export function StockMovementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<MovementFilterGroup>("الكل");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredMovements = stockMovements.filter((mov) => {
    const matchesSearch = 
        mov.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mov.referenceId && mov.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mov.vanName && mov.vanName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesType = true;
    if (filterType === "وارد") {
        matchesType = mov.type === "تزويد" || mov.type === "مرتجع";
    } else if (filterType === "منصرف") {
        matchesType = mov.type === "صرف لسيارة" || mov.type === "هالك";
    } else if (filterType !== "الكل") {
        matchesType = mov.type === filterType;
    }

    let matchesDateRange = true;
    const movDate = mov.date.split("T")[0];
    if (dateFrom && movDate < dateFrom) matchesDateRange = false;
    if (dateTo && movDate > dateTo) matchesDateRange = false;

    return matchesSearch && matchesType && matchesDateRange;
  });

  const getMovementIcon = (type: StockMovementType) => {
    switch (type) {
      case "تزويد": return <ArrowUpRight size={16} />;
      case "صرف لسيارة": return <ArrowDownRight size={16} />;
      case "مرتجع": return <Archive size={16} />;
      case "هالك": return <AlertTriangle size={16} />;
    }
  };

  const getMovementColor = (type: StockMovementType) => {
    switch (type) {
      case "تزويد": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "صرف لسيارة": return "text-blue-600 bg-blue-50 border-blue-100";
      case "مرتجع": return "text-amber-600 bg-amber-50 border-amber-100";
      case "هالك": return "text-rose-600 bg-rose-50 border-rose-100";
    }
  };

  // Stats
  const totalCount = stockMovements.length;
  const inCount = stockMovements.filter(m => m.type === "تزويد" || m.type === "مرتجع").length;
  const outCount = stockMovements.filter(m => m.type === "صرف لسيارة" || m.type === "هالك").length;

  const hasActiveFilters = filterType !== "الكل" || dateFrom || dateTo || searchTerm;

  const clearFilters = () => {
      setFilterType("الكل");
      setDateFrom("");
      setDateTo("");
      setSearchTerm("");
  };

  return (
    <div className="space-y-6 pb-10">
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
        {hasActiveFilters && (
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
             <input 
                type="date" 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)} 
                className="bg-transparent text-sm text-slate-700 outline-none w-[115px]" 
                dir="rtl"
             />
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
             <span className="text-xs font-medium text-slate-500 w-6">إلى</span>
             <input 
                type="date" 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)} 
                className="bg-transparent text-sm text-slate-700 outline-none w-[115px]" 
                dir="rtl"
             />
           </div>

           <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

           <div className="relative">
              <select
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value as MovementFilterGroup)}
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
          <table className="w-full text-right">
             <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[10%]">رقم الحركة</th>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[12%]">التاريخ</th>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[12%]">النوع</th>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[20%]">المنتج</th>
                 <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 w-[10%]">الكمية</th>
                 <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 w-[10%]">تغير الرصيد</th>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[14%]">المرجع / السيارة</th>
                 <th className="px-5 py-4 text-xs font-semibold text-slate-500">ملاحظات</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredMovements.length === 0 ? (
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
                    filteredMovements.map((mov) => {
                        const isPositive = mov.type === "تزويد" || mov.type === "مرتجع";
                        
                        return (
                            <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-5 py-4 align-top">
                                    <div className="font-bold text-slate-700 text-sm">{mov.id}</div>
                                </td>
                                <td className="px-5 py-4 align-top">
                                    <div className="text-sm text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(mov.date).toLocaleDateString('ar-EG')}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1.5 mr-5 whitespace-nowrap" dir="ltr">
                                        {new Date(mov.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-top">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getMovementColor(mov.type)}`}>
                                        {getMovementIcon(mov.type)}
                                        {mov.type}
                                    </span>
                                </td>
                                <td className="px-5 py-4 align-top">
                                    <div className="font-semibold text-slate-700 text-sm line-clamp-2" title={mov.productName}>{mov.productName}</div>
                                    <div className="text-xs text-slate-500 mt-1.5 font-mono">{mov.productId}</div>
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
                                <td className="px-5 py-4 align-top">
                                    {mov.referenceId && (
                                        <div className="text-xs font-semibold text-slate-600 bg-slate-100 inline-block px-2 py-1 rounded mb-2 w-full text-center">
                                            مرجع: {mov.referenceId}
                                        </div>
                                    )}
                                    {mov.vanName && (
                                        <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded line-clamp-1 border border-blue-100 text-center" title={mov.vanName}>
                                            {mov.vanName}
                                        </div>
                                    )}
                                    {!mov.referenceId && !mov.vanName && (
                                        <span className="text-slate-400 text-xs text-center block">-</span>
                                    )}
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
        </div>
      </div>
    </div>
  );
}
