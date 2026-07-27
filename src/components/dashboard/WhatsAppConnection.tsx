import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, AlertCircle, Key, ShieldCheck, Zap, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWhatsAppStatus,
  disconnectWhatsApp,
  saveMetaCredentials,
  connectEmbeddedSignup,
  WhatsAppStatusResponse,
  getCurrentShop,
} from "@/lib/api";
import { toast } from "sonner";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

const WhatsAppConnection = () => {
  const queryClient = useQueryClient();
  const [connectMode, setConnectMode] = useState<"embedded" | "manual">("embedded");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Load Meta Facebook JavaScript SDK for Embedded Signup (requires numeric Meta App ID)
  useEffect(() => {
    const metaAppId = import.meta.env.VITE_META_APP_ID || "";
    const isNumericAppId = /^\d+$/.test(metaAppId);

    if (!isNumericAppId && !connectMode) {
      setConnectMode("manual");
    }
    
    if (isNumericAppId && !document.getElementById("facebook-jssdk")) {
      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.init({
            appId: metaAppId,
            cookie: true,
            xfbml: true,
            version: "v21.0"
          });
        }
      };

      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(js);
    }
  }, []);

  // Fetch WhatsApp connection status
  const { data: status, isLoading: isStatusLoading } = useQuery<WhatsAppStatusResponse>({
    queryKey: ["whatsapp-status", getCurrentShop()],
    queryFn: fetchWhatsAppStatus,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  // Watch for connection status changes
  useEffect(() => {
    if (status?.connected) {
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", getCurrentShop()] });
    }
  }, [status?.connected, queryClient]);

  // Embedded Signup Mutation
  const embeddedSignupMutation = useMutation({
    mutationFn: connectEmbeddedSignup,
    onSuccess: (data) => {
      toast.success(data.message || "Meta WhatsApp Business Account Connected!");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", getCurrentShop()] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Embedded Signup connection failed");
    }
  });

  // Manual Credentials Mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: saveMetaCredentials,
    onSuccess: (data) => {
      toast.success(data.message || "Meta API Connected Successfully!");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", getCurrentShop()] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to verify & connect Meta credentials");
    }
  });

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: () => disconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
      toast.success("Meta WhatsApp account disconnected");
      setPhoneNumberId("");
      setWabaId("");
      setAccessToken("");
    },
    onError: () => {
      toast.error("Failed to disconnect WhatsApp");
    },
  });

  // Trigger Meta Official Embedded Signup Popup
  const launchMetaEmbeddedSignup = () => {
    const rawAppId = import.meta.env.VITE_META_APP_ID || "";
    const metaAppId = /^\d+$/.test(rawAppId) ? rawAppId : "";
    const metaConfigId = import.meta.env.VITE_META_CONFIG_ID || "";
    
    // If no valid numeric Meta App ID or Config ID is provided yet, switch to manual token tab automatically
    if (!metaAppId || !metaConfigId) {
      toast.info("Please enter your Phone Number ID & System Access Token below.");
      setConnectMode("manual");
      return;
    }

    if (typeof window.FB !== "undefined" && window.FB.login) {
      try {
        window.FB.login(
          (response: any) => {
            if (response?.authResponse) {
              const code = response.authResponse.code;
              console.log("[Meta Embedded Signup] Auth Code Received:", code);

              embeddedSignupMutation.mutate({
                code,
                accessToken: response.authResponse.accessToken
              });
            } else {
              console.log("[Meta Embedded Signup] Login window closed or cancelled.");
              toast.error("Meta signup window was closed.");
            }
          },
          {
            config_id: metaConfigId,
            response_type: "code",
            override_default_response_type: true,
            extras: {
              setup: {}
            }
          }
        );
      } catch (err) {
        console.error("FB.login error, trying fallback window...", err);
        openOAuthFallbackWindow(metaAppId, metaConfigId);
      }
    } else {
      openOAuthFallbackWindow(metaAppId, metaConfigId);
    }
  };

  const openOAuthFallbackWindow = (appId: string, configId: string) => {
    const redirectUri = `${window.location.origin}/dashboard`;
    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&config_id=${configId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    const popup = window.open(oauthUrl, "MetaWhatsAppConnect", "width=600,height=700,scrollbars=yes");
    if (!popup) {
      toast.error("Popup was blocked by your browser. Please allow popups or use Manual Token Setup.");
      setConnectMode("manual");
    }
  };

  const handleManualConnect = () => {
    if (!phoneNumberId.trim()) return toast.error("Please enter your Meta Phone Number ID");
    if (!accessToken.trim()) return toast.error("Please enter your Access Token");

    saveCredentialsMutation.mutate({
      metaPhoneNumberId: phoneNumberId.trim(),
      metaWabaId: wabaId.trim(),
      metaAccessToken: accessToken.trim(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 bg-card rounded-2xl border border-border shadow-card max-w-xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">WhatsApp Business API</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Meta Official Cloud Platform Connection</p>
        </div>
        {status?.connected ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">
            <CheckCircle2 className="w-4 h-4" />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200/40">
            <AlertCircle className="w-3.5 h-3.5" />
            Not Connected
          </span>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-6">
          <div className="bg-success/5 border-2 border-success/20 rounded-2xl p-6 text-center animate-in zoom-in duration-500">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Official Meta API Connected</h3>
            <p className="text-xs text-muted-foreground">Your store is powered by Meta WhatsApp Business Platform.</p>
          </div>

          <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground font-medium">Verified Number:</span>
              <span className="font-bold text-foreground">{status.phoneNumber || "Verified WhatsApp Number"}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
              <span className="text-muted-foreground font-medium">Quality Rating:</span>
              <span className="font-semibold text-success uppercase">{status.qualityRating || "GREEN (GOOD)"}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
              <span className="text-muted-foreground font-medium">Messaging Limit:</span>
              <span className="font-semibold text-foreground">1,000 Conversations / 24h</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] })}
              disabled={isStatusLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isStatusLoading ? "animate-spin" : ""}`} />
              Verify Status
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Meta API"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Mode Selector Tabs */}
          <div className="flex p-0.5 bg-muted/60 rounded-xl border border-border">
            <button
              onClick={() => setConnectMode("embedded")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                connectMode === "embedded"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              1-Click Meta Connect
            </button>
            <button
              onClick={() => setConnectMode("manual")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                connectMode === "manual"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Manual Token Setup
            </button>
          </div>

          {connectMode === "embedded" ? (
            <div className="space-y-4 py-2">
              <div className="p-5 bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-2xl border border-primary/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Official Meta 1-Click Setup</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                    Connect your Facebook Business Manager & WhatsApp profile directly in seconds. No manual token entry required.
                  </p>
                </div>

                <Button
                  variant="hero"
                  className="w-full text-xs font-bold h-11 shadow-lg shadow-primary/20"
                  onClick={launchMetaEmbeddedSignup}
                  disabled={embeddedSignupMutation.isPending}
                >
                  {embeddedSignupMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting with Meta...
                    </>
                  ) : (
                    "Connect Meta WhatsApp Account"
                  )}
                </Button>
              </div>

              <div className="space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Automatic Webhook & API Key registration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Official Meta Partner SLAs with 99.9% uptime</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
                Enter your custom Meta Developer App credentials manually from your Meta Business Manager.
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Phone Number ID <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 104829104920194"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    WABA ID (WhatsApp Business Account ID)
                  </label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="e.g. 981240182401928"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    System User Access Token <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    rows={3}
                    placeholder="EAAG....."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono resize-none"
                  />
                </div>

                <Button
                  className="w-full text-xs font-semibold h-10"
                  variant="hero"
                  onClick={handleManualConnect}
                  disabled={saveCredentialsMutation.isPending}
                >
                  {saveCredentialsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying with Meta...
                    </>
                  ) : (
                    "Save & Verify Credentials"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WhatsAppConnection;
