import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary mb-3">META & GDPR COMPLIANCE</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">User Data Deletion Instructions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              WhatFlow respects your privacy rights and provides full control over your stored Meta & WhatsApp data.
            </p>
          </div>

          <div className="space-y-12 text-foreground leading-relaxed">
            <div className="glass-card p-8 rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold mb-4">1. How to Request Data Deletion</h2>
              <p className="text-muted-foreground mb-4">
                According to Meta Platform rules and GDPR privacy regulations, users have the right to request the deletion of their personal data collected via the Meta WhatsApp Business API integration.
              </p>
              <p className="text-muted-foreground">
                If you wish to remove your Meta user data, WhatsApp connection credentials, or customer message history stored by WhatFlow, follow these simple steps:
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border space-y-4">
              <h2 className="text-2xl font-bold mb-2">2. Steps to Delete Your Data</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">1</span>
                  <p><strong>Disconnect in App:</strong> Log in to your WhatFlow Dashboard inside Shopify Admin, navigate to <strong>WhatsApp Connection</strong>, and click <strong>Disconnect Meta API</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">2</span>
                  <p><strong>Revoke Meta App Access:</strong> Go to your Facebook Settings → Business Integrations, locate <strong>WhatFlow</strong>, and click <strong>Remove</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">3</span>
                  <p><strong>Submit Email Request:</strong> Send an email to <strong>support@whatomatic.com</strong> with the subject line <em>"Data Deletion Request"</em> and your store domain (e.g. <code>yourstore.myshopify.com</code>).</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">3. Data Removal Timeline</h2>
              <p className="text-muted-foreground">
                Upon receiving your request, our technical support team will permanently delete your Meta System Tokens, WhatsApp credentials, and associated activity logs from our databases within <strong>48 hours</strong>. You will receive a confirmation email once data deletion is complete.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">4. Contact Support</h2>
              <p className="text-muted-foreground">
                For any questions or privacy inquiries, please reach out to us directly at <strong>support@whatomatic.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DataDeletion;
