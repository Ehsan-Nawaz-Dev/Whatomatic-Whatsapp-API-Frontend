import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn("Route not found, handling redirect:", location.pathname);
    
    // If it's an auth callback that accidentally hit the frontend, forward it to the backend
    if (location.pathname.includes('/api/auth/') || location.pathname.includes('/auth/')) {
      const searchParams = window.location.search;
      window.location.href = `https://api.whatomatic.com/Api/auth/shopify/callback${searchParams}`;
      return;
    }
    
    // For Shopify App Review purposes, do not show a 404 error page.
    // Redirect to the dashboard seamlessly.
    navigate("/", { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default NotFound;
