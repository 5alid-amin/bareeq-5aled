import React, { useState } from "react";
import { Warehouse, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("manager@detergents.eg");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<UserRole>("manager");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password, role);
      setLoading(false);
    }, 800);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Warehouse size={32} className="text-white" />
            </div>
            <h1 className="text-white text-xl mb-1">نظام إدارة التوزيع</h1>
            <p className="text-blue-200 text-sm">بريق للمنظفات والمساحيق</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <h2 className="text-slate-700 text-lg mb-6">تسجيل الدخول</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">نوع المستخدم</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setRole(r);
                      if (r === "manager") setEmail("manager@bareeq.eg");
                      else if (r === "warehouse") setEmail("warehouse@bareeq.eg");
                      else setEmail("van1@bareeq.eg");
                    }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="manager">المدير</option>
                    <option value="warehouse">مدير المخزن</option>
                    <option value="representative">المندوب</option>
                  </select>
                  <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.sa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جارٍ تسجيل الدخول...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            {/* Quick access hint */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs text-center mb-2">حسابات تجريبية</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setRole("manager"); setEmail("manager@detergents.eg"); setPassword("123456"); }}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-lg py-2 px-3 hover:bg-blue-100 transition-colors"
                >
                  🧑‍💼 المدير
                </button>
                <button
                  onClick={() => { setRole("warehouse"); setEmail("warehouse@detergents.eg"); setPassword("123456"); }}
                  className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg py-2 px-3 hover:bg-emerald-100 transition-colors"
                >
                  📦 مدير المخزن
                </button>
                <button
                  onClick={() => { setRole("representative"); setEmail("van1@detergents.eg"); setPassword("123456"); }}
                  className="text-xs bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg py-2 px-3 hover:bg-cyan-100 transition-colors"
                >
                  🚚 المندوب
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          © 2026 بريق للمنظفات والمساحيق — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
