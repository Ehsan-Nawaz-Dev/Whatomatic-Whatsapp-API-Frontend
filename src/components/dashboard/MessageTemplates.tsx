import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, MessageSquare, ShoppingCart, Truck, XCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/lib/api";

const iconMap = {
  "orders/create": MessageSquare,
  "admin-order-alert": Bell,
  "checkouts/abandoned": ShoppingCart,
  "fulfillments/update": Truck,
  "orders/cancelled": XCircle,
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
}

const emptyForm: TemplateFormState = {
  name: "",
  event: "orders/create",
  message: "",
  enabled: true,
  isPoll: false,
  pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"],
};

const MessageTemplates = () => {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const createMut = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TemplateFormState }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setDialogOpen(false);
      setForm(emptyForm);
      setIsEdit(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const openNewDialog = () => {
    setIsEdit(false);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (template: any) => {
    setIsEdit(true);
    setForm({
      id: template._id,
      name: template.name,
      event: template.event,
      message: template.message,
      enabled: template.enabled,
      isPoll: template.isPoll || false,
      pollOptions: template.pollOptions || ["✅Yes, Confirm✅", "❌No, Cancel❌"],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Message Templates</h1>
          <p className="text-muted-foreground mt-1">
            Customize the messages sent to your customers
          </p>
        </div>
        <Button variant="hero" onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading && <p className="text-sm text-muted-foreground">Loading templates...</p>}
        {!isLoading && templates.map((template: any, index: number) => {
          const Icon = iconMap[template.event as EventKey] ?? MessageSquare;
          return (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 bg-card rounded-xl border shadow-card transition-all duration-300 ${template.enabled ? "border-primary/30" : "border-border opacity-70"
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.enabled ? "gradient-primary" : "bg-muted"
                    }`}>
                    <Icon className={`w-6 h-6 ${template.enabled ? "text-primary-foreground" : "text-muted-foreground"
                      }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      {template.isPoll && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md font-bold uppercase">Poll</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{template.event}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleTemplate(template)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${template.enabled ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200 ${template.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Message Preview */}
              <div className="p-4 bg-muted/50 rounded-lg mb-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {template.message}
                </pre>
              </div>

              {/* Poll Options Preview */}
              {template.isPoll && template.pollOptions && template.pollOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.pollOptions.map((opt: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold text-primary flex items-center gap-1 shadow-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {opt}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(template)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMut.mutate(template._id)}
                >
                  <Trash2 className="w-4 h-4" />
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
        className="p-6 bg-accent/30 rounded-xl border border-border"
      >
        <h3 className="font-semibold text-foreground mb-4">Available Placeholders</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "{{customer_name}}",
            "{{order_id}}",
            "{{order_number}}",
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
              className="px-3 py-2 bg-card rounded-lg text-sm font-mono text-primary border border-border"
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
                    isPoll: newEvent === "admin-order-alert" ? false : form.isPoll
                  });
                }}
              >
                <option value="orders/create">Customer Order Confirmation</option>
                <option value="admin-order-alert">Admin New Order Alert</option>
                <option value="checkouts/abandoned">Abandoned checkout</option>
                <option value="fulfillments/update">Fulfillment update</option>
                <option value="orders/cancelled">Order cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tmpl-message">Message</Label>
                {(form.event === "orders/create" || form.event === "admin-order-alert") && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary font-bold decoration-primary/30 hover:decoration-primary transition-all underline shrink-0"
                    onClick={() => {
                      if (form.event === "orders/create") {
                        setForm({
                          ...form,
                          message: `Thank you for your order from {{store_name}}. This is a confirmation message.\n\nOrder Details:\n\nOrder ID: {{order_id}}\nOrder Number: {{order_number}}\n\nItems: {{items_list}}\nSubtotal: {{total_price}}\n\nAddress: {{shipping_address}}\nCity: {{city}}\n\nPlease confirm your order.`,
                          isPoll: true,
                          pollOptions: ["✅Yes, Confirm✅", "❌No, Cancel❌"]
                        });
                      } else {
                        setForm({
                          ...form,
                          message: `🔔 Alert!\n\nA new order has been placed at {{store_name}}!\n\nOrder number: {{order_number}}\nCustomer: {{customer_name}}\nShipping to:\n{{shipping_address}}\n{{city}}\n\nOrder details include:\n{{items_list}}\n\nSubtotal: {{total_price}}\nShipping: {{shipping_price}}\nPayment status: {{payment_status}}`,
                          isPoll: false
                        });
                      }
                    }}
                  >
                    ✨ Load Recommended template
                  </Button>
                )}
              </div>
              <Textarea
                id="tmpl-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="min-h-[200px]"
              />
            </div>

            {form.event !== "admin-order-alert" && (
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
