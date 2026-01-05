import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Info, AlertTriangle, CheckCircle2, XCircle, Trash2, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    fetchNotifications,
    deleteNotification,
    updateNotification,
    Notification
} from "@/lib/api";
import NotificationsSettings from "./NotificationsSettings";

const NotificationsList = () => {
    const queryClient = useQueryClient();
    const [showSettings, setShowSettings] = useState(false);

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
    });

    const deleteMut = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Notification removed");
        },
    });

    const markReadMut = useMutation({
        mutationFn: (id: string) => updateNotification(id, { read: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const getTypeIcon = (type: Notification["type"]) => {
        switch (type) {
            case "info": return <Info className="w-4 h-4 text-blue-500" />;
            case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case "error": return <XCircle className="w-4 h-4 text-destructive" />;
            default: return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    if (showSettings) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                        ← Back to Notifications
                    </Button>
                </div>
                <NotificationsSettings />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Activity Notifications</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Stay updated with your WhatsApp and order activity
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : notifications.length === 0 ? (
                    <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
                        <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
                        <p className="text-sm text-muted-foreground">We'll alert you when something important happens.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 bg-card rounded-xl border transition-all duration-200 flex items-start gap-4 group ${notif.read ? "border-border opacity-70" : "border-primary/20 shadow-sm shadow-primary/5"
                                    }`}
                            >
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${notif.read ? "bg-muted" : "bg-primary/10"
                                    }`}>
                                    {getTypeIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold text-sm truncate ${notif.read ? "text-foreground/70" : "text-foreground"}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {notif.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-primary hover:bg-primary/10"
                                            onClick={() => markReadMut.mutate(notif.id)}
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteMut.mutate(notif.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="pt-4 flex justify-center">
                    <Button variant="link" className="text-xs text-muted-foreground">
                        Clear all notifications
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NotificationsList;
