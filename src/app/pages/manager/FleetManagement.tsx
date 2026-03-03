import React, { useState } from "react";
import { Plus, Eye, Search, Filter, Truck } from "lucide-react";
import { vans, Van } from "../../data/mockData";

const STATUS_COLORS: Record<string, string> = {
  "نشطة": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "تحميل": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "متوقفة": "bg-red-100 text-red-700 border-red-200",
  "صيانة": "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_DOT: Record<string, string> = {
  "نشطة": "bg-emerald-500",
  "تحميل": "bg-yellow-400",
  "متوقفة": "bg-red-500",
  "صيانة": "bg-slate-400",
};

interface AddVanModalProps {
  onClose: () => void;
  onAdd: (van: { id: string; driver: string; location: string }) => void;
}

function AddVanModal({ onClose, onAdd }: AddVanModalProps) {
  const [form, setForm] = useState({ id: "", driver: "", location: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.driver || !form.location) return;
    onAdd(form);
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
            <h3 className="text-slate-700 text-lg mb-1">تمت الإضافة بنجاح!</h3>
            <p className="text-slate-400 text-sm">تمت إضافة الفان الجديدة إلى الأسطول</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base">إضافة فان جديدة</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">رقم الفان (Van ID)</label>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="مثال: VAN-007"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">اسم السائق</label>
                <input
                  value={form.driver}
                  onChange={(e) => setForm({ ...form, driver: e.target.value })}
                  placeholder="الاسم الكامل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">الموقع الابتدائي</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="مثال: القاهرة - التجمع الخامس"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                  إضافة الفان
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
  const [vanList, setVanList] = useState<Van[]>(vans);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  const filtered = vanList.filter((v) => {
    const matchSearch = v.driverName.includes(search) || v.id.includes(search) || v.location.includes(search);
    const matchStatus = filterStatus === "الكل" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = (form: { id: string; driver: string; location: string }) => {
    const newVan: Van = {
      id: form.id,
      driverName: form.driver,
      location: form.location,
      status: "متوقفة",
      totalSalesToday: 0,
      phone: "—",
      plate: "—",
      openingBalance: 0,
      expenses: 0,
    };
    setVanList([...vanList, newVan]);
  };

  return (
    <div className="space-y-5">
      {showModal && (
        <AddVanModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن فان أو سائق..."
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
            {["الكل", "نشطة", "تحميل", "متوقفة", "صيانة"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 text-xs transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          إضافة فان جديدة
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الفانات", value: vanList.length, color: "text-blue-600" },
          { label: "فانات نشطة", value: vanList.filter(v => v.status === "نشطة").length, color: "text-emerald-600" },
          { label: "في التحميل", value: vanList.filter(v => v.status === "تحميل").length, color: "text-yellow-600" },
          { label: "متوقفة / صيانة", value: vanList.filter(v => v.status === "متوقفة" || v.status === "صيانة").length, color: "text-red-500" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <Truck size={18} className={item.color} />
            <div>
              <p className={`text-xl ${item.color}`}>{item.value}</p>
              <p className="text-slate-400 text-xs">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-700 text-base">قائمة الفانات ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">رقم الفان</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">اسم السائق</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">الموقع الحالي</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">الحالة</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">مبيعات اليوم</th>
                <th className="text-right text-slate-500 text-xs px-5 py-3 whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((van) => (
                <tr key={van.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                        <Truck size={14} className="text-blue-500" />
                      </div>
                      <span className="text-slate-700 text-sm">{van.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 text-sm">{van.driverName}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{van.location}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${STATUS_DOT[van.status]}`}></div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[van.status]}`}>
                        {van.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm ${van.totalSalesToday > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                      {van.totalSalesToday > 0 ? `${van.totalSalesToday.toLocaleString("ar-EG")} ج.م` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onNavigate("van-details", van.id)}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={13} />
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            لا توجد نتائج مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );
}
