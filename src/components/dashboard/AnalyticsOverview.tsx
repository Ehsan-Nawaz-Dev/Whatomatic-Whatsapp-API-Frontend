import { motion } from "framer-motion";
import { BarChart3, MessageCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, getCurrentShop } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const AnalyticsOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", getCurrentShop()],
    queryFn: fetchAnalytics,
  });

  const messagesSent = data?.messagesSent ?? 0;
  const recoveredCarts = data?.recoveredCarts ?? 0;
  const confirmedOrders = data?.confirmedOrders ?? 0;
  const responseRate = data?.responseRate ?? 0;
  const recoveryRate = data?.recoveryRate ?? 0;
  const periodDays = data?.periodDays ?? 30;

  const chartData = data?.dailyStats?.map(stat => ({
    name: new Date(stat.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    count: stat.count
  })) || [];

  const cards = [
    {
      label: "WhatsApp messages sent",
      value: messagesSent.toLocaleString(),
      sub: `Last ${periodDays} days`,
      icon: MessageCircle,
    },
    {
      label: "Recovered carts",
      value: recoveredCarts.toLocaleString(),
      sub: `${recoveryRate}% recovery rate`,
      icon: ShoppingCart,
    },
    {
      label: "Orders confirmed via WhatsApp",
      value: confirmedOrders.toLocaleString(),
      sub: `${responseRate}% response rate`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-3 lg:space-y-4 xl:space-y-6">
      <div>
        <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">Analytics Overview</h1>
        <p className="text-muted-foreground mt-0.5 lg:mt-1 text-xs lg:text-sm">
          Track your WhatsApp messaging performance and order impact.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-[10px] xl:text-xs text-muted-foreground animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Updating analytics...
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-3 xl:gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-xl border border-border" />
          ))
        ) : (
          cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 lg:p-4 xl:p-5 bg-card rounded-xl border border-border shadow-card"
            >
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-lg xl:rounded-xl bg-accent flex items-center justify-center">
                  <card.icon className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-primary" />
                </div>
                <p className="text-[10px] lg:text-xs xl:text-sm text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">{card.sub}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Daily Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-3 lg:p-4 xl:p-6 bg-card rounded-xl border border-border shadow-card"
      >
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4 xl:mb-6">
          <div className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-lg bg-accent flex items-center justify-center">
            <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm lg:text-base text-foreground">30 Days Activity</h2>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Messages sent per day for the last 30 days</p>
          </div>
        </div>

        <div className="h-[180px] lg:h-[220px] xl:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                dy={10}
                interval={Math.ceil(chartData.length / 7)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={undefined}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-3 lg:p-4 xl:p-6 bg-accent/40 rounded-xl border border-border"
      >
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-lg bg-card flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm lg:text-base text-foreground">Conversion funnel</h2>
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              Based on recent {periodDays} days of WhatsApp activity.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 text-sm">
          <div>
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Abandoned checkouts</p>
            <p className="text-base lg:text-lg xl:text-xl font-semibold">{data?.abandonedCheckouts ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Messages delivered</p>
            <p className="text-base lg:text-lg xl:text-xl font-semibold">{data?.delivered ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Replies received</p>
            <p className="text-base lg:text-lg xl:text-xl font-semibold">{data?.replies ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Recovered orders</p>
            <p className="text-base lg:text-lg xl:text-xl font-semibold">{recoveredCarts}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsOverview;
