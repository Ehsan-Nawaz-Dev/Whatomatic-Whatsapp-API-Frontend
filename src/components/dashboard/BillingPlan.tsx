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

const BillingPlan = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showTrialDialog, setShowTrialDialog] = useState(false);
    const [trialDetails, setTrialDetails] = useState({ name: "", email: "", phone: "" });
    const [isActivatingTrial, setIsActivatingTrial] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
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
        },
        staleTime: 0 // Always fetch fresh
    });

    // Fetch Plans from Backend
    const { data: plansData, isLoading: isPlansLoading } = useQuery({
        queryKey: ["plans"],
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
            queryClient.invalidateQueries({ queryKey: ["billing-status"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to activate trial");
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
                body: JSON.stringify({ plan: planId }),
            });

            // Handle 404 (Merchant Not Found) - Auto Repair
            if (res.status === 404) {
                const params = new URLSearchParams(window.location.search);
                const shop = params.get("shop");
                if (shop) {
                    toast.loading("Setting up your account... please wait.");
                    const installUrl = `https://api.whatomatic.com/api/auth/shopify?shop=${shop}`;
                    if (window.top) {
                        window.top.location.href = installUrl;
                    } else {
                        window.location.href = installUrl;
                    }
                    return;
                }
            }

            const data = await res.json();
            if (data.confirmationUrl) {
                // Shopify Charge Confirmation URL - Needs to be top level
                if (window.top) {
                    window.top.location.href = data.confirmationUrl;
                } else {
                    window.location.href = data.confirmationUrl;
                }
            } else {
                toast.error("Failed to initiate charge");
                setLoadingPlan(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
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
            pro: { icon: Crown, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", btnVariant: "outline" }
        }[plan.id] || { icon: Star, color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200", btnVariant: "outline" };

        // Fix mapping for specific fields
        return { ...plan, popular: plan.isPopular, ...uiProps };
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Trial Offer Banner (Only for Free users who haven't used trial) */}
            {!trialActivated && currentPlanId === 'free' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift size={120} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Start Your Free Trial Today!</h2>
                        <p className="text-blue-100 mb-6 text-lg">
                            Experience the full power of WhatFlow with {trialLimit} free messages. No credit card required.
                            See how automated WhatsApp notifications can recover lost sales instantly.
                        </p>
                        <Button
                            onClick={() => setShowTrialDialog(true)}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 font-bold border-none shadow-lg"
                        >
                            <Gift className="mr-2 h-5 w-5" /> Claim Free {trialLimit} Messages
                        </Button>
                    </div>
                </div>
            )}

            {/* Trial Status Banner (When Trial Active) */}
            {isTrial && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                                <Crown size={24} /> Trial Subscription Active
                            </h3>
                            <p className="text-purple-200/60 mt-1">You are currently on the free trial plan.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm uppercase tracking-widest text-purple-400/60 font-bold mb-1">Messages Sent</div>
                            <div className="text-3xl font-bold text-white font-mono">{trialUsage} <span className="text-lg text-purple-500/50">/ {trialLimit}</span></div>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-purple-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((trialUsage / trialLimit) * 100, 100)}%` }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Plans Grid */}
            <div>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Choose Your Plan</h2>
                    <p className="text-slate-400">Scale your business with the power of WhatsApp automation</p>
                </div>

                {isPlansLoading ? (
                    <div className="text-center py-20 text-slate-500">Loading plans...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayPlans.map((plan: any) => {
                            const isCurrent = plan.id === currentPlanId || (isTrial && plan.id === 'trial'); // Wait, trial is special handling
                            const Icon = plan.icon;

                            return (
                                <motion.div
                                    key={plan.id}
                                    whileHover={{ y: -5 }}
                                    className={`relative bg-card text-card-foreground rounded-2xl border ${plan.popular ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-border'} p-6 flex flex-col`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <Star size={12} fill="currentColor" /> MOST POPULAR
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.bgColor} ${plan.color}`}>
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-bold">${plan.price}</span>
                                        <span className="text-muted-foreground text-sm">/mo</span>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        <li className="flex items-center gap-3 text-sm">
                                            <div className={`p-1 rounded-full ${plan.bgColor} ${plan.color}`}>
                                                <Check size={12} />
                                            </div>
                                            <span className="font-bold">{plan.messageLimit} Messages</span>
                                        </li>
                                        {plan.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Check size={16} className="text-green-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => {
                                            if (plan.price === 0) {
                                                // Free plan: show dialog to collect details
                                                setLoadingPlan(plan.id);
                                                setShowTrialDialog(true);
                                                setTrialDetails({ name: '', email: '', phone: '' });
                                            } else {
                                                // Paid plan: go directly to Shopify payment
                                                createCharge(plan.id);
                                            }
                                        }}
                                        disabled={(plan.id === currentPlanId && status?.status === 'active') || !!loadingPlan}
                                        className="w-full"
                                        variant={plan.btnVariant as any}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (plan.id === currentPlanId && status?.status === 'active') ? (
                                            "Current Plan"
                                        ) : (
                                            "Activate Plan"
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
