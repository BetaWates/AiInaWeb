import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcurement } from "../../contexts";
import type { Role } from "../../types";
import { useLanguage  } from "../../contexts";
import { useTheme  } from "../../contexts";
import { ArrowRight, ShieldAlert, Globe, Sun, Moon, Eye, EyeOff } from "lucide-react";
import logo from "../../logo.png";

export function Login() {
  const navigate = useNavigate();
  const { login } = useProcurement();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("employee@corp.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("Employee");
  const [showPassword, setShowPassword] = useState(false);

  const testAccounts = [
    { email: "employee@corp.com", role: "Employee" as Role, label: "Employee (Requisitioner)" },
    { email: "approver@corp.com", role: "Approver" as Role, label: "Approver (Finance/Mgr)" },
    { email: "purchasing@corp.com", role: "Purchasing" as Role, label: "Purchasing Officer" },
    { email: "admin@corp.com", role: "Admin" as Role, label: "System Administrator" },
  ];

  const handleTestAccountSelect = (acc: typeof testAccounts[0]) => {
    setEmail(acc.email);
    setSelectedRole(acc.role);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simulate login via Procurement Context
    const success = login(email, selectedRole);

    if (success) {
      // Redirect based on role
      const redirectMap: Record<Role, string> = {
        Employee: "/employee/dashboard",
        Purchasing: "/purchasing/dashboard",
        Approver: "/approver/dashboard",
        Admin: "/admin/dashboard",
      };
      navigate(redirectMap[selectedRole]);
    } else {
      setError(t("login.invalid"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row transition-colors duration-200">
      {/* Top action bar for Theme/Language in Login */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <Globe className="w-4 h-4" />
          <span>{language}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Left visual side */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-zinc-100 flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-800">
        {/* Glow effect */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-zinc-800/10 blur-[120px]" />
        
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="AIINA Logo"
            className="h-10 object-contain select-none"
          />
          <span className="font-bold text-xl tracking-tight text-white">PT Alpha Innovatech Indonesia</span>
        </div>

        <div className="space-y-6 max-w-lg z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Procurement &amp; Procurement Requisition Management Platform
          </h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Streamlining corporate purchasing from request to release. An integrated workflow-driven system supporting multiple organizational layers, real-time approval pipelines, and full audit logs.
          </p>
        </div>

        <div className="text-zinc-500 text-xs z-10">
          © 2026 PT Alpha Innovatech Indonesia. All rights reserved.
        </div>
      </div>

      {/* Right Login form side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Brand header on mobile */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <img
              src={logo}
              alt="AIINA Logo"
              className="h-10 object-contain mb-3 select-none"
            />
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
              PT Alpha Innovatech Indonesia
            </h2>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              {t("login.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("portal.subtitle")}
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  {t("login.userID")}
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-border bg-card py-2.5 px-3.5 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  {t("login.password")}
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-border bg-card py-2.5 pl-3.5 pr-11 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-r-lg"
                    tabIndex={0}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                      : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Role Selection (Crucial for simulation) */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t("login.role")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {testAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleTestAccountSelect(acc)}
                      className={`text-left p-2.5 border rounded-lg text-xs transition-all ${
                        selectedRole === acc.role
                          ? "border-primary bg-primary/5 font-semibold text-foreground ring-1 ring-primary"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-card"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-muted-foreground select-none">
                    {t("login.remember")}
                  </label>
                </div>

                <div className="text-xs">
                  <a href="#" className="font-semibold text-muted-foreground hover:text-foreground">
                    {t("login.forgot")}
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-md hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-150 cursor-pointer"
                >
                  <span>{t("login.button")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
