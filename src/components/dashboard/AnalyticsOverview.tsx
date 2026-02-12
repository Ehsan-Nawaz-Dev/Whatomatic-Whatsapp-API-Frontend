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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track how WhatFlow impacts your orders, recoveries, and confirmations.
          </p>
        </div>
        {isLoading && (
          <p className="text-xs text-muted-foreground">Loading analytics...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 bg-card rounded-xl border border-border shadow-card flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <card.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Activity Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-card rounded-xl border border-border shadow-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Daily Activity</h2>
            <p className="text-xs text-muted-foreground">Messages sent per day for the last 7 days</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-accent/40 rounded-xl border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Conversion funnel</h2>
            <p className="text-xs text-muted-foreground">
              Based on recent {periodDays} days of WhatsApp activity.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Abandoned checkouts</p>
            <p className="text-xl font-semibold">{data?.abandonedCheckouts ?? 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Messages delivered</p>
            <p className="text-xl font-semibold">{data?.delivered ?? 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Replies received</p>
            <p className="text-xl font-semibold">{data?.replies ?? 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Recovered orders</p>
            <p className="text-xl font-semibold">{recoveredCarts}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsOverview;
