import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContact } from "@/lib/api";
import { Mail, Phone, MapPin, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

const HelpSupport = () => {
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
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">Need assistance? Our team is here to help you get the most out of Whatomatic.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info Side */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6"
                    >
                        <div className="flex items-center gap-4 text-primary">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Email Support</h3>
                                <p className="text-xs text-muted-foreground">support@whatomatic.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-primary">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Phone Support</h3>
                                <p className="text-xs text-muted-foreground">+1 (40) 63160653</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-primary">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Office Address</h3>
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    Street 36 Silk Bank Plaza Lower Basement Workzone E11/3 Islamabad, Pakistan
                                </p>
                            </div>
                        </div>

                        <hr className="border-border" />

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <Clock className="w-5 h-5" />
                            <p className="text-xs">Average response: <span className="text-foreground font-medium">Under 12 hours</span></p>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold px-1">Frequently Asked Questions</h3>
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl border border-border bg-muted/20"
                            >
                                <h4 className="font-semibold text-sm mb-2">{faq.q}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-2xl bg-card border border-border shadow-sm"
                    >
                        <h2 className="text-xl font-bold mb-6 text-foreground font-outfit">Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-muted/30 border-border/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@store.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-muted/30 border-border/50 focus:bg-background transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How can we help?</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="min-h-[160px] bg-muted/30 border-border/50 focus:bg-background transition-colors resize-none"
                                    placeholder="Tell us about the issue or question you have..."
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Button type="submit" variant="hero" size="lg" className="px-10" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Sending..." : "Submit Ticket"}
                                </Button>

                                {mutation.isSuccess && (
                                    <div className="flex items-center gap-2 text-primary animate-in fade-in slide-in-from-right-2">
                                        <div className="p-1.5 rounded-full bg-primary/10">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">Message received!</span>
                                    </div>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
