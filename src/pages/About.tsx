import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary mb-3">ABOUT</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            About WhatFlow
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            WhatFlow is a WhatsApp automation app designed for Shopify merchants. It helps you automate
            order confirmations, abandoned cart reminders, and shipping updates, all from a single
            dashboard.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We want to make it effortless for Shopify merchants to talk to their customers on the
              channel they use the most: WhatsApp. WhatFlow reduces manual work so you can focus on
              growing your business.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Built for Shopify</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From order confirmations to abandoned cart recovery, every feature in WhatFlow is designed
              specifically for Shopify workflows and customer journeys.
            </p>
          </div>
        </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
