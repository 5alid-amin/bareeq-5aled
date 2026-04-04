import React from "react";
import { Bell, Search, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "لوحة تحكم المدير",
  fleet: "إدارة الأسطول",
  tracking: "تتبع المركبات",
  users: "إدارة المستخدمين",
  reports: "التقارير والتحليلات",
  "wh-dashboard": "لوحة تحكم المخزن",
  inventory: "إدارة المخزون",
  transfers: "تحويلات البضاعة",
  reorder: "تنبيهات إعادة الطلب",
  "van-details": "تفاصيل الفان",
  "rep-dashboard": "لوحة تحكم المندوب",
  "rep-inventory": "مخزون المركبة",
  "rep-sale": "تسجيل فاتورة بيع",
  "rep-history": "سجل المبيعات",
  attendance: "نظام تسجيل الحضور",
  payroll: "إدارة الرواتب",
};

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string, vanId?: string) => void;
}

export function Header({ activePage, onNavigate }: HeaderProps) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showBack = activePage === "van-details";

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
      {/* Left side: page title */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => onNavigate("fleet")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ChevronLeft size={16} />
            <span>رجوع</span>
          </button>
        )}
        <div>
          <h1 className="text-slate-800 text-base">{PAGE_TITLES[activePage] || "لوحة التحكم"}</h1>
          <p className="text-slate-400 text-xs">{today}</p>
        </div>
      </div>

      {/* Right side: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            type="text"
            placeholder="بحث..."
            className="bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>

        <button className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs">
            {user?.avatar}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-slate-700 text-xs leading-tight">{user?.name}</p>
            <p className="text-slate-400 text-xs leading-tight">
              {{
                manager: "المدير",
                warehouse: "مدير المخزن",
                warehouseManager: "مدير المخزن",
                representative: "المندوب",
                accountant: "المحاسب",
              }[user?.role as string] || "مستخدم"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}