import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary mb-3">LAST UPDATED: FEBRUARY 11, 2026</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At Whatomatic, we take your privacy and your customers' data security seriously.
            </p>
          </div>

          <div className="space-y-12 text-foreground leading-relaxed">
            <div className="glass-card p-8 rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                Whatomatic provides WhatsApp automation services for Shopify merchants. To perform these services, we collect and process the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Merchant Data:</strong> Shop name, email, Shopify access tokens, and phone numbers.</li>
                <li><strong>Order Data:</strong> Customer names, phone numbers, order details (items, totals), and shipping addresses to send notifications.</li>
                <li><strong>WhatsApp Data:</strong> Messages and interaction logs purely for providing the automation service and analytics.</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Information</h2>
              <p className="text-muted-foreground">
                We use the data collected strictly for:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                <li>Automating order confirmations, tracking updates, and abandonment recovery.</li>
                <li>Providing you with analytics on your message performance.</li>
                <li>Customer support and improving our service reliability.</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                We **do not** sell your data or your customers' data to third parties.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">3. Data Retention & Security</h2>
              <p className="text-muted-foreground">
                Logs of sent messages are kept for a limited time to provide merchants with activity history. We implement industry-standard security measures to protect your access tokens and merchant data. All communication with Shopify is performed over secure HTTPS connections.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">4. GDPR and CCPA</h2>
              <p className="text-muted-foreground">
                We act as a "Data Processor" for your customer information. As the Data Controller, you (the merchant) are responsible for ensuring that your customers are aware of how their data is used. We provide tools for data deletion if requested by a customer under their local privacy laws.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at <strong>support@whatomatic.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
