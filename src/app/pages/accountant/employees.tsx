import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, Wallet, Eye, Plus, X } from 'lucide-react';

// المسارات - تأكد من مطابقتها لمشروعك
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { KPICard } from '../../components/KPICard';
import { users, payrollRecords, User } from '../../data/mockData';

interface Transaction {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  reason: string;
}

const currentYearMonth = new Date().toISOString().slice(0, 7);

// --- Fake Data (البيانات اللي رجعت) ---
const initialBonuses: Transaction[] = [
  { id: 'B1', employeeId: 'ANY', amount: 500, date: `${currentYearMonth}-05`, reason: 'أداء ممتاز في تسليم المشروع' },
  { id: 'B2', employeeId: 'ANY', amount: 1200, date: `${currentYearMonth}-12`, reason: 'مكافأة ربع سنوية' },
];

const initialDeductions: Transaction[] = [
  { id: 'D1', employeeId: 'ANY', amount: 200, date: `${currentYearMonth}-10`, reason: 'تأخير صباحي متكرر' },
];

const initialAdvances: Transaction[] = [
  { id: 'A1', employeeId: 'ANY', amount: 1000, date: `${currentYearMonth}-01`, reason: 'سلفة طارئة' },
];

export default function EmployeesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'statement'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(currentYearMonth);
  const [selectedKPI, setSelectedKPI] = useState<'salary' | 'deductions' | 'bonuses' | 'advances'>('salary');
  const [addModalType, setAddModalType] = useState<string | null>(null);

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = Array.from({ length: 5 }, (_, i) => `${2024 + i}`);
  const [selectedYear, selectedMonth] = selectedPeriod.split("-");

  // دالة جلب البيانات الأصلية
  const getRecordsForKPI = (empId: string, month: string, kpi: string) => {
    if (kpi === 'salary') return [{ baseSalary: 8500, month: month }];
    let data = kpi === 'bonuses' ? initialBonuses : kpi === 'deductions' ? initialDeductions : initialAdvances;
    return data.filter(d => d.date.startsWith(month));
  };

  if (viewMode === 'statement' && selectedEmployee) {
    const employee = users.find(u => u.id === selectedEmployee);

    return (
      <div className="bg-slate-50 min-h-screen p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setViewMode('grid')} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة للقائمة
          </button>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{employee?.name}</h1>
              <p className="text-slate-500 mt-1">{employee?.role} | {employee?.phone}</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border">
              <Select value={selectedMonth} onValueChange={(m) => setSelectedPeriod(`${selectedYear}-${m}`)}>
                <SelectTrigger className="h-9 w-[110px] bg-white border-none rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={(y) => setSelectedPeriod(`${y}-${selectedMonth}`)}>
                <SelectTrigger className="h-9 w-[90px] bg-white border-none rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div onClick={() => setSelectedKPI('salary')} className={`cursor-pointer rounded-2xl ${selectedKPI === 'salary' ? 'ring-2 ring-blue-600 shadow-lg' : ''}`}>
                <KPICard title="المرتب" value="8,500" icon={<Wallet />} color="blue" />
            </div>
            <div onClick={() => setSelectedKPI('deductions')} className={`cursor-pointer rounded-2xl ${selectedKPI === 'deductions' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}>
                <KPICard title="الخصومات" value="200" icon={<MinusCircle />} color="red" />
            </div>
            <div onClick={() => setSelectedKPI('bonuses')} className={`cursor-pointer rounded-2xl ${selectedKPI === 'bonuses' ? 'ring-2 ring-emerald-600 shadow-lg' : ''}`}>
                <KPICard title="المكافآت" value="1,700" icon={<PlusCircle />} color="green" />
            </div>
            <div onClick={() => setSelectedKPI('advances')} className={`cursor-pointer rounded-2xl ${selectedKPI === 'advances' ? 'ring-2 ring-orange-600 shadow-lg' : ''}`}>
                <KPICard title="السلف" value="1,000" icon={<Wallet />} color="orange" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">
                {selectedKPI === 'salary' && 'تفاصيل المرتب الأساسي'}
                {selectedKPI === 'bonuses' && 'سجل المكافآت والبدلات'}
                {selectedKPI === 'deductions' && 'سجل الخصومات'}
                {selectedKPI === 'advances' && 'سجل السلف المستلمة'}
              </h2>
              
              {/* الزراير في مكانها في الجدول */}
              {selectedKPI !== 'salary' && (
                <button 
                  onClick={() => setAddModalType(selectedKPI)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                >
                  <Plus size={16} /> إضافة {selectedKPI === 'bonuses' ? 'مكافأة' : selectedKPI === 'deductions' ? 'خصم' : 'سلفة'}
                </button>
              )}
            </div>
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b text-slate-500 text-sm">
                <tr><th className="px-6 py-4">القيمة</th>{selectedKPI !== 'salary' && <th className="px-6 py-4">الملاحظة</th>}<th className="px-6 py-4">التاريخ</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getRecordsForKPI(selectedEmployee, selectedPeriod, selectedKPI).map((r: any, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{(r.amount || r.baseSalary).toLocaleString()} ج.م</td>
                    {selectedKPI !== 'salary' && <td className="px-6 py-4 text-slate-600">{r.reason || '-'}</td>}
                    <td className="px-6 py-4 text-slate-500">{r.date || r.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal الإضافة البسيط */}
        {addModalType && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full" dir="rtl">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-xl font-bold">إضافة {addModalType === 'bonuses' ? 'مكافأة' : addModalType === 'deductions' ? 'خصم' : 'سلفة'}</h3>
                <button onClick={() => setAddModalType(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ</label>
                  <input type="number" className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">الملاحظة</label>
                  <textarea className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-h-[80px]" placeholder="اكتب الملاحظة هنا..." />
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">حفظ البيانات</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // الجزء بتاع الـ Grid رجع تمام بالبيانات بتاعته
  return (
    <div className="bg-slate-50 min-h-screen p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">دليل الموظفين</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg">
            <Plus className="w-5 h-5" /> إضافة موظف
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.filter(u => u.role !== 'محاسب').map((emp) => (
            <div key={emp.id} className="bg-white rounded-3xl p-6 border shadow-sm group hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">{emp.name[0]}</div>
                <div><h3 className="text-lg font-bold">{emp.name}</h3><p className="text-sm text-slate-500">{emp.role}</p></div>
              </div>
              <button onClick={() => { setSelectedEmployee(emp.id); setViewMode('statement'); }} className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                <Eye className="w-4 h-4" /> كشف حساب
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}