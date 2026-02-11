import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary mb-3">EFFECTIVE DATE: FEBRUARY 11, 2026</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Terms of Service</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to Whatomatic. By using our service, you agree to the following terms and conditions.
            </p>
          </div>

          <div className="space-y-12 text-foreground leading-relaxed">
            <div className="glass-card p-8 rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By installing Whatomatic from the Shopify App Store, you agree to be bound by these terms. If you do not agree, please uninstall the application immediately.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Whatomatic is a software service that allows Shopify merchants to automate WhatsApp messages to their customers. You are responsible for connecting your own WhatsApp account or using our provided API services according to your plan.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">3. Merchant Responsibilities</h2>
              <p className="text-muted-foreground mb-4">
                As a merchant using Whatomatic, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You have obtained the necessary consent from your customers to contact them via WhatsApp.</li>
                <li>You will not use the service for spam, harassment, or illegal purposes.</li>
                <li>You will comply with WhatsApp's own Terms of Service and Business Policies.</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">4. WhatsApp Policies & Risk</h2>
              <p className="text-muted-foreground">
                WhatsApp has strict policies against mass messaging and automation. While Whatomatic includes safeguards to mimic human behavior, we are not responsible for any bans, blocks, or restrictions placed on your WhatsApp account by Meta/WhatsApp.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">5. Subscription & Billing</h2>
              <p className="text-muted-foreground">
                Billing is handled through Shopify's billing API. You will be charged based on the plan you select. You can cancel your subscription at any time by uninstalling the app or downgrading in the billing settings.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Whatomatic is provided "as is". We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsOfService;
