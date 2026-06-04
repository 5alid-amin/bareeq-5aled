import axios from 'axios';
import { useEffect, useState } from 'react';
import { DollarSign, FileText, Wallet, Landmark, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { KPICard } from "../../components/KPICard";

interface SalaryRecord {
  id: number | string;
  name: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  loans: number;
  netSalary: number;
  date?: string;
  notes?: string;
}

export function AccountantPayrollPage() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);

  // الـ State دي دلوقتي بتحدث نفسها "ديناميكياً" من داتا الجداول
  const [summary, setSummary] = useState({
    totalSalaries: 0,
    totalBonuses: 0,
    totalDeductions: 0,
    totalLoans: 0
  });

  const [activeTab, setActiveTab] = useState<"overview" | "deductions" | "bonuses" | "loans">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const defaultMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [selectedPeriod, setSelectedPeriod] = useState(`2026-${defaultMonth}`);
  const [selectedYear, selectedMonth] = selectedPeriod.split("-");

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = Array.from({ length: 2030 - 2024 + 1 }, (_, index) => `${2024 + index}`);

  // الميثود الوحيدة المسؤولة عن جلب البيانات وتحديث التوتال
  const fetchData = async () => {
    try {
      let endpoint = "monthly-report";
      if (activeTab === "bonuses") endpoint = "details/bonuses";
      else if (activeTab === "deductions") endpoint = "details/deductions";
      else if (activeTab === "loans") endpoint = "details/loans";
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/Payroll/${endpoint}`, {
      const response = await axios.get(`http://pareeq.runasp.net/api/Payroll/${endpoint}`, {
        params: {
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear),
          search: searchQuery
        }
      });

      // استلام الـ items والـ total اللي راجعين مع بعض في Response واحد
      const { items, total } = response.data;

      // تحديث رقم الكارت المختار فقط في الـ summary state
      setSummary(prev => ({
        ...prev,
        [activeTab === "overview" ? "totalSalaries" :
          activeTab === "bonuses" ? "totalBonuses" :
            activeTab === "deductions" ? "totalDeductions" : "totalLoans"]: total
      }));

      // تحويل البيانات لتناسب شكل الجدول (Mapping)
      const mappedData = items.map((item: any, index: number) => ({
        id: item.employeeId || index,
        name: item.employeeName || item.employeeFullName || "غير معروف",
        baseSalary: item.baseSalary || 0,
        bonuses: item.totalBonuses || item.amount || 0,
        deductions: item.totalDeductions || item.amount || 0,
        loans: item.totalLoans || item.amount || 0,
        netSalary: item.netSalary || item.amount || 0,
        date: item.paymentDate || item.date,
        notes: item.notes || ""
      }));

      setRecords(mappedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, activeTab, searchQuery]);

  const getActiveTabTitle = () => {
    if (activeTab === "overview") return "إجمالي الرواتب";
    if (activeTab === "bonuses") return "المكافآت";
    if (activeTab === "deductions") return "الخصومات";
    if (activeTab === "loans") return "السلف";
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
            <p className="text-sm text-slate-500">متابعة الرواتب والمكافآت والخصومات والسلف</p>
          </div>
        </div>

        {/* الفلاتر */}
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

      {/* الكروت العلوية (بالتنسيق الموحد والتوسط الذي طلبته) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">

        <div
          onClick={() => setActiveTab("overview")}
          className={`cursor-pointer transition-all rounded-2xl flex flex-col justify-center ${activeTab === "overview" ? "ring-2 ring-purple-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard
            title={activeTab === "overview" ? "إجمالي الرواتب" : ""}
            value={activeTab === "overview" ? `${summary.totalSalaries.toLocaleString()} ج.م` : "إجمالي الرواتب"}
            icon={<Wallet size={24} />}
            color="blue"
          />
        </div>

        <div
          onClick={() => setActiveTab("bonuses")}
          className={`cursor-pointer transition-all rounded-2xl flex flex-col justify-center ${activeTab === "bonuses" ? "ring-2 ring-emerald-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard
            title={activeTab === "bonuses" ? "إجمالي المكافآت" : ""}
            value={activeTab === "bonuses" ? `${summary.totalBonuses.toLocaleString()} ج.م` : "إجمالي المكافآت"}
            icon={<DollarSign size={24} />}
            color="green"
          />
        </div>

        <div
          onClick={() => setActiveTab("deductions")}
          className={`cursor-pointer transition-all rounded-2xl flex flex-col justify-center ${activeTab === "deductions" ? "ring-2 ring-red-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard
            title={activeTab === "deductions" ? "إجمالي الخصومات" : ""}
            value={activeTab === "deductions" ? `${summary.totalDeductions.toLocaleString()} ج.م` : "إجمالي الخصومات"}
            icon={<FileText size={24} />}
            color="red"
          />
        </div>

        <div
          onClick={() => setActiveTab("loans")}
          className={`cursor-pointer transition-all rounded-2xl flex flex-col justify-center ${activeTab === "loans" ? "ring-2 ring-orange-600 shadow-md scale-[1.01]" : ""}`}
        >
          <KPICard
            title={activeTab === "loans" ? "إجمالي السلف" : ""}
            value={activeTab === "loans" ? `${summary.totalLoans.toLocaleString()} ج.م` : "إجمالي السلف"}
            icon={<Landmark size={24} />}
            color="orange"
          />
        </div>
      </div>

      {/* قسم الجداول */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
          <h3 className="font-bold text-slate-800 text-lg">{getActiveTabTitle()}</h3>

          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="بحث باسم الموظف ..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "overview" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">الراتب الأساسي</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">مكافآت</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">خصومات</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-600">سلف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-blue-600">الصافي</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.baseSalary.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">+{record.bonuses.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-{record.deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-orange-600">-{record.loans.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{record.netSalary.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bonuses" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">القيمة</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-emerald-600">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">+{record.bonuses.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "deductions" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">الخصم</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-red-600">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">-{record.deductions.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "loans" && (
            <table className="w-full text-right whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-orange-600">الموظف</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-600">قيمة السلفة</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-600">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-600">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{record.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-orange-600">{record.loans.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{record.notes || "-"}</td>
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