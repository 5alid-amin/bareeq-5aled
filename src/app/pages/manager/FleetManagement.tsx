import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, Edit2, Trash2, Eye, Check, X, Save } from "lucide-react";

// --- Types (Matching your Backend DTOs) ---
interface Van {
  id: number;
  vanName: string;
  plateNumber: string;
  model: string;
  status: string;
  representativeName: string;
  driverName: string;
  representativeId?: number | null; // إضافة الـ ID
  driverId?: number | null;         // إضافة الـ ID
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

const API_BASE = "https://pareeq.runasp.net/api/VehicleManagement";

const STATUS_COLORS: Record<string, string> = {
  "نشطة": "bg-green-500 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]",
  "متوقفة": "bg-slate-100 text-slate-600 border-slate-200",
};

// --- Modal Component ---
interface VanDetailsModalProps {
  van: Van | null;
  onClose: () => void;
  onRefresh: () => void;
}

function VanDetailsModal({ van, onClose, onRefresh }: VanDetailsModalProps) {
  const [formData, setFormData] = useState<Van | null>(van);
  const [reps, setReps] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    if (van) {
      setFormData(van);
      fetch(`${API_BASE}/helpers/representatives`).then(res => res.json()).then(data => setReps(data));
      fetch(`${API_BASE}/helpers/Drivers`).then(res => res.json()).then(data => setDrivers(data));
    }
  }, [van]);

  if (!formData) return null;

  const handleSave = async () => {
    try {
      const method = formData.id === 0 ? "POST" : "PUT";
      const url = formData.id === 0 ? API_BASE : `${API_BASE}/${formData.id}`;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleName: formData.vanName,
          plateNumber: formData.plateNumber,
          model: formData.model,
          status: formData.status,
          driverId: formData.driverId,             // إرسال الـ ID
          representativeId: formData.representativeId // إرسال الـ ID
        })
      });

      if (response.ok) {
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("Error saving van:", error);
    }
  };

  const renderField = (label: string, field: keyof Van, idField: keyof Van, type: "text" | "select" = "text", options: any[] = []) => (
    <div className="flex flex-col p-3 border-b border-slate-50">
      <label className="text-slate-400 text-xs mb-1">{label}</label>
      {type === "select" ? (
        <select
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData[idField] || ""}
          onChange={(e) => setFormData({ ...formData, [idField]: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">اختر...</option>
          {options.map(opt => (
            <option key={opt.employeeId} value={opt.employeeId}>{opt.fullName}</option>
          ))}
        </select>
      ) : (
        <input
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData[field] || ""}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-blue-600" />
            <h2 className="text-slate-700 text-base font-bold">
              {formData.id === 0 ? "إضافة مركبة جديدة" : `تعديل مركبة ${formData.id}`}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">×</button>
        </div>

        <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto" dir="rtl">
          {renderField("اسم السيارة", "vanName", "vanName")}
          {renderField("رقم اللوحة", "plateNumber", "plateNumber")}
          {renderField("الموديل", "model", "model")}
          {renderField("المندوب", "representativeName", "representativeId", "select", reps)}
          {renderField("السائق", "driverName", "driverId", "select", drivers)}

          <div className="p-3">
            <p className="text-slate-400 text-xs mb-2">حالة المركبة</p>
            <div className="flex gap-2">
              {["نشطة", "متوقفة"].map(s => (
                <button
                  key={s}
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`flex-1 py-2.5 rounded-xl text-xs border transition-all font-bold ${formData.status === s
                    ? (s === "نشطة" ? "bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-slate-600 border-slate-700 text-white")
                    : "bg-white text-slate-400 border-slate-200"
                    }`}
                >
                  {s === "نشطة" && formData.status === s && <Check size={14} className="inline ml-1" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Save size={16} /> حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export function FleetManagement() {
  const [selectedVan, setSelectedVan] = useState<Van | null>(null);
  const [vanList, setVanList] = useState<Van[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const query = filterStatus !== "الكل" ? `?status=${filterStatus}` : "";
      const response = await fetch(`${API_BASE}${query}`);
      const data = await response.json();

      const mappedVans = data.vehicles.map((v: any) => ({
        id: v.vehicleId,
        vanName: v.vehicleName,
        plateNumber: v.plateNumber,
        status: v.status,
        representativeName: v.representativeName,
        driverName: v.driverName,
        representativeId: v.representativeId, // تخزين الـ ID القادم من الداتا
        driverId: v.driverId,                 // تخزين الـ ID القادم من الداتا
        model: v.model || "2024"
      }));

      setVanList(mappedVans);
      setStats({
        total: data.totalCount,
        active: data.activeCount,
        inactive: data.inactiveCount
      });
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterStatus]);

  const filtered = vanList.filter((v) =>
    v.driverName.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toString().includes(search) ||
    v.vanName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = () => {
    setSelectedVan({
      id: 0,
      vanName: "",
      plateNumber: "",
      model: "",
      status: "متوقفة",
      representativeName: "",
      driverName: "",
      representativeId: null,
      driverId: null
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {selectedVan && (
        <VanDetailsModal
          van={selectedVan}
          onClose={() => setSelectedVan(null)}
          onRefresh={fetchVehicles}
        />
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم السائق أو السيارة..."
            className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
          />
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
          <Plus size={18} /> إضافة عربة جديدة
        </button>
      </div>

      <div className="flex justify-center gap-6 py-4 flex-wrap">
        {[
          { label: "إجمالي الفانات", filter: "الكل", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "نشطة", filter: "نشطة", value: stats.active, color: "text-green-600", bg: "bg-green-50" },
          { label: "متوقفة", filter: "متوقفة", value: stats.inactive, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setFilterStatus(item.filter)}
            className={`bg-white rounded-3xl border-2 shadow-sm px-10 py-6 flex items-center gap-5 transition-all ${filterStatus === item.filter ? "border-blue-500 bg-blue-50/30 scale-105" : "border-slate-100"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg}`}><Truck size={28} className={item.color} /></div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-slate-500 text-sm font-medium">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((van) => (
          <div key={van.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Truck size={20} className="text-blue-500" /></div>
                <div>
                  <h3 className="text-slate-800 font-bold">#{van.id}</h3>
                  <p className="text-slate-400 text-xs">{van.vanName}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full border text-[10px] font-bold ${STATUS_COLORS[van.status]}`}>
                {van.status}
              </div>
            </div>

            <div className="p-5 flex-1 space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">المندوب</p>
                <p className="text-blue-600 text-sm font-semibold">{van.representativeName || "غير معين"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">السائق</p>
                <p className="text-slate-700 text-sm font-semibold">{van.driverName || "غير معين"}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={() => setSelectedVan(van)}
                className="w-full flex justify-center items-center gap-2 bg-white text-blue-600 border border-slate-200 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm"
              >
                <Eye size={16} /> التفاصيل والتعديل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}