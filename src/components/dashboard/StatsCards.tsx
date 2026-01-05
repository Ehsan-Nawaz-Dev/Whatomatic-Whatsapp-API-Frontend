import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, CheckCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";

const StatsCards = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const messagesSent = data?.messagesSent ?? 0;
  const recoveredCarts = data?.recoveredCarts ?? 0;
  const confirmedOrders = data?.confirmedOrders ?? 0;
  const responseRate = data?.responseRate ?? 0;

  const stats = [
    {
      label: "Messages Sent",
      value: messagesSent.toLocaleString(),
      change: "+12.5%",
      positive: true,
      icon: MessageCircle,
    },
    {
      label: "Carts Recovered",
      value: recoveredCarts.toLocaleString(),
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
    },
    {
      label: "Orders Confirmed",
      value: confirmedOrders.toLocaleString(),
      change: "+15.3%",
      positive: true,
      icon: CheckCircle,
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      change: "+3.1%",
      positive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.positive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
      {isLoading && stats.length === 0 && (
        <p className="text-xs text-muted-foreground">Loading overview...</p>
      )}
    </div>
  );
};

export default StatsCards;
