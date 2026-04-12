import React, { useState } from "react";
import { Plus, Search, Truck, Edit2, Trash2, Eye } from "lucide-react";
import { vans, Van, users } from "../../data/mockData";

const STATUS_COLORS: Record<string, string> = {
  "نشطة": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "متوقفة": "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_DOT: Record<string, string> = {
  "نشطة": "bg-emerald-500",
  "متوقفة": "bg-slate-400",
};

interface VanModalProps {
  van?: { id: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" } | null;
  onClose: () => void;
  onSave: (van: { id: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" }) => void;
}

function VanModal({ van, onClose, onSave }: VanModalProps) {
  const [form, setForm] = useState({ 
    id: van?.id || "", 
    driver: van?.driver || "",
    representativeId: van?.representativeId || "",
    status: van?.status || "متوقفة" as "نشطة" | "متوقفة",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.driver) return;
    onSave(form);
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-slate-700 text-lg mb-1">{van ? "تم التحديث بنجاح!" : "تمت الإضافة بنجاح!"}</h3>
            <p className="text-slate-400 text-sm">{van ? "تم تحديث بيانات المركبة" : "تمت إضافة الفان الجديدة إلى المركبات"}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base font-bold">{van ? "تعديل بيانات المركبة" : "إضافة فان جديدة"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">رقم الفان (Van ID)</label>
                <input
                  disabled={!!van} // Prevent changing ID if editing
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="مثال: VAN-007"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم المندوب (مستخدم النظام)</label>
                <div className="relative">
                  <select
                    value={form.representativeId}
                    onChange={(e) => setForm({ ...form, representativeId: e.target.value })}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">بدون مندوب</option>
                    {users
                      .filter((u) => u.role === "مندوب")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم السائق (الفعلي)</label>
                <input
                  value={form.driver}
                  onChange={(e) => setForm({ ...form, driver: e.target.value })}
                  placeholder="الاسم الكامل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {van && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5 font-medium">حالة المركبة</label>
                  <div className="flex gap-3">
                    {["نشطة", "متوقفة"].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setForm({ ...form, status: s as "نشطة" | "متوقفة" })}
                        className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${form.status === s ? (s === "نشطة" ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "bg-slate-100 border-slate-300 text-slate-700 font-bold") : "border-slate-200 text-slate-500"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  {van ? "حفظ التعديلات" : "إضافة الفان"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

interface FleetManagementProps {
  onNavigate: (page: string, vanId?: string) => void;
}

export function FleetManagement({ onNavigate }: FleetManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editVanData, setEditVanData] = useState<{id: string, driver: string, representativeId?: string, status: "نشطة" | "متوقفة"} | null>(null);
  const [vanList, setVanList] = useState<Van[]>(vans);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  const filtered = vanList.filter((v) => {
    const matchSearch = v.driverName.includes(search) || v.id.includes(search) || (v.representativeName && v.representativeName.includes(search));
    const matchStatus = filterStatus === "الكل" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (form: { id: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" }) => {
    const repName = users.find(u => u.id === form.representativeId)?.name;
    
    if (editVanData) {
      setVanList(vanList.map(v => 
        v.id === form.id ? { ...v, driverName: form.driver, representativeId: form.representativeId, representativeName: repName, status: form.status || v.status } : v
      ));
    } else {
      const newVan: Van = {
        id: form.id,
        driverName: form.driver,
        representativeId: form.representativeId,
        representativeName: repName,
        location: "القاهرة", // Default location
        status: form.status || "متوقفة",
        totalSalesToday: 0,
        phone: "—",
        plate: "—",
        openingBalance: 0,
        expenses: 0,
      };
      setVanList([...vanList, newVan]);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المركبة كلياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      setVanList(vanList.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {(showModal || editVanData) && (
        <VanModal 
          van={editVanData}
          onClose={() => { setShowModal(false); setEditVanData(null); }} 
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
              placeholder="بحث عن فان أو مندوب أو سائق..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
        <button
          onClick={() => { setEditVanData(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          إضافة فان جديدة
        </button>
      </div>

      {/* Summary cards as filters */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: "إجمالي الفانات", filter: "الكل", value: vanList.length, color: "text-blue-600", borderColor: "border-blue-500", bg: "bg-blue-50" },
          { label: "فانات نشطة", filter: "نشطة", value: vanList.filter(v => v.status === "نشطة").length, color: "text-emerald-600", borderColor: "border-emerald-500", bg: "bg-emerald-50" },
          { label: "متوقفة", filter: "متوقفة", value: vanList.filter(v => v.status === "متوقفة").length, color: "text-slate-500", borderColor: "border-slate-500", bg: "bg-slate-50" },
        ].map((item) => (
          <button 
            key={item.label}
            onClick={() => setFilterStatus(item.filter)}
            className={`bg-white rounded-xl border-2 shadow-sm px-4 py-3 flex items-center gap-3 w-full transition-all text-right outline-none hover:bg-slate-50 ${filterStatus === item.filter ? item.borderColor + " " + item.bg : "border-transparent"}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
              <Truck size={18} className={item.color} />
            </div>
            <div>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((van) => (
          <div key={van.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden">
            {/* Card Header */}
            <div className="p-5 pb-4 border-b border-slate-50/80 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                    <Truck size={22} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg leading-tight">{van.id}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">المركبة</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-sm ${STATUS_COLORS[van.status]}`}>
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[van.status]}`}></div>
                  {van.status}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1">
              <div className="space-y-4">
                {van.representativeName && (
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1 line-clamp-1">المندوب (مسؤول المبيعات)</p>
                    <p className="text-blue-600 text-sm font-semibold">{van.representativeName}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-1 line-clamp-1">السائق (المركبة)</p>
                  <p className="text-slate-700 text-sm font-semibold">{van.driverName}</p>
                </div>
                
                {van.status === "نشطة" && (
                  <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                     <p className="text-blue-400 text-xs mb-1">حالة العمل</p>
                     <p className="text-blue-700 text-sm font-medium">قيد التشغيل بالميدان</p>
                  </div>
                )}
                {van.status === "متوقفة" && (
                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                     <p className="text-slate-400 text-xs mb-1">حالة العمل</p>
                     <p className="text-slate-600 text-sm font-medium">متوقفة أو بالجراج</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer / Actions */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate("van-details", van.id)}
                className="flex-1 flex justify-center items-center gap-2 bg-white text-blue-600 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-[0.98]"
              >
                <Eye size={16} />
                التفاصيل
              </button>
              
              <button
                onClick={() => setEditVanData({ id: van.id, driver: van.driverName, representativeId: van.representativeId, status: van.status })}
                className="w-11 h-11 flex justify-center items-center text-slate-500 bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:bg-slate-100 rounded-xl transition-all active:scale-[0.98] flex-shrink-0"
                title="تعديل"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(van.id)}
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
          <Truck size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">لا توجد نتائج مطابقة للبحث</p>
          <p className="text-slate-400 text-sm mt-1">حاول البحث باستخدام اسم فان أو مندوب مختلف</p>
        </div>
      )}
    </div>
  );
}
