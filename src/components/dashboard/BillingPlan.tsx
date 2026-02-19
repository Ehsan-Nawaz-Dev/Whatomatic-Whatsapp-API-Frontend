import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Info, Gift } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, withShopParam, activateTrial, getCurrentShop, getAuthUrl, getAuthHeaders } from "@/lib/api";
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

const BillingPlan = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showTrialDialog, setShowTrialDialog] = useState(false);
    const [trialDetails, setTrialDetails] = useState({ name: "", email: "", phone: "" });
    const [isActivatingTrial, setIsActivatingTrial] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const queryClient = useQueryClient();

    // Fetch current subscription status
    const { data: status, isLoading: isStatusLoading } = useQuery({
        queryKey: ["billing-status", getCurrentShop()],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const res = await fetch(withShopParam("/billing/status"), { headers });
            if (!res.ok) return null;
            const data = await res.json();

            // If they are trial, we fetch detailed trial status
            if (data.plan === 'trial') {
                const trialRes = await fetch(withShopParam("/trial/status"), { headers });
                if (trialRes.ok) return trialRes.json();
            }
            return data;
        },
        staleTime: 0 // Always fetch fresh
    });

    // Fetch Plans from Backend
    const { data: plansData, isLoading: isPlansLoading } = useQuery({
        queryKey: ["plans", getCurrentShop()],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/plans`);
            if (!res.ok) throw new Error("Failed to fetch plans");
            return res.json();
        }
    });

    const handleActivateTrial = async () => {
        if (!trialDetails.name || !trialDetails.email || !trialDetails.phone) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsActivatingTrial(true);
        try {
            // Get shop from URL
            const params = new URLSearchParams(window.location.search);
            const shop = params.get("shop");

            // We use our API helper
            const res = await activateTrial(trialDetails);

            toast.success("Trial Activated Successfully!");
            setShowTrialDialog(false);
            queryClient.invalidateQueries({ queryKey: ["billing-status", getCurrentShop()] });
        } catch (error: any) {
            toast.error(error.message || "Failed to activate trial");
        } finally {
            setIsActivatingTrial(false);
        }
    };

    const createCharge = async (planId: string) => {
        try {
            setLoadingPlan(planId);

            // App Bridge 4 provides a global 'shopify' object
            // We check local window first, then top-level window as a fallback
            // @ts-ignore
            const activeShopify = window.shopify || (window.top && (window.top as any).shopify);

            console.log("[Billing] App Bridge (activeShopify):", activeShopify);

            if (activeShopify && activeShopify.billing && typeof activeShopify.billing.request === 'function') {
                console.log(`[Billing] Requesting Shopify Managed Billing for plan: ${planId}`);
                // @ts-ignore
                await activeShopify.billing.request({
                    plan: planId,
                    isTest: true
                });
            } else {
                console.error("[Billing] Shopify billing API not found. activeShopify:", activeShopify);
                toast.error("Billing not ready. Please ensure: 1. You are inside Shopify Admin. 2. You have RE-INSTALLED the app after setting Managed Pricing in the Partner Dashboard.");
                setLoadingPlan(null);
            }
        } catch (err) {
            console.error("[Billing] Error in createCharge:", err);
            toast.error("An error occurred during billing request");
            setLoadingPlan(null);
        }
    };

    const currentPlanId = status?.plan || "free";
    const isTrial = currentPlanId === 'trial';
    const trialUsage = status?.trialUsage || 0;
    const trialLimit = status?.trialLimit || 10;
    const trialActivated = status?.trialActivated || false;

    // Merge API plans with UI metadata (icons, colors)
    const displayPlans = (plansData || []).map((plan: any) => {
        // Map ID to UI props
        const uiProps = {
            free: { icon: Gift, color: "text-gray-500", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/20", btnVariant: "outline" },
            starter: { icon: Star, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", btnVariant: "outline" },
            growth: { icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", popular: true, btnVariant: "default" },
            professional: { icon: Crown, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", btnVariant: "outline" }
        }[plan.id] || { icon: Star, color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200", btnVariant: "outline" };

        // Fix mapping for specific fields
        return { ...plan, popular: plan.isPopular, ...uiProps };
    });

    return (
        <div className="space-y-4 lg:space-y-6 xl:space-y-8 max-w-6xl mx-auto">
            {/* Plans Grid */}
            <div>
                <div className="text-center mb-4 lg:mb-6 xl:mb-10">
                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-black mb-1 lg:mb-2">Choose Your Plan</h2>
                    <p className="text-xs lg:text-sm xl:text-base text-black/70 italic px-4">Scale your business with the power of WhatsApp automation</p>
                </div>

                {isPlansLoading ? (
                    <div className="text-center py-12 lg:py-20 text-slate-500 animate-pulse">Loading plans...</div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 lg:gap-3 xl:gap-4">
                        {displayPlans.map((plan: any) => {
                            const isCurrent = plan.id === currentPlanId || (isTrial && plan.id === 'trial');
                            const Icon = plan.icon;

                            return (
                                <motion.div
                                    key={plan.id}
                                    whileHover={{ y: -3 }}
                                    className={`relative bg-card text-card-foreground rounded-xl border ${plan.popular ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-border'} p-2.5 lg:p-3 xl:p-4 flex flex-col`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] lg:text-[9px] xl:text-[10px] font-bold px-1.5 lg:px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg whitespace-nowrap">
                                            <Star size={8} fill="currentColor" /> POPULAR
                                        </div>
                                    )}

                                    <div className={`w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-lg flex items-center justify-center mb-1.5 lg:mb-2 xl:mb-3 ${plan.bgColor} ${plan.color}`}>
                                        <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                                    </div>

                                    <h3 className="text-xs lg:text-sm xl:text-base font-bold mb-0.5">{plan.name}</h3>
                                    <div className="flex items-baseline gap-0.5 mb-2 lg:mb-3 xl:mb-4">
                                        <span className="text-base lg:text-lg xl:text-2xl font-bold">${plan.price}</span>
                                        <span className="text-muted-foreground text-[9px] lg:text-[10px] xl:text-xs">/mo</span>
                                    </div>

                                    <ul className="space-y-1 lg:space-y-1.5 xl:space-y-2 mb-3 lg:mb-4 xl:mb-6 flex-1">
                                        <li className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs xl:text-sm">
                                            <div className={`p-0.5 rounded-full ${plan.bgColor} ${plan.color}`}>
                                                <Check className="w-2 h-2 lg:w-2.5 lg:h-2.5" />
                                            </div>
                                            <span className="font-bold truncate">{plan.messageLimit} Msgs</span>
                                        </li>
                                        {plan.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-[10px] xl:text-xs text-muted-foreground">
                                                <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-500 shrink-0" />
                                                <span className="truncate">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => {
                                            if (plan.price === 0) {
                                                setLoadingPlan(plan.id);
                                                setShowTrialDialog(true);
                                                setTrialDetails({ name: '', email: '', phone: '' });
                                            } else {
                                                createCharge(plan.id);
                                            }
                                        }}
                                        disabled={(plan.id === currentPlanId && status?.status === 'active') || !!loadingPlan}
                                        className="w-full h-7 lg:h-8 xl:h-9 text-[10px] lg:text-xs"
                                        variant={plan.btnVariant as any}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <span className="flex items-center gap-1.5">
                                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (plan.id === currentPlanId && status?.status === 'active') ? (
                                            "Current Plan"
                                        ) : (
                                            "Activate"
                                        )}
                                    </Button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Trial Dialog */}
            <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
                <DialogContent className="bg-[#0f172a] text-white border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Gift className="text-blue-500" />
                            {loadingPlan ? "Complete Account Setup" : "Activate Free Trial"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {loadingPlan
                                ? "Please provide your details before we activate your selected plan."
                                : `Get started instantly with ${trialLimit} free messages. No payment info needed.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                placeholder="John Doe"
                                className="bg-[#1e293b] border-slate-700 text-white"
                                value={trialDetails.name}
                                onChange={(e) => setTrialDetails({ ...trialDetails, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                className="bg-[#1e293b] border-slate-700 text-white"
                                value={trialDetails.email}
                                onChange={(e) => setTrialDetails({ ...trialDetails, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number (WhatsApp)</Label>
                            <Input
                                placeholder="+1234567890"
                                className="bg-[#1e293b] border-slate-700 text-white"
                                value={trialDetails.phone}
                                onChange={(e) => setTrialDetails({ ...trialDetails, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { setShowTrialDialog(false); setLoadingPlan(null); setIsConfirming(false); }} disabled={isConfirming}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-500 text-white min-w-[160px]"
                            onClick={() => {
                                setIsConfirming(true);
                                if (loadingPlan) {
                                    createCharge(loadingPlan);
                                } else {
                                    handleActivateTrial();
                                }
                            }}
                            disabled={isActivatingTrial || isConfirming}
                        >
                            {(isActivatingTrial || isConfirming) ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : loadingPlan ? "Confirm & Proceed" : "Activate Trial"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BillingPlan;
