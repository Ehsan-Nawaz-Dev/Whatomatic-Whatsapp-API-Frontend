import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, Smartphone, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings, fetchWhatsAppStatus, fetchChatButtonSettings, getCurrentShop } from "@/lib/api";

interface SetupChecklistProps {
    onNavigate: (tab: string) => void;
}

const SetupChecklist = ({ onNavigate }: SetupChecklistProps) => {
    const { data: settings } = useQuery({
        queryKey: ["merchant-settings", getCurrentShop()],
        queryFn: fetchSettings,
    });

    const { data: whatsapp } = useQuery({
        queryKey: ["whatsapp-status", getCurrentShop()],
        queryFn: fetchWhatsAppStatus,
    });

    const { data: chatButton } = useQuery({
        queryKey: ["chat-button-settings", getCurrentShop()],
        queryFn: fetchChatButtonSettings,
    });

    const steps = [
        {
            id: "whatsapp",
            title: "Connect WhatsApp",
            description: "Scan the QR code to link your business WhatsApp account.",
            completed: !!whatsapp?.connected,
            tab: "overview", // It's on the overview page
            icon: Smartphone
        },
        {
            id: "settings",
            title: "Configure Settings",
            description: "Set your business number and order tags for automation.",
            completed: !!(settings?.whatsappNumber || settings?.adminPhoneNumber || settings?.phone),
            tab: "settings",
            icon: Zap
        },
        {
            id: "chat-button",
            title: "Enable Chat Button",
            description: "Optional: Add a WhatsApp button to your storefront.",
            completed: !!chatButton?.enabled,
            tab: "chat-button",
            icon: MessageSquare
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const isFinished = completedCount === steps.length;

    if (isFinished) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl border border-primary/20 shadow-sm mb-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        🚀 Complete your setup
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Finish these steps to start automating your customer communications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
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
