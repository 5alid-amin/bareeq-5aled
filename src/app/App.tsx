import React, { useState, useEffect } from "react";
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
import { AttendancePage } from "./pages/manager/AttendancePage";
import { PayrollPage } from "./pages/manager/PayrollPage";
import { RestockRequestPage } from "./pages/representative/RestockRequestPage";
import { RestockManagementPage } from "./pages/warehouse/RestockManagementPage";
import { GeneralLedgerPage } from "./pages/accountant/GeneralLedgerPage";
import { AccountsReceivablePage } from "./pages/accountant/AccountsReceivablePage";
import { AccountsPayablePage } from "./pages/accountant/AccountsPayablePage";
import { AccountantPayrollPage } from "./pages/accountant/AccountantPayrollPage";

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>("");
  const [activeVanId, setActiveVanId] = useState<string>("VAN-001");

  // Reset page when user/role changes
  useEffect(() => {
    setActivePage("");
  }, [user?.role]);

  // Set default page based on role
  const defaultPage = user?.role === "manager"
    ? "dashboard"
    : user?.role === "warehouse"
      ? "wh-dashboard"
      : user?.role === "accountant"
        ? "acc-ledger"
        : "rep-dashboard";
  const currentPage = activePage || defaultPage;

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page: string, vanId?: string) => {
    setActivePage(page);
    if (vanId) setActiveVanId(vanId);
  };

  const renderPage = () => {
    switch (currentPage) {
      // Manager pages
      case "dashboard":
        return <ManagerDashboard onNavigate={handleNavigate} />;
      case "fleet":
        return <FleetManagement onNavigate={handleNavigate} />;
      case "van-details":
        return <VanDetails vanId={activeVanId} onNavigate={handleNavigate} />;
      case "tracking":
        return <VehicleTracking />;
      case "users":
        return <UserManagement />;
      case "reports":
        return <Reports />;
      case "attendance":
        return <AttendancePage />;
      case "payroll":
        return <PayrollPage />;

      // Warehouse pages
      case "wh-dashboard":
        return <WarehouseDashboard onNavigate={handleNavigate} />;
      case "inventory":
        return <InventoryPage />;
      case "discrepancy":
        return <VehicleDiscrepancyPage />;
      case "transfers":
        return <VehicleLoadingPage />;
      case "returns":
        return <ReturnsPage />;
      case "reorder":
        return <ReorderAlertsPage />;
      case "wh-restock":
        return <RestockManagementPage />;

      // Representative pages
      case "rep-dashboard":
        return <RepresentativeDashboard onNavigate={handleNavigate} />;
      case "rep-inventory":
        return <VehicleInventory onNavigate={handleNavigate} />;
      case "rep-restock":
        return <RestockRequestPage />;
      case "rep-sale":
        return <RecordSale />;
      case "rep-history":
        return <SalesHistory />;

      // Accountant pages
      case "acc-ledger":
        return <GeneralLedgerPage />;
      case "acc-receivable":
        return <AccountsReceivablePage />;
      case "acc-payable":
        return <AccountsPayablePage />;
      case "acc-payroll":
        return <AccountantPayrollPage />;

      default:
        return user.role === "manager"
          ? <ManagerDashboard onNavigate={handleNavigate} />
          : user.role === "warehouse"
            ? <WarehouseDashboard onNavigate={handleNavigate} />
            : user.role === "accountant"
              ? <GeneralLedgerPage />
              : <RepresentativeDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
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