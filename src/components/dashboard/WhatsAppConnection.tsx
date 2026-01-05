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
  WhatsAppQRCodeResponse,
  WhatsAppStatusResponse,
} from "@/lib/api";
import { toast } from "sonner";

const WhatsAppConnection = () => {
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<WhatsAppQRCodeResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

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
    } else if (status && !status.connected && !qrData && !generateQRMutation.isPending) {
      // Auto-fetch QR if not connected and we don't have it yet
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
          {/* QR Code Display */}
          <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center border-2 border-border p-4 overflow-hidden">
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
                    : "Click below to generate"}
                </p>
              </div>
            )}
          </div>

          {qrData && (
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg mx-auto max-w-xs">
              <AlertCircle className="w-4 h-4" />
              <span>QR code expires in 60 seconds</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span>Open WhatsApp on your phone</span>
            </div>
            <ol className="text-sm text-muted-foreground space-y-2 text-left max-w-xs mx-auto">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">1.</span>
                Go to Settings → Linked Devices
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">2.</span>
                Tap "Link a Device"
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">3.</span>
                Point your phone at this screen
              </li>
            </ol>
          </div>

          <Button
            variant="hero"
            className="mt-6"
            onClick={handleGenerateQR}
            disabled={generateQRMutation.isPending || !!qrData}
          >
            {generateQRMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : qrData ? (
              "Waiting for scan..."
            ) : (
              "Generate QR Code"
            )}
          </Button>
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
