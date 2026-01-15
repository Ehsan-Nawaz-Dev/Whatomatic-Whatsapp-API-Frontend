import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Info, Gift } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, withShopParam, activateTrial } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Product plans
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
    const [showTrialDialog, setShowTrialDialog] = useState(false);
    const [trialDetails, setTrialDetails] = useState({ name: "", email: "", phone: "" });
    const [isActivatingTrial, setIsActivatingTrial] = useState(false);
    const queryClient = useQueryClient();

    // Fetch current subscription status
    const { data: status, isLoading: isStatusLoading } = useQuery({
        queryKey: ["billing-status"],
        queryFn: async () => {
            const res = await fetch(withShopParam("/billing/status"));
            if (!res.ok) return null;
            const data = await res.json();

            // If they are trial, we fetch detailed trial status
            if (data.plan === 'trial') {
                const trialRes = await fetch(withShopParam("/trial/status"));
                if (trialRes.ok) return trialRes.json();
            }
            return data;
        }
    });

    const handleActivateTrial = async () => {
        if (!trialDetails.name || !trialDetails.email) {
            toast.error("Please provide your name and email");
            return;
        }

        try {
            setIsActivatingTrial(true);
            const params = new URLSearchParams(window.location.search);
            const shop = params.get("shop") || "";

            await activateTrial({
                ...trialDetails,
                shop
            } as any);

            toast.success("Trial activated! You have 10 free order messages.");
            setShowTrialDialog(false);
            queryClient.invalidateQueries({ queryKey: ["billing-status"] });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsActivatingTrial(false);
        }
    };

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
    const isTrial = currentPlanId === 'trial';
    const trialUsage = status?.trialUsage || 0;
    const trialLimit = status?.trialLimit || 10;
    const trialActivated = status?.trialActivated || false;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {!trialActivated && currentPlanId === 'free' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Start Your Free Trial</h2>
                            <p className="text-muted-foreground">Get 10 automated order messages for free to test the app!</p>
                        </div>
                    </div>
                    <Button size="lg" onClick={() => setShowTrialDialog(true)}>
                        Activate Free Trial
                    </Button>
                </motion.div>
            )}

            {isTrial && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Trial Subscription Active</h2>
                                <p className="text-muted-foreground">You are currently using the trial. Upgrade to a paid plan for unlimited messages.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold mb-1">Messages Sent: {trialUsage} / {trialLimit}</div>
                            <div className="w-full md:w-48 bg-muted rounded-full h-2">
                                <div
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((trialUsage / trialLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

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

            <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Your Free Trial</DialogTitle>
                        <DialogDescription>
                            Please confirm your details to start your 10-message free trial.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={trialDetails.name}
                                onChange={(e) => setTrialDetails({ ...trialDetails, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={trialDetails.email}
                                onChange={(e) => setTrialDetails({ ...trialDetails, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">WhatsApp Number (Optional)</Label>
                            <Input
                                id="phone"
                                value={trialDetails.phone}
                                onChange={(e) => setTrialDetails({ ...trialDetails, phone: e.target.value })}
                                placeholder="+923001234567"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowTrialDialog(false)}
                            disabled={isActivatingTrial}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleActivateTrial}
                            disabled={isActivatingTrial}
                        >
                            {isActivatingTrial ? "Activating..." : "Activate Now"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center text-xs text-muted-foreground max-w-2xl mx-auto">
                Charges are billed in USD. You can cancel at any time. By clicking Upgrade, you agree to our Terms of Service.
            </div>
        </div>
    );
};

export default BillingPlan;
