import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  BarChart3,
  Bell,
  HelpCircle,
  MessageCircle,
  Users,
  Cloud
} from "lucide-react";

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
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, locked: !isSubscribed },
    { id: "automations", label: "Automations", icon: Bell, locked: !isSubscribed },
    { id: "contacts", label: "Contacts", icon: Users, locked: !isSubscribed },
    { id: "templates", label: "Templates", icon: MessageSquare, locked: !isSubscribed },
    { id: "analytics", label: "Analytics", icon: BarChart3, locked: !isSubscribed },
    { id: "chat-button", label: "Chat Button", icon: MessageCircle, locked: !isSubscribed },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "billing", label: "Billing", icon: Cloud },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <div className="transition-transform duration-300 hover:scale-[1.02]">
          <img
            src="/whatomatic-logo.svg"
            alt="Whatomatic"
            className="w-full h-auto max-h-11 object-contain block"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id} className="relative group">
              <button
                onClick={() => {
                  if (item.locked) return;
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${item.locked ? 'opacity-40 cursor-not-allowed' : (activeTab === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
                {item.locked && <Lock className="w-3.5 h-3.5 animate-pulse" />}
              </button>

              {/* Tooltip for locked items */}
              {item.locked && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    🔒 Please subscribe to a package
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
          <HelpCircle className="w-5 h-5" />
          Help & Support
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
