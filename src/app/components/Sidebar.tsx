import React from "react";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Users,
  BarChart3,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Warehouse,
  ShoppingCart,
  List,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const managerNav: NavItem[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "fleet", label: "إدارة الأسطول", icon: <Truck size={18} /> },
  { id: "tracking", label: "تتبع المركبات", icon: <MapPin size={18} /> },
  { id: "users", label: "إدارة المستخدمين", icon: <Users size={18} /> },
  { id: "attendance", label: "نظام تسجيل الحضور", icon: <Clock size={18} /> },
  { id: "payroll", label: "إدارة الرواتب", icon: <DollarSign size={18} /> },
  { id: "reports", label: "التقارير والتحليلات", icon: <BarChart3 size={18} /> },
];

const warehouseNav: NavItem[] = [
  { id: "wh-dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "inventory", label: "المخزون", icon: <Package size={18} /> },
  { id: "transfers", label: "تحويلات البضاعة", icon: <ArrowLeftRight size={18} /> },
  { id: "reorder", label: "تنبيهات إعادة الطلب", icon: <AlertTriangle size={18} /> },
  { id: "wh-restock", label: "طلبات التعبئة", icon: <RefreshCw size={18} /> },
];

const repNav: NavItem[] = [
  { id: "rep-dashboard", label: "لوحة تحكم المندوب", icon: <LayoutDashboard size={18} /> },
  { id: "rep-inventory", label: "مخزون المركبة", icon: <Package size={18} /> },
  { id: "rep-sale", label: "تسجيل فاتورة بيع", icon: <ShoppingCart size={18} /> },
  { id: "rep-history", label: "سجل المبيعات", icon: <List size={18} /> },
  { id: "rep-restock", label: "طلبات إعادة التعبئة", icon: <RefreshCw size={18} /> },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string, vanId?: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "manager"
    ? managerNav
    : user?.role === "warehouse"
      ? warehouseNav
      : repNav;

  const roleLabel = user?.role === "manager" ? "مدير" : user?.role === "warehouse" ? "مدير المخزن" : "المندوب";
  const roleBadgeColor = user?.role === "manager" ? "bg-blue-500" : user?.role === "warehouse" ? "bg-emerald-500" : "bg-cyan-500";

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full shadow-xl flex-shrink-0">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Warehouse size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">بريق للمنظفات</p>
            <p className="text-blue-400 text-xs leading-tight">والمساحيق</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm flex-shrink-0">
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm truncate">{user?.name}</p>
            <span className={`inline-block text-white text-xs px-2 py-0.5 rounded-full mt-0.5 ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-slate-500 text-xs px-2 mb-2 uppercase tracking-wider">القائمة الرئيسية</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-right ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {user?.role === "manager" && (
          <>
            <p className="text-slate-500 text-xs px-2 mb-2 mt-6 uppercase tracking-wider">إدارة المخزن</p>
            <ul className="space-y-1">
              {warehouseNav.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-right ${isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                      <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Role switcher hint */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs px-2 mb-2 uppercase tracking-wider">تبديل الدور</p>
          <button
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150"
          >
            <Users size={18} className="text-slate-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700">
        <p className="text-slate-600 text-xs text-center">v2.1.0 — © 2026 بريق للمنظفات</p>
      </div>
    </aside>
  );
}