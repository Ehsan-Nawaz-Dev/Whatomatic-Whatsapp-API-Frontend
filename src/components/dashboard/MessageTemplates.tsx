import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, MessageSquare, ShoppingCart, Truck, XCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, getCurrentShop } from "@/lib/api";
import { toast } from "sonner";

const iconMap = {
  "orders/create": MessageSquare,
  "orders/create/bank_transfer": MessageSquare,
  "admin-order-alert": Bell,
  "admin-confirmed-alert": Bell,
  "checkouts/abandoned": ShoppingCart,
  "fulfillments/update": Truck,
  "fulfillments/delivered": Truck,
  "orders/cancelled": XCircle,
  "orders/confirmed": Bell,
  "orders/cancel_verify": XCircle,
} as const;

type EventKey = keyof typeof iconMap;

interface TemplateFormState {
  id?: string;
  name: string;
  event: EventKey;
  message: string;
  enabled: boolean;
  isPoll: boolean;
  pollOptions: string[];
  sendingDelay: number;
}

const emptyForm: TemplateFormState = {
  name: "",
  event: "orders/create",
  message: "",
  enabled: true,
  isPoll: false,
  pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"],
  sendingDelay: 0,
};

const MessageTemplates = () => {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates", getCurrentShop()],
    queryFn: fetchTemplates,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [isCustomDelayMode, setIsCustomDelayMode] = useState(false);

  const createMut = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", getCurrentShop()] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Template created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create template");
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TemplateFormState }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", getCurrentShop()] });
      setDialogOpen(false);
      setForm(emptyForm);
      setIsEdit(false);
      toast.success("Template updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update template");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", getCurrentShop()] });
      toast.success("Template deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete template");
    }
  });

  const openNewDialog = () => {
    setIsEdit(false);
    setIsCustomDelayMode(false);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (template: any) => {
    setIsEdit(true);
    const existingDelay = template.sendingDelay || 0;
    setIsCustomDelayMode(![0, 1, 5, 15, 30, 60, 120, 360, 720, 1440].includes(existingDelay));
    setForm({
      id: template._id,
      name: template.name,
      event: template.event,
      message: template.message,
      enabled: template.enabled,
      isPoll: template.isPoll || false,
      pollOptions: template.pollOptions || ["✅Yes, Confirm✅", "❌No, Cancel❌"],
      sendingDelay: existingDelay,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message content is required");
      return;
    }

    if (isEdit && form.id) {
      updateMut.mutate({ id: form.id, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const toggleTemplate = (template: any) => {
    updateMut.mutate({
      id: template._id,
      data: { ...template, enabled: !template.enabled },
    });
  };

  return (
    <div className="space-y-3 lg:space-y-4 xl:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">Message Templates</h1>
          <p className="text-[10px] lg:text-xs xl:text-sm text-muted-foreground mt-0.5">
            Customize the messages sent to your customers
          </p>
        </div>
        <Button variant="hero" onClick={openNewDialog} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:gap-3 xl:gap-4">
        {isLoading && <p className="text-sm text-muted-foreground col-span-2">Loading templates...</p>}
        {!isLoading && templates.map((template: any, index: number) => {
          const Icon = iconMap[template.event as EventKey] ?? MessageSquare;
          return (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 lg:p-4 xl:p-5 bg-card rounded-xl border shadow-card transition-all duration-300 ${template.enabled ? "border-primary/30" : "border-border opacity-70"
                }`}
            >
              <div className="flex items-start justify-between mb-2 lg:mb-3">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-lg xl:rounded-xl flex items-center justify-center shrink-0 ${template.enabled ? "gradient-primary" : "bg-muted"
                    }`}>
                    <Icon className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 ${template.enabled ? "text-primary-foreground" : "text-muted-foreground"
                      }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <h3 className="font-semibold text-xs lg:text-sm xl:text-base text-foreground truncate">{template.name}</h3>
                      {template.isPoll && (
                        <span className="text-[8px] lg:text-[9px] xl:text-[10px] px-1 lg:px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md font-bold uppercase shrink-0">Poll</span>
                      )}
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground font-mono truncate">{template.event}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleTemplate(template)}
                  className={`relative w-9 h-5 lg:w-10 lg:h-5 xl:w-11 xl:h-6 rounded-full transition-colors duration-200 shrink-0 ${template.enabled ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 lg:top-1 lg:left-1 w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 rounded-full bg-card shadow-sm transition-transform duration-200 ${template.enabled ? "translate-x-4 lg:translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Message Preview */}
              <div className="p-2 lg:p-3 xl:p-4 bg-muted/50 rounded-lg mb-2 lg:mb-3">
                <pre className="text-[10px] lg:text-xs xl:text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed line-clamp-4 xl:line-clamp-6">
                  {template.message}
                </pre>
              </div>

              {/* Poll Options Preview */}
              {template.isPoll && template.pollOptions && template.pollOptions.length > 0 && (
                <div className="flex flex-wrap gap-1 lg:gap-1.5 mb-2 lg:mb-3">
                  {template.pollOptions.map((opt: string, i: number) => (
                    <span
                      key={i}
                      className="px-1.5 lg:px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-full text-[8px] lg:text-[9px] xl:text-[10px] font-bold text-primary flex items-center gap-0.5 shadow-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {opt}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 lg:h-8 text-[10px] lg:text-xs"
                  onClick={() => openEditDialog(template)}
                >
                  <Edit2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1 lg:mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 lg:h-8 w-7 lg:w-8 p-0"
                  onClick={() => deleteMut.mutate(template._id)}
                >
                  <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Variables Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-3 lg:p-4 xl:p-6 bg-accent/30 rounded-xl border border-border"
      >
        <h3 className="font-semibold text-xs lg:text-sm xl:text-base text-foreground mb-2 lg:mb-3 xl:mb-4">Available Placeholders</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 lg:gap-2 xl:gap-3">
          {[
            "{{customer_name}}",
            "{{order_id}}",
            "{{order_number}}",
            "{{grand_total}}",
            "{{price}}",
            "{{total_price}}",
            "{{subtotal}}",
            "{{items_list}}",
            "{{shipping_address}}",
            "{{city}}",
            "{{shipping_price}}",
            "{{payment_status}}",
            "{{cart_total}}",
            "{{cart_link}}",
            "{{tracking_link}}",
            "{{store_name}}",
            "{{order_date}}",
          ].map((placeholder) => (
            <code
              key={placeholder}
              className="px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 bg-card rounded-lg text-[9px] lg:text-[10px] xl:text-xs font-mono text-primary border border-border truncate"
            >
              {placeholder}
            </code>
          ))}
        </div>
      </motion.div>
      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tmpl-name">Name</Label>
              <Input
                id="tmpl-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tmpl-event">Event</Label>
              <select
                id="tmpl-event"
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={form.event}
                onChange={(e) => {
                  const newEvent = e.target.value as EventKey;
                  setForm({
                    ...form,
                    event: newEvent,
                    isPoll: (newEvent === "admin-order-alert" || newEvent === "admin-confirmed-alert") ? false : form.isPoll
                  });
                }}
              >
                <option value="orders/create">Customer Order Confirmation (Poll)</option>
                <option value="orders/create/bank_transfer">Customer Bank Transfer Confirmation (Poll)</option>
                <option value="orders/confirmed">Post-Confirmation Thank You</option>
                <option value="admin-order-alert">Admin New Order Alert</option>
                <option value="admin-confirmed-alert">Admin Order Confirmed Alert</option>
                <option value="checkouts/abandoned">Abandoned checkout</option>
                <option value="fulfillments/update">Fulfillment update</option>
                <option value="fulfillments/delivered">Delivery update</option>
                <option value="orders/cancelled">Order cancelled</option>
                <option value="orders/cancel_verify">Order Cancellation Verification (Poll)</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tmpl-message">Message</Label>
                {(form.event === "orders/create" || form.event === "orders/create/bank_transfer" || form.event === "orders/confirmed" || form.event === "admin-order-alert" || form.event === "admin-confirmed-alert" || form.event === "orders/cancel_verify" || form.event === "orders/cancelled" || form.event === "fulfillments/delivered" || form.event === "fulfillments/update") && (
                  <button
                    type="button"
                    className="h-auto p-0 text-xs text-primary font-bold decoration-primary/30 hover:decoration-primary transition-all underline shrink-0"
                    onClick={() => {
                      if (form.event === "orders/create") {
                        setForm({
                          ...form,
                          message: `✅ *Order Confirmed!*\n\nHi {{customer_name}},\n\nGreat news! Your order *{{order_number}}* has been officially confirmed by {{store_name}}. 🛍️\n\n---\n📦 *Order Summary:*\n{{items_list}}\n\n💰 *Grand Total:* {{grand_total}}\n---\n\n📍 *Shipping to:*\n{{shipping_address}}\n{{city}}\n\nWe are getting your package ready for shipping. We'll send you another message with the tracking details as soon as it's on the way! 🚚\n\nThank you for shopping with us!\n- {{store_name}} Team`,
                          isPoll: true,
                          pollOptions: ["✅ Yes, Confirm ✅", "❌ No, Cancel ❌"]
                        });
                      } else if (form.event === "orders/create/bank_transfer") {
                        setForm({
                          ...form,
                          message: `🏦 *Bank Transfer Instructions!*\n\nHi {{customer_name}},\n\nThank you for your order *{{order_number}}*. 🛍️\n\nTo complete your order, please transfer *{{grand_total}}* to our bank account:\n\n*Bank:* [Bank Name]\n*Account Title:* [Account Title]\n*Account/IBAN:* [Account Number]\n\nOnce transferred, please reply to this message with a screenshot/receipt of the transfer so we can confirm your order immediately! 📲\n\nThank you!\n- {{store_name}} Team`,
                          isPoll: false,
                          pollOptions: []
                        });
                      } else if (form.event === "orders/confirmed") {
                        setForm({
                          ...form,
                          name: "Thank You Message",
                          message: `🎉 *Thank You, {{customer_name}}!*\n\nYour order *{{order_number}}* is now being processed by *{{store_name}}*! 🚀\n\n✨ *What's next?*\n1. Our team is hand-picking your items. 📦\n2. We'll pack them with care. 🎀\n3. You'll get a tracking link via WhatsApp as soon as it ships! 🚚\n\nWe appreciate your business! If you have any questions, just reply to this message. 💬`,
                          isPoll: false
                        });
                      } else if (form.event === "orders/cancel_verify") {
                        setForm({
                          ...form,
                          message: `Are you sure you want to cancel your order? ❌\n\nThis will stop your order from being processed immediately.`,
                          isPoll: true,
                          pollOptions: ["🗑️ Yes, Cancel Order", "✅ No, Keep Order"]
                        });
                      } else if (form.event === "orders/cancelled") {
                        setForm({
                          ...form,
                          message: `Your order *{{order_number}}* has been cancelled as requested. ❌\n\nIf you have any questions or would like to place a new order, we're here to help!`,
                          isPoll: false
                        });
                      } else if (form.event === "fulfillments/delivered") {
                        setForm({
                          ...form,
                          message: `🎉 *Order Delivered!*\n\nHi {{customer_name}}! 🚚\n\nWe're excited to let you know that your order *{{order_number}}* has been successfully delivered! \n\nWe hope you love your new purchase! If you have any questions or need assistance, feel free to reply to this message. 💬\n\nThank you for shopping with {{store_name}}!`,
                          isPoll: false
                        });
                      } else if (form.event === "fulfillments/update") {
                        setForm({
                          ...form,
                          name: "Shipment Update",
                          message: `Hi {{customer_name}}! 🚚\n\nGreat news! Your order {{order_number}} has been shipped via {{courier}}!\n\n📦 Tracking Number: {{tracking_number}}\n📍 Track your package: {{tracking_link}}\n\nThank you for shopping with {{store_name}}!`,
                          isPoll: false
                        });
                      } else if (form.event === "admin-order-alert") {
                        setForm({
                          ...form,
                          message: `🔔 *New Order Alert!*\n\nA new order {{order_number}} has been received at {{store_name}}.\n\n*Customer:* {{customer_name}}\n*Product Price:* {{price}}\n*Grand Total:* {{grand_total}}\n\n*Items:*\n{{items_list}}\n\n*Shipping to:*\n{{shipping_address}}\n{{city}}\n\nPayment status: {{payment_status}}`,
                          isPoll: false
                        });
                      } else if (form.event === "admin-confirmed-alert") {
                        setForm({
                          ...form,
                          message: `🔔 *Order Confirmed by Customer!*\n\nOrder {{order_number}} has been confirmed by customer {{customer_name}}! ✅\n\n*Items:*\n{{items_list}}\n\n*Grand Total:* {{grand_total}}\n\n*Shipping Address:*\n{{shipping_address}}\n{{city}}`,
                          isPoll: false
                        });
                      }
                    }}
                  >
                    ✨ Load Recommended template
                  </button>
                )}
              </div>
              <Textarea
                id="tmpl-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-delay">Sending Time</Label>
              <div className="flex gap-2">
                <select
                  id="tmpl-delay"
                  className="flex-1 h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={isCustomDelayMode ? "custom" : form.sendingDelay.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsCustomDelayMode(true);
                      setForm({ ...form, sendingDelay: form.sendingDelay || 1 });
                    } else {
                      setIsCustomDelayMode(false);
                      setForm({ ...form, sendingDelay: parseInt(val) });
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
                      className="w-20 h-10"
                      value={form.sendingDelay.toString()}
                      onChange={(e) => setForm({ ...form, sendingDelay: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">min</span>
                  </div>
                )}
              </div>
            </div>

            {form.event !== "admin-order-alert" && form.event !== "admin-confirmed-alert" && (
              <div className="space-y-4 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Send as Poll</Label>
                    <p className="text-[11px] text-muted-foreground">Creates a WhatsApp poll with clickable buttons</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isPoll: !form.isPoll })}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.isPoll ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-card shadow-sm transition-transform duration-200 ${form.isPoll ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                {form.isPoll && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-xs font-medium">Poll Options (maximum 2 recommended)</Label>
                    {form.pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...form.pollOptions];
                            newOpts[idx] = e.target.value;
                            setForm({ ...form, pollOptions: newOpts });
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="h-9"
                        />
                        {form.pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-destructive"
                            onClick={() => setForm({ ...form, pollOptions: form.pollOptions.filter((_, i) => i !== idx) })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {form.pollOptions.length < 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs border-dashed"
                        onClick={() => setForm({ ...form, pollOptions: [...form.pollOptions, ""] })}
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
            <Button
              variant="outline"
              type="button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="hero"
              disabled={createMut.isPending || updateMut.isPending}
              onClick={handleSave}
            >
              {isEdit ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageTemplates;
