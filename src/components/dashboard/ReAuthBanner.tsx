import { useQuery } from "@tanstack/react-query";
import { withShopParam } from "@/lib/api";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const ReAuthBanner = () => {
    const [countdown, setCountdown] = useState(15); // Auto-redirect after 15 seconds
    const [autoRedirectEnabled, setAutoRedirectEnabled] = useState(true);

    // Fetch auth status for the current merchant (dynamically based on shop param)
    const { data: authStatus, isLoading } = useQuery({
        queryKey: ["auth-status"],
        queryFn: async () => {
            const res = await fetch(withShopParam("/settings/auth-status"));
            if (!res.ok) return null;
            return res.json();
        },
        refetchInterval: 30000, // Check every 30 seconds
    });

    // Auto-redirect countdown
    useEffect(() => {
        if (authStatus?.needsReauth && autoRedirectEnabled && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (authStatus?.needsReauth && autoRedirectEnabled && countdown === 0) {
            // Redirect to OAuth
            window.location.href = authStatus.reauthUrl;
        }
    }, [authStatus, countdown, autoRedirectEnabled]);

    // Don't show banner if loading or authenticated
    if (isLoading || !authStatus || authStatus.authenticated) {
        return null;
    }

    // Show banner if re-authorization is needed
    if (authStatus.needsReauth) {
        return (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 shadow-lg border-b border-red-600 animate-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <AlertTriangle className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Shopify Connection Needs Update</h3>
                            <p className="text-sm text-white/90">
                                {authStatus.reason || "We've updated our app permissions. Please reconnect to continue using WhatFlow."}
                            </p>
                            {autoRedirectEnabled && countdown > 0 && (
                                <p className="text-xs text-white/80 mt-1 font-mono">
                                    Auto-redirecting in {countdown} seconds...
                                </p>
                            )}
                            {authStatus.detectedAt && !autoRedirectEnabled && (
                                <p className="text-xs text-white/70 mt-1">
                                    Detected: {new Date(authStatus.detectedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {autoRedirectEnabled && countdown > 0 && (
                            <Button
                                onClick={() => setAutoRedirectEnabled(false)}
                                variant="outline"
                                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                                size="sm"
                            >
                                Cancel Auto-Redirect
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                window.location.href = authStatus.reauthUrl;
                            }}
                            className="bg-white text-red-600 hover:bg-red-50 font-bold shadow-lg flex items-center gap-2"
                            size="lg"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reconnect Now
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ReAuthBanner;
