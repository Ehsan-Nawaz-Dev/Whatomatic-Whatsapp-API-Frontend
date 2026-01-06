import { motion } from "framer-motion";
import { Zap, ShoppingCart, MessageSquare, Truck, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAutomationsStats, toggleAutomation } from "@/lib/api";
import { toast } from "sonner";

const automations = [
    {
        id: "abandoned-cart",
        title: "Abandoned Cart Recovery",
        description: "Send reminders to customers who leave items in their cart.",
        icon: ShoppingCart,
        stats: { sent: 124, recovered: 28, revenue: "$1,420" },
        enabled: true,
    },
    {
        id: "order-confirmation",
        title: "Order Confirmation",
        description: "Send a WhatsApp message as soon as an order is placed.",
        icon: MessageSquare,
        stats: { sent: 450, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "shipping-update",
        title: "Shipping Alerts",
        description: "Notify customers when their order is shipped or out for delivery.",
        icon: Truck,
        stats: { sent: 312, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "cancellation",
        title: "Order Cancellation",
        description: "Automatically inform customers if their order is cancelled.",
        icon: XCircle,
        stats: { sent: 12, recovered: null, revenue: null },
        enabled: true,
    },
];

const AutomationsOverview = () => {
    const queryClient = useQueryClient();
    const { data: statsData, isLoading } = useQuery({
        queryKey: ["automations-stats"],
        queryFn: fetchAutomationsStats,
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const toggleMut = useMutation({
        mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleAutomation(id, enabled),
        onSuccess: (_, variables) => {
            const status = variables.enabled ? "enabled" : "disabled";
            toast.success(`Automation ${status} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["automations-stats"] });
        },
        onError: () => {
            toast.error("Failed to update automation status");
        }
    });

    const handleToggle = (id: string, currentStatus: boolean) => {
        toggleMut.mutate({ id, enabled: !currentStatus });
    };

    // Merge API stats with local automation definitions
    const displayAutomations = automations.map(flow => {
        const statsArray = Array.isArray(statsData) ? statsData : [];
        const apiStat = statsArray.find((s: any) => s.id === flow.id);
        const isEnabled = apiStat?.enabled ?? flow.enabled;

        return {
            ...flow,
            enabled: isEnabled,
            stats: apiStat ? {
                sent: apiStat.sent || 0,
                recovered: apiStat.recovered || 0,
                revenue: apiStat.revenue ? `$${apiStat.revenue.toLocaleString()}` : (flow.stats.revenue || "$0")
            } : flow.stats
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">WhatsApp Automations</h1>
                    <p className="text-muted-foreground mt-1">
                        Increase conversions and keep customers updated with automated flows.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground">Loading automation stats...</div>
                ) : displayAutomations.map((flow, index) => (
                    <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 bg-card rounded-2xl border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-primary/30 ${!flow.enabled && "opacity-75 grayscale-[0.5]"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${flow.enabled ? "gradient-primary shadow-lg shadow-primary/20" : "bg-muted"
                                }`}>
                                <flow.icon className={`w-7 h-7 ${flow.enabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                    {flow.title}
                                    {!flow.enabled && <Badge variant="secondary" className="text-[10px] font-normal">Disabled</Badge>}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-md">{flow.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 px-4 flex-wrap md:flex-nowrap">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sent</p>
                                <p className="text-xl font-bold">{flow.stats.sent}</p>
                            </div>
                            {flow.stats.recovered !== null && (
                                <>
                                    <div className="w-px h-10 bg-border hidden md:block" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recovered</p>
                                        <p className="text-xl font-bold text-emerald-500">{flow.stats.recovered}</p>
                                    </div>
                                </>
                            )}
                            {flow.stats.revenue !== null && (
                                <>
                                    <div className="w-px h-10 bg-border hidden md:block" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Revenue</p>
                                        <p className="text-xl font-bold text-emerald-500">{flow.stats.revenue}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm">Edit Template</Button>
                            <Switch
                                checked={flow.enabled}
                                onCheckedChange={() => handleToggle(flow.id, flow.enabled)}
                                disabled={toggleMut.isPending}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-6 bg-accent/30 rounded-2xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Zap className="text-primary w-6 h-6" />
                    <div>
                        <p className="font-bold">Missing an automation?</p>
                        <p className="text-sm text-muted-foreground">Request a custom flow for your shop.</p>
                    </div>
                </div>
                <Button variant="hero">Contact Support</Button>
            </div>
        </div>
    );
};

export default AutomationsOverview;
