import { motion } from "framer-motion";
import { Zap, ShoppingCart, MessageSquare, Truck, XCircle, Bell, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAutomationsStats, toggleAutomation, fetchTemplates } from "@/lib/api";
import { toast } from "sonner";

const automations = [
    {
        id: "admin-order-alert",
        title: "Admin Order Alert",
        description: "Notify the admin immediately when a new order is received.",
        icon: Bell,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
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
        description: "Ask customers to confirm their order details via WhatsApp.",
        icon: MessageSquare,
        stats: { sent: 450, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "order-confirmed-reply",
        title: "Post-Confirmation Reply",
        description: "Send a beautiful thank you message after confirmation.",
        icon: Zap,
        stats: { sent: 432, recovered: null, revenue: null },
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
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedFlow, setSelectedFlow] = useState<any>(null);

    const queryClient = useQueryClient();
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ["automations-stats"],
        queryFn: fetchAutomationsStats,
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const { data: templates = [], isLoading: isTemplatesLoading } = useQuery({
        queryKey: ["templates"],
        queryFn: fetchTemplates,
    });

    const isLoading = isStatsLoading || isTemplatesLoading;

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

    // Merge API stats and actual template content with local automation definitions
    const displayAutomations = automations.map(flow => {
        const statsArray = Array.isArray(statsData) ? statsData : [];
        const apiStat = statsArray.find((s: any) => s.id === flow.id);

        // Find the actual template for this flow
        // Mapping flow.id to event keys
        const eventMap: Record<string, string> = {
            "admin-order-alert": "admin-order-alert",
            "abandoned-cart": "checkouts/abandoned",
            "order-confirmation": "orders/create",
            "order-confirmed-reply": "orders/confirmed",
            "shipping-update": "fulfillments/update",
            "cancellation": "orders/cancelled",
        };

        const template = templates.find((t: any) => t.event === eventMap[flow.id]);
        const isEnabled = apiStat?.enabled ?? flow.enabled;

        return {
            ...flow,
            enabled: isEnabled,
            template: template, // Include the real template data
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedFlow(flow);
                                    setPreviewOpen(true);
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                            <Switch
                                checked={flow.enabled}
                                onCheckedChange={() => handleToggle(flow.id, flow.enabled)}
                                disabled={toggleMut.isPending}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-none">
                    {selectedFlow && (
                        <div className="bg-[#f0f2f5] dark:bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                            {/* WhatsApp Header */}
                            <div className="bg-[#008069] p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <selectedFlow.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{selectedFlow.title}</h3>
                                    <p className="text-white/70 text-xs">Automation Service</p>
                                </div>
                            </div>

                            {/* Chat Body */}
                            <div className="p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain min-h-[400px]">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-[#1f2c33] p-4 rounded-xl rounded-tl-none shadow-sm max-w-[90%] border border-black/5 dark:border-white/5"
                                >
                                    <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-[#111b21] dark:text-[#e9edef]">
                                        {selectedFlow.template ? (
                                            // Show the actual user-created template
                                            selectedFlow.template.message
                                                .replace(/{{customer_name}}/g, "Ehsan")
                                                .replace(/{{order_number}}/g, "#1001")
                                                .replace(/{{store_name}}/g, "WhatFlow Store")
                                                .replace(/{{items_list}}/g, "1x Wireless Headphones - $199.99")
                                                .replace(/{{grand_total}}/g, "$214.99")
                                                .replace(/{{shipping_address}}/g, "123 Demo St")
                                                .replace(/{{city}}/g, "New York")
                                                .replace(/{{price}}/g, "$199.99")
                                                .replace(/{{payment_status}}/g, "Paid")
                                        ) : (
                                            // Fallback if no template is found
                                            "No template created yet for this automation. Please go to the Templates tab to create one."
                                        )}
                                    </div>
                                    <div className="text-[11px] text-[#667781] dark:text-[#8696a0] text-right mt-1">
                                        12:45 PM
                                    </div>
                                </motion.div>

                                {selectedFlow.template?.isPoll && selectedFlow.template?.pollOptions && (
                                    <div className="space-y-2 mt-4">
                                        <div className="flex flex-col gap-2">
                                            {selectedFlow.template.pollOptions.map((option: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="px-6 py-2 bg-white dark:bg-[#1f2c33] rounded-full text-[#008069] dark:text-[#53bdeb] text-sm font-bold shadow-sm border border-black/5 dark:border-white/5 text-center"
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AutomationsOverview;
