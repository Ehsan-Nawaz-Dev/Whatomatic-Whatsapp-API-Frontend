import { NavMenu } from "@shopify/app-bridge-react";

interface AppNavigationProps {
    activeTab?: string;
}

/**
 * Shopify App Navigation Menu
 * This component uses App Bridge React v4 to configure the sidebar navigation
 * in the Shopify Admin. It creates the expandable menu under your app name.
 */
const AppNavigation = ({ activeTab }: AppNavigationProps) => {
    return (
        <NavMenu>
            <a href="/" rel="home">Home</a>
            <a href="/dashboard?tab=automations">Automations</a>
            <a href="/dashboard?tab=contacts">Contacts</a>
            <a href="/dashboard?tab=templates">Templates</a>
            <a href="/dashboard?tab=analytics">Analytics</a>
            <a href="/dashboard?tab=chat-button">Chat Button</a>
            <a href="/dashboard?tab=settings">Settings</a>
            <a href="/dashboard?tab=billing">Plans & Usage</a>
        </NavMenu>
    );
};

export default AppNavigation;
