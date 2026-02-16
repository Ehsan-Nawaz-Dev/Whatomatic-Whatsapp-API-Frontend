import { Bell, Search, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  billing?: {
    plan: string;
    status: string;
    usage?: number;
    limit?: number;
    shopName?: string;
  };
  onNavigateNotifications?: () => void;
}

const DashboardHeader = ({ billing, onNavigateNotifications }: DashboardHeaderProps) => {
  const isTrial = billing?.plan === 'trial';
  const isActive = billing?.status === 'active';
  const usage = billing?.usage || 0;
  const limit = billing?.limit || 10;
  const remaining = limit - usage;

  return (
    <header className="h-14 lg:h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between">
      {/* Search - push right on mobile to make room for hamburger */}
      <div className="flex-1 max-w-xs lg:max-w-md ml-10 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="w-full h-9 lg:h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4 ml-2">
        {isActive && (
          <div className={`hidden lg:flex items-center gap-2 px-2.5 xl:px-3 py-1.5 ${isTrial ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'} rounded-full border text-xs font-medium whitespace-nowrap`}>
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="capitalize">{billing?.plan || 'Plan'}: {remaining} left</span>
          </div>
        )}

        {/* Notifications */}
        <button
          onClick={onNavigateNotifications}
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
