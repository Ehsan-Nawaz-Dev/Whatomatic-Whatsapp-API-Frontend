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
import BillingPlan from "@/components/dashboard/BillingPlan";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withShopParam, getCurrentShop, getAuthUrl, getAuthHeaders, fetchWhatsAppStatus } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import SetupChecklist from "@/components/dashboard/SetupChecklist";
import HelpSupport from "@/components/dashboard/HelpSupport";
import OnboardingWalkthrough from "@/components/dashboard/OnboardingWalkthrough";
import { fetchAutomationsStats } from "@/lib/api";


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
      (async () => {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(withShopParam("/billing/status"), { headers });

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
        } catch (err) {
          console.error('[Dashboard] Status check failed:', err);
        }
      })();
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
        const headers = await getAuthHeaders();
        const res = await fetch(withShopParam("/billing/status"), { headers });

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
          const trialRes = await fetch(withShopParam("/trial/status"), { headers });
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

  const [isOnboardingDone, setIsOnboardingDone] = useState(true); // default true to avoid flash, use effect evaluates

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = getCurrentShop() || params.get('shop');

    // Clear cache only if this is an explicit fresh install redirect from Shopify
    if (params.get('installed') === "true") {
      if (shop) localStorage.removeItem(`whatflow_onboarding_done_${shop}`);
    }

    if (shop) {
      setIsOnboardingDone(localStorage.getItem(`whatflow_onboarding_done_${shop}`) === "true");
    } else {
      setIsOnboardingDone(false);
    }
  }, []);

  const { data: whatsappStatus } = useQuery<any>({
    queryKey: ["whatsapp-status", getCurrentShop()],
    queryFn: fetchWhatsAppStatus,
  });

  const { data: statsData } = useQuery({
    queryKey: ["automations-stats", getCurrentShop()],
    queryFn: fetchAutomationsStats,
    enabled: !!whatsappStatus?.connected,
  });

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

  // Onboarding logic: Prevent bypassing step 1 for new users despite the 'free' default backend state
  const isPaidPlan = billing?.plan && billing?.plan !== "free" && billing?.plan !== "none";
  let isPlanChosen = isPaidPlan || isJustActivated || !!whatsappStatus?.connected;

  // If the backend explicitly says this is a new installation, override any leftover local browser cache
  if (!billing?.isNewlyInstalled && (isOnboardingDone || isPlanChosen)) {
    isPlanChosen = true;
  }
  const isWhatsAppConnected = !!whatsappStatus?.connected;
  const hasAutomations = Array.isArray(statsData) && statsData.some((s: any) => s.enabled);

  let onboardingStep = 1;
  if (!isPlanChosen) {
    onboardingStep = 1;
  } else if (!isWhatsAppConnected) {
    onboardingStep = 2;
  } else {
    onboardingStep = 3;
    // Auto-finish if they have automations and they refreshed?
    // Optionally we can auto-finish here if we want.
  }

  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const handleFinishOnboarding = () => {
    const shop = getCurrentShop();
    localStorage.setItem(`whatflow_onboarding_done_${shop}`, "true");
    setIsOnboardingDone(true);
    setIsSessionFinished(true);
    setActiveTab("overview");
  };

  const forceShowOnboarding = billing?.isNewlyInstalled && !isSessionFinished;

  // Very aggressive visibility: If local storage says it isn't done, show it.
  // If backend says it's newly installed, force show it.
  const shouldRenderOnboarding = !isBillingLoading && (!isOnboardingDone || forceShowOnboarding) && !isSessionFinished;

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
    <div className="flex h-screen bg-background overflow-hidden relative">
      {shouldRenderOnboarding && (
        <OnboardingWalkthrough
          currentStep={onboardingStep}
          hasAutomations={hasAutomations}
          onComplete={handleFinishOnboarding}
        />
      )}
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


        <main className="flex-1 p-2.5 sm:p-3 lg:p-4 xl:p-6 overflow-y-auto overflow-x-hidden">
          {effectiveTab === "overview" && (
            <div className="space-y-3 lg:space-y-4 xl:space-y-6">
              {whatsappStatus?.connected === false ? (
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">WhatsApp Not Connected</h3>
                      <p className="text-sm mt-1 opacity-90">Please connect your WhatsApp account to enable automations and start sending messages.</p>
                    </div>
                  </div>
                  <WhatsAppConnection />
                </div>
              ) : (
                <>
                  <SetupChecklist onNavigate={setActiveTab} />
                  <StatsCards />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-6">
                    <WhatsAppConnection />
                    <RecentActivity />
                  </div>
                </>
              )}
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
