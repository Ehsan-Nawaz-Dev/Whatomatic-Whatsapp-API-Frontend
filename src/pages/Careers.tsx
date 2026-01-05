import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary mb-3">CAREERS</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Work with WhatFlow</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join the team building better customer communication for Shopify merchants.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          We are not hiring for specific roles yet. When you are ready, list your open positions and
          application process here.
        </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Careers;
