import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchSettings, updateSettings } from "@/lib/api";

const MerchantSettings = () => {
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [orderConfirmTag, setOrderConfirmTag] = useState("");
  const [orderCancelTag, setOrderCancelTag] = useState("");
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
    } else {
      setStoreName("My Shopify Store");
      setWhatsappNumber("+1 555 123 4567");
      setDefaultCountry("US");
      setLanguage("English");
      setOrderConfirmTag("Confirmed");
      setOrderCancelTag("Cancelled");
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    setWebhookUrl(`${baseUrl.replace(/\/api$/, "")}/api/webhooks/shopify/orders/create`);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confirmTag">CONFIRM response tag</Label>
                <Input
                  id="confirmTag"
                  value={orderConfirmTag}
                  onChange={(e) => setOrderConfirmTag(e.target.value)}
                  placeholder="Confirmed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelTag">CANCEL response tag</Label>
                <Input
                  id="cancelTag"
                  value={orderCancelTag}
                  onChange={(e) => setOrderCancelTag(e.target.value)}
                  placeholder="Cancelled"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These Shopify order tags will be applied when customers reply CONFIRM or CANCEL in
              WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">Shopify webhook URL (read-only)</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Configure this URL in your Shopify admin to enable webhook-driven automation.
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
