import React, { useState } from "react";
import { Plus, Edit2, Search, UserCheck, UserX, ChevronDown, Trash2 } from "lucide-react";
import { users as initialUsers, User, vans } from "../../data/mockData";

const ROLE_COLORS: Record<string, string> = {
  "مدير": "bg-purple-100 text-purple-700 border-purple-200",
  "مدير مخزن": "bg-blue-100 text-blue-700 border-blue-200",
  "مندوب": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "محاسب": "bg-amber-100 text-amber-700 border-amber-200",
};

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "مندوب" as User["role"],
    status: user?.status ?? "نشط" as User["status"],
    assignedVanId: user?.assignedVanId ?? "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h3 className="text-slate-700 text-lg">{user ? "تم التحديث" : "تمت الإضافة"} بنجاح!</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base">{user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-lg">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">الاسم الكامل</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@bareeq.eg"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">الدور الوظيفي</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="مدير">مدير</option>
                    <option value="مدير مخزن">مدير مخزن</option>
                    <option value="محاسب">محاسب</option>
                    <option value="مندوب">مندوب</option>
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {form.role === "مندوب" && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">السيارة المرتبطة</label>
                  <div className="relative">
                    <select
                      value={form.assignedVanId}
                      onChange={(e) => setForm({ ...form, assignedVanId: e.target.value })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">بدون سيارة</option>
                      {vans.map(v => (
                        <option key={v.id} value={v.id}>{v.id} - {v.driverName}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">الحالة</label>
                <div className="flex gap-3">
                  {["نشط", "غير نشط"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setForm({ ...form, status: s as User["status"] })}
                      className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${form.status === s ? (s === "نشط" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700") : "border-slate-200 text-slate-500"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">إلغاء</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700">حفظ</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function UserManagement() {
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("الكل");

  const filtered = userList.filter((u) => {
    const matchSearch = u.name.includes(search) || u.email.includes(search);
    const matchRole = filterRole === "الكل" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSave = (data: Partial<User>) => {
    if (editUser) {
      setUserList(userList.map((u) => u.id === editUser.id ? { ...u, ...data } : u));
    } else {
      const newUser: User = {
        id: `USR-${String(userList.length + 1).padStart(3, "0")}`,
        name: data.name ?? "",
        email: data.email ?? "",
        role: data.role ?? "مندوب",
        status: data.status ?? "نشط",
        joinDate: new Date().toISOString().split("T")[0],
        assignedVanId: data.assignedVanId,
      };
      setUserList([...userList, newUser]);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      setUserList(userList.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {(showModal || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
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
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
            {["الكل", "مدير", "مدير مخزن", "مندوب"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-2 text-xs transition-colors ${filterRole === r ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats - Act as filters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "إجمالي المستخدمين", filter: "الكل", value: userList.length, color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-500" },
          { label: "المديرون", filter: "مدير", value: userList.filter(u => u.role === "مدير").length, color: "text-purple-600", bg: "bg-purple-50", borderColor: "border-purple-500" },
          { label: "مديرو المخازن", filter: "مدير مخزن", value: userList.filter(u => u.role === "مدير مخزن").length, color: "text-cyan-600", bg: "bg-cyan-50", borderColor: "border-cyan-500" },
          { label: "المحاسبون", filter: "محاسب", value: userList.filter(u => u.role === "محاسب").length, color: "text-amber-600", bg: "bg-amber-50", borderColor: "border-amber-500" },
          { label: "المندوبون", filter: "مندوب", value: userList.filter(u => u.role === "مندوب").length, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-500" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterRole(s.filter)}
            className={`w-full text-right outline-none rounded-xl p-4 shadow-sm border-2 transition-all ${filterRole === s.filter ? s.borderColor : 'border-transparent'} ${s.bg} hover:brightness-95`}
          >
            <p className={`text-2xl ${s.color} font-bold`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((user) => (
          <div key={user.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden">
            {/* Card Header */}
            <div className="p-5 pb-4 border-b border-slate-50/80 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg leading-tight">{user.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 space-y-4">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1">البريد الإلكتروني</p>
                <p className="text-slate-700 text-sm" dir="ltr">{user.email}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">الدور الوظيفي</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full border inline-block ${ROLE_COLORS[user.role]}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1">الحالة</p>
                  <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${user.status === "نشط" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {user.status === "نشط" ? <UserCheck size={14} /> : <UserX size={14} />}
                    <span className="font-medium">{user.status}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1">تاريخ الانضمام</p>
                <p className="text-slate-600 text-sm">{user.joinDate}</p>
              </div>
            </div>

            {/* Card Footer / Actions */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto flex items-center gap-2">
              <button
                onClick={() => setEditUser(user)}
                className="flex-1 flex justify-center items-center gap-2 bg-white text-slate-600 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                <Edit2 size={16} />
                تعديل
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="w-11 h-11 flex justify-center items-center text-red-500 bg-white border border-slate-200 hover:border-red-200 shadow-sm hover:bg-red-50 rounded-xl transition-all active:scale-[0.98] flex-shrink-0"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 border-dashed">
          <UserX size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">لا توجد نتائج مطابقة للبحث</p>
          <p className="text-slate-400 text-sm mt-1">حاول البحث باستخدام اسم أو بريد مختلف</p>
        </div>
      )}
    </div>
  );
}
