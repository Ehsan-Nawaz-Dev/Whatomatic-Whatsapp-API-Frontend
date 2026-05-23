import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Zap, ArrowRight, ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-5xl flex flex-col gap-2 sm:gap-3 h-[95vh] lg:h-[92vh] max-h-[900px]">
                <div className="text-center shrink-0 pt-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        Welcome to Whatomatic!
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Let's get your store set up in 3 simple steps.</p>
                </div>

                {/* Stepper Header */}
                <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12 w-full shrink-0">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id; // true progress
                        const isCurrent = activeStep === step.id;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-2.5 sm:gap-3 transition-all duration-300 cursor-pointer rounded-full p-1.5 sm:p-2 sm:pr-4 hover:bg-muted/50 ${isCurrent || isCompleted ? 'opacity-100' : 'opacity-60'}`}
                                onClick={() => setActiveStep(step.id)}
                            >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shrink-0 rounded-full flex items-center justify-center border transition-transform duration-200 ${isCurrent ? 'bg-primary/10 border-primary text-primary shadow-sm scale-105' :
                                        isCompleted ? 'bg-success/10 border-success text-success' :
                                            'bg-muted border-muted-foreground/30 text-muted-foreground'
                                    }`}>
                                    {isCompleted && !isCurrent ? <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <step.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <h3 className={`font-bold text-xs sm:text-sm lg:text-base ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-1">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden sm:block w-6 sm:w-12 lg:w-16 h-[2px] bg-border ml-3 sm:ml-6 lg:ml-8 shrink-0" />
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
                            className="absolute inset-0 flex flex-col overflow-hidden"
                        >
                            {/* Internal scrollable area for whichever component is rendered */}
                            <div className={`flex-1 overflow-y-auto ${activeStep === 3 ? 'p-0' : 'px-3 sm:px-4 lg:px-6 pt-1 sm:pt-1.5 pb-3 sm:pb-4'}`}>

                                {activeStep === 1 && (
                                    <div className="max-w-5xl mx-auto h-full pb-3 sm:pb-4">
                                        <BillingPlan hideHeader />
                                    </div>
                                )}

                                {activeStep === 2 && (
                                    <div className="max-w-4xl mx-auto flex flex-col items-center pt-1.5 sm:pt-2 h-full pb-3 sm:pb-4">
                                        <WhatsAppConnection />
                                    </div>
                                )}

                                {activeStep === 3 && (
                                    <div className="flex flex-col h-full px-3 sm:px-4 lg:px-6 pt-1.5 pb-3">
                                        <div className="mb-2 pb-2 border-b border-border shrink-0">
                                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Start Automation</h2>
                                                <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Enable at least one automation to complete your setup.</p>
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

                {/* Previous / Next Navigation */}
                <div className="flex items-center justify-between shrink-0 mt-4 sm:mt-6">
                    {activeStep > 1 ? (
                        <Button
                            variant="outline"
                            onClick={() => setActiveStep(activeStep - 1)}
                            className="h-10 px-5 gap-2 text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                    ) : (
                        <div /> /* spacer */
                    )}

                    {activeStep < 3 ? (
                        <Button
                            variant="hero"
                            onClick={() => setActiveStep(activeStep + 1)}
                            className="h-10 px-6 gap-2 text-sm font-semibold"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={onComplete}
                            variant={hasAutomations ? "hero" : "outline"}
                            className="h-10 px-6 gap-2 text-sm font-semibold"
                        >
                            {hasAutomations ? "Complete Setup" : "Skip for now"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
