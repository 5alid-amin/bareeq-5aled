import React, { createContext, useContext, useState } from "react";

export type UserRole = "manager" | "warehouse" | "representative";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  assignedVanId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, AuthUser> = {
  "manager@bareeq.eg": {
    id: "USR-001",
    name: "عبدالله فؤاد الشافعي",
    email: "manager@bareeq.eg",
    role: "manager",
    avatar: "ع",
  },
  "warehouse@bareeq.eg": {
    id: "USR-002",
    name: "فهد عبد العزيز الصاوي",
    email: "warehouse@bareeq.eg",
    role: "warehouse",
    avatar: "ف",
  },
  "van1@bareeq.eg": {
    id: "USR-003",
    name: "أحمد محمد السعيد",
    email: "van1@bareeq.eg",
    role: "representative",
    avatar: "أ",
    assignedVanId: "VAN-001",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, _password: string, role: UserRole) => {
    const found = Object.values(MOCK_USERS).find((u) => u.role === role);
    if (found) {
      setUser(found);
    } else {
      let defaultName = "";
      let defaultAvatar = "";
      if (role === "manager") {
        defaultName = "عبدالله فؤاد الشافعي";
        defaultAvatar = "ع";
      } else if (role === "warehouse") {
        defaultName = "فهد عبد العزيز الصاوي";
        defaultAvatar = "ف";
      } else {
        defaultName = "أحمد محمد السعيد";
        defaultAvatar = "أ";
      }

      setUser({
        id: "TEMP-ID",
        name: defaultName,
        email,
        role,
        avatar: defaultAvatar,
        assignedVanId: role === "representative" ? "VAN-001" : undefined,
      });
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
