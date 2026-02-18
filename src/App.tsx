import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavMenu } from "@shopify/app-bridge-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import OrderConfirmationDemo from "./pages/OrderConfirmationDemo";
import BillingSuccess from "./pages/BillingSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavMenu>
          <a href="/dashboard" rel="home">Whatomatic</a>
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
        </NavMenu>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/landing" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/order-confirmation" element={<OrderConfirmationDemo />} />
          <Route path="/billing-success" element={<BillingSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
