import React, { useState } from "react";
import { MapPin, Truck, Navigation, Signal, Clock } from "lucide-react";
import { vans, Van } from "../../data/mockData";

const STATUS_COLORS: Record<string, string> = {
  "نشطة": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "متوقفة": "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_DOT: Record<string, string> = {
  "نشطة": "bg-emerald-500 animate-pulse",
  "متوقفة": "bg-slate-400",
};

const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "VAN-001": { x: 65, y: 38 },
  "VAN-002": { x: 52, y: 55 },
  "VAN-003": { x: 73, y: 62 },
  "VAN-004": { x: 40, y: 45 },
  "VAN-005": { x: 58, y: 72 },
  "VAN-006": { x: 45, y: 30 },
};

const MAP_DOT_COLORS: Record<string, string> = {
  "نشطة": "#10b981",
  "متوقفة": "#94a3b8",
};

const LAST_UPDATE: Record<string, string> = {
  "VAN-001": "منذ دقيقتين",
  "VAN-002": "منذ 5 دقائق",
  "VAN-003": "منذ 12 دقيقة",
  "VAN-004": "منذ 3 ساعات",
  "VAN-005": "منذ يوم",
  "VAN-006": "منذ دقيقة",
};

export function VehicleTracking() {
  const [selectedVan, setSelectedVan] = useState<Van>(vans[0]);

  return (
    <div className="relative isolate min-h-[800px]">
      {/* Blurred Overlay for "Coming Soon" */}
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30 rounded-2xl p-4">
        <div className="bg-white/90 px-6 sm:px-12 py-8 rounded-3xl shadow-2xl border border-white/50 animate-pulse flex flex-col items-center gap-4 text-center w-full max-w-sm sm:max-w-none">
          <Navigation size={48} className="text-blue-500" />
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-wider">قريباً</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">جاري العمل على ميزة تتبع المركبات المباشر...</p>
        </div>
      </div>

      <div className="space-y-4 opacity-50 pointer-events-none select-none filter blur-[2px]">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "إجمالي الفانات", value: vans.length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "نشطة الآن", value: vans.filter(v => v.status === "نشطة").length, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "متوقفة", value: vans.filter(v => v.status === "متوقفة").length, color: "text-slate-500", bg: "bg-slate-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-white shadow-sm`}>
              <p className={`text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main tracking area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          {/* Van list */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-100">
              <h2 className="text-slate-700 text-base">قائمة الفانات</h2>
              <p className="text-slate-400 text-xs mt-0.5">اختر فان لعرض موقعها</p>
            </div>
            <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
              {vans.map((van) => (
                <button
                  key={van.id}
                  onClick={() => setSelectedVan(van)}
                  className={`w-full text-right px-4 py-3.5 hover:bg-slate-50 transition-colors ${selectedVan.id === van.id ? "bg-blue-50 border-r-2 border-blue-500" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[van.status]}`}></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 text-sm">{van.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[van.status]}`}>
                            {van.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs truncate mt-0.5">{van.driverName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-slate-400" />
                          <p className="text-slate-400 text-xs truncate">{van.location}</p>
                        </div>
                      </div>
                    </div>
                    {van.totalSalesToday > 0 && (
                      <div className="text-left flex-shrink-0">
                        <p className="text-emerald-600 text-xs">{van.totalSalesToday.toLocaleString("ar-EG")} ج.م</p>
                        <p className="text-slate-400 text-xs">اليوم</p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Map panel */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation size={17} className="text-blue-500" />
                <h2 className="text-slate-700 text-base">خريطة تتبع الفانات</h2>
              </div>
              <div className="flex items-center gap-2">
                <Signal size={14} className="text-emerald-500" />
                <span className="text-emerald-600 text-xs">مباشر</span>
              </div>
            </div>

            {/* Map placeholder with van markers */}
            <div className="relative bg-gradient-to-br from-slate-100 to-blue-50 h-[400px] overflow-hidden">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapgrid)" />
                {/* Road lines */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8,4" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8,4" />
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#e2e8f0" strokeWidth="2" />
                {/* Blocks */}
                <rect x="32%" y="32%" width="16%" height="16%" rx="4" fill="#e2e8f0" opacity="0.6" />
                <rect x="54%" y="32%" width="14%" height="16%" rx="4" fill="#e2e8f0" opacity="0.6" />
                <rect x="32%" y="52%" width="16%" height="16%" rx="4" fill="#e2e8f0" opacity="0.6" />
                <rect x="54%" y="52%" width="14%" height="16%" rx="4" fill="#e2e8f0" opacity="0.6" />
              </svg>

              {/* Van markers */}
              {vans.map((van) => {
                const pos = MAP_POSITIONS[van.id] || { x: 50, y: 50 };
                const isSelected = selectedVan.id === van.id;
                const color = MAP_DOT_COLORS[van.status];
                return (
                  <button
                    key={van.id}
                    onClick={() => setSelectedVan(van)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <div
                      className="relative flex items-center justify-center transition-transform"
                      style={{ transform: isSelected ? "scale(1.3)" : "scale(1)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        style={{ backgroundColor: color }}
                      >
                        <Truck size={16} className="text-white" />
                      </div>
                      {isSelected && (
                        <div
                          className="absolute -inset-1.5 rounded-full border-2 animate-ping opacity-60"
                          style={{ borderColor: color }}
                        ></div>
                      )}
                      <div className="absolute -top-8 right-1/2 translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        {van.id}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Map label */}
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-slate-500 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200">
                منطقة القاهرة
              </div>
            </div>

            {/* Selected Van Info */}
            <div className="px-5 py-4 bg-gradient-to-l from-blue-50 to-slate-50 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[selectedVan.status]}`}></span>
                    <span className="text-slate-700 text-sm">{selectedVan.id} — {selectedVan.driverName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedVan.status]}`}>
                      {selectedVan.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <MapPin size={13} />
                    <span>{selectedVan.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={13} className="text-slate-400" />
                    <span className="text-xs">{LAST_UPDATE[selectedVan.id]}</span>
                  </div>
                  {selectedVan.totalSalesToday > 0 && (
                    <div className="bg-white border border-emerald-100 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-slate-400">مبيعات اليوم</p>
                      <p className="text-emerald-600 text-sm">{selectedVan.totalSalesToday.toLocaleString("ar-EG")} ج.م</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-slate-500 text-xs">مفتاح الخريطة:</span>
            {[
              { label: "نشطة", color: "bg-emerald-500" },
              { label: "متوقفة", color: "bg-slate-400" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${l.color}`}></div>
                <span className="text-slate-600 text-xs">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
