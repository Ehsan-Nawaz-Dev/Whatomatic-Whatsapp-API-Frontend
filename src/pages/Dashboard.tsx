import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import WhatsAppConnection from "@/components/dashboard/WhatsAppConnection";
import MessageTemplates from "@/components/dashboard/MessageTemplates";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MerchantSettings from "@/components/dashboard/MerchantSettings";
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import NotificationsList from "@/components/dashboard/NotificationsList";
import ContactsManagement from "@/components/dashboard/ContactsManagement";
import WhatsAppCloudSettings from "@/components/dashboard/WhatsAppCloudSettings";
import AutomationsOverview from "@/components/dashboard/AutomationsOverview";
import BulkMessenger from "@/components/dashboard/BulkMessenger";
import ChatButtonConfig from "@/components/dashboard/ChatButtonConfig";
import BillingPlan from "@/components/dashboard/BillingPlan";
import { useQuery } from "@tanstack/react-query";
import { withShopParam } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTabState] = useState(tabParam);

  // Sync state with URL params
  useEffect(() => {
    setActiveTabState(tabParam);
  }, [tabParam]);

  // AUTO-DETECT: If shop in URL but merchant doesn't exist, trigger OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');

    if (shop) {
      // Check if merchant exists by calling billing status
      fetch(withShopParam("/billing/status"))
        .then(res => res.json())
        .then(data => {
          // If plan is 'none' and status is 'none', merchant likely doesn't exist
          if (data.plan === 'none' && data.status === 'none') {
            const redirectUrl = `https://api.whatomatic.com/api/auth/shopify?shop=${shop}`;
            console.log(`[Dashboard] Merchant not found for ${shop}. Triggering OAuth installation to: ${redirectUrl}`);

            // Break out of iframe for OAuth
            if (window.top) {
              window.top.location.href = redirectUrl;
            } else {
              window.location.href = redirectUrl;
            }
          }
        })
        .catch(err => {
          console.error('[Dashboard] Failed to check merchant status:', err);
        });
    }
  }, []);

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
    setActiveTabState(tab);
  };

  // Fetch billing status
  const { data: billing, isLoading: isBillingLoading } = useQuery({
    queryKey: ["billing-status"],
    queryFn: async () => {
      try {
        const res = await fetch(withShopParam("/billing/status"));

        // --- LAZY AUTH CHECK ---
        // If 401/403 or network error with 'shop' param, we might need to install
        if (res.status === 401 || res.status === 403) {
          const params = new URLSearchParams(window.location.search);
          const shop = params.get("shop");
          if (shop) {
            const redirectUrl = `https://api.whatomatic.com/api/auth/shopify?shop=${shop}`;
            console.log("Redirecting to Install/Re-auth...", shop);

            if (window.top) {
              window.top.location.href = redirectUrl;
            } else {
              window.location.href = redirectUrl;
            }
            return { plan: "loading", status: "redirecting" };
          }
        }

        if (!res.ok) return { plan: "free", status: "none" };
        const data = await res.json();

        // If trial plan, ensure we get the full trial status
        if (data.plan === 'trial') {
          const trialRes = await fetch(withShopParam("/trial/status"));
          if (trialRes.ok) return trialRes.json();
        }

        return data;
      } catch (err) {
        console.error("Billing status check failed:", err);
        return { plan: "free", status: "none" };
      }
    },
    // Keep it fresh
    staleTime: 60000,
  });

  const isActive = billing?.status === "active";

  // Force billing tab for new/unpaid users, but allow settings for setup
  const effectiveTab = (!isActive && activeTab !== "settings") ? "billing" : activeTab;

  if (isBillingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Checking subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeTab={effectiveTab}
        setActiveTab={setActiveTab}
        isSubscribed={isActive}
      />

      <div className="flex-1 flex flex-col">
        <DashboardHeader billing={billing} />

        <main className="flex-1 p-6 overflow-auto">
          {effectiveTab === "overview" && (
            <div className="space-y-6">
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WhatsAppConnection />
                <RecentActivity />
              </div>
            </div>
          )}

          {effectiveTab === "templates" && <MessageTemplates />}

          {effectiveTab === "contacts" && <ContactsManagement />}

          {effectiveTab === "automations" && <AutomationsOverview />}

          {effectiveTab === "analytics" && (
            <div className="space-y-6">
              <AnalyticsOverview />
            </div>
          )}

          {effectiveTab === "notifications" && (
            <NotificationsList />
          )}

          {effectiveTab === "chat-button" && (
            <ChatButtonConfig />
          )}

          {effectiveTab === "billing" && (
            <div className="space-y-6">
              <BillingPlan />
            </div>
          )}

          {effectiveTab === "settings" && (
            <div className="space-y-6 max-w-5xl">
              <MerchantSettings />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
