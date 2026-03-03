import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple" | "red" | "cyan";
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    valuText: "text-blue-700",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    valuText: "text-emerald-700",
    border: "border-emerald-100",
  },
  orange: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    valuText: "text-orange-700",
    border: "border-orange-100",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    valuText: "text-purple-700",
    border: "border-purple-100",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    valuText: "text-red-700",
    border: "border-red-100",
  },
  cyan: {
    bg: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-600",
    valuText: "text-cyan-700",
    border: "border-cyan-100",
  },
};

export function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm mb-1">{title}</p>
          <p className={`text-2xl ${c.valuText}`}>{value}</p>
          {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              <span>{trend.positive ? "▲" : "▼"}</span>
              <span>{trend.value}</span>
              <span className="text-slate-400">مقارنة بالأمس</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center ${c.iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
