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
    { id: "settings", label: "Settings", icon: Settings },
    { id: "billing", label: "Billing", icon: Cloud },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center shadow-md">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">WhatFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => !item.locked && setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${item.locked ? 'opacity-50 cursor-not-allowed' : (activeTab === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
                {item.locked && <Lock className="w-3.5 h-3.5" />}
              </button>
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
