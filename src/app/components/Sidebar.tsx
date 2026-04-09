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
  RefreshCw,
  BookOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  RotateCcw,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const managerNav: NavItem[] = [
  { id: "manager/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "manager/fleet", label: "إدارة الأسطول", icon: <Truck size={18} /> },
  { id: "manager/tracking", label: "تتبع المركبات", icon: <MapPin size={18} /> },
  { id: "manager/users", label: "إدارة المستخدمين", icon: <Users size={18} /> },
  { id: "manager/attendance", label: "نظام تسجيل الحضور", icon: <Clock size={18} /> },
  { id: "manager/reports", label: "التقارير والتحليلات", icon: <BarChart3 size={18} /> },
];

const warehouseNav: NavItem[] = [
  { id: "warehouse/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "warehouse/inventory", label: "المخزون", icon: <Package size={18} /> },
  { id: "warehouse/discrepancy", label: "فروقات جرد السيارات", icon: <ClipboardList size={18} /> },
  { id: "warehouse/transfers", label: "تحميل السيارات", icon: <Truck size={18} /> },
  { id: "warehouse/returns", label: "مرتجع", icon: <RotateCcw size={18} /> },
  { id: "warehouse/reorder", label: "تنبيهات إعادة الطلب", icon: <AlertTriangle size={18} /> },
  { id: "warehouse/restock", label: "طلبات التعبئة", icon: <RefreshCw size={18} /> },
];

const repNav: NavItem[] = [
  { id: "representative/dashboard", label: "لوحة تحكم المندوب", icon: <LayoutDashboard size={18} /> },
  { id: "representative/inventory", label: "مخزون المركبة", icon: <Package size={18} /> },
  { id: "representative/sale", label: "تسجيل فاتورة بيع", icon: <ShoppingCart size={18} /> },
  { id: "representative/history", label: "سجل المبيعات", icon: <List size={18} /> },
  { id: "representative/restock", label: "طلبات إعادة التعبئة", icon: <RefreshCw size={18} /> },
];

const accountantNav: NavItem[] = [
  { id: "accountant/ledger", label: "الرئيسيه", icon: <BookOpen size={18} /> },
  { id: "accountant/receivable", label: "الواردات", icon: <ArrowDownToLine size={18} /> },
  { id: "accountant/payable", label: "الصادرات", icon: <ArrowUpFromLine size={18} /> },
  { id: "accountant/payroll", label: "المرتبات", icon: <Wallet size={18} /> },
  { id: "accountant/employees", label: "العاملين  ", icon: <Users size={18} /> },
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
      : user?.role === "accountant"
        ? accountantNav
        : repNav;

  const roleLabel = user?.role === "manager" ? "المدير" : user?.role === "warehouse" ? "مدير المخزن" : user?.role === "accountant" ? "المحاسب" : "المندوب";
  const roleBadgeColor = user?.role === "manager" ? "bg-blue-500" : user?.role === "warehouse" ? "bg-emerald-500" : user?.role === "accountant" ? "bg-amber-500" : "bg-cyan-500";

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

            <p className="text-slate-500 text-xs px-2 mb-2 mt-6 uppercase tracking-wider">الإدارة المالية</p>
            <ul className="space-y-1">
              {accountantNav.map((item) => {
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