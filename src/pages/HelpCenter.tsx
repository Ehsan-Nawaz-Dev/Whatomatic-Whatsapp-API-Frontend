import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContact } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, MessageCircle, Clock, ShieldCheck } from "lucide-react";

const HelpCenter = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      setName("");
      setEmail("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, message });
  };

  const faqs = [
    {
      q: "How does the cancellation flow work?",
      a: "When a customer initiates a cancellation, we send a WhatsApp poll for verification. This prevents accidental cancellations and ensures clear communication."
    },
    {
      q: "Is it safe for my WhatsApp account?",
      a: "Yes! We use human simulation delays and anti-spam safeguards to mimic natural messaging behavior, reducing the risk of being flagged."
    },
    {
      q: "Do I need a WhatsApp Business API?",
      a: "Whatomatic supports both standard WhatsApp pairing (via QR code) and WhatsApp Cloud API. You can choose the method that fits your volume."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Support & Help Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Need help with your Whatomatic setup? Our team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Side */}
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-primary">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@whatomatic.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 text-primary">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Average Response</h3>
                  <p className="text-sm text-muted-foreground">Under 12 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Privacy Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">100% secure connection</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30">
                  <h4 className="font-semibold text-sm mb-2">{faq.q}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl bg-card border border-border shadow-md">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@store.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px] bg-muted/50 border-border/50"
                    placeholder="Tell us about the issue or question you have..."
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button type="submit" variant="hero" size="lg" disabled={mutation.isPending}>
                    {mutation.isPending ? "Sending..." : "Submit Ticket"}
                  </Button>

                  {mutation.isSuccess && (
                    <div className="flex items-center gap-2 text-primary animate-in fade-in slide-in-from-right-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-sm font-medium">Message received!</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
