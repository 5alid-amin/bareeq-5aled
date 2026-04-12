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
  van?: { id: string; vanName: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" } | null;
  onClose: () => void;
  onSave: (van: { id: string; vanName: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" }) => void;
  onDelete?: (id: string) => void;
}

function VanModal({ van, onClose, onSave, onDelete }: VanModalProps) {
  const [form, setForm] = useState({ 
    id: van?.id || "", 
    vanName: van?.vanName || "", 
    driver: van?.driver || "",
    representativeId: van?.representativeId || "",
    status: van?.status || "متوقفة" as "نشطة" | "متوقفة",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.vanName || !form.driver) return;
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
            <p className="text-slate-400 text-sm">{van ? "تم تحديث بيانات المركبة" : "تمت إضافة المركبة الجديدة"}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base font-bold">{van ? "تعديل بيانات المركبة" : "إضافة فان جديدة"}</h2>
              {van && (
                <button 
                  onClick={() => onDelete?.(van.id)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>حذف</span>
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">رقم المركبة (ID) - غير قابل للتعديل</label>
                <input
                  disabled={true} 
                  value={form.id}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم السيارة (نوع المركبة)</label>
                <input
                  value={form.vanName}
                  onChange={(e) => setForm({ ...form, vanName: e.target.value })}
                  placeholder="مثال: تويوتا هايس"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم المندوب - غير قابل للتعديل</label>
                <select
                  disabled={true}
                  value={form.representativeId}
                  className="w-full appearance-none bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                >
                  <option value="">{users.find(u => u.id === form.representativeId)?.name || "بدون مندوب"}</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5 font-medium">اسم السائق (قابل للتعديل)</label>
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
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">إلغاء</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">حفظ التعديلات</button>
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
  const [editVanData, setEditVanData] = useState<{id: string, vanName: string, driver: string, representativeId?: string, status: "نشطة" | "متوقفة"} | null>(null);
  const [vanList, setVanList] = useState<Van[]>(vans);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  const filtered = vanList.filter((v) => {
    const matchSearch = v.driverName.includes(search) || v.id.includes(search);
    const matchStatus = filterStatus === "الكل" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (form: { id: string; vanName: string; driver: string; representativeId?: string; status?: "نشطة" | "متوقفة" }) => {
    setVanList(vanList.map(v => v.id === form.id ? { ...v, vanName: form.vanName, driverName: form.driver, status: form.status || v.status } : v));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المركبة؟")) {
      setVanList(vanList.filter(v => v.id !== id));
      setEditVanData(null);
    }
  };

  return (
    <div className="space-y-6">
      {(showModal || editVanData) && (
        <VanModal 
          van={editVanData}
          onClose={() => { setShowModal(false); setEditVanData(null); }} 
          onSave={handleSave} 
          onDelete={handleDelete}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Summary cards: Big and Centered */}
      <div className="flex justify-center gap-6 py-4">
        {[
          { label: "إجمالي الفانات", filter: "الكل", value: vanList.length, color: "text-blue-600", borderColor: "border-blue-500", bg: "bg-blue-50" },
          { label: "فانات نشطة", filter: "نشطة", value: vanList.filter(v => v.status === "نشطة").length, color: "text-emerald-600", borderColor: "border-emerald-500", bg: "bg-emerald-50" },
          { label: "متوقفة", filter: "متوقفة", value: vanList.filter(v => v.status === "متوقفة").length, color: "text-slate-500", borderColor: "border-slate-500", bg: "bg-slate-50" },
        ].map((item) => (
          <button 
            key={item.label}
            onClick={() => setFilterStatus(item.filter)}
            className={`bg-white rounded-3xl border-2 shadow-sm px-10 py-6 flex items-center gap-5 transition-all hover:scale-105 ${filterStatus === item.filter ? item.borderColor + " " + item.bg : "border-slate-100"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg}`}>
              <Truck size={28} className={item.color} />
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-slate-500 text-sm font-medium">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((van) => (
          <div key={van.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Truck size={20} className="text-blue-500" /></div>
                <div>
                  <h3 className="text-slate-800 font-bold">{van.id}</h3>
                  <p className="text-slate-400 text-xs">{van.vanName || "سيارة توزيع"}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full border text-[10px] font-bold ${STATUS_COLORS[van.status]}`}>{van.status}</div>
            </div>

            <div className="p-5 flex-1 space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">المندوب</p>
                <p className="text-blue-600 text-sm font-semibold">{van.representativeName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">السائق</p>
                <p className="text-slate-700 text-sm font-semibold">{van.driverName}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
              <button
                // التعديل هنا: يذهب إلى representative/inventory
                onClick={() => onNavigate("representative/inventory", van.id)}
                className="flex-1 flex justify-center items-center gap-2 bg-white text-blue-600 border border-slate-200 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all"
              >
                <Eye size={16} /> التفاصيل
              </button>
              
              <button
                onClick={() => setEditVanData({ id: van.id, vanName: van.vanName || "", driver: van.driverName, representativeId: van.representativeId, status: van.status })}
                className="w-11 h-11 flex justify-center items-center text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}