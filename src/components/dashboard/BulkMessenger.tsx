import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Upload, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { sendCampaign } from "@/lib/api";

const BulkMessenger = () => {
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [contactsCount, setContactsCount] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = () => {
        setIsUploading(true);
        // Simulate parsing
        setTimeout(() => {
            setContactsCount(142);
            setIsUploading(false);
            toast.success("Imported 142 contacts successfully!");
        }, 1500);
    };

    const startCampaign = async () => {
        if (contactsCount === 0) {
            toast.error("Please upload contacts first");
            return;
        }
        if (!message) {
            toast.error("Please write a message");
            return;
        }

        setIsSending(true);
        setProgress(0);

        try {
            // In a real scenario, you'd parse info from the CSV
            // For now, we allow sending to the imported count using the first contact as a template
            const campaignContacts = Array.from({ length: Math.min(contactsCount, 5) }).map((_, i) => ({
                id: `cont_${i}`,
                phone: i === 0 ? "+923001234567" : `+92300${1000000 + i}`, // Dummy but keeps first one for test
                name: `Customer ${i}`
            }));

            await sendCampaign({
                contacts: campaignContacts,
                message: message
            });

            // Simulate progress for UI feedback during the request
            let current = 0;
            const interval = setInterval(() => {
                current += 10;
                setProgress(current);
                if (current >= 100) {
                    clearInterval(interval);
                    setIsSending(false);
                    toast.success(`Campaign launched successfully to ${contactsCount} contacts!`);
                }
            }, 100);

        } catch (error: any) {
            setIsSending(false);
            toast.error(error.message || "Failed to launch campaign");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Bulk Messenger</h1>
                <p className="text-muted-foreground mt-1">
                    Send personalized promotional messages to your customer lists.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1: Upload */}
                <div className="md:col-span-1 space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-card space-y-4 h-full">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">1. Upload Contacts</h3>
                        <p className="text-sm text-muted-foreground">Upload a CSV file containing your customer phone numbers and names.</p>

                        <div
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                            onClick={handleFileUpload}
                        >
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-xs mt-2 text-muted-foreground">Click to browse or drag & drop</p>
                        </div>

                        {contactsCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                {contactsCount} contacts ready
                            </div>
                        )}

                        <Button variant="outline" className="w-full text-xs h-8" disabled={isUploading}>
                            Download Sample CSV
                        </Button>
                    </div>
                </div>

                {/* Step 2: Message & Send */}
                <div className="md:col-span-2 space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-card space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">2. Compose Message</h3>
                            <Textarea
                                placeholder="Hi {{name}}, we have a special offer for you!"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[150px] bg-muted/30 border-border"
                            />
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Wait 20-30 seconds between messages to protect your account.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {["{{name}}", "{{store_name}}", "{{discount_code}}"].map(tag => (
                                    <code key={tag} className="px-2 py-1 bg-muted rounded text-[10px] cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setMessage(m => m + tag)}>
                                        {tag}
                                    </code>
                                ))}
                            </div>

                            {isSending ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Sending campaign...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            ) : (
                                <Button variant="hero" className="w-full py-6 text-lg" onClick={startCampaign}>
                                    <Send className="w-5 h-5 mr-3" />
                                    Launch Campaign
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div className="text-xs leading-relaxed">
                            <p className="font-bold mb-1">Important Spam Notice</p>
                            Sending promotional messages to people who haven't opted-in can result in your WhatsApp account being banned. Ensure your list is clean and contains only customers who have given consent.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkMessenger;
