import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, AlertCircle, ShieldCheck, Zap, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWhatsAppStatus,
  fetchWhatsAppConfig,
  disconnectWhatsApp,
  connectEmbeddedSignup,
  registerWhatsAppNumber,
  requestMetaVerification,
  verifyMetaCode,
  sendCloudMessage,
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

  // Meta app identity comes from the backend (or a build-time override). No hardcoded
  // fallback IDs - a misconfigured deploy must surface, not silently point merchants
  // at some other Meta app.
  const staticAppId = import.meta.env.VITE_META_APP_ID || "";
  const staticConfigId = import.meta.env.VITE_META_CONFIG_ID || "";

  const resolvedAppId = /^\d+$/.test(staticAppId) ? staticAppId : (remoteConfig?.metaAppId || "");
  const resolvedConfigId = staticConfigId || remoteConfig?.metaConfigId || "";

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
    onSuccess: async (data: any) => {
      toast.success(data.message || "Meta WhatsApp Business Account Connected!");
      
      // Update React Query cache instantly so status & buttons change immediately
      queryClient.setQueryData(["whatsapp-status", getCurrentShop()], (old: any) => ({
        ...old,
        connected: true,
        phoneNumber: data.displayPhone || data.phoneNumber || "Verified Meta Phone",
        qualityRating: "GREEN",
        deviceName: "Meta Cloud API",
        status: "connected"
      }));

      await queryClient.refetchQueries({ queryKey: ["whatsapp-status"] });
      await queryClient.refetchQueries({ queryKey: ["merchant-settings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Embedded Signup connection failed");
    }
  });

  const [capturedMetaIds, setCapturedMetaIds] = useState<{ wabaId?: string; phoneNumberId?: string }>({});

  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessageText, setTestMessageText] = useState("Hello! 👋 This is a live test message from your Whatomatic Meta WhatsApp Business API.");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber.trim()) {
      toast.error("Please enter a target phone number");
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await sendCloudMessage({
        to: testPhoneNumber.trim(),
        message: testMessageText.trim()
      });
      if (res.success) {
        toast.success(`Test WhatsApp message sent successfully! ID: ${res.messageId || 'OK'}`);
      } else {
        toast.error(res.error || "Failed to send test message");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send test message");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Listen for Meta Embedded Signup postMessage events (emitted by Meta popup)
  useEffect(() => {
    const handleMetaMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP" || data?.event === "WA_EMBEDDED_SIGNUP") {
          console.log("[Meta Embedded Signup] postMessage event received:", data);
          const wabaId = data.data?.waba_id || data.waba_id;
          const phoneNumberId = data.data?.phone_number_id || data.phone_number_id;
          if (wabaId || phoneNumberId) {
            setCapturedMetaIds({ wabaId, phoneNumberId });
          }
        }
      } catch (err) {
        // Ignore non-JSON postMessage events
      }
    };

    window.addEventListener("message", handleMetaMessage);
    return () => window.removeEventListener("message", handleMetaMessage);
  }, []);

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
        wabaId: capturedMetaIds.wabaId,
        phoneNumberId: capturedMetaIds.phoneNumberId,
        redirectUri: getCanonicalRedirectUri()
      });
      // Clean code query parameter from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status?.connected]);

  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Request Meta Verification OTP SMS/Voice Code
  const requestOtpMutation = useMutation({
    mutationFn: (method: "SMS" | "VOICE") => requestMetaVerification(method),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Verification OTP sent from Meta! Check your phone.");
      setShowOtpInput(true);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send OTP code from Meta");
    }
  });

  // Verify Meta 6-Digit Verification Code
  const verifyOtpMutation = useMutation({
    mutationFn: (code: string) => verifyMetaCode(code),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Phone number verified and enabled for Cloud API messaging!");
      setShowOtpInput(false);
      setOtpCode("");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to verify Meta OTP code");
    }
  });

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

    if (!isNumericAppId || !resolvedConfigId) {
      toast.error("WhatsApp signup isn't available right now. Please contact support.");
      console.error("[Meta Embedded Signup] Missing META_APP_ID / META_CONFIG_ID from backend config.");
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
                wabaId: capturedMetaIds.wabaId,
                phoneNumberId: capturedMetaIds.phoneNumberId,
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

          {status.registered === false && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Phone Verification Required</p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Your number is linked to Meta. Click <strong>"Send SMS OTP Code"</strong> below to receive Meta's 6-digit verification code directly on your phone and enable Cloud API messaging dynamically.
                  </p>
                </div>
              </div>

              {!showOtpInput ? (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    onClick={() => requestOtpMutation.mutate("SMS")}
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? "Sending OTP..." : "Send SMS OTP Code"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => requestOtpMutation.mutate("VOICE")}
                    disabled={requestOtpMutation.isPending}
                  >
                    Voice Call OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      Enter Meta 6-Digit Verification Code:
                    </span>
                    <button
                      className="text-[10px] text-amber-700 dark:text-amber-300 underline"
                      onClick={() => requestOtpMutation.mutate("SMS")}
                      disabled={requestOtpMutation.isPending}
                    >
                      Resend SMS
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-background text-foreground tracking-widest font-mono text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <Button
                      size="sm"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4"
                      onClick={() => verifyOtpMutation.mutate(otpCode)}
                      disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status.degraded && (
            <p className="text-xs text-muted-foreground text-center">
              Meta is temporarily unreachable — showing last known status.
            </p>
          )}

          <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground font-medium">Verified Number:</span>
              <span className="font-bold text-foreground">{status.phoneNumber || "Verified WhatsApp Number"}</span>
            </div>
            {status.qualityRating && (
              <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
                <span className="text-muted-foreground font-medium">Quality Rating:</span>
                <span className="font-semibold text-success uppercase">{status.qualityRating}</span>
              </div>
            )}
          </div>

          {/* Test Message Component */}
          <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-primary" />
                Send Test WhatsApp Message
              </span>
              <span className="text-[10px] font-medium text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Meta Cloud API
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter recipient phone number (e.g. +923048799087)"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
              <textarea
                rows={2}
                placeholder="Test message text..."
                value={testMessageText}
                onChange={(e) => setTestMessageText(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-all"
              />
            </div>

            <Button
              size="sm"
              className="w-full text-xs font-bold gap-1.5 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSendTestMessage}
              disabled={isSendingTest || !testPhoneNumber.trim()}
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending Test Message...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test Message
                </>
              )}
            </Button>
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
