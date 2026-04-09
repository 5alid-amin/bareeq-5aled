import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { DollarSign, FileText, Wallet, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { KPICard } from "../../components/KPICard";

interface SalaryRecord {
  id: number | string;
  name: string;
  position: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: string;
  period?: string;
  date?: string;
}

export function AccountantPayrollPage() {
  const [records, setRecords] = useState<SalaryRecord[]>([
    { id: 1, name: "أحمد محمد السيد", position: "محاسب", baseSalary: 8000, bonuses: 500, deductions: 0, netSalary: 8500, status: "مدفوع", period: "2026-04", date: "2026-04-01" },
    { id: 2, name: "محمد علي البحيري", position: "مندوب مبيعات", baseSalary: 6000, bonuses: 0, deductions: 200, netSalary: 5800, status: "معلق", period: "2026-04", date: "2026-04-02" }
  ]);
  
  const [activeTab, setActiveTab] = useState<"overview" | "deductions" | "bonuses">("overview");

  const defaultMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedPeriod, setSelectedPeriod] = useState(`2026-${defaultMonth}`);
  const [selectedYear, selectedMonth] = selectedPeriod.split("-");

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = Array.from({ length: 2030 - 2024 + 1 }, (_, index) => `${2024 + index}`);

  const filteredRecords = records.filter(record => !record.period || record.period === selectedPeriod);

  const totalPayroll = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalDeductions = filteredRecords.reduce((sum, r) => sum + r.deductions, 0);
  const totalBonuses = filteredRecords.reduce((sum, r) => sum + r.bonuses, 0);

  // عنوان الجدول الديناميكي (إجمالي الرواتب / المكافآت / الخصومات)
  const getActiveTabTitle = () => {
    if (activeTab === "overview") return "إجمالي الرواتب";
    if (activeTab === "bonuses") return "المكافآت";
    if (activeTab === "deductions") return "الخصومات";
    return "";
  };

  return (
    <div className="space-y-6 relative text-right" dir="rtl">
      {/* الهيدر */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">الرواتب والأجور</h2>
            <p className="text-sm text-slate-500">متابعة الرواتب والمكافآت والخصومات</p>
          </div>
        </div>

        {/* الفلترة */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          <Select value={selectedMonth} onValueChange={(month) => setSelectedPeriod(`${selectedYear}-${month}`)}>
            <SelectTrigger className="w-28 bg-slate-50 border-none rounded-xl focus:ring-0">
              <SelectValue placeholder="الشهر" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString().padStart(2, '0')}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={(year) => setSelectedPeriod(`${year}-${selectedMonth}`)}>
            <SelectTrigger className="w-24 bg-slate-50 border-none rounded-xl focus:ring-0">
              <SelectValue placeholder="السنة" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* الكروت العلوية مع Outline دائري */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab("overview")} 
          className={`cursor-pointer transition-all rounded-2xl ${activeTab === "overview" ? "ring-2 ring-purple-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard title="إجمالي الرواتب" value={`${totalPayroll.toLocaleString()} ج.م`} icon={<Wallet size={24} />} color="blue" />
        </div>
        
        <div 
          onClick={() => setActiveTab("bonuses")} 
          className={`cursor-pointer transition-all rounded-2xl ${activeTab === "bonuses" ? "ring-2 ring-emerald-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard title="إجمالي المكافآت" value={`${totalBonuses.toLocaleString()} ج.م`} icon={<DollarSign size={24} />} color="green" />
        </div>

        <div 
          onClick={() => setActiveTab("deductions")} 
          className={`cursor-pointer transition-all rounded-2xl ${activeTab === "deductions" ? "ring-2 ring-red-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard title="إجمالي الخصومات" value={`${totalDeductions.toLocaleString()} ج.م`} icon={<FileText size={24} />} color="red" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* الترويسة فوق الجدول - تم حذف التابات الثلاثة منها بناء على طلبك */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-slate-800 text-lg">{getActiveTabTitle()}</h3>
        </div>

        <div className="overflow-x-auto">
          {/* جدول الرواتب */}
          {activeTab === "overview" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">الراتب</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">الشهر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{record.netSalary.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* جدول المكافآت */}
          {activeTab === "bonuses" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">القيمة</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.filter(r => r.bonuses > 0).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">+{record.bonuses.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date || record.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* جدول الخصومات */}
          {activeTab === "deductions" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">الخصم</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.filter(r => r.deductions > 0).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">-{record.deductions.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date || record.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}