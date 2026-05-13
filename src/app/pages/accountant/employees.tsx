import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, Wallet, Eye, Plus, X, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';

// المسارات - تأكد من مطابقتها لمشروعك
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { KPICard } from '../../components/KPICard';

// الإعدادات الأساسية لـ Axios
// baseURL: import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: 'https://localhost:7280/api' // تأكد من المنفذ (Port) الخاص بك
    // baseURL: import.meta.env.VITE_API_URL
});

export default function EmployeesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'statement'>('grid');
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [selectedKPI, setSelectedKPI] = useState<'salary' | 'deductions' | 'bonuses' | 'advances'>('salary');

    // التعديل هنا: إضافة قيم ابتدائية صريحة لمنع الشاشة البيضاء
    const [statementData, setStatementData] = useState<any>({
        totalBaseSalary: 0,
        totalBonuses: 0,
        totalDeductions: 0,
        totalLoans: 0,
        details: []
    });

    const [addModalType, setAddModalType] = useState<string | null>(null);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);

    // جداول البيانات للمودالز
    const [formData, setFormData] = useState({ amount: 0, notes: '', fullName: '', jobTitle: 'مندوب', phone: '', baseSalary: 0 });

    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const years = Array.from({ length: 5 }, (_, i) => `${2024 + i}`);
    const [selectedYear, selectedMonth] = selectedPeriod.split("-");

    // 1. جلب قائمة الموظفين
    const fetchEmployees = async () => {
        try {
            const res = await api.get('/Employees/all-employees');
            setEmployees(res.data);
        } catch (err) { console.error("Error fetching employees", err); }
    };

    // 2. جلب كشف الحساب (Statement)
    const fetchStatement = async () => {
        if (!selectedEmployee) return;
        try {
            const filterType = selectedKPI === 'advances' ? 'loans' : selectedKPI;
            const res = await api.get(`/Employees/${selectedEmployee}/statement`, {
                params: {
                    month: parseInt(selectedMonth),
                    year: parseInt(selectedYear),
                    filterType: filterType
                }
            });
            // نأمن البيانات اللي جاية برضه بـ Default values
            setStatementData({
                totalBaseSalary: res.data?.totalBaseSalary || 0,
                totalBonuses: res.data?.totalBonuses || 0,
                totalDeductions: res.data?.totalDeductions || 0,
                totalLoans: res.data?.totalLoans || 0,
                details: res.data?.details || []
            });
        } catch (err) { console.error("Error fetching statement", err); }
    };

    useEffect(() => { fetchEmployees(); }, []);
    useEffect(() => { if (viewMode === 'statement') fetchStatement(); }, [selectedEmployee, selectedPeriod, selectedKPI, viewMode]);

    // 3. الأكشنز (Actions)
    const handleAddEmployee = async () => {
        try {
            await api.post('/Employees/add', {
                fullName: formData.fullName,
                jobTitle: formData.jobTitle,
                phone: formData.phone,
                baseSalary: formData.baseSalary
            });
            setShowAddEmployeeModal(false);
            fetchEmployees();
        } catch (err) { alert("حدث خطأ أثناء الإضافة"); }
    };

    const handleDeleteEmployee = async (id: string, name: string) => {
        if (window.confirm(`هل أنت متأكد من حذف الموظف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            try {
                await api.delete(`/Employees/delete/${id}`);
                setViewMode('grid');
                fetchEmployees();
            } catch (err) { alert("فشل الحذف"); }
        }
    };

    const handleAddFinancialRecord = async () => {
        try {
            let endpoint = '';
            let payload: any = { employeeId: selectedEmployee, amount: formData.amount, notes: formData.notes, date: new Date().toISOString() };

            if (addModalType === 'bonuses') endpoint = '/Employees/add-bonus';
            else if (addModalType === 'deductions') endpoint = '/Employees/add-deduction';
            else if (addModalType === 'advances') endpoint = '/Employees/add-loan';
            else if (addModalType === 'salary') {
                endpoint = '/Employees/add-manual-payroll';
                payload = { employeeId: selectedEmployee, baseSalary: formData.amount };
            }

            await api.post(endpoint, payload);
            setAddModalType(null);
            fetchStatement();
        } catch (err: any) { alert(err.response?.data?.message || "حدث خطأ"); }
    };

    const handleUpdateRecord = async () => {
        try {
            let type = editingRecord.type === 'advances' ? 'loan' :
                editingRecord.type === 'bonuses' ? 'bonus' :
                    editingRecord.type === 'deductions' ? 'deduction' : 'payroll';

            const payload = {
                baseSalary: parseFloat(editingRecord.amount || editingRecord.baseSalary || 0),
                paymentDate: editingRecord.date || new Date().toISOString(),
            };

            await api.put(`/Employees/${type}/${editingRecord.id}`, payload);
            setEditingRecord(null);
            fetchStatement();
        } catch (err) {
            console.error("Update Error:", err);
            alert("فشل التحديث، تأكد من البيانات");
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
            try {
                let type = selectedKPI === 'advances' ? 'loan' : selectedKPI === 'bonuses' ? 'bonus' : selectedKPI === 'deductions' ? 'deduction' : 'payroll';
                await api.delete(`/Employees/${type}/${id}`);
                fetchStatement();
            } catch (err) { alert("فشل الحذف"); }
        }
    };

    if (viewMode === 'statement' && selectedEmployee) {
        const employee = employees.find(u => u.employeeId === parseInt(selectedEmployee));

        return (
            <div className="bg-slate-50 min-h-screen p-6" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setViewMode('grid')} className="flex items-center text-gray-500 hover:text-gray-800 font-medium">
                            <ArrowLeft className="w-4 h-4 ml-2" /> العودة للقائمة
                        </button>

                        <button
                            onClick={() => handleDeleteEmployee(selectedEmployee, employee?.fullName || '')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm font-bold"
                        >
                            <Trash2 size={16} /> حذف الموظف
                        </button>
                    </div>

                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-start gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{employee?.fullName}</h1>
                                <p className="text-slate-500 mt-1">{employee?.jobTitle} | {employee?.phone || 'بدون رقم'}</p>
                            </div>

                            {selectedKPI === 'salary' && (
                                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm self-center">
                                    <span className="text-sm font-bold text-slate-600">إضافة يدوية</span>
                                    <button
                                        onClick={() => setIsManualMode(!isManualMode)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${isManualMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isManualMode ? 'right-7' : 'right-1'}`} />
                                    </button>
                                </div>
                            )}
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
                        <div onClick={() => setSelectedKPI('salary')} className={`cursor-pointer rounded-2xl transition-all ${selectedKPI === 'salary' ? 'ring-2 ring-blue-600 shadow-lg scale-[1.02]' : ''}`}>
                            <KPICard title="المرتب الاساسي" value={(statementData?.totalBaseSalary || 0).toLocaleString()} icon={<Wallet />} color="blue" />
                        </div>
                        <div onClick={() => setSelectedKPI('deductions')} className={`cursor-pointer rounded-2xl transition-all ${selectedKPI === 'deductions' ? 'ring-2 ring-red-600 shadow-lg scale-[1.02]' : ''}`}>
                            <KPICard title="الخصومات" value={(statementData?.totalDeductions || 0).toLocaleString()} icon={<MinusCircle />} color="red" />
                        </div>
                        <div onClick={() => setSelectedKPI('bonuses')} className={`cursor-pointer rounded-2xl transition-all ${selectedKPI === 'bonuses' ? 'ring-2 ring-emerald-600 shadow-lg scale-[1.02]' : ''}`}>
                            <KPICard title="المكافآت" value={(statementData?.totalBonuses || 0).toLocaleString()} icon={<PlusCircle />} color="green" />
                        </div>
                        <div onClick={() => setSelectedKPI('advances')} className={`cursor-pointer rounded-2xl transition-all ${selectedKPI === 'advances' ? 'ring-2 ring-orange-600 shadow-lg scale-[1.02]' : ''}`}>
                            <KPICard title="السلف" value={(statementData?.totalLoans || 0).toLocaleString()} icon={<Wallet />} color="orange" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {selectedKPI === 'salary' && 'المرتب الأساسي'}
                                {selectedKPI === 'bonuses' && 'سجل المكافآت والبدلات'}
                                {selectedKPI === 'deductions' && 'سجل الخصومات'}
                                {selectedKPI === 'advances' && 'سجل السلف المستلمة'}
                            </h2>

                            {(selectedKPI !== 'salary' || (selectedKPI === 'salary' && isManualMode)) && (
                                <button
                                    onClick={() => { setFormData({ ...formData, amount: 0, notes: '' }); setAddModalType(selectedKPI); }}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                                >
                                    <Plus size={16} /> إضافة {selectedKPI === 'salary' ? 'مرتب' : selectedKPI === 'bonuses' ? 'مكافأة' : selectedKPI === 'deductions' ? 'خصم' : 'سلفة'}
                                </button>
                            )}
                        </div>
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b text-slate-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4">القيمة</th>
                                    {selectedKPI !== 'salary' && <th className="px-6 py-4">الملاحظة</th>}
                                    <th className="px-6 py-4">التاريخ</th>
                                    <th className="px-6 py-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* تم إضافة check هنا للتأكد إن details موجودة */}
                                {(statementData?.details || []).map((r: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold">{(r.amount || 0).toLocaleString()} ج.م</td>
                                        {selectedKPI !== 'salary' && <td className="px-6 py-4 text-slate-600">{r.notes || '-'}</td>}
                                        <td className="px-6 py-4 text-slate-500">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingRecord({ ...r, type: selectedKPI })}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(r.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!statementData?.details || statementData.details.length === 0) && (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">لا توجد سجلات لهذا الشهر</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal الإضافة */}
                {addModalType && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full" dir="rtl">
                            <div className="flex justify-between items-center mb-6 border-b pb-3">
                                <h3 className="text-xl font-bold">
                                    إضافة {addModalType === 'salary' ? 'مرتب يدوي' : addModalType === 'bonuses' ? 'مكافأة' : addModalType === 'deductions' ? 'خصم' : 'سلفة'}
                                </h3>
                                <button onClick={() => setAddModalType(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                        placeholder="0.00"
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                {addModalType !== 'salary' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">الملاحظة</label>
                                        <textarea
                                            className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-h-[80px]"
                                            placeholder="اكتب الملاحظة هنا..."
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                )}
                                <button onClick={handleAddFinancialRecord} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">حفظ البيانات</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal التعديل */}
                {editingRecord && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full" dir="rtl">
                            <div className="flex justify-between items-center mb-6 border-b pb-3">
                                <h3 className="text-xl font-bold text-slate-800">تعديل البيانات</h3>
                                <button onClick={() => setEditingRecord(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ</label>
                                    <input
                                        type="number"
                                        defaultValue={editingRecord.amount}
                                        className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                        onChange={(e) => setEditingRecord({ ...editingRecord, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                {editingRecord.type !== 'salary' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">الملاحظة</label>
                                        <textarea
                                            defaultValue={editingRecord.notes}
                                            className="w-full border rounded-xl p-3 text-right focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-h-[80px]"
                                            onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                        />
                                    </div>
                                )}
                                <button onClick={handleUpdateRecord} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">تحديث السجل</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen p-6" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">دليل الموظفين</h1>
                    <button
                        onClick={() => { setFormData({ ...formData, fullName: '', phone: '', baseSalary: 0 }); setShowAddEmployeeModal(true); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> إضافة موظف
                    </button>
                </div>

                {showAddEmployeeModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200" dir="rtl">
                            <div className="flex justify-between items-center mb-6 text-slate-800">
                                <h3 className="text-2xl font-bold">إضافة موظف جديد</h3>
                                <button onClick={() => setShowAddEmployeeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف</label>
                                    <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-3.5 text-right focus:border-blue-500 outline-none bg-slate-50/50" placeholder="الاسم الكامل" onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الدور الوظيفي</label>
                                    <select className="w-full border-2 border-slate-100 rounded-2xl p-3.5 text-right focus:border-blue-500 outline-none bg-slate-50/50 appearance-none" onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}>
                                        <option value="مندوب">مندوب</option>
                                        <option value="مدير مخزن">مدير مخزن</option>
                                        <option value="محاسب">محاسب</option>
                                        <option value="مدير">مدير</option>
                                        <option value="سواق">سواق</option>

                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">رقم التليفون (11 رقم)</label>
                                    <input type="tel" maxLength={11} className="w-full border-2 border-slate-100 rounded-2xl p-3.5 text-left focus:border-blue-500 outline-none bg-slate-50/50" placeholder="01xxxxxxxxx" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">المرتب الأساسي</label>
                                    <input type="number" className="w-full border-2 border-slate-100 rounded-2xl p-3.5 text-right focus:border-blue-500 outline-none bg-slate-50/50" placeholder="0.00" onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })} />
                                </div>
                                <button onClick={handleAddEmployee} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">حفظ البيانات</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {employees.map((emp) => (
                        <div key={emp.employeeId} className="bg-white rounded-3xl p-6 border shadow-sm group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">{emp.fullName[0]}</div>
                                <div><h3 className="text-lg font-bold text-slate-800">{emp.fullName}</h3><p className="text-sm text-slate-500">{emp.jobTitle}</p></div>
                            </div>
                            <button onClick={() => { setSelectedEmployee(emp.employeeId.toString()); setViewMode('statement'); }} className="w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                <Eye className="w-4 h-4" /> كشف حساب
                            </button>
                        </div>
                    ))}
                    {employees.length === 0 && <p className="text-center col-span-3 text-slate-500">لا يوجد موظفين حالياً</p>}
                </div>
            </div>
        </div>
    );
}