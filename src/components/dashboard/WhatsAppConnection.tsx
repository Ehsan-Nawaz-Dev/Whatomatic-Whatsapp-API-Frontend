import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWhatsAppStatus,
  fetchWhatsAppConfig,
  disconnectWhatsApp,
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

  // Fetch dynamic Meta App ID configuration from backend
  const { data: remoteConfig } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: fetchWhatsAppConfig,
    staleTime: 60000,
  });

  const staticAppId = import.meta.env.VITE_META_APP_ID || "";
  const staticConfigId = import.meta.env.VITE_META_CONFIG_ID || "";

  const resolvedAppId = /^\d+$/.test(staticAppId) ? staticAppId : (remoteConfig?.metaAppId || "1031248766177799");
  const resolvedConfigId = staticConfigId || remoteConfig?.metaConfigId || "1981964775839147";

  // Load Meta Facebook JavaScript SDK for Embedded Signup
  useEffect(() => {
    const isNumericAppId = /^\d+$/.test(resolvedAppId);

    if (isNumericAppId && !document.getElementById("facebook-jssdk")) {
      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.init({
            appId: resolvedAppId,
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
  }, [resolvedAppId]);

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

  const getCanonicalRedirectUri = () => {
    return `${window.location.origin}/dashboard`;
  };

  // Listen for OAuth authorization code in URL (for direct URL fallback redirect on Vercel)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !status?.connected) {
      console.log("[Meta OAuth Direct Redirect] Captured code from URL string:", code);
      embeddedSignupMutation.mutate({
        code,
        redirectUri: getCanonicalRedirectUri()
      });
      // Clean code query parameter from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status?.connected]);

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: () => disconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
      toast.success("Meta WhatsApp account disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect WhatsApp");
    },
  });

  // Trigger Meta Official Embedded Signup Popup via Facebook Login
  const launchMetaEmbeddedSignup = () => {
    const isNumericAppId = /^\d+$/.test(resolvedAppId);

    if (!isNumericAppId) {
      toast.error("META_APP_ID is missing. Please set META_APP_ID in Vercel Environment Variables.");
      return;
    }

    if (typeof window.FB !== "undefined" && window.FB.login) {
      try {
        window.FB.login(
          (response: any) => {
            if (response?.authResponse) {
              const code = response.authResponse.code;
              const accessToken = response.authResponse.accessToken;
              console.log("[Meta Embedded Signup] Auth Response:", { code: !!code, accessToken: !!accessToken });

              embeddedSignupMutation.mutate({
                code,
                accessToken,
                redirectUri: getCanonicalRedirectUri()
              });
            } else {
              console.log("[Meta Embedded Signup] Login window closed or cancelled.");
              toast.error("Meta signup window was closed.");
            }
          },
          {
            config_id: resolvedConfigId,
            extras: {
              setup: {}
            }
          }
        );
      } catch (err) {
        console.error("FB.login error, trying fallback window...", err);
        openOAuthFallbackWindow(resolvedAppId, resolvedConfigId);
      }
    } else {
      openOAuthFallbackWindow(resolvedAppId, resolvedConfigId);
    }
  };

  const openOAuthFallbackWindow = (appId: string, configId: string) => {
    const redirectUri = getCanonicalRedirectUri();
    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&config_id=${configId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    const popup = window.open(oauthUrl, "MetaWhatsAppConnect", "width=600,height=700,scrollbars=yes");
    if (!popup) {
      toast.error("Popup was blocked by your browser. Please allow popups.");
    }
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
          <div className="space-y-4 py-2">
            <div className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-2xl border border-primary/20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Connect with Facebook Login</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                  Log in with Facebook to select your WhatsApp Business Account and connect automatically.
                </p>
              </div>

              <Button
                variant="hero"
                className="w-full text-xs font-bold h-11 shadow-lg shadow-primary/20 bg-[#1877F2] hover:bg-[#166FE5] text-white"
                onClick={launchMetaEmbeddedSignup}
                disabled={embeddedSignupMutation.isPending}
              >
                {embeddedSignupMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting with Meta...
                  </>
                ) : (
                  "Connect with Facebook Login"
                )}
              </Button>
            </div>

            <div className="space-y-2 text-[11px] text-muted-foreground pt-1">
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
        </div>
      )}
    </motion.div>
  );
};

export default WhatsAppConnection;
