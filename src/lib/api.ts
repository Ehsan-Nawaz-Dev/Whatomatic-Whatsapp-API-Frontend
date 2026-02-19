export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://api.whatomatic.com/api").replace(/\/$/, "");

// Dynamic OAuth URL - derives from API_BASE_URL so it works on any deployment
// API_BASE_URL = "https://api.whatomatic.com/api" → auth = "https://api.whatomatic.com/api/auth/shopify"
export const getAuthUrl = (shop: string): string => {
  return `${API_BASE_URL}/auth/shopify?shop=${shop}`;
};

// Dynamic shop detection - called fresh every time, not cached at module level
const getShopFromUrl = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("shop") || params.get("shop_domain") || "";
  } catch (e) {
    return "";
  }
};

// Get current shop - always fresh from URL
export const getCurrentShop = (): string => {
  return getShopFromUrl() || import.meta.env.VITE_SHOP_DOMAIN || "";
};

// Keep DEFAULT_SHOP for backward compat
const DEFAULT_SHOP = getCurrentShop();

export const withShopParam = (path: string) => {
  const shop = getCurrentShop(); // Always get fresh shop from URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${API_BASE_URL}/${cleanPath}`);
  url.searchParams.set("shop", shop);
  return url.toString();
};

const sanitizePhone = (phone: string) => {
  // Remove everything except digits and +
  return phone.replace(/[^\d+]/g, "");
};

// Helper to get authenticated headers (Shopify Session Token)
export const getAuthHeaders = async (existingHeaders = {}) => {
  const headers: Record<string, string> = {
    ...existingHeaders,
    "Content-Type": "application/json"
  };

  try {
    // App Bridge 4 provides idToken() which returns a Promise for the JWT session token
    // @ts-ignore
    if (window.shopify && typeof window.shopify.idToken === 'function') {
      // @ts-ignore
      const token = await window.shopify.idToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn("[AppBridge] Failed to get session token:", err);
  }

  return headers;
};

export interface MerchantSettingsPayload {
  storeName?: string;
  whatsappNumber?: string;
  defaultCountry?: string;
  language?: string;
  adminPhoneNumber?: string;
  orderConfirmTag?: string;
  orderCancelTag?: string;
  pendingConfirmTag?: string;
  adminNotifiedTag?: string;
  noWhatsappTag?: string;
  orderConfirmReply?: string;
  orderCancelReply?: string;
}

export const fetchSettings = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/settings"), { headers });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
};

export const updateSettings = async (payload: MerchantSettingsPayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/settings"), {
    method: "PUT",
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/templates"), { headers });
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
};

export const createTemplate = async (payload: TemplatePayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/templates"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create template");
  return res.json();
};

export const updateTemplate = async (id: string, payload: TemplatePayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/templates/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update template");
  return res.json();
};

export const deleteTemplate = async (id: string) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/templates/${id}`), {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete template");
  return res.json();
};

export const fetchActivity = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/activity"), { headers });
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
  pushNotifications: boolean;
}

export const fetchNotificationSettings = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/notifications"), { headers });
  if (!res.ok) throw new Error("Failed to load notification settings");
  return res.json();
};

export const updateNotificationSettings = async (payload: NotificationSettingsPayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/notifications"), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save notification settings");
  return res.json();
};

export interface Plan {
  id: string;
  name: string;
  price: number;
  messageLimit: number;
  features: string[];
  isActive: boolean;
  description: string;
  isPopular?: boolean;
}

export const fetchPlans = async (): Promise<Plan[]> => {
  const res = await fetch(`${API_BASE_URL}/plans`);
  if (!res.ok) throw new Error("Failed to load plans");
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
  dailyStats?: { date: string; count: number }[];
  growth?: { sent: number; recovered: number; confirmed: number; responseRate: number };
}

export const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/analytics"), { headers });
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
  dailyUsage?: number;
  dailyLimit?: number;
}

export interface WhatsAppMessagePayload {
  to: string;
  message: string;
  type?: "text" | "image" | "document";
}

export const generateWhatsAppQR = async (): Promise<WhatsAppQRCodeResponse> => {
  const url = withShopParam("/whatsapp/qr");
  console.log(`[WhatsApp] Fetching QR from: ${url}`);

  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error(`[WhatsApp] QR fetch failed: ${res.status} ${res.statusText}`, errorText);
    throw new Error(`Server error: ${res.status}. Maybe server is still starting?`);
  }

  const data = await res.json();
  console.log("[WhatsApp] QR response data:", data);

  // Handle various response formats
  const qrCode = data.qrCode || data.qr || (typeof data === "string" ? data : null);

  if (!qrCode) {
    console.warn("[WhatsApp] No QR code in response");
    throw new Error("QR not ready. Waiting for server...");
  }

  return {
    qrCode,
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
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "POST",
      headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/status"), { headers });
  if (!res.ok) throw new Error("Failed to fetch WhatsApp status");
  return res.json();
};

export const connectWhatsApp = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/connect"), {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to connect WhatsApp");
  return res.json();
};

export const disconnectWhatsApp = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/disconnect"), {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to disconnect WhatsApp");
  return res.json();
};

export const sendWhatsAppMessage = async (payload: WhatsAppMessagePayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/send"), {
    method: "POST",
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp-cloud/send"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send cloud message");
  return res.json();
};

export const sendCloudTemplate = async (payload: CloudTemplatePayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp-cloud/send-template"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send template message");
  return res.json();
};

export const fetchCloudTemplates = async (): Promise<CloudTemplate[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp-cloud/templates"), { headers });
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
  totalOrders?: number;
  lastOrderAt?: string;
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/contact"), { headers });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
};

export const createContact = async (payload: ContactPayload): Promise<Contact> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/contact"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create contact");
  }
  return res.json();
};

export const updateContact = async (id: string, payload: Partial<ContactPayload>): Promise<Contact> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/contact/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
};

export const deleteContact = async (id: string) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/contact/${id}`), {
    method: "DELETE",
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/activity"), { headers });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();

  // Map ActivityLog & GlobalBroadcasts to Notification interface
  return data.map((log: any) => {
    if (log.isBroadcast) {
      return {
        id: log._id,
        title: log.title || "📢 System Announcement",
        message: log.message,
        type: (log.type === 'error' ? 'error' : (log.type === 'warning' ? 'warning' : (log.type === 'success' ? 'success' : 'info'))) as any,
        read: false,
        createdAt: log.createdAt
      };
    }

    return {
      id: log._id,
      title: log.type.charAt(0).toUpperCase() + log.type.slice(1) + " Alert",
      message: log.message || `${log.type} event for order ${log.orderId || 'N/A'}`,
      type: log.type === 'failed' ? 'error' : (log.type === 'confirmed' ? 'success' : 'info'),
      read: false, // Activity logs don't have read status yet, default to false
      createdAt: log.createdAt
    };
  });
};

export const createNotification = async (payload: NotificationPayload): Promise<Notification> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/notifications"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create notification");
  return res.json();
};

export const updateNotification = async (id: string, payload: Partial<Notification>): Promise<Notification> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/notifications/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update notification");
  return res.json();
};

export const deleteNotification = async (id: string) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/notifications/${id}`), {
    method: "DELETE",
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/activity"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create activity log");
  return res.json();
};

// Campaigns API
export const sendCampaign = async (payload: { contacts: any[]; message: string }) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/campaigns/send"), {
    method: "POST",
    headers,
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
  color: string;
}

export const fetchChatButtonSettings = async (): Promise<ChatButtonSettings> => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/settings/chat-button"), { headers });
  if (!res.ok) throw new Error("Failed to fetch chat button settings");
  return res.json();
};

export const updateChatButtonSettings = async (payload: ChatButtonSettings) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/settings/chat-button"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update chat button settings");
  return res.json();
};

// Automations Stats API
export const fetchAutomationsStats = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/automations/stats"), { headers });
  if (!res.ok) throw new Error("Failed to fetch automations stats");
  return res.json();
};
// Trial API
export interface TrialActivationPayload {
  name: string;
  email: string;
  phone: string;
}

export const activateTrial = async (payload: TrialActivationPayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/trial/activate"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to activate trial");
  }
  return res.json();
};

export const fetchTrialStatus = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/trial/status"), { headers });
  if (!res.ok) throw new Error("Failed to fetch trial status");
  return res.json();
};

export const toggleAutomation = async (id: string, enabled: boolean) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/automations/toggle"), {
    method: "PUT",
    headers,
    body: JSON.stringify({ id, enabled }),
  });
  if (!res.ok) throw new Error("Failed to toggle automation");
  return res.json();
};

