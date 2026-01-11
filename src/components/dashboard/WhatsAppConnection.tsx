import { motion } from "framer-motion";
import { QrCode, CheckCircle2, Smartphone, RefreshCw, AlertCircle } from "lucide-react";
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
  sendCloudMessage,
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
  const { data: status, isLoading: isStatusLoading } = useQuery<WhatsAppStatusResponse>({
    queryKey: ["whatsapp-status"],
    queryFn: fetchWhatsAppStatus,
    refetchInterval: (query) => (query.state.data?.connected ? false : 3000), // Poll every 3 seconds if not connected
  });

  // Fetch QR code
  const { data: qrResponse, isLoading: isQrLoading, error: qrError } = useQuery<WhatsAppQRCodeResponse, Error>({
    queryKey: ["whatsapp-qr"],
    queryFn: generateWhatsAppQR,
    enabled: !status?.connected, // Fetch QR if not connected (even if status is loading/error)
    refetchInterval: (query) => (status?.connected ? false : 2000), // Poll every 2 seconds if not connected
    retry: true,
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

  // Auto-connect on mount
  useEffect(() => {
    connectMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-qr"] });
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
        <div className="text-center py-8">
          <div className="space-y-4 max-w-xs mx-auto">
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
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <Smartphone className="w-4 h-4" />
                <span>Link via QR Code</span>
              </div>
              <ol className="text-xs text-muted-foreground space-y-2 text-left max-w-[240px] mx-auto">
                <p className="text-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded text-[10px] mb-2">
                  Scanning... polling QR every 2s
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
