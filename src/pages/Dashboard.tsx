import { useState } from "react";
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WhatsAppConnection />
                <RecentActivity />
              </div>
            </div>
          )}

          {activeTab === "templates" && <MessageTemplates />}

          {activeTab === "contacts" && <ContactsManagement />}

          {activeTab === "automations" && <AutomationsOverview />}

          {activeTab === "campaigns" && <BulkMessenger />}

          {activeTab === "chat-button" && <ChatButtonConfig />}

          {activeTab === "whatsapp-cloud" && <WhatsAppCloudSettings />}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <AnalyticsOverview />
            </div>
          )}

          {activeTab === "notifications" && (
            <NotificationsList />
          )}

          {activeTab === "settings" && (
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
