export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://whatomatic-whatsapp-a-pi-backend.vercel.app/api").replace(/\/$/, "");

// Dynamic OAuth URL - derives from API_BASE_URL so it works on any deployment
// API_BASE_URL = "https://api.whatomatic.com/api" → auth = "https://api.whatomatic.com/api/auth/shopify"
export const getAuthUrl = (shop: string): string => {
  return `${API_BASE_URL}/auth/shopify?shop=${shop}`;
};

const SHOP_STORAGE_KEY = "whatomatic_shop_domain";

// Dynamic shop detection - called fresh every time, not cached at module level
const getShopFromUrl = (): string => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("shop") || params.get("shop_domain") || "";
  } catch (e) {
    return "";
  }
};

// App Bridge knows the shop even when the query string doesn't.
const getShopFromAppBridge = (): string => {
  try {
    // @ts-ignore - injected by app-bridge.js
    return window.shopify?.config?.shop || "";
  } catch (e) {
    return "";
  }
};

const readStoredShop = (): string => {
  try {
    return sessionStorage.getItem(SHOP_STORAGE_KEY) || localStorage.getItem(SHOP_STORAGE_KEY) || "";
  } catch (e) {
    return "";
  }
};

const rememberShop = (shop: string) => {
  if (!shop) return;
  try {
    sessionStorage.setItem(SHOP_STORAGE_KEY, shop);
    localStorage.setItem(SHOP_STORAGE_KEY, shop);
  } catch (e) {
    // Storage unavailable (private mode / blocked cookies) - non-fatal
  }
};

/**
 * Resolves the current shop domain.
 *
 * The URL is only a reliable source on the initial embedded load. In-app
 * navigation (the App Bridge NavMenu links are plain `/dashboard?tab=...`)
 * replaces the query string and drops `shop`, after which every request went out
 * as `?shop=` and the backend answered 401. So we fall back to App Bridge and to
 * the last shop we saw, and persist whichever one resolves.
 */
export const getCurrentShop = (): string => {
  const shop =
    getShopFromUrl() ||
    getShopFromAppBridge() ||
    readStoredShop() ||
    import.meta.env.VITE_SHOP_DOMAIN ||
    "";

  rememberShop(shop);
  return shop;
};

// Keep DEFAULT_SHOP for backward compat
const DEFAULT_SHOP = getCurrentShop();

export const withShopParam = (path: string) => {
  const shop = getCurrentShop(); // Always get fresh shop from URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${API_BASE_URL}/${cleanPath}`);
  // Never send `shop=` empty - the backend treats that as "no shop" and 401s.
  if (shop) url.searchParams.set("shop", shop);
  return url.toString();
};

const sanitizePhone = (phone: string) => {
  // Remove everything except digits and +
  return phone.replace(/[^\d+]/g, "");
};

/**
 * Waits for App Bridge to expose idToken().
 *
 * app-bridge.js is loaded from Shopify's CDN, so on a cold/slow load the first
 * few React queries can fire before `window.shopify.idToken` exists. Those
 * requests previously went out with no Authorization header at all and came back
 * 401, which surfaced as the dashboard randomly showing "Not Connected".
 */
const waitForAppBridge = async (timeoutMs = 4000): Promise<boolean> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // @ts-ignore - injected by app-bridge.js
    if (window.shopify && typeof window.shopify.idToken === "function") return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  // @ts-ignore
  return !!(window.shopify && typeof window.shopify.idToken === "function");
};

// Helper to get authenticated headers (Shopify Session Token)
export const getAuthHeaders = async (existingHeaders = {}) => {
  const headers: Record<string, string> = {
    ...existingHeaders,
    "Content-Type": "application/json"
  };

  // Second identifier the backend accepts, so a request still resolves its shop
  // if the session token is momentarily unavailable.
  const shop = getCurrentShop();
  if (shop) headers["x-shop-domain"] = shop;

  try {
    // App Bridge 4 provides idToken() which returns a Promise for the JWT session token
    const ready = await waitForAppBridge();
    if (ready) {
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

export const fetchWhatsAppConfig = async (): Promise<{ metaAppId: string; metaConfigId: string }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(withShopParam("/whatsapp/config"), { headers });
    if (!res.ok) return { metaAppId: "", metaConfigId: "" };
    return res.json();
  } catch {
    return { metaAppId: "", metaConfigId: "" };
  }
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
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/tickets"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit support ticket");
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

export interface MetaCredentialsPayload {
  metaPhoneNumberId: string;
  metaWabaId?: string;
  metaAccessToken: string;
  metaWebhookVerifyToken?: string;
}

export interface WhatsAppStatusResponse {
  connected: boolean;
  phoneNumber?: string;
  deviceName?: string;
  qualityRating?: string;
  lastConnected?: string;
  errorMessage?: string;
  /** False when the number is not registered for Cloud API messaging (Meta error 133010). */
  registered?: boolean;
  /** True when Meta was unreachable and this is last-known-good state, not a live check. */
  degraded?: boolean;
  /** True when the Meta access token is dead and the merchant must reconnect. */
  requiresReconnect?: boolean;
}

export interface WhatsAppQRCodeResponse {
  qrCode?: string;
  sessionId?: string;
  expiresAt?: string;
}

export const saveMetaCredentials = async (payload: MetaCredentialsPayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/credentials"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save Meta credentials");
  }
  return res.json();
};

export interface EmbeddedSignupPayload {
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  accessToken?: string;
  redirectUri?: string;
}

export const connectEmbeddedSignup = async (payload: EmbeddedSignupPayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/embedded-signup"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to complete Embedded Signup");
  }
  return res.json();
};

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

/**
 * Registers the connected number for Cloud API messaging.
 * Recovery for merchants stuck on Meta error 133010 ("Account not registered").
 */
export const registerWhatsAppNumber = async (pin?: string) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp/register"), {
    method: "POST",
    headers,
    body: JSON.stringify(pin ? { pin } : {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to register WhatsApp number");
  }
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
  const data = await res.json();
  return data.templates || [];
};

export interface CreateCloudTemplatePayload {
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language?: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttons?: string[];
  examples?: string[];
}

export const createCloudTemplate = async (payload: CreateCloudTemplatePayload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam("/whatsapp-cloud/templates"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit template to Meta");
  }
  return res.json();
};

export const deleteCloudTemplate = async (templateName: string) => {
  const headers = await getAuthHeaders();
  const res = await fetch(withShopParam(`/whatsapp-cloud/templates/${templateName}`), {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete template from Meta");
  }
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

  const shop = getCurrentShop();
  const readKey = `whatomatic_read_notifications_${shop}`;
  const deletedKey = `whatomatic_deleted_notifications_${shop}`;
  
  let readIds: string[] = [];
  let deletedIds: string[] = [];
  try {
    readIds = JSON.parse(localStorage.getItem(readKey) || "[]");
  } catch (e) {}
  try {
    deletedIds = JSON.parse(localStorage.getItem(deletedKey) || "[]");
  } catch (e) {}

  // Map ActivityLog & GlobalBroadcasts to Notification interface
  return data
    .filter((log: any) => !deletedIds.includes(log._id))
    .map((log: any) => {
      const isRead = readIds.includes(log._id);
      if (log.isBroadcast) {
        return {
          id: log._id,
          title: log.title || "📢 System Announcement",
          message: log.message,
          type: (log.type === 'error' ? 'error' : (log.type === 'warning' ? 'warning' : (log.type === 'success' ? 'success' : 'info'))) as any,
          read: isRead,
          createdAt: log.createdAt
        };
      }

      return {
        id: log._id,
        title: log.type.charAt(0).toUpperCase() + log.type.slice(1) + " Alert",
        message: log.message || `${log.type} event for order ${log.orderId || 'N/A'}`,
        type: log.type === 'failed' ? 'error' : ((log.type === 'confirmed' || log.type === 'shipped' || log.type === 'fulfilled') ? 'success' : 'info'),
        read: isRead,
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
  const shop = getCurrentShop();
  const readKey = `whatomatic_read_notifications_${shop}`;
  
  if (payload.read !== undefined) {
    let readIds: string[] = [];
    try {
      readIds = JSON.parse(localStorage.getItem(readKey) || "[]");
    } catch (e) {}
    
    if (payload.read) {
      if (!readIds.includes(id)) {
        readIds.push(id);
      }
    } else {
      readIds = readIds.filter(x => x !== id);
    }
    localStorage.setItem(readKey, JSON.stringify(readIds));
  }
  
  return {
    id,
    title: "",
    message: "",
    type: "info",
    read: !!payload.read,
    createdAt: new Date().toISOString(),
    ...payload
  };
};

export const deleteNotification = async (id: string) => {
  const shop = getCurrentShop();
  const deletedKey = `whatomatic_deleted_notifications_${shop}`;
  
  let deletedIds: string[] = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem(deletedKey) || "[]");
  } catch (e) {}
  
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
  }
  
  return { success: true };
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

