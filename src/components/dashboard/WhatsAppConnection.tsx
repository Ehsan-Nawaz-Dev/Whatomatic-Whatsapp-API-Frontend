import { motion } from "framer-motion";
import { QrCode, CheckCircle2, Smartphone, RefreshCw, AlertCircle, MessageSquare, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateWhatsAppQR,
  fetchWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppPairingCode,
  sendWhatsAppMessage,
  sendCloudMessage,
  WhatsAppQRCodeResponse,
  WhatsAppStatusResponse,
  getCurrentShop,
} from "@/lib/api";
import { toast } from "sonner";

const WhatsAppConnection = () => {
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<WhatsAppQRCodeResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<"qr" | "phone">("qr");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Fetch WhatsApp connection status
  const { data: status, isLoading: isStatusLoading } = useQuery<WhatsAppStatusResponse>({
    queryKey: ["whatsapp-status", getCurrentShop()],
    queryFn: fetchWhatsAppStatus,
    refetchInterval: (query) => (query.state.data?.connected ? false : 3000), // Poll every 3 seconds if not connected
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Watch for connection status changes and refresh merchant settings
  useEffect(() => {
    if (status?.connected) {
      // Invalidate merchant settings to reload the WhatsApp number
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", getCurrentShop()] });
    }
  }, [status?.connected, queryClient]);

  // Fetch QR code
  const { data: qrResponse, isLoading: isQrLoading, error: qrError } = useQuery<WhatsAppQRCodeResponse, Error>({
    queryKey: ["whatsapp-qr", getCurrentShop()],
    queryFn: generateWhatsAppQR,
    enabled: !status?.connected && !isStatusLoading, // Fetch QR if not connected
    refetchInterval: (query) => (status?.connected ? false : 5000), // Increase interval slightly to avoid congestion
    retry: 1, // Only retry once per interval
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: connectWhatsApp,
    onSuccess: () => {
      console.log("[WhatsApp] Connection initialized");
    },
    onError: (err: any) => {
      console.error("[WhatsApp] Connection error:", err);
      toast.error(`Failed to start server: ${err.message}`);
    }
  });

  // Pairing code mutation
  const pairMutation = useMutation({
    mutationFn: getWhatsAppPairingCode,
    onSuccess: (data) => {
      setPairingCode(data.pairingCode);
      toast.success("Pairing code generated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to get pairing code");
    }
  });

  // Auto-connect on mount
  useEffect(() => {
    connectMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-qr", getCurrentShop()] });
      toast.success("WhatsApp disconnected successfully");
    },
    onError: () => {
      toast.error("Failed to disconnect WhatsApp");
    },
  });

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleReconnect = () => {
    disconnectMutation.mutate();
    setTimeout(() => {
      connectMutation.mutate();
    }, 500);
  };

  const currentQr = qrResponse?.qrCode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-card rounded-xl border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">WhatsApp Connection</h2>
        {status?.connected && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        )}
      </div>

      {!status?.connected ? (
        <div className="text-center py-4">
          {/* Method Selector */}
          <div className="flex p-1 bg-muted/50 rounded-lg max-w-[320px] mx-auto mb-8 border border-border">
            <button
              onClick={() => setConnectionMethod("qr")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${connectionMethod === "qr"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <button
              onClick={() => setConnectionMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${connectionMethod === "phone"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Smartphone className="w-4 h-4" />
              Pairing Code
            </button>
          </div>

          <div className="space-y-4 max-w-xs mx-auto">
            {connectionMethod === "qr" ? (
              <>
                {/* QR Code Display */}
                <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center border-2 border-border p-4 overflow-hidden relative group">
                  {currentQr ? (
                    <img
                      src={currentQr}
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-xs text-muted-foreground">
                        {qrError ? qrError.message : (connectMutation.isPending ? "Starting server..." : "Loading QR code...")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                      <QrCode className="w-4 h-4" />
                      <span>Link via QR Code</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] })}
                      disabled={isStatusLoading}
                      className="text-[10px] h-7 px-3"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isStatusLoading ? "animate-spin" : ""}`} />
                      Check Connection Status
                    </Button>
                  </div>

                  <ol className="text-xs text-muted-foreground space-y-2 text-left max-w-[240px] mx-auto">
                    <p className="text-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded text-[10px] mb-2">
                      {isStatusLoading ? "Checking status..." : "Waiting for scan..."}
                    </p>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">1.</span>
                      Open WhatsApp → Settings → Linked Devices
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">2.</span>
                      Tap "Link a Device" and scan this code
                    </li>
                  </ol>
                </div>


              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground mb-4">
                    Enter your phone number with country code to receive a link code on your WhatsApp.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      className="w-full"
                      onClick={() => pairMutation.mutate(phoneNumber)}
                      disabled={!phoneNumber || pairMutation.isPending}
                    >
                      {pairMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : "Get Pairing Code"}
                    </Button>
                  </div>
                </div>

                {pairingCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl text-center"
                  >
                    <p className="text-xs font-semibold text-primary uppercase tracking-tight mb-2">Your Pairing Code</p>
                    <div className="flex justify-center gap-2">
                      {pairingCode.split('').map((char, i) => (
                        <span key={i} className="w-8 h-10 flex items-center justify-center bg-background border-2 border-primary/30 rounded text-xl font-bold text-foreground">
                          {char}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                      <Key className="w-4 h-4" />
                      <span>Link with Phone Number</span>
                    </div>

                    {pairingCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["whatsapp-status", getCurrentShop()] })}
                        disabled={isStatusLoading}
                        className="text-[10px] h-7 px-3"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isStatusLoading ? "animate-spin" : ""}`} />
                        Check Connection Status
                      </Button>
                    )}
                  </div>

                  <ol className="text-xs text-muted-foreground space-y-2 text-left max-w-[240px] mx-auto">
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">1.</span>
                      Open WhatsApp → Settings → Linked Devices
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">2.</span>
                      Tap "Link a Device" → "Link with phone number instead"
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-primary">3.</span>
                      Enter the 8-character code shown above
                    </li>
                    {pairingCode && (
                      <p className="text-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded text-[10px] mt-2 italic">
                        Once entered, wait 10-20 seconds then click Check Status.
                      </p>
                    )}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-success/5 border-2 border-success/20 rounded-2xl p-6 text-center animate-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">Success: Connected!</h3>
            <p className="text-sm text-muted-foreground">Your WhatsApp account is active and ready.</p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-xl border border-border/50">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {status.phoneNumber || "Linked Business Number"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {status.deviceName || "WhatsApp Session"}
              </p>
            </div>
          </div>

          {/* Daily Limit Safety Monitor */}
          <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Daily Safety Limit</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {status.dailyUsage || 0} / {status.dailyLimit || 250}
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((status.dailyUsage || 0) / (status.dailyLimit || 250)) * 100, 100)}%` }}
                className={`h-full rounded-full ${((status.dailyUsage || 0) / (status.dailyLimit || 250)) > 0.8
                  ? "bg-destructive"
                  : "bg-primary"
                  }`}
              />
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              * To avoid being blocked by WhatsApp, we limit "Device" connections to 250 messages/day. Upgrade to <strong className="text-primary">Cloud API</strong> for unlimited, 100% safe sending.
            </p>
          </div>

          {/* Test Message Feature */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-1">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Send Test Message</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Phone (e.g. +923...)"
                className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                id="test-phone"
              />
              <Button
                size="sm"
                variant="default"
                className="h-8 text-xs h-[30px]"
                onClick={async () => {
                  const phone = (document.getElementById("test-phone") as HTMLInputElement).value;
                  if (!phone) return toast.error("Enter a phone number");
                  try {
                    const res = await sendWhatsAppMessage({
                      to: phone,
                      message: "Hello from WhatFlow! Your connection is working. 🚀"
                    });
                    toast.success("Test message sent!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to send message");
                  }
                }}
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Verify your connection by sending a message to your own number.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={disconnectMutation.isPending}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </div>
      )
      }
    </motion.div >
  );
};

export default WhatsAppConnection;
