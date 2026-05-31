import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/Layout";
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { FleetManagement } from "./pages/manager/FleetManagement";
import { VanDetails } from "./pages/manager/VanDetails";
import { VehicleTracking } from "./pages/manager/VehicleTracking";
import { UserManagement } from "./pages/manager/UserManagement";
import { Reports } from "./pages/manager/Reports";
import { WarehouseDashboard } from "./pages/warehouse/WarehouseDashboard";
import { InventoryPage } from "./pages/warehouse/InventoryPage";
import { VehicleLoadingPage } from "./pages/warehouse/VehicleLoadingPage";
import { ReturnsPage } from "./pages/warehouse/ReturnsPage";
import { VehicleDiscrepancyPage } from "./pages/warehouse/VehicleDiscrepancyPage";
import { ReorderAlertsPage } from "./pages/warehouse/ReorderAlertsPage";

// New Pages
import { RepresentativeDashboard } from "./pages/representative/RepresentativeDashboard";
import { VehicleInventory } from "./pages/representative/VehicleInventory";
import { RecordSale } from "./pages/representative/RecordSale";
import { SalesHistory } from "./pages/representative/SalesHistory";
import { PayrollPage } from "./pages/manager/PayrollPage";
import { RestockRequestPage } from "./pages/representative/RestockRequestPage";
import { RestockManagementPage } from "./pages/warehouse/RestockManagementPage";
import { StockMovementsPage } from "./pages/warehouse/StockMovementsPage";
import { GeneralLedgerPage } from "./pages/accountant/GeneralLedgerPage";
import { AccountsReceivablePage } from "./pages/accountant/AccountsReceivablePage";
import { AccountsPayablePage } from "./pages/accountant/AccountsPayablePage";
import { AccountantPayrollPage } from "./pages/accountant/AccountantPayrollPage";
import EmployeesPage from "./pages/accountant/employees";

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Set default page based on role
  const defaultPage = user?.role === "manager"
    ? "manager/dashboard"
    : user?.role === "warehouse"
      ? "warehouse/dashboard"
      : user?.role === "accountant"
        ? "accountant/ledger"
        : "representative/dashboard";
  const currentPage = location.pathname.slice(1) || defaultPage;

  // Navigate to role-specific default page whenever user (or their role) changes
  useEffect(() => {
    if (user) {
      // Only redirect to default if we're at root or on another role's path
      const currentRole = location.pathname.split("/")[1]; // e.g. "manager", "warehouse", ...
      const ownedRoles = ["manager", "warehouse", "representative", "accountant"];
      
      // Allow manager to access manager, warehouse, and accountant paths
      const allowedRolesForUser = user.role === "manager"
        ? ["manager", "warehouse", "accountant"]
        : [user.role.split("/")[0]];

      const isOnOwnPage = (ownedRoles.includes(currentRole) && allowedRolesForUser.includes(currentRole))
        || location.pathname.startsWith(`/${user.role.split("/")[0]}`)
        || location.pathname === "/";

      if (!isOnOwnPage) {
        navigate(`/${defaultPage}`, { replace: true });
      } else if (location.pathname === "/") {
        navigate(`/${defaultPage}`, { replace: true });
      }
    }
  }, [user?.id, navigate, location.pathname, defaultPage]); // trigger on user, path, or defaultPage changes

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page: string, vanId?: string) => {
    if (vanId) {
      navigate(`/${page}/${vanId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  const VanDetailsWrapper = () => {
    const params = useParams();
    return <VanDetails vanId={params.vanId || "VAN-001"} onNavigate={handleNavigate} />;
  };

  return (
    <Layout activePage={currentPage} onNavigate={handleNavigate}>
      <Routes>
        {/* Manager pages */}
        <Route path="/manager/dashboard" element={<ManagerDashboard onNavigate={handleNavigate} />} />
        <Route path="/manager/fleet" element={<FleetManagement onNavigate={handleNavigate} />} />
        <Route path="/manager/van-details/:vanId" element={<VanDetailsWrapper />} />
        <Route path="/manager/tracking" element={<VehicleTracking />} />
        <Route path="/manager/users" element={<UserManagement />} />
        <Route path="/manager/payroll" element={<PayrollPage />} />
        <Route path="/manager/reports" element={<Reports />} />

        {/* Warehouse pages */}
        <Route path="/warehouse/dashboard" element={<WarehouseDashboard onNavigate={handleNavigate} />} />
        <Route path="/warehouse/inventory" element={<InventoryPage />} />
        <Route path="/warehouse/discrepancy" element={<VehicleDiscrepancyPage />} />
        <Route path="/warehouse/transfers" element={<VehicleLoadingPage />} />
        <Route path="/warehouse/returns" element={<ReturnsPage />} />
        <Route path="/warehouse/reorder" element={<ReorderAlertsPage />} />
        <Route path="/warehouse/restock" element={<RestockManagementPage />} />
        <Route path="/warehouse/movements" element={<StockMovementsPage />} />

        {/* Representative pages */}
        <Route path="/representative/dashboard" element={<RepresentativeDashboard onNavigate={handleNavigate} />} />
        <Route path="/representative/inventory" element={<VehicleInventory onNavigate={handleNavigate} />} />
        <Route path="/representative/sale" element={<RecordSale />} />
        <Route path="/representative/history" element={<SalesHistory />} />
        <Route path="/representative/restock" element={<RestockRequestPage />} />

        {/* Accountant pages */}
        <Route path="/accountant/ledger" element={<GeneralLedgerPage />} />
        <Route path="/accountant/receivable" element={<AccountsReceivablePage />} />
        <Route path="/accountant/payable" element={<AccountsPayablePage />} />
        <Route path="/accountant/payroll" element={<AccountantPayrollPage />} />
        <Route path="/accountant/employees" element={<EmployeesPage />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={`/${defaultPage}`} replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}