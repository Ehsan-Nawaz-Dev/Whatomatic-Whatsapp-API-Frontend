import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetchSettings, updateSettings, API_BASE_URL } from "@/lib/api";

const MerchantSettings = () => {
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [orderConfirmTag, setOrderConfirmTag] = useState("");
  const [orderCancelTag, setOrderCancelTag] = useState("");
  const [pendingConfirmTag, setPendingConfirmTag] = useState("");
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-settings"],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (data) {
      setStoreName(data.storeName || "My Shopify Store");
      setWhatsappNumber(data.whatsappNumber || "+1 555 123 4567");
      setDefaultCountry(data.defaultCountry || "US");
      setLanguage(data.language || "English");
      setOrderConfirmTag(data.orderConfirmTag || "Confirmed");
      setOrderCancelTag(data.orderCancelTag || "Cancelled");
      setPendingConfirmTag(data.pendingConfirmTag || "Pending Confirmation");
      setAdminPhoneNumber(data.adminPhoneNumber || "");
    } else {
      setStoreName("My Shopify Store");
      setWhatsappNumber("+1 555 123 4567");
      setDefaultCountry("US");
      setLanguage("English");
      setOrderConfirmTag("Confirmed");
      setOrderCancelTag("Cancelled");
      setPendingConfirmTag("Pending Confirmation");
      setAdminPhoneNumber("");
    }

    setWebhookUrl(`${API_BASE_URL.replace(/\/api$/, "")}/api/webhooks/shopify`);
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      storeName,
      whatsappNumber,
      defaultCountry,
      language,
      orderConfirmTag,
      orderCancelTag,
      pendingConfirmTag,
      adminPhoneNumber,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Merchant Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure your Shopify store and WhatsApp connection. These settings will be used by
          the automation engine.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Business WhatsApp number</Label>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+1 555 123 4567"
            />
            <p className="text-xs text-muted-foreground">
              This number will be used for all outgoing customer messages.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">Admin Phone Number (for alerts)</Label>
            <Input
              id="adminPhone"
              value={adminPhoneNumber}
              onChange={(e) => setAdminPhoneNumber(e.target.value)}
              placeholder="+1 555 999 0000"
            />
            <p className="text-xs text-muted-foreground">
              New order alerts will be sent to this number.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Default country</Label>
              <Input
                id="country"
                value={defaultCountry}
                onChange={(e) => setDefaultCountry(e.target.value)}
                placeholder="US"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Order response tags</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pendingTag" className="text-[10px] uppercase font-bold text-muted-foreground">Pending tag</Label>
                <Input
                  id="pendingTag"
                  value={pendingConfirmTag}
                  onChange={(e) => setPendingConfirmTag(e.target.value)}
                  placeholder="Pending Confirmation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmTag" className="text-[10px] uppercase font-bold text-muted-foreground">Confirm tag</Label>
                <Input
                  id="confirmTag"
                  value={orderConfirmTag}
                  onChange={(e) => setOrderConfirmTag(e.target.value)}
                  placeholder="Confirmed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelTag" className="text-[10px] uppercase font-bold text-muted-foreground">Cancel tag</Label>
                <Input
                  id="cancelTag"
                  value={orderCancelTag}
                  onChange={(e) => setOrderCancelTag(e.target.value)}
                  placeholder="Cancelled"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These Shopify order tags will be applied automatically based on the message status and customer replies.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook">Shopify webhook URL</Label>
              <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                Status: Automatic
              </Badge>
            </div>
            <Input
              id="webhook"
              value={webhookUrl}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Automatic registration is enabled. Your store is synced with the backend.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              placeholder="Any internal notes about this store's automation setup..."
              className="min-h-[80px]"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button type="submit" variant="hero" disabled={mutation.isPending || isLoading}>
              {mutation.isPending ? "Saving..." : "Save settings"}
            </Button>
            {mutation.isSuccess && (
              <span className="text-xs text-success">Settings saved</span>
            )}
            {mutation.isError && (
              <span className="text-xs text-destructive">Failed to save settings</span>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default MerchantSettings;
