import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Search, UserCheck, UserX, ChevronDown, Trash2, Camera, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

// البيز URL
const API_URL = "https://localhost:7280/api/Users";

// ألوان الأدوار الوظيفية
const ROLE_COLORS: Record<string, string> = {
  "Admin": "bg-purple-100 text-purple-700 border-purple-200",
  "WarehouseManager": "bg-blue-100 text-blue-700 border-blue-200",
  "Representative": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Accountant": "bg-amber-100 text-amber-700 border-amber-200",
};

interface UserModalProps {
  user?: any | null;
  onClose: () => void;
  onSave: () => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [employees, setEmployees] = useState<{ employeeId: number, fullName: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false); // حالة إظهار الباسورد
  const [form, setForm] = useState({
    employeeId: user?.employeeId ?? 0,
    email: user?.email ?? "", // دي اللي هتشيل الايميل أو اليوزر نيم
    password: "",
    role: user?.roleValue ?? 4,
    isActive: user?.isActive ?? true,
    avatarUrl: user?.avatarUrl ?? "",
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      axios.get(`${API_URL}/available-employees`).then(res => setEmployees(res.data));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await axios.put(`${API_URL}/${user.id}`, {
          email: form.email,
          role: Number(form.role),
          isActive: form.isActive,
          avatarUrl: form.avatarUrl
        });
      } else {
        await axios.post(API_URL, {
          employeeId: Number(form.employeeId),
          email: form.email,
          password: form.password,
          role: Number(form.role),
          isActive: form.isActive,
          avatarUrl: form.avatarUrl
        });
      }
      setSaved(true);
      onSave();
      setTimeout(() => onClose(), 1200);
    } catch (error) {
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h3 className="text-slate-700 text-lg">{user ? "تم التحديث" : "تمت الإضافة"} بنجاح!</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base font-bold">{user ? "تعديل بيانات الحساب" : "إنشاء حساب جديد"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-lg">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!user && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5 font-medium">اختيار الموظف</label>
                  <div className="relative">
                    <select
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: Number(e.target.value) })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر الموظف...</option>
                      {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.fullName}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني أو اسم المستخدم */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم المستخدم أو البريد</label>
                <input
                  type="text" // تم التغيير لـ text ليدعم أي صيغة
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اسم المستخدم أو الإيميل"
                  dir="ltr"
                  required
                />
              </div>

              {/* الرقم السري مع زر الإظهار */}
              {!user && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5 font-medium">الرقم السري</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="••••••••"
                      dir="ltr"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Lock size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300 hidden" />
                  </div>
                </div>
              )}

              {/* الدور الوظيفي */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">الصلاحية (الرول)</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>مدير</option>
                    <option value={3}>مدير مخزن</option>
                    <option value={2}>محاسب</option>
                    <option value={4}>مندوب</option>
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* الحالة */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">حالة الحساب</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: true })}
                    className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${form.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "border-slate-200 text-slate-500"}`}
                  >
                    نشط
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: false })}
                    className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${!form.isActive ? "bg-red-50 border-red-200 text-red-700 font-bold" : "border-slate-200 text-slate-500"}`}
                  >
                    غير نشط
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 font-medium">إلغاء</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 disabled:opacity-50">
                  {loading ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function UserManagement() {
  const [userList, setUserList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("الكل");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUserList(res.data);
    } catch (err) {
      console.error("خطأ في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = userList.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "الكل" || u.roleName === filterRole;
    return matchSearch && matchRole;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-500">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-5">
      {(showModal || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={fetchUsers}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن مستخدم..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {["الكل", "Admin", "WarehouseManager", "Representative"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-2 text-xs transition-colors font-medium ${filterRole === r ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {r === "Admin" ? "مدير" : r === "WarehouseManager" ? "مخزن" : r === "Representative" ? "مندوب" : "الكل"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-100 font-bold"
        >
          <Plus size={16} />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "إجمالي الحسابات", filter: "الكل", value: userList.length, color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-500" },
          { label: "المديرون", filter: "Admin", value: userList.filter(u => u.roleName === "Admin").length, color: "text-purple-600", bg: "bg-purple-50", borderColor: "border-purple-500" },
          { label: "مديرو المخازن", filter: "WarehouseManager", value: userList.filter(u => u.roleName === "WarehouseManager").length, color: "text-cyan-600", bg: "bg-cyan-50", borderColor: "border-cyan-500" },
          { label: "المحاسبون", filter: "Accountant", value: userList.filter(u => u.roleName === "Accountant").length, color: "text-amber-600", bg: "bg-amber-50", borderColor: "border-amber-500" },
          { label: "المندوبون", filter: "Representative", value: userList.filter(u => u.roleName === "Representative").length, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-500" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterRole(s.filter)}
            className={`w-full text-right outline-none rounded-xl p-4 shadow-sm border-2 transition-all ${filterRole === s.filter ? s.borderColor : 'border-transparent'} ${s.bg} hover:brightness-95`}
          >
            <p className={`text-2xl ${s.color} font-black`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5 font-bold">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((user) => (
          <div key={user.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden group">
            <div className="p-5 pb-4 border-b border-slate-50/80 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm">
                    {user.fullName.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="text-slate-800 font-bold text-base leading-tight group-hover:text-blue-600 transition-colors">{user.fullName}</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5 font-bold tracking-wider">USR-{user.id}</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <p className="text-slate-400 text-[11px] font-bold mb-1 uppercase">بيانات الدخول</p>
                <p className="text-slate-700 text-sm font-medium" dir="ltr">{user.email}</p>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold mb-1 uppercase">الدور الوظيفي</p>
                  <span className={`text-[11px] px-3 py-1 rounded-full border inline-block font-bold ${ROLE_COLORS[user.roleName]}`}>
                    {user.roleName}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-bold mb-1 uppercase">الحالة</p>
                  <div className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border font-bold ${user.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {user.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                    <span>{user.isActive ? "نشط" : "غير نشط"}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold mb-1">تاريخ الإنشاء</p>
                  <p className="text-slate-600 text-[11px] font-medium">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="text-left">
                  <p className="text-slate-400 text-[10px] font-bold mb-1">آخر ظهور</p>
                  <p className="text-slate-600 text-[11px] font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString('ar-EG') : "لم يدخل بعد"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto flex items-center gap-2 opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditUser(user)}
                className="flex-1 flex justify-center items-center gap-2 bg-white text-slate-600 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95"
              >
                <Edit2 size={14} />
                تعديل
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="w-11 h-11 flex justify-center items-center text-red-500 bg-white border border-slate-200 hover:border-red-200 shadow-sm hover:bg-red-50 rounded-xl transition-all active:scale-95 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}