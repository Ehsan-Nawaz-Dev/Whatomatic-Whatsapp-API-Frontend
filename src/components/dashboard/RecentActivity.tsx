import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, ShoppingCart } from "lucide-react";
import { fetchActivity, fetchSettings, getCurrentShop } from "@/lib/api";

const typeConfig: Record<string, { icon: any; iconColor: string; bgColor: string }> = {
  confirmed: { icon: CheckCircle2, iconColor: "text-success", bgColor: "bg-success/10" },
  cancelled: { icon: XCircle, iconColor: "text-destructive", bgColor: "bg-destructive/10" },
  recovered: { icon: ShoppingCart, iconColor: "text-primary", bgColor: "bg-primary/10" },
  pending: { icon: Clock, iconColor: "text-warning", bgColor: "bg-warning/10" },
  failed: { icon: XCircle, iconColor: "text-destructive", bgColor: "bg-destructive/10" },
};

const RecentActivity = () => {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity", getCurrentShop()],
    queryFn: fetchActivity,
  });

  const { data: settings } = useQuery({
    queryKey: ["merchant-settings", getCurrentShop()],
    queryFn: fetchSettings,
  });

  const pendingLabel = settings?.pendingConfirmTag || "Pending Confirmation";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-3 lg:p-4 xl:p-6 bg-card rounded-xl border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-3 lg:mb-4 xl:mb-6">
        <h2 className="text-sm lg:text-base xl:text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="flex items-center gap-2">
          {isLoading && <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground animate-spin" />}
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["activity", getCurrentShop()] })}
            className="text-[10px] lg:text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4 max-h-[280px] lg:max-h-[350px] xl:max-h-[400px] overflow-y-auto pr-1 lg:pr-2 custom-scrollbar">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        )}
        {!isLoading && activities.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        )}
        {!isLoading && activities.map((activity: any, index: number) => {
          const cfg = typeConfig[activity.type] || typeConfig.pending;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={activity._id ?? index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-2.5 lg:gap-3 p-2 lg:p-3 rounded-lg hover:bg-muted/50 transition-colors ${activity.type === 'pending' ? 'animate-pulse' : ''}`}
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${cfg.bgColor} flex items-center justify-center flex-shrink-0 relative`}>
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${cfg.iconColor}`} />
                {activity.type === 'pending' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-warning rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs lg:text-sm font-medium text-foreground truncate">
                    {activity.message || `Order Notification`}
                  </p>
                  {activity.type === 'pending' && (
                    <span className="text-[9px] lg:text-[10px] bg-warning/20 text-warning px-1 lg:px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{pendingLabel}</span>
                  )}
                  {activity.type === 'failed' && (
                    <span className="text-[9px] lg:text-[10px] bg-destructive/20 text-destructive px-1 lg:px-1.5 py-0.5 rounded-full font-bold">FAILED</span>
                  )}
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  {activity.customerName || "No Name Provided"} • {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
