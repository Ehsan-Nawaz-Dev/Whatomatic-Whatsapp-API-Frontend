import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, withShopParam } from "@/lib/api";
import { toast } from "sonner";

// Temporary mock plans for frontend development
// These should ideally come from the backend API `/billing/plans`
const PLANS = [
    {
        id: "beginner",
        name: "Beginner",
        price: "9.99",
        features: ["100 Orders/mo", "Basic WhatsApp Templates", "Email Support", "3-Day History"],
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        btnVariant: "outline" as const
    },
    {
        id: "intermediate",
        name: "Intermediate",
        price: "29.99",
        features: ["1,000 Orders/mo", "Advanced Templates", "Priority Support", "Unlimited History", "Manual Campaigns"],
        icon: Zap,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        popular: true,
        btnVariant: "hero" as const
    },
    {
        id: "pro",
        name: "Pro",
        price: "59.99",
        features: ["Unlimited Orders", "Custom Branding", "Dedicated Account Manager", "API Access", "Automated Campaigns"],
        icon: Crown,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        btnVariant: "outline" as const
    }
];

const BillingPlan = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // Fetch current subscription status
    const { data: status } = useQuery({
        queryKey: ["billing-status"],
        queryFn: async () => {
            const res = await fetch(withShopParam("/billing/status"));
            if (!res.ok) return null; // Assume free if error or 404
            return res.json();
        }
    });

    const createCharge = async (planId: string) => {
        try {
            setLoadingPlan(planId);
            const res = await fetch(withShopParam("/billing/create"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planId })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to initiate charge");

            // Redirect to Shopify confirmation URL
            if (data.confirmationUrl) {
                window.top!.location.href = data.confirmationUrl;
            } else {
                toast.error("Invalid server response");
            }
        } catch (err: any) {
            toast.error(err.message);
            setLoadingPlan(null);
        }
    };

    const currentPlanId = status?.plan || "free";

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
                <p className="text-muted-foreground">Select the package that fits your business needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan, index) => {
                    const Icon = plan.icon;
                    const isCurrent = currentPlanId === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-6 rounded-2xl border-2 flex flex-col ${plan.borderColor} bg-card shadow-card ${plan.popular ? 'ring-2 ring-primary/20 scale-105 md:scale-105 z-10' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${plan.bgColor}`}>
                                <Icon className={`w-6 h-6 ${plan.color}`} />
                            </div>

                            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                            <div className="mt-2 mb-6 flex items-baseline">
                                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                                <span className="text-sm text-muted-foreground">/mo</span>
                            </div>

                            <div className="flex-1 space-y-3 mb-8">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-success" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={isCurrent ? "secondary" : (plan.btnVariant as any)}
                                disabled={isCurrent || !!loadingPlan}
                                onClick={() => createCharge(plan.id)}
                                className={`w-full ${isCurrent ? 'opacity-100 cursor-default' : ''}`}
                            >
                                {loadingPlan === plan.id ? "Processing..." : (isCurrent ? "Current Plan" : "Upgrade")}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center text-xs text-muted-foreground max-w-2xl mx-auto">
                Charges are billed in USD. You can cancel at any time. By clicking Upgrade, you agree to our Terms of Service.
            </div>
        </div>
    );
};

export default BillingPlan;
