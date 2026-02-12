import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Rocket } from "lucide-react";

const BillingSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(4);
    const shop = searchParams.get("shop");

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect to dashboard
                    const dashUrl = shop ? `/dashboard?shop=${shop}&tab=overview` : "/dashboard?tab=overview";
                    navigate(dashUrl, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, shop]);

    return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
            {/* Animated background particles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899"][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -200, -400],
                        x: [0, (Math.random() - 0.5) * 200],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Radial gradient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)]" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 text-center max-w-lg mx-auto px-6"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="relative inline-block mb-8"
                >
                    {/* Outer glow ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-green-500/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ width: 120, height: 120, left: -10, top: -10 }}
                    />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                        <motion.div
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-bold text-white mb-3"
                >
                    Plan Activated! 🎉
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-slate-400 mb-8"
                >
                    Your subscription is now active. Welcome aboard!
                </motion.p>

                {/* Features unlocked */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                            What's Included
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                            "WhatsApp Notifications",
                            "Order Confirmations",
                            "Abandoned Cart Recovery",
                            "Shipment Tracking",
                            "Custom Templates",
                            "Analytics Dashboard",
                        ].map((feature, i) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                className="flex items-center gap-2 text-slate-300"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {feature}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Redirect info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Rocket className="w-4 h-4" />
                        <span className="text-sm">
                            Redirecting to your dashboard in <span className="text-white font-bold">{countdown}s</span>
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-64 mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default BillingSuccess;
