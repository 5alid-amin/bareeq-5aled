import React, { useState } from "react";
import { Plus, Edit2, Search, UserCheck, UserX, ChevronDown } from "lucide-react";
import { users as initialUsers, User } from "../../data/mockData";

const ROLE_COLORS: Record<string, string> = {
  "مدير": "bg-purple-100 text-purple-700 border-purple-200",
  "مدير مخزن": "bg-blue-100 text-blue-700 border-blue-200",
  "مندوب": "bg-cyan-100 text-cyan-700 border-cyan-200",
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
                    <option value="مندوب">مندوب</option>
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
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
      };
      setUserList([...userList, newUser]);
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المستخدمين", value: userList.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "المديرون", value: userList.filter(u => u.role === "مدير").length, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "مديرو المخازن", value: userList.filter(u => u.role === "مدير مخزن").length, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "المندوبون", value: userList.filter(u => u.role === "مندوب").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className={`text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-700 text-base">المستخدمون ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-slate-500 text-xs px-5 py-3">المستخدم</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">البريد الإلكتروني</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">الدور</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">الحالة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">تاريخ الانضمام</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-700 text-sm">{user.name}</p>
                        <p className="text-slate-400 text-xs">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm" dir="ltr">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {user.status === "نشط" ? (
                        <UserCheck size={14} className="text-emerald-500" />
                      ) : (
                        <UserX size={14} className="text-red-400" />
                      )}
                      <span className={`text-xs ${user.status === "نشط" ? "text-emerald-600" : "text-red-500"}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{user.joinDate}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setEditUser(user)}
                      className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 size={12} />
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
