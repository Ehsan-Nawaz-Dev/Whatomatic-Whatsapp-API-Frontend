import { motion } from "framer-motion";
import { Zap, ShoppingCart, MessageSquare, Truck, XCircle, Bell, Eye, Edit2, Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAutomationsStats, toggleAutomation, fetchTemplates, fetchSettings, getCurrentShop, updateTemplate, createTemplate } from "@/lib/api";
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
        id: "abandoned_cart",
        title: "Abandoned Cart Recovery",
        description: "Send reminders to customers who leave items in their cart.",
        icon: ShoppingCart,
        stats: { sent: 0, recovered: 0, revenue: "$0" },
        enabled: true,
    },
    {
        id: "order-confirmation",
        title: "Order Confirmation",
        description: "Ask customers to confirm their order details via WhatsApp.",
        icon: MessageSquare,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "order-confirmed-reply",
        title: "Post-Confirmation Reply",
        description: "Send a beautiful thank you message after confirmation.",
        icon: Zap,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "fulfillment_update",
        title: "Shipping Alerts",
        description: "Notify customers when their order is shipped or out for delivery.",
        icon: Truck,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "cancellation",
        title: "Order Cancellation",
        description: "Automatically inform customers if their order is cancelled.",
        icon: XCircle,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "cancellation-verify",
        title: "Cancellation Verification",
        description: "Ask customers to confirm before processing a cancellation.",
        icon: XCircle,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
];

const AutomationsOverview = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedFlow, setSelectedFlow] = useState<any>(null);
    const [editForm, setEditForm] = useState<any>({
        name: "",
        message: "",
        isPoll: false,
        pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"],
    });

    const queryClient = useQueryClient();
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ["automations-stats", getCurrentShop()],
        queryFn: fetchAutomationsStats,
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const { data: templates = [], isLoading: isTemplatesLoading } = useQuery({
        queryKey: ["templates", getCurrentShop()],
        queryFn: fetchTemplates,
    });

    const { data: settings } = useQuery({
        queryKey: ["merchant-settings", getCurrentShop()],
        queryFn: fetchSettings,
    });

    const isLoading = isStatsLoading || isTemplatesLoading;
    const storeName = settings?.storeName || "Your Store";

    const toggleMut = useMutation({
        mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleAutomation(id, enabled),
        onSuccess: (_, variables) => {
            const status = variables.enabled ? "enabled" : "disabled";
            toast.success(`Automation ${status} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["automations-stats", getCurrentShop()] });
        },
        onError: () => {
            toast.error("Failed to update automation status");
        }
    });

    const handleToggle = (id: string, currentStatus: boolean) => {
        toggleMut.mutate({ id, enabled: !currentStatus });
    };

    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateTemplate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates", getCurrentShop()] });
            setEditOpen(false);
            toast.success("Template updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update template");
        }
    });

    const createMut = useMutation({
        mutationFn: (data: any) => createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates", getCurrentShop()] });
            setEditOpen(false);
            toast.success("Template created successfully!");
        },
        onError: () => {
            toast.error("Failed to create template");
        }
    });

    const handleEditClick = (flow: any) => {
        setSelectedFlow(flow);
        if (flow.template) {
            setEditForm({
                id: flow.template._id,
                name: flow.template.name || flow.title,
                message: flow.template.message,
                isPoll: flow.template.isPoll || false,
                pollOptions: flow.template.pollOptions || ["✅Yes, Confirm✅", "❌No, Cancel❌"],
                event: flow.template.event,
                enabled: flow.template.enabled
            });
        } else {
            // Mapping flow.id to event keys
            const eventMap: Record<string, string> = {
                "admin-order-alert": "admin-order-alert",
                "abandoned_cart": "checkouts/abandoned",
                "order-confirmation": "orders/create",
                "order-confirmed-reply": "orders/confirmed",
                "fulfillment_update": "fulfillments/update",
                "cancellation": "orders/cancelled",
                "cancellation-verify": "orders/cancel_verify",
            };
            setEditForm({
                name: flow.title,
                message: "",
                isPoll: flow.id === "order-confirmation" || flow.id === "cancellation-verify",
                pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"],
                event: eventMap[flow.id],
                enabled: true
            });
        }
        setEditOpen(true);
    };

    const handleSaveTemplate = () => {
        if (!editForm.message.trim()) {
            toast.error("Message content is required");
            return;
        }

        if (editForm.id) {
            updateMut.mutate({ id: editForm.id, data: editForm });
        } else {
            createMut.mutate(editForm);
        }
    };

    // Merge API stats and actual template content with local automation definitions
    const displayAutomations = automations.map(flow => {
        const statsArray = Array.isArray(statsData) ? statsData : [];
        const apiStat = statsArray.find((s: any) => s.id === flow.id);

        // Find the actual template for this flow
        // Mapping flow.id to event keys
        const eventMap: Record<string, string> = {
            "admin-order-alert": "admin-order-alert",
            "abandoned_cart": "checkouts/abandoned",
            "order-confirmation": "orders/create",
            "order-confirmed-reply": "orders/confirmed",
            "fulfillment_update": "fulfillments/update",
            "cancellation": "orders/cancelled",
            "cancellation-verify": "orders/cancel_verify",
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
                        className={`p-4 lg:p-6 bg-card rounded-2xl border border-border shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 transition-all hover:border-primary/30 ${!flow.enabled && "opacity-75 grayscale-[0.5]"
                            }`}
                    >
                        <div className="flex items-start lg:items-center gap-4">
                            <div className={`w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-2xl flex items-center justify-center ${flow.enabled ? "gradient-primary shadow-lg shadow-primary/20" : "bg-muted"
                                }`}>
                                <flow.icon className={`w-6 h-6 lg:w-7 lg:h-7 ${flow.enabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-base lg:text-lg text-foreground flex items-center gap-2 flex-wrap">
                                    {flow.title}
                                    {!flow.enabled && <Badge variant="secondary" className="text-[10px] font-normal">Disabled</Badge>}
                                </h3>
                                <p className="text-xs lg:text-sm text-muted-foreground max-w-md line-clamp-2 md:line-clamp-none">{flow.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-8 px-0 lg:px-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <div className="space-y-1 shrink-0">
                                <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sent</p>
                                <p className="text-lg lg:text-xl font-bold">{flow.stats.sent}</p>
                            </div>
                            {flow.stats.recovered !== null && (
                                <>
                                    <div className="w-px h-8 lg:h-10 bg-border shrink-0" />
                                    <div className="space-y-1 shrink-0">
                                        <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recovered</p>
                                        <p className="text-lg lg:text-xl font-bold text-emerald-500">{flow.stats.recovered}</p>
                                    </div>
                                </>
                            )}
                            {flow.stats.revenue !== null && (
                                <>
                                    <div className="w-px h-8 lg:h-10 bg-border shrink-0" />
                                    <div className="space-y-1 shrink-0">
                                        <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Revenue</p>
                                        <p className="text-lg lg:text-xl font-bold text-emerald-500">{flow.stats.revenue}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 mt-2 lg:mt-0 pt-3 lg:pt-0 border-t border-border/50 lg:border-none">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 lg:h-9 text-xs"
                                    onClick={() => {
                                        setSelectedFlow(flow);
                                        setPreviewOpen(true);
                                    }}
                                >
                                    <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5" />
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 lg:h-9 text-xs"
                                    onClick={() => handleEditClick(flow)}
                                >
                                    <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5" />
                                    Edit
                                </Button>
                            </div>
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
                                                .replace(/{{customer_name}}/g, "John Doe")
                                                .replace(/{{order_number}}/g, "#1001")
                                                .replace(/{{store_name}}/g, storeName)
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

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit {selectedFlow?.title} Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="tmpl-message">Message Content</Label>
                            <Textarea
                                id="tmpl-message"
                                value={editForm.message}
                                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                                className="min-h-[200px]"
                                placeholder="Enter your WhatsApp message here..."
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Use placeholders like {"{{customer_name}}"}, {"{{order_number}}"}, etc.
                            </p>
                        </div>

                        {editForm.event !== "admin-order-alert" && (
                            <div className="space-y-4 pt-2 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-semibold">Send as Poll</Label>
                                        <p className="text-[11px] text-muted-foreground">Creates a WhatsApp poll with clickable buttons</p>
                                    </div>
                                    <Switch
                                        checked={editForm.isPoll}
                                        onCheckedChange={(checked) => setEditForm({ ...editForm, isPoll: checked })}
                                    />
                                </div>

                                {editForm.isPoll && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-xs font-medium">Poll Options (maximum 2 recommended)</Label>
                                        {editForm.pollOptions.map((opt: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...editForm.pollOptions];
                                                        newOpts[idx] = e.target.value;
                                                        setEditForm({ ...editForm, pollOptions: newOpts });
                                                    }}
                                                    placeholder={`Option ${idx + 1}`}
                                                    className="h-9"
                                                />
                                                {editForm.pollOptions.length > 2 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="px-2 text-destructive"
                                                        onClick={() => setEditForm({ ...editForm, pollOptions: editForm.pollOptions.filter((_: any, i: number) => i !== idx) })}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {editForm.pollOptions.length < 5 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-8 text-xs border-dashed"
                                                onClick={() => setEditForm({ ...editForm, pollOptions: [...editForm.pollOptions, ""] })}
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Add Option
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button
                            variant="hero"
                            onClick={handleSaveTemplate}
                            disabled={updateMut.isPending || createMut.isPending}
                        >
                            {updateMut.isPending || createMut.isPending ? "Saving..." : "Save Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AutomationsOverview;
