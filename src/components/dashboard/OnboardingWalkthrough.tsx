import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Zap, ArrowRight, Check } from "lucide-react";
import BillingPlan from "@/components/dashboard/BillingPlan";
import WhatsAppConnection from "@/components/dashboard/WhatsAppConnection";
import AutomationsOverview from "@/components/dashboard/AutomationsOverview";
import { Button } from "@/components/ui/button";

interface OnboardingWalkthroughProps {
    currentStep: number;
    onComplete: () => void;
    hasAutomations: boolean;
}

export default function OnboardingWalkthrough({ currentStep, onComplete, hasAutomations }: OnboardingWalkthroughProps) {
    const [activeStep, setActiveStep] = useState(currentStep);

    // Auto-advance if external progress catches up or overtakes
    useEffect(() => {
        setActiveStep(currentStep);
    }, [currentStep]);

    const steps = [
        { id: 1, title: "Choose Plan", icon: CreditCard, description: "Select billing plan" },
        { id: 2, title: "WhatsApp", icon: Smartphone, description: "Link business number" },
        { id: 3, title: "Automations", icon: Zap, description: "Enable an automation" }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
            <div className="w-full max-w-5xl flex flex-col gap-4 lg:gap-6 h-[95vh] lg:h-[88vh]">
                <div className="text-center shrink-0 pt-2">
                    <h1 className="text-2xl lg:text-3xl font-extrabold mb-1 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        Welcome to Whatomatic!
                    </h1>
                    <p className="text-muted-foreground text-xs lg:text-sm">Let's get your store set up in 3 simple steps.</p>
                </div>

                {/* Stepper Header */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-10 w-full shrink-0">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id; // true progress
                        const isCurrent = activeStep === step.id;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-2 sm:gap-3 transition-all duration-300 cursor-pointer rounded-full p-1 sm:p-2 sm:pr-4 hover:bg-muted/50 ${isCurrent || isCompleted ? 'opacity-100' : 'opacity-60'}`}
                                onClick={() => setActiveStep(step.id)}
                            >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shrink-0 rounded-full flex items-center justify-center border-2 transition-transform duration-200 ${isCurrent ? 'bg-primary/10 border-primary text-primary shadow-sm scale-105' :
                                        isCompleted ? 'bg-success/10 border-success text-success' :
                                            'bg-muted border-muted-foreground/30 text-muted-foreground'
                                    }`}>
                                    {isCompleted && !isCurrent ? <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <step.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <h3 className={`font-bold text-xs lg:text-sm ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-[9px] lg:text-[11px] text-muted-foreground line-clamp-1">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden sm:block w-4 sm:w-8 lg:w-10 h-[2px] bg-border ml-2 sm:ml-4 lg:ml-6 shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content Container */}
                <div className="flex-1 min-h-0 relative w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-card rounded-2xl lg:rounded-3xl shadow-xl border border-primary/20 flex flex-col overflow-hidden"
                        >
                            {/* Internal scrollable area for whichever component is rendered */}
                            <div className={`flex-1 overflow-y-auto ${activeStep === 3 ? 'p-0' : 'p-4 lg:p-6'} bg-gradient-to-br from-background via-card to-background`}>

                                {activeStep === 1 && (
                                    <div className="max-w-4xl mx-auto h-full pb-10">
                                        <BillingPlan />
                                    </div>
                                )}

                                {activeStep === 2 && (
                                    <div className="max-w-3xl mx-auto flex flex-col items-center pt-4 lg:pt-8 h-full pb-10">
                                        <WhatsAppConnection />
                                    </div>
                                )}

                                {activeStep === 3 && (
                                    <div className="flex flex-col h-full bg-card p-4 lg:p-6 pb-10">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border shrink-0">
                                            <div className="flex-1">
                                                <h2 className="text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Start Automation</h2>
                                                <p className="text-xs lg:text-sm text-muted-foreground mb-4 sm:mb-0">Enable at least one automation to complete your setup.</p>
                                            </div>
                                            <Button
                                                onClick={onComplete}
                                                variant={hasAutomations ? "hero" : "outline"}
                                                className="px-6 h-10 w-full sm:w-auto"
                                            >
                                                {hasAutomations ? "Complete Setup" : "Skip for now"}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
                                            <AutomationsOverview />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
