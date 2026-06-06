import React from "react";
import { Bell, Search, ChevronLeft, Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "لوحة تحكم المدير",
  fleet: "إدارة المركبات",
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
  onToggleMobileMenu?: () => void;
}

export function Header({ activePage, onNavigate, onToggleMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const showBack = activePage === "van-details";

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
      {/* Left side: page title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button 
            onClick={onToggleMobileMenu} 
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
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

      {/* Right side: notifications + avatar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleDarkMode}
          className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

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