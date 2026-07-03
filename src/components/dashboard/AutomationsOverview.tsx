import { motion } from "framer-motion";
import { Zap, ShoppingCart, MessageSquare, Truck, XCircle, Bell, Eye, Edit2, Trash2, Plus, X } from "lucide-react";
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
        id: "order-confirmation",
        title: "Order Confirmation",
        description: "Ask customers to confirm their order details via WhatsApp.",
        icon: MessageSquare,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: true,
    },
    {
        id: "bank-transfer-confirmation",
        title: "Bank Transfer Confirmation",
        description: "Send bank details and instructions to customers who choose bank transfer/deposit.",
        icon: MessageSquare,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "order-confirmed-reply",
        title: "Post-Confirmation Reply",
        description: "Send a beautiful thank you message after confirmation.",
        icon: Zap,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "cancellation",
        title: "Order Cancellation",
        description: "Automatically inform customers if their order is cancelled.",
        icon: XCircle,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "admin-order-alert",
        title: "Admin Order Alert",
        description: "Notify the admin immediately when a new order is received.",
        icon: Bell,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "admin-confirmed-alert",
        title: "Admin Order Confirmed Alert",
        description: "Notify the admin immediately when a customer confirms an order.",
        icon: Bell,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "abandoned_cart",
        title: "Abandoned Cart Recovery",
        description: "Send reminders to customers who leave items in their cart.",
        icon: ShoppingCart,
        stats: { sent: 0, recovered: 0, revenue: "$0" },
        enabled: false,
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
        id: "fulfillment_delivered",
        title: "Delivery Alerts",
        description: "Notify customers when their order is marked as delivered.",
        icon: Truck,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
    },
    {
        id: "cancellation-verify",
        title: "Cancellation Verification",
        description: "Ask customers to confirm before processing a cancellation.",
        icon: XCircle,
        stats: { sent: 0, recovered: null, revenue: null },
        enabled: false,
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
        sendingDelay: 0,
    });
    const [isCustomDelayMode, setIsCustomDelayMode] = useState(false);

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
            const existingDelay = flow.template.sendingDelay || 0;
            setIsCustomDelayMode(![0, 1, 5, 15, 30, 60, 120, 360, 720, 1440].includes(existingDelay));
            setEditForm({
                id: flow.template._id,
                name: flow.template.name || flow.title,
                message: flow.template.message,
                isPoll: flow.template.isPoll || false,
                pollOptions: flow.template.pollOptions || ["✅Yes, Confirm✅", "❌No, Cancel❌"],
                event: flow.template.event,
                enabled: flow.template.enabled,
                sendingDelay: existingDelay,
                targetOrderStatus: flow.template.targetOrderStatus || "all"
            });
        } else {
            // Mapping flow.id to event keys
            const eventMap: Record<string, string> = {
                "admin-order-alert": "admin-order-alert",
                "admin-confirmed-alert": "admin-confirmed-alert",
                "abandoned_cart": "checkouts/abandoned",
                "order-confirmation": "orders/create",
                "bank-transfer-confirmation": "orders/create/bank_transfer",
                "order-confirmed-reply": "orders/confirmed",
                "fulfillment_update": "fulfillments/update",
                "fulfillment_delivered": "fulfillments/delivered",
                "cancellation": "orders/cancelled",
                "cancellation-verify": "orders/cancel_verify",
            };

            const defaultMessages: Record<string, string> = {
                "order-confirmation": `Hi {{customer_name}}! 👋\n\nThank you for your order from {{store_name}}!\n\n📦 *Order:* {{order_number}}\n🛒 *Items:* {{items_list}}\n💰 *Total:* {{grand_total}}\n📍 *Address:* {{shipping_address}}, {{city}}\n\nPlease confirm if these details are correct.`,
                "bank-transfer-confirmation": `🏦 *Bank Transfer Instructions!*\n\nHi {{customer_name}},\n\nThank you for your order *{{order_number}}*. 🛍️\n\nTo complete your order, please transfer *{{grand_total}}* to our bank account:\n\n*Bank:* [Bank Name]\n*Account Title:* [Account Title]\n*Account/IBAN:* [Account Number]\n\nOnce transferred, please reply to this message with a screenshot/receipt of the transfer so we can confirm your order immediately! 📲\n\nThank you!\n- {{store_name}} Team`,
                "order-confirmed-reply": `🎉 *Thank You, {{customer_name}}!*\n\nYour order *{{order_number}}* is now being processed by *{{store_name}}*! 🚀\n\n✨ *What's next?*\n1. Our team is hand-picking your items. 📦\n2. We'll pack them with care. 🎀\n3. You'll get a tracking link via WhatsApp as soon as it ships! 🚚\n\nWe appreciate your business! If you have any questions, just reply to this message. 💬`,
                "cancellation": `Hi {{customer_name}},\n\nYour order {{order_number}} has been cancelled.\n\nIf this was a mistake, please contact us.\n\nThank you for shopping with {{store_name}}!`,
                "cancellation-verify": `Are you sure you want to cancel your order? ❌\n\nThis will stop your order from being processed immediately.`,
                "fulfillment_update": `Hi {{customer_name}}! 🚚\n\nGreat news! Your order {{order_number}} has been shipped via {{courier}}!\n\n📦 Tracking Number: {{tracking_number}}\n📍 Track your package: {{tracking_link}}\n\nThank you for shopping with {{store_name}}!`,
                "fulfillment_delivered": `Hi {{customer_name}}! 🚚\n\nYour order {{order_number}} has been delivered!\n\nThank you for shopping with {{store_name}}!`,
                "admin-order-alert": `🔔 *New Order Alert!*\n\nOrder: {{order_number}}\nCustomer: {{customer_name}}\nTotal: {{grand_total}}\nItems: {{items_list}}\nAddress: {{shipping_address}}, {{city}}`,
                "admin-confirmed-alert": `🔔 *Order Confirmed by Customer!*\n\nOrder {{order_number}} has been confirmed by customer {{customer_name}}! ✅\n\n*Items:*\n{{items_list}}\n\n*Grand Total:* {{grand_total}}\n\n*Shipping Address:*\n{{shipping_address}}, {{city}}`,
                "abandoned_cart": `Hi {{customer_name}}, you left something in your cart! 🛒\n\nClick here to finish your purchase: {{cart_link}}\n\nThank you for visiting {{store_name}}!`,
            };

            setIsCustomDelayMode(false);
            setEditForm({
                name: flow.title,
                message: defaultMessages[flow.id] || "",
                isPoll: flow.id === "order-confirmation" || flow.id === "cancellation-verify",
                pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"],
                event: eventMap[flow.id],
                enabled: false,
                sendingDelay: 0,
                targetOrderStatus: "all"
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
            "admin-confirmed-alert": "admin-confirmed-alert",
            "abandoned_cart": "checkouts/abandoned",
            "order-confirmation": "orders/create",
            "bank-transfer-confirmation": "orders/create/bank_transfer",
            "order-confirmed-reply": "orders/confirmed",
            "fulfillment_update": "fulfillments/update",
            "fulfillment_delivered": "fulfillments/delivered",
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
                    <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">WhatsApp Automations</h1>
                    <p className="text-muted-foreground mt-0.5 lg:mt-1 text-xs lg:text-sm">
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
                        className={`p-3 lg:p-4 xl:p-6 bg-card rounded-xl lg:rounded-2xl border border-border shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 xl:gap-6 transition-all hover:border-primary/30 ${!flow.enabled && "opacity-75 grayscale-[0.5]"
                            }`}
                    >
                        <div className="flex items-start lg:items-center gap-3 lg:gap-4">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 shrink-0 rounded-xl lg:rounded-2xl flex items-center justify-center ${flow.enabled ? "gradient-primary shadow-lg shadow-primary/20" : "bg-muted"
                                }`}>
                                <flow.icon className={`w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 ${flow.enabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm lg:text-base xl:text-lg text-foreground flex items-center gap-2 flex-wrap">
                                    {flow.title}
                                    {!flow.enabled && <Badge variant="secondary" className="text-[9px] lg:text-[10px] font-normal">Disabled</Badge>}
                                </h3>
                                <p className="text-[11px] lg:text-xs xl:text-sm text-muted-foreground max-w-md line-clamp-2 md:line-clamp-none">{flow.description}</p>
                            </div>
                        </div>

                        {/* Stats removed as per user request */}

                        <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-3 xl:gap-4 mt-1 lg:mt-0 pt-2 lg:pt-0 border-t border-border/50 lg:border-none">
                            <div className="flex gap-1.5 lg:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 lg:h-8 xl:h-9 text-[11px] lg:text-xs px-2 lg:px-3"
                                    onClick={() => {
                                        setSelectedFlow(flow);
                                        setPreviewOpen(true);
                                    }}
                                >
                                    <Eye className="w-3 h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 mr-1 lg:mr-1.5" />
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 lg:h-8 xl:h-9 text-[11px] lg:text-xs px-2 lg:px-3"
                                    onClick={() => handleEditClick(flow)}
                                >
                                    <Edit2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 mr-1 lg:mr-1.5" />
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
                <DialogContent hideClose className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-none">
                    {selectedFlow && (
                        <div className="bg-[#f0f2f5] dark:bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                            {/* WhatsApp Header */}
                            <div className="bg-[#008069] p-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <selectedFlow.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{selectedFlow.title}</h3>
                                        <p className="text-white/70 text-xs">Automation Service</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat Body */}
                            <div className="p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain min-h-[400px]">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-[#1f2c33] p-4 rounded-xl rounded-tl-none shadow-sm max-w-[90%] border border-black/5 dark:border-white/5"
                                >
                                    <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-[#111b21] dark:text-[#e9edef]">
                                        {(() => {
                                            const defaultMessages: Record<string, string> = {
                                                "order-confirmation": `Hi {{customer_name}}! 👋\n\nThank you for your order from {{store_name}}!\n\n📦 *Order:* {{order_number}}\n🛒 *Items:* {{items_list}}\n💰 *Total:* {{grand_total}}\n📍 *Address:* {{shipping_address}}, {{city}}\n\nPlease confirm if these details are correct.`,
                                                "bank-transfer-confirmation": `🏦 *Bank Transfer Instructions!*\n\nHi {{customer_name}},\n\nThank you for your order *{{order_number}}*. 🛍️\n\nTo complete your order, please transfer *{{grand_total}}* to our bank account:\n\n*Bank:* [Bank Name]\n*Account Title:* [Account Title]\n*Account/IBAN:* [Account Number]\n\nOnce transferred, please reply to this message with a screenshot/receipt of the transfer so we can confirm your order immediately! 📲\n\nThank you!\n- {{store_name}} Team`,
                                                "order-confirmed-reply": `🎉 *Thank You, {{customer_name}}!*\n\nYour order *{{order_number}}* is now being processed by *{{store_name}}*! 🚀\n\n✨ *What's next?*\n1. Our team is hand-picking your items. 📦\n2. We'll pack them with care. 🎀\n3. You'll get a tracking link via WhatsApp as soon as it ships! 🚚\n\nWe appreciate your business! If you have any questions, just reply to this message. 💬`,
                                                "cancellation": `Hi {{customer_name}},\n\nYour order {{order_number}} has been cancelled.\n\nIf this was a mistake, please contact us.\n\nThank you for shopping with {{store_name}}!`,
                                                "cancellation-verify": `Are you sure you want to cancel your order? ❌\n\nThis will stop your order from being processed immediately.`,
                                                "fulfillment_update": `Hi {{customer_name}}! 🚚\n\nGreat news! Your order {{order_number}} has been shipped via {{courier}}!\n\n📦 Tracking Number: {{tracking_number}}\n📍 Track your package: {{tracking_link}}\n\nThank you for shopping with {{store_name}}!`,
                                                "fulfillment_delivered": `Hi {{customer_name}}! 🚚\n\nYour order {{order_number}} has been delivered!\n\nThank you for shopping with {{store_name}}!`,
                                                "admin-order-alert": `🔔 *New Order Alert!*\n\nOrder: {{order_number}}\nCustomer: {{customer_name}}\nTotal: {{grand_total}}\nItems: {{items_list}}\nAddress: {{shipping_address}}, {{city}}`,
                                                "admin-confirmed-alert": `🔔 *Order Confirmed by Customer!*\n\nOrder {{order_number}} has been confirmed by customer {{customer_name}}! ✅\n\n*Items:*\n{{items_list}}\n\n*Grand Total:* {{grand_total}}\n\n*Shipping Address:*\n{{shipping_address}}, {{city}}`,
                                                "abandoned_cart": `Hi {{customer_name}}, you left something in your cart! 🛒\n\nClick here to finish your purchase: {{cart_link}}\n\nThank you for visiting {{store_name}}!`,
                                            };
                                            
                                            const messageText = selectedFlow.template?.message || defaultMessages[selectedFlow.id] || "";
                                            return messageText
                                                .replace(/{{customer_name}}/g, "John Doe")
                                                .replace(/{{first_name}}/g, "John")
                                                .replace(/{{customer_first_name}}/g, "John")
                                                .replace(/{{order_number}}/g, "#1001")
                                                .replace(/{{store_name}}/g, storeName)
                                                .replace(/{{items_list}}/g, "1x Wireless Headphones - $199.99")
                                                .replace(/{{grand_total}}/g, "$214.99")
                                                .replace(/{{shipping_address}}/g, "123 Demo St")
                                                .replace(/{{city}}/g, "New York")
                                                .replace(/{{price}}/g, "$199.99")
                                                .replace(/{{payment_status}}/g, "Paid");
                                        })()}
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

            {/* Edit Dialog - Full Template Editor */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Edit {selectedFlow?.title} Template</DialogTitle>
                        <p className="text-xs text-muted-foreground">Customize your WhatsApp automation message and delivery settings.</p>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
                        {/* LEFT: Form Fields */}
                        <div className="space-y-4">
                            {/* Template Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tmpl-name" className="text-xs font-semibold">Template Name</Label>
                                <Input
                                    id="tmpl-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="e.g. Order Confirmation"
                                    className="h-9"
                                />
                            </div>

                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                                <div>
                                    <Label className="text-xs font-semibold">Template Status</Label>
                                    <p className="text-[10px] text-muted-foreground">Enable or disable this template</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-medium ${editForm.enabled !== false ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                        {editForm.enabled !== false ? '✅ Active' : '⏸️ Paused'}
                                    </span>
                                    <Switch
                                        checked={editForm.enabled !== false}
                                        onCheckedChange={(checked) => setEditForm({ ...editForm, enabled: checked })}
                                    />
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tmpl-message" className="text-xs font-semibold">Message Content</Label>
                                <Textarea
                                    id="tmpl-message"
                                    value={editForm.message}
                                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                                    className="min-h-[160px] text-sm"
                                    placeholder="Enter your WhatsApp message here..."
                                />
                                <div className="p-2 bg-muted/40 rounded-md border border-border/30">
                                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">📌 Available Placeholders:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {["{{customer_name}}", "{{first_name}}", "{{customer_first_name}}", "{{order_number}}", "{{store_name}}", "{{items_list}}", "{{grand_total}}", "{{shipping_address}}", "{{city}}", "{{price}}", "{{payment_status}}", "{{tracking_link}}", "{{tracking_number}}", "{{courier}}"].map(ph => (
                                            <button
                                                key={ph}
                                                type="button"
                                                className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono hover:bg-primary/20 transition-colors cursor-pointer"
                                                onClick={() => setEditForm({ ...editForm, message: editForm.message + ph })}
                                            >
                                                {ph}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sending Time */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tmpl-delay" className="text-xs font-semibold">Sending Time</Label>
                                <div className="flex gap-2">
                                    <select
                                        id="tmpl-delay"
                                        className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-xs"
                                        value={isCustomDelayMode ? "custom" : (editForm.sendingDelay || 0).toString()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "custom") {
                                                setIsCustomDelayMode(true);
                                                setEditForm({ ...editForm, sendingDelay: editForm.sendingDelay || 1 });
                                            } else {
                                                setIsCustomDelayMode(false);
                                                setEditForm({ ...editForm, sendingDelay: parseInt(val) });
                                            }
                                        }}
                                    >
                                        <option value="0">Default (App Safe Guard Limit)</option>
                                        <option value="1">1 Minute</option>
                                        <option value="5">5 Minutes</option>
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="120">2 Hours</option>
                                        <option value="360">6 Hours</option>
                                        <option value="720">12 Hours</option>
                                        <option value="1440">24 Hours</option>
                                        <option value="custom">Custom Time...</option>
                                    </select>
                                    {isCustomDelayMode && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="w-16 h-9 text-xs"
                                                value={(editForm.sendingDelay || 0).toString()}
                                                onChange={(e) => setEditForm({ ...editForm, sendingDelay: parseInt(e.target.value) || 0 })}
                                            />
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">min</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Target Order Status (Only for Order Confirmation) */}
                            {editForm.event === "orders/create" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="tmpl-target-status" className="text-xs font-semibold">Target Orders</Label>
                                    <select
                                        id="tmpl-target-status"
                                        className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs"
                                        value={editForm.targetOrderStatus || "all"}
                                        onChange={(e) => setEditForm({ ...editForm, targetOrderStatus: e.target.value })}
                                    >
                                        <option value="all">Send to ALL New Orders</option>
                                        <option value="pending">Send ONLY to Pending/COD Orders</option>
                                        <option value="paid">Send ONLY to Paid Orders</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground mt-1">Filters based on the order's financial status in Shopify.</p>
                                </div>
                            )}

                            {/* Poll Settings */}
                            {editForm.event !== "admin-order-alert" && editForm.event !== "admin-confirmed-alert" && (
                                <div className="space-y-3 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-xs font-semibold">Send as Poll</Label>
                                            <p className="text-[10px] text-muted-foreground">Creates a WhatsApp poll with clickable buttons</p>
                                        </div>
                                        <Switch
                                            checked={editForm.isPoll}
                                            onCheckedChange={(checked) => setEditForm({ ...editForm, isPoll: checked })}
                                        />
                                    </div>

                                    {editForm.isPoll && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-[10px] font-medium">Poll Options (max 5)</Label>
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
                                                        className="h-8 text-sm"
                                                    />
                                                    {editForm.pollOptions.length > 2 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="px-2 text-destructive h-8"
                                                            onClick={() => setEditForm({ ...editForm, pollOptions: editForm.pollOptions.filter((_: any, i: number) => i !== idx) })}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {editForm.pollOptions.length < 5 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-7 text-[10px] border-dashed"
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

                        {/* RIGHT: Live WhatsApp Preview */}
                        <div className="hidden md:block">
                            <Label className="text-xs font-semibold mb-2 block">📱 Live Preview</Label>
                            <div className="bg-[#f0f2f5] dark:bg-[#0b141a] rounded-2xl overflow-hidden shadow-lg border border-border/50">
                                {/* WhatsApp Header */}
                                <div className="bg-[#008069] px-3 py-2.5 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        {selectedFlow && <selectedFlow.icon className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-xs">{storeName}</h4>
                                        <p className="text-white/70 text-[10px]">WhatsApp Business</p>
                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div
                                    className="p-4 min-h-[280px] bg-repeat bg-contain"
                                    style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}
                                >
                                    <div className="bg-white dark:bg-[#1f2c33] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[95%] border border-black/5 dark:border-white/5">
                                        <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#111b21] dark:text-[#e9edef]">
                                            {editForm.message
                                                ? editForm.message
                                                    .replace(/{{customer_name}}/g, "John Doe")
                                                    .replace(/{{first_name}}/g, "John")
                                                    .replace(/{{customer_first_name}}/g, "John")
                                                    .replace(/{{order_number}}/g, "#1001")
                                                    .replace(/{{store_name}}/g, storeName)
                                                    .replace(/{{items_list}}/g, "1x Wireless Headphones - $199.99")
                                                    .replace(/{{grand_total}}/g, "$214.99")
                                                    .replace(/{{shipping_address}}/g, "123 Demo St")
                                                    .replace(/{{city}}/g, "New York")
                                                    .replace(/{{price}}/g, "$199.99")
                                                    .replace(/{{payment_status}}/g, "Paid")
                                                : <span className="text-muted-foreground italic">Type your message to see preview...</span>
                                            }
                                        </div>
                                        <div className="text-[9px] text-[#667781] dark:text-[#8696a0] text-right mt-1">
                                            12:45 PM ✓✓
                                        </div>
                                    </div>

                                    {/* Poll Options Preview */}
                                    {editForm.isPoll && editForm.pollOptions?.filter((o: string) => o.trim()).length > 0 && (
                                        <div className="space-y-1.5 mt-3">
                                            {editForm.pollOptions.filter((o: string) => o.trim()).map((option: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-1.5 bg-white dark:bg-[#1f2c33] rounded-full text-[#008069] dark:text-[#53bdeb] text-[11px] font-bold shadow-sm border border-black/5 dark:border-white/5 text-center"
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
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
