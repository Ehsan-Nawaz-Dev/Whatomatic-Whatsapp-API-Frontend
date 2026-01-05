import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, ShoppingCart } from "lucide-react";
import { fetchActivity } from "@/lib/api";

const typeConfig: Record<string, { icon: any; iconColor: string; bgColor: string }> = {
  confirmed: { icon: CheckCircle2, iconColor: "text-success", bgColor: "bg-success/10" },
  cancelled: { icon: XCircle, iconColor: "text-destructive", bgColor: "bg-destructive/10" },
  recovered: { icon: ShoppingCart, iconColor: "text-primary", bgColor: "bg-primary/10" },
  pending: { icon: Clock, iconColor: "text-warning", bgColor: "bg-warning/10" },
};

const RecentActivity = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchActivity,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 bg-card rounded-xl border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-4">
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
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.message || `Shopify event: ${activity.type}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.customerName || "Unknown customer"} • {new Date(activity.createdAt).toLocaleString()}
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
