import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Layout, MessageSquare, Globe, Bell, Settings2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
    sendCloudMessage,
    sendCloudTemplate,
    fetchCloudTemplates,
    CloudMessagePayload,
    CloudTemplatePayload,
    getCurrentShop
} from "@/lib/api";

const WhatsAppCloudSettings = () => {
    const queryClient = useQueryClient();
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");

    const { data: templates = [], isLoading: loadingTemplates } = useQuery({
        queryKey: ["cloud-templates", getCurrentShop()],
        queryFn: fetchCloudTemplates,
    });

    const sendMsgMut = useMutation({
        mutationFn: sendCloudMessage,
        onSuccess: () => {
            toast.success("Message sent successfully via Cloud API!");
            setMessage("");
        },
        onError: () => toast.error("Failed to send cloud message"),
    });

    const sendTemplateMut = useMutation({
        mutationFn: sendCloudTemplate,
        onSuccess: () => {
            toast.success("Template message sent!");
        },
        onError: () => toast.error("Failed to send template message"),
    });

    const handleSendTest = () => {
        if (!recipient) return toast.error("Please enter a recipient number");
        if (!message) return toast.error("Please enter a message");

        sendMsgMut.mutate({
            to: recipient,
            message: message,
            type: "text"
        });
    };

    const handleSendTemplateTest = (templateName: string) => {
        if (!recipient) return toast.error("Please enter a recipient number");

        sendTemplateMut.mutate({
            to: recipient,
            templateName,
            language: "en"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">WhatsApp Cloud API</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your official Meta WhatsApp Business Platform integration
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Production Environment
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border shadow-card overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Quick Message Test
                            </CardTitle>
                            <CardDescription>
                                Test your connection by sending a direct message
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Recipient Phone Number</Label>
                                <Input
                                    id="recipient"
                                    placeholder="+1234567890"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Input
                                    id="message"
                                    placeholder="Hello from WhatFlow Cloud API!"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="hero"
                                className="w-full"
                                onClick={handleSendTest}
                                disabled={sendMsgMut.isPending}
                            >
                                {sendMsgMut.isPending ? "Sending..." : "Send Test Message"}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 pl-1">
                            <Layout className="w-5 h-5 text-primary" />
                            Verified Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loadingTemplates ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                                ))
                            ) : templates.length === 0 ? (
                                <div className="col-span-full py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">
                                    No templates synced from Meta.
                                    <Button variant="link" className="text-primary text-xs">Sync Now</Button>
                                </div>
                            ) : templates.map((tmpl) => (
                                <Card key={tmpl.id} className="border-border hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-sm font-bold truncate pr-2">{tmpl.name}</CardTitle>
                                            <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                                {tmpl.status}
                                            </span>
                                        </div>
                                        <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                                            {tmpl.category} • {tmpl.language}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => handleSendTemplateTest(tmpl.name)}
                                            disabled={sendTemplateMut.isPending}
                                        >
                                            Send Test Template
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm">API Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="flex items-center gap-1 text-success font-medium">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span>Meta (Official)</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Region</span>
                                    <span>North America</span>
                                </div>
                            </div>

                            <Alert className="bg-primary/5 border-primary/20">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-xs font-semibold">Webhooks</AlertTitle>
                                <AlertDescription className="text-[10px]">
                                    Your webhook is configured to receive events at:
                                    <code className="block mt-1 p-1 bg-background rounded border border-border">/api/webhooks/whatsapp</code>
                                </AlertDescription>
                            </Alert>

                            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                <Settings2 className="w-3.5 h-3.5 mr-2" />
                                Advanced Settings
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Connect your Meta Business Account to WhatFlow to unlock a 99.9% uptime and official verified badge.
                            </p>
                            <Button variant="link" className="p-0 h-auto text-xs text-primary font-semibold">
                                View Documentation →
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppCloudSettings;
