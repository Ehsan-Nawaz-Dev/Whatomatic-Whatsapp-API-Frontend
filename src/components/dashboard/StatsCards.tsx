import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, CheckCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, getCurrentShop } from "@/lib/api";

const StatsCards = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", getCurrentShop()],
    queryFn: fetchAnalytics,
  });

  const messagesSent = data?.messagesSent ?? 0;
  const recoveredCarts = data?.recoveredCarts ?? 0;
  const confirmedOrders = data?.confirmedOrders ?? 0;
  const responseRate = data?.responseRate ?? 0;

  const growth = data?.growth || { sent: 0, recovered: 0, confirmed: 0, responseRate: 0 };

  const stats = [
    {
      label: "Messages Sent",
      value: messagesSent.toLocaleString(),
      change: `${growth.sent > 0 ? '+' : ''}${growth.sent}%`,
      positive: growth.sent >= 0,
      icon: MessageCircle,
    },
    {
      label: "Carts Recovered",
      value: recoveredCarts.toLocaleString(),
      change: `${growth.recovered > 0 ? '+' : ''}${growth.recovered}%`,
      positive: growth.recovered >= 0,
      icon: ShoppingCart,
    },
    {
      label: "Orders Confirmed",
      value: confirmedOrders.toLocaleString(),
      change: `${growth.confirmed > 0 ? '+' : ''}${growth.confirmed}%`,
      positive: growth.confirmed >= 0,
      icon: CheckCircle,
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      change: `${growth.responseRate > 0 ? '+' : ''}${growth.responseRate}%`,
      positive: growth.responseRate >= 0,
      icon: TrendingUp,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card animate-pulse rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 xl:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 lg:p-4 xl:p-6 bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-2 lg:mb-3 xl:mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-lg xl:rounded-xl bg-accent flex items-center justify-center">
              <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-primary" />
            </div>
            <span
              className={`text-[10px] lg:text-xs font-medium px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full ${stat.positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
                }`}
            >
              {stat.change}
            </span>
          </div>
          <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground mb-0.5 lg:mb-1">{stat.value}</h3>
          <p className="text-[11px] lg:text-xs xl:text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
