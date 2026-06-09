import React, { useState } from "react";
import { useProcurement } from "../../contexts";
import { useLanguage  } from "../../contexts";
import { useTheme  } from "../../contexts";
import { User, Shield, Moon, Sun, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export function Settings() {
  const { currentUser } = useProcurement();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("profile");
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground">{t("settings.title")}</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure profile settings, regional formats and system display preferences.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile configuration saved successfully.</span>
        </div>
      )}

      {/* Settings Grid Panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm min-h-[400px]">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 md:p-6 bg-sidebar/20">
          <nav className="flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "preferences" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>System Preferences</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-foreground">User Profile Information</h3>
              
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-extrabold border border-primary/20 shadow-inner">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{currentUser?.name}</h4>
                  <p className="text-xs text-muted-foreground">{currentUser?.role} Account</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Business Department</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.department || "Unassigned"}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground outline-none cursor-not-allowed"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="cursor-pointer">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* SYSTEM PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-foreground">System Preferences</h3>
              
              <div className="space-y-4">
                {/* Theme Selector */}
                <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground">Display Theme Mode</h4>
                    <p className="text-[10px] text-muted-foreground">Select light gray mode or default corporate dark mode styling.</p>
                  </div>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Language Switcher */}
                <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground">Operational Language</h4>
                    <p className="text-[10px] text-muted-foreground">Select dynamic system language translation preference.</p>
                  </div>
                  <div className="flex gap-1.5 border border-border p-1 bg-background rounded-lg">
                    <button
                      onClick={() => setLanguage("EN")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        language === "EN" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage("ID")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        language === "ID" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Indonesia
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
