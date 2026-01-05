import { motion } from "framer-motion";
import { Store, QrCode, MessageCircle, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Store,
    step: "01",
    title: "Install the App",
    description: "Add WhatFlow to your Shopify store with one click. No coding required.",
  },
  {
    icon: QrCode,
    step: "02",
    title: "Connect WhatsApp",
    description: "Scan a QR code to link your WhatsApp Business account in seconds.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Customize Templates",
    description: "Create personalized message templates for different order events.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Go Automatic",
    description: "Let WhatFlow handle customer communication while you focus on growing your business.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-4"
          >
            HOW IT WORKS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Up and Running in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Get started with WhatFlow in four simple steps. No technical expertise needed.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="text-6xl font-bold text-muted/50 mb-4">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
