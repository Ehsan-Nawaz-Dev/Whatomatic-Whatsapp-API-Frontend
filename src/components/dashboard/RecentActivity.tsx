import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, ShoppingCart } from "lucide-react";
import { fetchActivity } from "@/lib/api";

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
        <div className="flex items-center gap-2">
          {isLoading && <Clock className="w-4 h-4 text-muted-foreground animate-spin" />}
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["activity"] })}
            className="text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order</th>
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</th>
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="py-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading activity...</td>
              </tr>
            )}
            {!isLoading && activities.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No recent activity yet.</td>
              </tr>
            )}
            {!isLoading && activities.map((activity: any, index: number) => {
              const cfg = typeConfig[activity.type] || typeConfig.pending;
              const Icon = cfg.icon;

              // Robust Address Extraction
              const addr = activity.shippingAddress || activity.address ||
                activity.rawPayload?.shipping_address?.address1 ||
                activity.rawPayload?.billing_address?.address1 ||
                activity.rawPayload?.customer?.default_address?.address1 || "-";

              const city = activity.city ||
                activity.rawPayload?.shipping_address?.city ||
                activity.rawPayload?.billing_address?.city || "-";

              const total = activity.totalPrice ||
                activity.rawPayload?.total_price ||
                activity.rawPayload?.current_total_price || "-";

              const currency = activity.rawPayload?.currency || "";

              return (
                <motion.tr
                  key={activity._id ?? index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3 px-2">
                    <div className={`w-8 h-8 rounded-full ${cfg.bgColor} flex items-center justify-center relative`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                      {activity.type === 'pending' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-warning rounded-full border-2 border-card animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                      {activity.message?.includes("Order") ? (activity.rawPayload?.name || activity.orderId || "Order") : (activity.message || "Activity")}
                    </p>
                    {activity.orderId && <p className="text-[10px] text-muted-foreground font-mono">#{activity.orderId.slice(-6)}</p>}
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{activity.customerName || "No Name"}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.customerPhone?.slice(-10) || ""}</p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-[11px] text-foreground max-w-[120px] truncate font-medium" title={addr}>
                      {addr}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{city}</p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs font-bold text-primary">
                      {total !== "-" ? `${currency} ${total}` : "-"}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <p className="text-[10px] text-foreground font-medium">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentActivity;
