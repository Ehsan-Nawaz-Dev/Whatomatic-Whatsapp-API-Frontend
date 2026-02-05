import { Bell, Search, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  billing?: {
    plan: string;
    trialLimit?: number;
    trialUsage?: number;
    shopName?: string;
  };
}

const DashboardHeader = ({ billing }: DashboardHeaderProps) => {
  const isTrial = billing?.plan === 'trial';
  const remaining = (billing?.trialLimit || 10) - (billing?.trialUsage || 0);

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {isTrial && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Trial: {remaining} messages left</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{billing?.shopName || "My Store"}</p>
            <p className="text-xs text-muted-foreground capitalize">{billing?.plan || "Free Plan"}</p>
          </div>
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
