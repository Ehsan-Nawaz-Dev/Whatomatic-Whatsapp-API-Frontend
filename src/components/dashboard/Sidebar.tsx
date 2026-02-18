import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  BarChart3,
  Bell,
  HelpCircle,
  MessageCircle,
  Users,
  Cloud,
  Menu,
  X,
  Zap
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSubscribed?: boolean;
}

const Lock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab, isSubscribed = false }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "automations", label: "Automations", icon: Zap, locked: !isSubscribed },
    { id: "contacts", label: "Contacts", icon: Users, locked: !isSubscribed },
    { id: "analytics", label: "Analytics", icon: BarChart3, locked: !isSubscribed },
    { id: "chat-button", label: "Chat Button", icon: MessageCircle, locked: !isSubscribed },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "billing", label: "Billing", icon: Cloud },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const handleNavClick = (id: string, locked?: boolean) => {
    if (locked) return;
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border flex items-center justify-between">
        <div className="transition-transform duration-300 hover:scale-[1.02] flex-1 min-w-0">
          <img
            src="/whatomatic-logo.svg"
            alt="Whatomatic"
            className="w-full h-auto max-h-11 object-contain block"
          />
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden ml-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id} className="relative group">
              <button
                onClick={() => handleNavClick(item.id, item.locked)}
                title={item.locked ? "🔒 Please subscribe to a package" : undefined}
                className={`w-full flex items-center justify-between px-2.5 lg:px-3 xl:px-4 py-2 lg:py-2 xl:py-2.5 rounded-lg text-xs lg:text-[13px] xl:text-sm font-medium transition-all duration-200 ${item.locked ? 'opacity-40 cursor-not-allowed' : (activeTab === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}`}
              >
                <div className="flex items-center gap-2 lg:gap-2 xl:gap-3 min-w-0">
                  <item.icon className="w-4 h-4 lg:w-[18px] lg:h-[18px] xl:w-5 xl:h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.locked && <Lock className="w-3.5 h-3.5 animate-pulse shrink-0" />}
              </button>

              {/* Tooltip for locked items - appears below */}
              {item.locked && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-[9999] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="relative bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                    🔒 Please subscribe to a package
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-card border border-border rounded-xl shadow-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile: slide-over, desktop: fixed */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto
          top-0 left-0 h-full
          w-[260px] lg:w-48 xl:w-56 2xl:w-64
          bg-card border-r border-border flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
