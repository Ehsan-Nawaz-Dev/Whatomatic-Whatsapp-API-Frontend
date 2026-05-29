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
      <div className="border-b border-border flex items-center justify-between">
        <div
          role="img"
          aria-label="Whatomatic"
          style={{
            backgroundImage: "url('/whatomatic%20logo%20PNG-02.png')",
            backgroundSize: '95% auto',
            backgroundPosition: 'center 42%',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '55px',
          }}
        />
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-2 right-2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground z-10"
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

      {/* Footer Area with Socials, Rate & Support */}
      <div className="p-4 border-t border-border mt-auto shrink-0 bg-background/50">
        <a
          href="https://apps.shopify.com/whatomatic-whatsapp-automation-1#modal-show=WriteReviewModal"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 mb-3 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Give us a Rating
        </a>

        <a
          href="https://wa.me/14063160653"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          WhatsApp Us
        </a>

        <div className="flex justify-center gap-4">
          <a href="https://www.instagram.com/whatomatic/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E1306C] transition-colors" title="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61586164251235" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors" title="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </a>
          <a href="https://pk.linkedin.com/company/whatomatic" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors" title="LinkedIn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-2 left-3 z-50 p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-foreground" />
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
          w-[260px] lg:w-56 xl:w-64 2xl:w-72
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
