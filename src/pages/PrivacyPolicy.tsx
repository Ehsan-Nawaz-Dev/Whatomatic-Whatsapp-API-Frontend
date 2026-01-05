import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary mb-3">POLICY</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This is a placeholder privacy policy for WhatFlow. Replace this content with your real
            legal text before going live.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Use this page to describe what data you collect, how you use it, and how merchants and
            their customers can contact you about privacy.
          </p>
        </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
