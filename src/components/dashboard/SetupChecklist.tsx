import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, Smartphone, Zap, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings, fetchWhatsAppStatus, fetchChatButtonSettings, getCurrentShop } from "@/lib/api";

interface SetupChecklistProps {
    onNavigate: (tab: string) => void;
}

const SetupChecklist = ({ onNavigate }: SetupChecklistProps) => {
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ["merchant-settings", getCurrentShop()],
        queryFn: fetchSettings,
    });

    const { data: whatsapp, isLoading: whatsappLoading } = useQuery({
        queryKey: ["whatsapp-status", getCurrentShop()],
        queryFn: fetchWhatsAppStatus,
    });

    const isLoading = settingsLoading || whatsappLoading;

    // Use a refined check for Step 2 completion
    const isStep2Completed = !!(settings?.whatsappNumber || settings?.adminPhoneNumber || settings?.phone);

    const steps = [
        {
            id: "whatsapp",
            title: "Connect WhatsApp",
            description: "Scan the QR code to link your business WhatsApp account.",
            completed: !!whatsapp?.connected,
            tab: "overview",
            icon: Smartphone
        },
        {
            id: "settings",
            title: "Configure Settings",
            description: "Set your business number and order tags for automation.",
            completed: isStep2Completed,
            tab: "settings",
            icon: Zap
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const isFinished = completedCount === steps.length;

    if (isLoading || isFinished) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 lg:p-4 xl:p-6 bg-gradient-to-br from-primary/5 via-card to-card rounded-xl border border-primary/10 shadow-card"
        >
            <div className="flex items-center justify-between mb-3 lg:mb-4 xl:mb-6">
                <div>
                    <h2 className="text-sm lg:text-base xl:text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        Quick Setup Guide
                    </h2>
                    <p className="text-[10px] lg:text-xs xl:text-sm text-muted-foreground mt-0.5 lg:mt-1">
                        Complete these steps to get started with WhatFlow
                    </p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-16 lg:w-20 xl:w-24 h-1.5 lg:h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(completedCount / steps.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-primary">{completedCount}/{steps.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`p-4 rounded-xl border transition-all ${step.completed
                            ? "bg-success/5 border-success/20 opacity-75"
                            : "bg-card border-border hover:border-primary/50"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${step.completed ? "bg-success/10" : "bg-primary/10"}`}>
                                <step.icon className={`w-5 h-5 ${step.completed ? "text-success" : "text-primary"}`} />
                            </div>
                            {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                        <h3 className={`font-bold text-sm ${step.completed ? "text-success" : "text-foreground"}`}>
                            {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                            {step.description}
                        </p>
                        {!step.completed && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs h-8"
                                onClick={() => onNavigate(step.tab)}
                            >
                                Setup
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SetupChecklist;
