import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string, vanId?: string) => void;
}

export function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Sidebar on the RIGHT (first in RTL flow) */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}