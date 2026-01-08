export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://backend-wfmy.onrender.com/api").replace(/\/$/, "");
const getShopFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("shop") || params.get("shop_domain") || null;
  } catch (e) {
    return null;
  }
};

const RAW_SHOP = getShopFromUrl() || import.meta.env.VITE_SHOP_DOMAIN || "demo-shop.myshopify.com";
// Sanitize shop name: only alphanumeric and underscores for maximum backend compatibility
// We keep the original for webhooks but the sanitized one for general API grouping if needed
const DEFAULT_SHOP = RAW_SHOP.replace(/[^a-zA-Z0-9\.]/g, "_");

export const withShopParam = (path: string) => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${API_BASE_URL}/${cleanPath}`);
  url.searchParams.set("shop", RAW_SHOP); // Use the real raw shop for backend matching
  return url.toString();
};

const sanitizePhone = (phone: string) => {
  // Remove everything except digits and +
  return phone.replace(/[^\d+]/g, "");
};

export interface MerchantSettingsPayload {
  storeName?: string;
  whatsappNumber?: string;
  defaultCountry?: string;
  language?: string;
  adminPhoneNumber?: string;
  orderConfirmTag?: string;
  orderCancelTag?: string;
}

export const fetchSettings = async () => {
  const res = await fetch(withShopParam("/settings"));
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
};

export const updateSettings = async (payload: MerchantSettingsPayload) => {
  const res = await fetch(withShopParam("/settings"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
};

export interface TemplatePayload {
  id?: string;
  name: string;
  event: string;
  message: string;
  enabled: boolean;
  isPoll?: boolean;
  pollOptions?: string[];
}

export const fetchTemplates = async () => {
  const res = await fetch(withShopParam("/templates"));
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
};

export const createTemplate = async (payload: TemplatePayload) => {
  const res = await fetch(withShopParam("/templates"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create template");
  return res.json();
};

export const updateTemplate = async (id: string, payload: TemplatePayload) => {
  const res = await fetch(withShopParam(`/templates/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update template");
  return res.json();
};

export const deleteTemplate = async (id: string) => {
  const res = await fetch(withShopParam(`/templates/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete template");
  return res.json();
};

export const fetchActivity = async () => {
  const res = await fetch(withShopParam("/activity"));
  if (!res.ok) throw new Error("Failed to load activity");
  return res.json();
};

export const submitContact = async (payload: { name: string; email: string; message?: string }) => {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit contact form");
  return res.json();
};

export interface NotificationSettingsPayload {
  notifyOnConfirm: boolean;
  notifyOnCancel: boolean;
  notifyOnAbandoned: boolean;
  emailAlerts: boolean;
  whatsappAlerts: boolean;
}

export const fetchNotificationSettings = async () => {
  const res = await fetch(withShopParam("/notifications"));
  if (!res.ok) throw new Error("Failed to load notification settings");
  return res.json();
};

export const updateNotificationSettings = async (payload: NotificationSettingsPayload) => {
  const res = await fetch(withShopParam("/notifications"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save notification settings");
  return res.json();
};

export interface AnalyticsSummary {
  messagesSent: number;
  recoveredCarts: number;
  confirmedOrders: number;
  responseRate: number;
  abandonedCheckouts: number;
  delivered: number;
  replies: number;
  recoveryRate: number;
  cancelled: number;
  periodDays: number;
}

export const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  const res = await fetch(withShopParam("/analytics"));
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
};

// WhatsApp Web API
export interface WhatsAppQRCodeResponse {
  qrCode: string;
  sessionId: string;
  expiresAt: string;
}

export interface WhatsAppStatusResponse {
  connected: boolean;
  phoneNumber?: string;
  deviceName?: string;
  lastConnected?: string;
}

export interface WhatsAppMessagePayload {
  to: string;
  message: string;
  type?: "text" | "image" | "document";
}

export const generateWhatsAppQR = async (): Promise<WhatsAppQRCodeResponse> => {
  const res = await fetch(withShopParam("/whatsapp/qr"));
  if (!res.ok) throw new Error("Failed to fetch current QR code from backend");

  const data = await res.json();
  if (!data.qrCode) throw new Error("No active QR code found on backend");

  return {
    qrCode: data.qrCode,
    sessionId: data.sessionId || `session_${DEFAULT_SHOP}`,
    expiresAt: data.expiresAt || new Date(Date.now() + 60000).toISOString()
  };
};

export const getWhatsAppPairingCode = async (phone: string): Promise<{ pairingCode: string }> => {
  const sanitizedPhone = sanitizePhone(phone);
  // Send in query params AND body for maximum compatibility
  const urlObj = new URL(withShopParam("/whatsapp/pair"));
  urlObj.searchParams.set("phone", sanitizedPhone);
  const url = urlObj.toString();

  console.log(`[API] Requesting pairing code for ${sanitizedPhone} to ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: sanitizedPhone,
        shop: DEFAULT_SHOP
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.error || errorData.message || `Server error (${res.status})`;
      console.error(`[API] Pairing error: ${res.status} ${res.statusText}`, errorData);
      throw new Error(message);
    }

    return res.json();
  } catch (err: any) {
    if (err.message === "Failed to fetch") {
      throw new Error("Cannot connect to backend. Please check your internet or API URL.");
    }
    throw err;
  }
};


export const fetchWhatsAppStatus = async (): Promise<WhatsAppStatusResponse> => {
  const res = await fetch(withShopParam("/whatsapp/status"));
  if (!res.ok) throw new Error("Failed to fetch WhatsApp status");
  return res.json();
};

export const connectWhatsApp = async () => {
  const res = await fetch(withShopParam("/whatsapp/connect"), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to connect WhatsApp");
  return res.json();
};

export const disconnectWhatsApp = async () => {
  const res = await fetch(withShopParam("/whatsapp/disconnect"), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to disconnect WhatsApp");
  return res.json();
};

export const sendWhatsAppMessage = async (payload: WhatsAppMessagePayload) => {
  const res = await fetch(withShopParam("/whatsapp/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send WhatsApp message");
  return res.json();
};

// WhatsApp Cloud API
export interface CloudMessagePayload {
  to: string;
  message: string;
  type?: "text" | "template";
}

export interface CloudTemplatePayload {
  to: string;
  templateName: string;
  language: string;
  components?: any[];
}

export interface CloudTemplate {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: any[];
}

export const sendCloudMessage = async (payload: CloudMessagePayload) => {
  const res = await fetch(withShopParam("/whatsapp-cloud/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send cloud message");
  return res.json();
};

export const sendCloudTemplate = async (payload: CloudTemplatePayload) => {
  const res = await fetch(withShopParam("/whatsapp-cloud/send-template"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send template message");
  return res.json();
};

export const fetchCloudTemplates = async (): Promise<CloudTemplate[]> => {
  const res = await fetch(withShopParam("/whatsapp-cloud/templates"));
  if (!res.ok) throw new Error("Failed to fetch cloud templates");
  return res.json();
};

// Contact Management API
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactPayload {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  notes?: string;
}

export const fetchContacts = async (): Promise<Contact[]> => {
  const res = await fetch(withShopParam("/contact"));
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
};

export const createContact = async (payload: ContactPayload): Promise<Contact> => {
  const res = await fetch(withShopParam("/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create contact");
  return res.json();
};

export const updateContact = async (id: string, payload: Partial<ContactPayload>): Promise<Contact> => {
  const res = await fetch(withShopParam(`/contact/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
};

export const deleteContact = async (id: string) => {
  const res = await fetch(withShopParam(`/contact/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete contact");
  return res.json();
};

// Notifications Management API
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await fetch(withShopParam("/notifications"));
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const createNotification = async (payload: NotificationPayload): Promise<Notification> => {
  const res = await fetch(withShopParam("/notifications"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create notification");
  return res.json();
};

export const updateNotification = async (id: string, payload: Partial<Notification>): Promise<Notification> => {
  const res = await fetch(withShopParam(`/notifications/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update notification");
  return res.json();
};

export const deleteNotification = async (id: string) => {
  const res = await fetch(withShopParam(`/notifications/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
};

// Activity Logging API
export interface ActivityLogPayload {
  event: string;
  description: string;
  metadata?: Record<string, any>;
}

export const createActivityLog = async (payload: ActivityLogPayload) => {
  const res = await fetch(withShopParam("/activity"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create activity log");
  return res.json();
};

// Campaigns API
export const sendCampaign = async (payload: { contacts: any[]; message: string }) => {
  const res = await fetch(withShopParam("/campaigns/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send campaign");
  return res.json();
};

// Chat Button API
export interface ChatButtonSettings {
  enabled: boolean;
  phoneNumber: string;
  buttonText: string;
  position: string;
  themeColor: string;
}

export const fetchChatButtonSettings = async (): Promise<ChatButtonSettings> => {
  const res = await fetch(withShopParam("/settings/chat-button"));
  if (!res.ok) throw new Error("Failed to fetch chat button settings");
  return res.json();
};

export const updateChatButtonSettings = async (payload: ChatButtonSettings) => {
  const res = await fetch(withShopParam("/settings/chat-button"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update chat button settings");
  return res.json();
};

// Automations Stats API
export const fetchAutomationsStats = async () => {
  const res = await fetch(withShopParam("/automations/stats"));
  if (!res.ok) throw new Error("Failed to fetch automations stats");
  return res.json();
};
// Automations Toggle API
export const toggleAutomation = async (id: string, enabled: boolean) => {
  const res = await fetch(withShopParam("/automations/toggle"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, enabled }),
  });
  if (!res.ok) throw new Error("Failed to toggle automation");
  return res.json();
};
