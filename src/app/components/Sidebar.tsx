import React, { useState } from "react";
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
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const managerNav: NavItem[] = [
  { id: "manager/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "manager/fleet", label: "إدارة المركبات", icon: <Truck size={18} /> },
  { id: "manager/tracking", label: "تتبع المركبات", icon: <MapPin size={18} /> },
  { id: "manager/users", label: "إدارة المستخدمين", icon: <Users size={18} /> },
  { id: "manager/reports", label: "التقارير والتحليلات", icon: <BarChart3 size={18} /> },
];

const warehouseNav: NavItem[] = [
  { id: "warehouse/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
  { id: "warehouse/inventory", label: "المخزون الرئيسي", icon: <Package size={18} /> },
  { id: "warehouse/movements", label: "حركات المخزون", icon: <ArrowLeftRight size={18} /> },
  { id: "warehouse/discrepancy", label: "مراجعة مخزون المركبات", icon: <ClipboardList size={18} /> },
  { id: "warehouse/transfers", label: "مخزون السيارات", icon: <Truck size={18} /> },
  { id: "warehouse/returns", label: "مرتجع", icon: <RotateCcw size={18} /> },
  { id: "warehouse/reorder", label: "تزويد المخزن", icon: <AlertTriangle size={18} /> },
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
  { id: "accountant/payable", label: "المصروفات", icon: <ArrowUpFromLine size={18} /> },
  { id: "accountant/payroll", label: "المرتبات", icon: <Wallet size={18} /> },
  { id: "accountant/employees", label: "العاملين  ", icon: <Users size={18} /> },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string, vanId?: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  const navItems = user?.role === "manager"
    ? managerNav
    : user?.role === "warehouse"
      ? warehouseNav
      : user?.role === "accountant"
        ? accountantNav
        : repNav;

  const roleLabel = user?.role === "manager" ? "المدير" : user?.role === "warehouse" ? "مدير المخزن" : user?.role === "accountant" ? "المحاسب" : "المندوب";
  const roleBadgeColor = user?.role === "manager" ? "bg-blue-500" : user?.role === "warehouse" ? "bg-emerald-500" : user?.role === "accountant" ? "bg-amber-500" : "bg-cyan-500";

  const NavList = ({ items, title }: { items: NavItem[], title?: string }) => (
    <>
      {title && !isCollapsed && (
        <p className="text-slate-500 text-xs px-2 mb-2 mt-6 uppercase tracking-wider transition-opacity duration-200">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activePage === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-right ${isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-slate-900 flex flex-col h-full shadow-xl flex-shrink-0 transition-all duration-300 relative`}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-10 bg-blue-600 text-white rounded-full p-1 shadow-lg border-2 border-slate-900 hover:bg-blue-500 transition-colors z-50"
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-slate-700 overflow-hidden">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Warehouse size={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <p className="text-white text-sm font-semibold leading-tight">بريق للمنظفات</p>
              <p className="text-blue-400 text-xs leading-tight">والمساحيق</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-slate-700 overflow-hidden">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm flex-shrink-0">
            {user?.avatar}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <p className="text-white text-sm truncate">{user?.name}</p>
              <span className={`inline-block text-white text-xs px-2 py-0.5 rounded-full mt-0.5 ${roleBadgeColor}`}>
                {roleLabel}
              </span>
              {user?.role === "representative" && user.vehicleName && (
                <p className="text-cyan-300 text-xs mt-1 truncate">🚚 {user.vehicleName}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <p className="text-slate-500 text-xs px-2 mb-2 uppercase tracking-wider">القائمة الرئيسية</p>
        )}
        
        <NavList items={navItems} />

        {user?.role === "manager" && (
          <>
            <NavList items={warehouseNav} title="إدارة المخزن" />
            <NavList items={accountantNav} title="الإدارة المالية" />
          </>
        )}

        {/* Logout Section */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          {!isCollapsed && (
            <p className="text-slate-500 text-xs px-2 mb-2 uppercase tracking-wider">النظام</p>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? "تسجيل الخروج" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-150 ${isCollapsed ? "justify-center px-2" : "text-right"}`}
          >
            <LogOut size={18} className="text-slate-500" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-5 py-3 border-t border-slate-700">
          <p className="text-slate-600 text-xs text-center whitespace-nowrap">v2.1.0 — © 2026 بريق</p>
        </div>
      )}
    </aside>
  );
}