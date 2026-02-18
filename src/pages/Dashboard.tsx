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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withShopParam, getCurrentShop, getAuthUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import SetupChecklist from "@/components/dashboard/SetupChecklist";
import HelpSupport from "@/components/dashboard/HelpSupport";


const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTabState] = useState(tabParam);

  // Sync state with URL params
  useEffect(() => {
    setActiveTabState(tabParam);
  }, [tabParam]);

  const queryClient = useQueryClient();

  // (Redundant block removed)

  // AUTO-DETECT: If shop in URL but merchant doesn't exist or token is missing, trigger OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');

    if (shop) {
      fetch(withShopParam("/billing/status"))
        .then(async res => {
          if (res.status === 401) {
            console.warn(`[Dashboard] Token MISSING (401) for ${shop}. Breaking out to OAuth...`);
            const authUrl = getAuthUrl(shop);

            if (window.top && window.top !== window.self) {
              window.top.location.replace(authUrl);
            } else {
              window.location.replace(authUrl);
            }
            return;
          }

          const data = await res.json().catch(() => ({}));

          // Handle cases where merchant doesn't exist at all or needs token
          if (data.needsToken || (data.plan === 'none' && data.status === 'none')) {
            const authUrl = getAuthUrl(shop);
            if (window.top && window.top !== window.self) {
              window.top.location.replace(authUrl);
            } else {
              window.location.replace(authUrl);
            }
            return;
          }

          // Handle case: plan is active but Shopify token is missing (needed for tagging, etc.)
          if (data.needsToken) {
            console.warn(`[Dashboard] Plan active but token missing for ${shop}. Redirecting to OAuth to get token...`);
            const authUrl = getAuthUrl(shop);
            if (window.top && window.top !== window.self) {
              window.top.location.replace(authUrl);
            } else {
              window.location.replace(authUrl);
            }
            return;
          }
        })
        .catch(err => {
          console.error('[Dashboard] Status check failed:', err);
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
    queryKey: ["billing-status", getCurrentShop()],
    queryFn: async () => {
      // If we just activated client-side, don't even wait for server
      if (isJustActivated) return { plan: "unknown", status: "active" };

      try {
        const res = await fetch(withShopParam("/billing/status"));

        // --- LAZY AUTH CHECK ---
        // If 401/403 or network error with 'shop' param, we might need to install
        if (res.status === 401 || res.status === 403) {
          const params = new URLSearchParams(window.location.search);
          const shop = params.get("shop");
          if (shop) {
            const redirectUrl = getAuthUrl(shop);
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

  const [isJustActivated, setIsJustActivated] = useState(false);

  // Handle Billing Success Redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      setIsJustActivated(true);
      // Force refresh of billing status
      queryClient.invalidateQueries({ queryKey: ["billing-status", getCurrentShop()] });
      // Remove the param to clean URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("billing");
      window.history.replaceState({}, "", newUrl.toString());
      // Optimistically set active tab to overview
      setActiveTabState("overview");
    }
  }, []);

  // ... (rest of logic)

  const isActive = billing?.status === "active" || isJustActivated; // FORCE ACTIVE if just redirected

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

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          billing={billing}
          onNavigateNotifications={() => setActiveTab("notifications")}
        />

        {/* 
          Native Shopify Navigation (ui-nav-menu):
          Configures the sidebar menu items in the Shopify Admin.
          The rel="home" link sets the app's root route and is NOT shown as a nav item.
        */}
        <ui-nav-menu>
          <a href="/dashboard" rel="home">WhatFlow</a>
          <a href="/dashboard?tab=notifications">Notifications</a>
          <a href="/dashboard?tab=automations">Automations</a>
          <a href="/dashboard?tab=contacts">Contacts</a>
          <a href="/dashboard?tab=templates">Templates</a>
          <a href="/dashboard?tab=analytics">Analytics</a>
          <a href="/dashboard?tab=chat-button">Chat Button</a>
          <a href="/dashboard?tab=bulk-messenger">Bulk Messenger</a>
          <a href="/dashboard?tab=settings">Settings</a>
          <a href="/dashboard?tab=billing">Plans & Billing</a>
          <a href="/dashboard?tab=help">Help & Support</a>
        </ui-nav-menu>

        <main className="flex-1 p-2.5 sm:p-3 lg:p-4 xl:p-6 overflow-y-auto overflow-x-hidden">
          {effectiveTab === "overview" && (
            <div className="space-y-3 lg:space-y-4 xl:space-y-6">
              <SetupChecklist onNavigate={setActiveTab} />
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-6">
                <WhatsAppConnection />
                <RecentActivity />
              </div>
            </div>
          )}

          {effectiveTab === "templates" && <MessageTemplates />}

          {effectiveTab === "contacts" && <ContactsManagement />}

          {effectiveTab === "automations" && <AutomationsOverview />}

          {effectiveTab === "analytics" && (
            <div className="space-y-3 lg:space-y-4 xl:space-y-6">
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
            <div className="space-y-3 lg:space-y-4 xl:space-y-6">
              <BillingPlan />
            </div>
          )}

          {effectiveTab === "settings" && (
            <div className="space-y-3 lg:space-y-4 xl:space-y-6 max-w-5xl">
              <MerchantSettings />
            </div>
          )}

          {effectiveTab === "help" && (
            <div className="space-y-3 lg:space-y-4 xl:space-y-6">
              <HelpSupport />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
