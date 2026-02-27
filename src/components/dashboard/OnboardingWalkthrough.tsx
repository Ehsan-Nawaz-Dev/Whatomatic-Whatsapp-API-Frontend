import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, CreditCard, Smartphone, Zap, ArrowRight, Check } from "lucide-react";
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
    const steps = [
        { id: 1, title: "Choose Plan", icon: CreditCard, description: "Select a billing plan to continue" },
        { id: 2, title: "Connect WhatsApp", icon: Smartphone, description: "Link your business account" },
        { id: 3, title: "Start Automation", icon: Zap, description: "Enable your first automation" }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center pt-6 lg:pt-10 px-4 overflow-y-auto">
            <div className="w-full max-w-6xl flex flex-col gap-6 lg:gap-8 mb-12">
                <div className="text-center">
                    <h1 className="text-2xl lg:text-4xl font-extrabold mb-2 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        Welcome to WhatFlow!
                    </h1>
                    <p className="text-muted-foreground text-sm lg:text-base">Let's get your store set up in 3 simple steps.</p>
                </div>

                {/* Stepper Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-center gap-4 sm:gap-8 lg:gap-12 w-full max-w-4xl mx-auto">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className={`flex items-center gap-3 transition-opacity duration-300 ${isCurrent || isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-success/10 border-success text-success' :
                                    isCurrent ? 'bg-primary/10 border-primary text-primary' :
                                        'bg-muted border-muted-foreground/20 text-muted-foreground'
                                    }`}>
                                    {isCompleted ? <Check className="w-5 h-5 lg:w-6 lg:h-6" /> : <step.icon className="w-5 h-5 lg:w-6 lg:h-6" />}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <h3 className={`font-bold text-sm lg:text-base ${isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-[10px] lg:text-xs text-muted-foreground">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden sm:block w-8 lg:w-12 h-[2px] bg-border ml-4 lg:ml-8" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content Container */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-card w-full rounded-2xl lg:rounded-3xl shadow-2xl border border-primary/20 overflow-hidden min-h-[500px] flex flex-col"
                    >
                        {/* Render Component based on Step */}
                        <div className={`flex-1 ${currentStep === 3 ? 'p-0' : 'p-4 lg:p-8 xl:p-10'} bg-gradient-to-br from-background via-card to-background`}>
                            {currentStep === 1 && (
                                <div className="max-w-4xl mx-auto">
                                    <BillingPlan />
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div className="max-w-3xl mx-auto flex flex-col items-center pt-8">
                                    <WhatsAppConnection />
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="flex flex-col h-full bg-card p-4 lg:p-8 xl:p-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                                        <div className="flex-1">
                                            <h2 className="text-xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Start Automation</h2>
                                            <p className="text-sm lg:text-base text-muted-foreground mb-4 sm:mb-0">Enable at least one automation to complete your setup.</p>
                                        </div>
                                        <Button
                                            onClick={onComplete}
                                            variant={hasAutomations ? "hero" : "outline"}
                                            className="px-6 h-10 lg:h-12 w-full sm:w-auto"
                                        >
                                            {hasAutomations ? "Complete Setup" : "Skip for now"}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col overflow-y-auto">
                                        <AutomationsOverview />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
