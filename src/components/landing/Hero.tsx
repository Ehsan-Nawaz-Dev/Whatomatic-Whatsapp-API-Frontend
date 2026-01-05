import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ShoppingBag, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden gradient-hero">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">
              Shopify's #1 WhatsApp Automation Tool
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            Automate Your{" "}
            <span className="text-gradient">WhatsApp</span>
            <br />
            Customer Engagement
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Send order confirmations, recover abandoned carts, and keep customers 
            updated—all through WhatsApp. Seamlessly integrated with your Shopify store.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <Button variant="hero" size="xl">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="glass" size="xl">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-col items-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by 2,500+ Shopify merchants worldwide
            </p>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div className="text-xs text-muted-foreground">Delivery Rate</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">35%</div>
                <div className="text-xs text-muted-foreground">Cart Recovery</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-xs text-muted-foreground">Shopify Rating</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute top-40 left-20"
        >
          <div className="w-14 h-14 bg-card rounded-2xl shadow-card flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-primary" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute top-60 right-20"
        >
          <div className="w-14 h-14 bg-card rounded-2xl shadow-card flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-secondary" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
