import { motion } from "framer-motion";
import { Bell, Mail, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  NotificationSettingsPayload,
  getCurrentShop,
} from "@/lib/api";

const NotificationsSettings = () => {
  const [notifyOnConfirm, setNotifyOnConfirm] = useState(true);
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);
  const [notifyOnAbandoned, setNotifyOnAbandoned] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notification-settings", getCurrentShop()],
    queryFn: fetchNotificationSettings,
  });

  const mutation = useMutation({
    mutationFn: (payload: NotificationSettingsPayload) => updateNotificationSettings(payload),
  });

  useEffect(() => {
    if (!data) return;
    setNotifyOnConfirm(!!data.notifyOnConfirm);
    setNotifyOnCancel(!!data.notifyOnCancel);
    setNotifyOnAbandoned(!!data.notifyOnAbandoned);
    setEmailAlerts(!!data.emailAlerts);
    setWhatsappAlerts(!!data.whatsappAlerts);
    setPushNotifications(!!data.pushNotifications);
  }, [data]);

  const handleToggle = (next: Partial<NotificationSettingsPayload>) => {
    const payload: NotificationSettingsPayload = {
      notifyOnConfirm,
      notifyOnCancel,
      notifyOnAbandoned,
      emailAlerts,
      whatsappAlerts,
      pushNotifications,
      ...next,
    };
    mutation.mutate(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Control how you and your team are notified about WhatsApp activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Order events</h2>
              <p className="text-xs text-muted-foreground">
                Get notified when customers confirm, cancel, or ignore WhatsApp messages.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span className="text-foreground">Customer confirms order via WhatsApp</span>
              <Switch
                checked={notifyOnConfirm}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setNotifyOnConfirm(v);
                  handleToggle({ notifyOnConfirm: v });
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-foreground">Customer cancels order via WhatsApp</span>
              <Switch
                checked={notifyOnCancel}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setNotifyOnCancel(v);
                  handleToggle({ notifyOnCancel: v });
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-foreground">Abandoned cart not recovered</span>
              <Switch
                checked={notifyOnAbandoned}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setNotifyOnAbandoned(v);
                  handleToggle({ notifyOnAbandoned: v });
                }}
              />
            </label>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Channels</h2>
              <p className="text-xs text-muted-foreground">
                Choose how notifications are delivered to your team.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4" />
                Email alerts
              </span>
              <Switch
                checked={emailAlerts}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setEmailAlerts(v);
                  handleToggle({ emailAlerts: v });
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-foreground">
                <MessageCircle className="w-4 h-4" />
                Internal WhatsApp alerts
              </span>
              <Switch
                checked={whatsappAlerts}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setWhatsappAlerts(v);
                  handleToggle({ whatsappAlerts: v });
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-foreground">
                <Bell className="w-4 h-4" />
                Browser push notifications
              </span>
              <Switch
                checked={pushNotifications}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(v) => {
                  setPushNotifications(v);
                  handleToggle({ pushNotifications: v });
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsSettings;
