import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetchSettings, updateSettings, fetchWhatsAppStatus, API_BASE_URL, getCurrentShop } from "@/lib/api";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { toast } from "sonner";

const MerchantSettings = () => {
  const shopify = useAppBridge();
  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [orderConfirmTag, setOrderConfirmTag] = useState("");
  const [orderCancelTag, setOrderCancelTag] = useState("");
  const [pendingConfirmTag, setPendingConfirmTag] = useState("");
  const [adminNotifiedTag, setAdminNotifiedTag] = useState("");
  const [noWhatsappTag, setNoWhatsappTag] = useState("");
  const [orderConfirmReply, setOrderConfirmReply] = useState("");
  const [orderCancelReply, setOrderCancelReply] = useState("");
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Track initial state
  const [initialState, setInitialState] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-settings", getCurrentShop()],
    queryFn: fetchSettings,
  });

  const { data: whatsappStatus } = useQuery({
    queryKey: ["whatsapp-status", getCurrentShop()],
    queryFn: fetchWhatsAppStatus,
  });

  useEffect(() => {
    if (data) {
      const state = {
        storeName: data.storeName || data.shopDomain || "My Store",
        whatsappNumber: (whatsappStatus?.connected && whatsappStatus?.phoneNumber) ? whatsappStatus.phoneNumber : "",
        defaultCountry: data.defaultCountry || data.country || "US",
        language: data.language || "English",
        orderConfirmTag: data.orderConfirmTag || "Order Confirmed",
        orderCancelTag: data.orderCancelTag || "Order Cancel By customer",
        pendingConfirmTag: data.pendingConfirmTag || "Pending Confirmation",
        adminNotifiedTag: data.adminNotifiedTag || "Admin Notified",
        noWhatsappTag: data.noWhatsappTag || "No WhatsApp",
        orderConfirmReply: data.orderConfirmReply || "✅ *Order Confirmed!*\n\nHi {{customer_name}}, thank you for your order! 🛍️\n\n*Order:* {{order_number}}\n*Total:* {{grand_total}}\n\nWe're preparing your items for shipping. We'll notify you once it's on the way! 🚚",
        orderCancelReply: data.orderCancelReply || "Your order has been cancelled as requested. ❌",
        adminPhoneNumber: data.adminPhoneNumber || data.phone || ""
      };
      setStoreName(state.storeName);
      setWhatsappNumber(state.whatsappNumber);
      setDefaultCountry(state.defaultCountry);
      setLanguage(state.language);
      setOrderConfirmTag(state.orderConfirmTag);
      setOrderCancelTag(state.orderCancelTag);
      setPendingConfirmTag(state.pendingConfirmTag);
      setAdminNotifiedTag(state.adminNotifiedTag);
      setNoWhatsappTag(state.noWhatsappTag);
      setOrderConfirmReply(state.orderConfirmReply);
      setOrderCancelReply(state.orderCancelReply);
      setAdminPhoneNumber(state.adminPhoneNumber);
      setInitialState(state);
    }
    setWebhookUrl(`${API_BASE_URL.replace(/\/api$/, "")}/api/webhooks/shopify`);
  }, [data, whatsappStatus]);

  const isDirty = initialState && (
    storeName !== initialState.storeName ||
    whatsappNumber !== initialState.whatsappNumber ||
    defaultCountry !== initialState.defaultCountry ||
    language !== initialState.language ||
    orderConfirmTag !== initialState.orderConfirmTag ||
    orderCancelTag !== initialState.orderCancelTag ||
    pendingConfirmTag !== initialState.pendingConfirmTag ||
    adminNotifiedTag !== initialState.adminNotifiedTag ||
    noWhatsappTag !== initialState.noWhatsappTag ||
    orderConfirmReply !== initialState.orderConfirmReply ||
    orderCancelReply !== initialState.orderCancelReply ||
    adminPhoneNumber !== initialState.adminPhoneNumber
  );

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success("Settings saved!");
      setInitialState({
        storeName, whatsappNumber, defaultCountry, language,
        orderConfirmTag, orderCancelTag, pendingConfirmTag,
        adminNotifiedTag, noWhatsappTag, orderConfirmReply,
        orderCancelReply, adminPhoneNumber
      });
    },
    onError: () => toast.error("Failed to save")
  });

  const handleSave = () => {
    mutation.mutate({
      storeName, whatsappNumber, defaultCountry, language,
      orderConfirmTag, orderCancelTag, pendingConfirmTag,
      adminNotifiedTag, noWhatsappTag, orderConfirmReply,
      orderCancelReply, adminPhoneNumber
    });
  };

  const handleDiscard = () => {
    if (initialState) {
      setStoreName(initialState.storeName);
      setWhatsappNumber(initialState.whatsappNumber);
      setDefaultCountry(initialState.defaultCountry);
      setLanguage(initialState.language);
      setOrderConfirmTag(initialState.orderConfirmTag);
      setOrderCancelTag(initialState.orderCancelTag);
      setPendingConfirmTag(initialState.pendingConfirmTag);
      setAdminNotifiedTag(initialState.adminNotifiedTag);
      setNoWhatsappTag(initialState.noWhatsappTag);
      setOrderConfirmReply(initialState.orderConfirmReply);
      setOrderCancelReply(initialState.orderCancelReply);
      setAdminPhoneNumber(initialState.adminPhoneNumber);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 lg:space-y-4 xl:space-y-6"
    >
      {isDirty && (
        <SaveBar id="merchant-settings-save-bar">
          <button variant="primary" onClick={handleSave}>Save</button>
          <button onClick={handleDiscard}>Discard</button>
        </SaveBar>
      )}

      <div>
        <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground">Merchant Settings</h1>
        <p className="text-muted-foreground mt-0.5 lg:mt-1 text-[10px] lg:text-xs xl:text-sm max-w-2xl">
          Configure your Shopify store and WhatsApp connection. These settings will be used by
          the automation engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="storeName">Store name</Label>
              {data?.storeName && (
                <Badge variant="outline" className="text-[10px] font-normal text-green-600 border-green-200 bg-green-50">
                  From Shopify
                </Badge>
              )}
            </div>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Your store name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="whatsappNumber">Business WhatsApp number</Label>
              {whatsappStatus?.connected ? (
                <Badge variant="outline" className="text-[10px] font-normal text-green-600 border-green-200 bg-green-50">
                  Connected ✓
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-normal text-amber-600 border-amber-200 bg-amber-50">
                  Not Connected
                </Badge>
              )}
            </div>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder={whatsappStatus?.connected ? "" : "Connect WhatsApp first"}
              disabled={!whatsappStatus?.connected}
              className={!whatsappStatus?.connected ? "bg-muted" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {whatsappStatus?.connected
                ? "This number will be used for all outgoing customer messages."
                : "Please connect WhatsApp in the 'WhatsApp Connection' tab first."}
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

        <div className="space-y-6">
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <Label className="text-sm font-medium">Auto-reply messages</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confirmReply" className="text-[10px] uppercase font-bold text-muted-foreground">Confirmation Reply</Label>
                <Textarea
                  id="confirmReply"
                  value={orderConfirmReply}
                  onChange={(e) => setOrderConfirmReply(e.target.value)}
                  placeholder="✅ *Order Confirmed!* ..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelReply" className="text-[10px] uppercase font-bold text-muted-foreground">Cancellation Reply</Label>
                <Textarea
                  id="cancelReply"
                  value={orderCancelReply}
                  onChange={(e) => setOrderCancelReply(e.target.value)}
                  placeholder="Your order has been cancelled as requested. ❌"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              These messages are sent automatically when a customer clicks a button in the WhatsApp poll.
            </p>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <Label className="text-sm font-medium">Order Tagging</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="adminTag" className="text-[10px] uppercase font-bold text-muted-foreground">Admin Notified tag</Label>
                <Input
                  id="adminTag"
                  value={adminNotifiedTag}
                  onChange={(e) => setAdminNotifiedTag(e.target.value)}
                  placeholder="Admin Notified"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noWpTag" className="text-[10px] uppercase font-bold text-muted-foreground">No WhatsApp tag</Label>
                <Input
                  id="noWpTag"
                  value={noWhatsappTag}
                  onChange={(e) => setNoWhatsappTag(e.target.value)}
                  placeholder="No WhatsApp"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shopify order tags will be applied automatically based on the message status and customer replies.
            </p>
          </div>          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              placeholder="Any internal notes about this store's automation setup..."
              className="min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-[270px] z-50 flex justify-end items-center gap-3 p-4 bg-card border rounded-lg shadow-xl"
        >
          <span className="text-sm font-medium text-foreground mr-auto">
            You have unsaved changes.
          </span>
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={mutation.isPending}
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </motion.div>
      )}
    </motion.div >
  );
};

export default MerchantSettings;
