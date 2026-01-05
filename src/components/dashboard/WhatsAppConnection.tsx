import { motion } from "framer-motion";
import { QrCode, CheckCircle2, Smartphone, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateWhatsAppQR,
  fetchWhatsAppStatus,
  disconnectWhatsApp,
  getWhatsAppPairingCode,
  WhatsAppQRCodeResponse,
  WhatsAppStatusResponse,
} from "@/lib/api";
import { toast } from "sonner";

const WhatsAppConnection = () => {
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<WhatsAppQRCodeResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<"qr" | "phone" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Fetch WhatsApp connection status
  const { data: status, isLoading } = useQuery<WhatsAppStatusResponse>({
    queryKey: ["whatsapp-status"],
    queryFn: fetchWhatsAppStatus,
    refetchInterval: pollingInterval || false,
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: generateWhatsAppQR,
    onSuccess: (data) => {
      setQrData(data);
      // Start polling for connection status
      setPollingInterval(3000); // Poll every 3 seconds
      toast.success("QR Code generated! Scan it with your phone");
    },
    onError: () => {
      toast.error("Failed to generate QR code. Please try again.");
    },
  });

  // Pairing code mutation
  const pairingCodeMutation = useMutation({
    mutationFn: (phone: string) => getWhatsAppPairingCode(phone),
    onSuccess: (data) => {
      setPairingCode(data.pairingCode);
      setPollingInterval(3000);
      toast.success("Pairing code received! Enter it on your phone.");
    },
    onError: () => {
      toast.error("Failed to get pairing code. Please check the number and try again.");
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: () => {
      setQrData(null);
      setPollingInterval(null);
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
      toast.success("WhatsApp disconnected successfully");
    },
    onError: () => {
      toast.error("Failed to disconnect WhatsApp");
    },
  });

  // Stop polling when connected
  useEffect(() => {
    if (status?.connected) {
      setPollingInterval(null);
      setQrData(null);
      setPairingCode(null);
    } else if (status && !status.connected && connectionMethod === "qr" && !qrData && !generateQRMutation.isPending) {
      // Fetch QR if QR method selected but not yet generated
      generateQRMutation.mutate();
    }
  }, [status?.connected, status, qrData, generateQRMutation.isPending]);

  // Check if QR code expired
  useEffect(() => {
    if (!qrData) return;

    const expiresAt = new Date(qrData.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) {
      setQrData(null);
      setPollingInterval(null);
      toast.error("QR code expired. Please generate a new one.");
      return;
    }

    const timer = setTimeout(() => {
      setQrData(null);
      setPollingInterval(null);
      toast.error("QR code expired. Please generate a new one.");
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [qrData]);

  const handleGenerateQR = () => {
    generateQRMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleReconnect = () => {
    disconnectMutation.mutate();
    setTimeout(() => {
      generateQRMutation.mutate();
    }, 500);
  };

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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Checking connection status...</p>
        </div>
      ) : !status?.connected ? (
        <div className="text-center py-8">
          {!connectionMethod ? (
            <div className="space-y-4 max-w-xs mx-auto">
              <p className="text-sm text-muted-foreground mb-6">
                Choose how you want to connect your WhatsApp account to WhatFlow.
              </p>
              <Button
                variant="hero"
                className="w-full justify-start gap-3 h-14"
                onClick={() => setConnectionMethod("phone")}
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                Connect with phone number
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 border-2"
                onClick={() => setConnectionMethod("qr")}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                Connect with QR code
              </Button>
            </div>
          ) : connectionMethod === "qr" ? (
            <>
              {/* QR Code Display */}
              <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center border-2 border-border p-4 overflow-hidden relative group">
                {qrData?.qrCode ? (
                  qrData.qrCode.startsWith("data:image") ? (
                    <img
                      src={qrData.qrCode}
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={qrData.qrCode}
                      size={224}
                      level="H"
                      includeMargin={false}
                    />
                  )
                ) : (
                  <div className="text-center px-4">
                    <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {generateQRMutation.isPending
                        ? "Generating session..."
                        : "Preparing QR code..."}
                    </p>
                  </div>
                )}

                {generateQRMutation.isPending && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {qrData && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg mx-auto max-w-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>QR code expires in 60 seconds</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>Link via QR Code</span>
                </div>
                <ol className="text-xs text-muted-foreground space-y-2 text-left max-w-[240px] mx-auto">
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

              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <Button
                  variant="hero"
                  onClick={handleGenerateQR}
                  disabled={generateQRMutation.isPending || !!qrData}
                >
                  {generateQRMutation.isPending ? "Generating..." : qrData ? "Waiting for scan..." : "Full Refresh"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConnectionMethod(null);
                    setQrData(null);
                  }}
                  disabled={generateQRMutation.isPending}
                >
                  Change method
                </Button>
              </div>
            </>
          ) : connectionMethod === "phone" ? (
            <div className="space-y-6 max-w-xs mx-auto">
              {!pairingCode ? (
                <>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-foreground">Connect with phone number</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your WhatsApp number to receive a pairing code on your phone.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <label htmlFor="phoneNumber" className="text-xs font-medium text-muted-foreground ml-1">Phone Number</label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                      />
                    </div>
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={() => phoneNumber && pairingCodeMutation.mutate(phoneNumber)}
                      disabled={pairingCodeMutation.isPending || !phoneNumber}
                    >
                      {pairingCodeMutation.isPending ? "Getting code..." : "Get Pairing Code"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setConnectionMethod(null)}
                      disabled={pairingCodeMutation.isPending}
                    >
                      Back to methods
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center animate-in zoom-in duration-300">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Your Pairing Code</p>
                    <div className="text-4xl font-mono font-bold text-foreground tracking-[0.2em] py-2">
                      {pairingCode}
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      How to use this code:
                    </h3>
                    <ol className="text-xs text-muted-foreground space-y-3">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        Open WhatsApp → Settings → Linked Devices
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        Tap <span className="text-foreground font-medium">Link a Device</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        Tap <span className="text-foreground font-medium">Link with phone number instead</span> at the bottom
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">4.</span>
                        Enter the 8-character code shown above
                      </li>
                    </ol>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setPairingCode(null)}
                    >
                      Use different number
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setConnectionMethod(null);
                        setPairingCode(null);
                      }}
                    >
                      Back to methods
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-xs mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">Connect with phone number</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your WhatsApp number to receive a pairing code on your phone.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col items-start gap-1.5">
                  <label htmlFor="phoneNumber" className="text-xs font-medium text-muted-foreground ml-1">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <Button variant="hero" className="w-full">
                  Get Pairing Code
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setConnectionMethod(null)}
                >
                  Back to methods
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {status.phoneNumber || "+1 (555) 123-4567"}
              </p>
              <p className="text-sm text-muted-foreground">
                {status.deviceName || "Business WhatsApp"}
              </p>
              {status.lastConnected && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last connected: {new Date(status.lastConnected).toLocaleString()}
                </p>
              )}
            </div>
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
      )}
    </motion.div>
  );
};

export default WhatsAppConnection;
