import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary mb-3">TERMS</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These are placeholder terms of service for WhatFlow. Replace this with your actual
            terms before launching publicly.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Use this page to describe the rules and conditions under which merchants use your
            application.
          </p>
        </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsOfService;
