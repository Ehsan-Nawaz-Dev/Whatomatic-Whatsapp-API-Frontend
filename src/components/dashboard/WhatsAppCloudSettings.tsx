import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Layout, MessageSquare, Globe, Bell, Settings2, Info, CheckCircle2, AlertCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    sendCloudMessage,
    sendCloudTemplate,
    fetchCloudTemplates,
    createCloudTemplate,
    deleteCloudTemplate,
    CloudMessagePayload,
    CloudTemplatePayload,
    getCurrentShop
} from "@/lib/api";

const WhatsAppCloudSettings = () => {
    const queryClient = useQueryClient();
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create Template State
    const [tplName, setTplName] = useState("");
    const [tplCategory, setTplCategory] = useState<"UTILITY" | "MARKETING" | "AUTHENTICATION">("UTILITY");
    const [tplLanguage, setTplLanguage] = useState("en_US");
    const [tplBody, setTplBody] = useState("");
    const [tplHeader, setTplHeader] = useState("");
    const [tplFooter, setTplFooter] = useState("");
    const [tplButtons, setTplButtons] = useState("");
    const [tplExample1, setTplExample1] = useState("");
    const [tplExample2, setTplExample2] = useState("");

    const { data: templates = [], isLoading: loadingTemplates, refetch: refetchTemplates, isRefetching } = useQuery({
        queryKey: ["cloud-templates", getCurrentShop()],
        queryFn: fetchCloudTemplates,
    });

    const sendMsgMut = useMutation({
        mutationFn: sendCloudMessage,
        onSuccess: () => {
            toast.success("Message sent successfully via Cloud API!");
            setMessage("");
        },
        onError: (err: any) => toast.error(err.message || "Failed to send cloud message"),
    });

    const sendTemplateMut = useMutation({
        mutationFn: sendCloudTemplate,
        onSuccess: () => {
            toast.success("Template message sent!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to send template message"),
    });

    const createTemplateMut = useMutation({
        mutationFn: createCloudTemplate,
        onSuccess: (data) => {
            toast.success(data.message || "Template submitted to Meta for approval!");
            setIsCreateOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["cloud-templates", getCurrentShop()] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to submit template to Meta");
        }
    });

    const deleteTemplateMut = useMutation({
        mutationFn: deleteCloudTemplate,
        onSuccess: (data) => {
            toast.success(data.message || "Template deleted from Meta!");
            queryClient.invalidateQueries({ queryKey: ["cloud-templates", getCurrentShop()] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete template");
        }
    });

    const resetForm = () => {
        setTplName("");
        setTplCategory("UTILITY");
        setTplLanguage("en_US");
        setTplBody("");
        setTplHeader("");
        setTplFooter("");
        setTplButtons("");
        setTplExample1("");
        setTplExample2("");
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tplName) return toast.error("Template name is required");
        if (!tplBody) return toast.error("Body text is required");

        const buttonsArray = tplButtons ? tplButtons.split(",").map(b => b.trim()).filter(Boolean) : [];
        const examplesArray = [tplExample1, tplExample2].filter(Boolean);

        createTemplateMut.mutate({
            name: tplName,
            category: tplCategory,
            language: tplLanguage,
            bodyText: tplBody,
            headerText: tplHeader || undefined,
            footerText: tplFooter || undefined,
            buttons: buttonsArray.length > 0 ? buttonsArray : undefined,
            examples: examplesArray.length > 0 ? examplesArray : undefined
        });
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">WhatsApp Cloud API</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your store's Meta WhatsApp Business Platform templates & API
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchTemplates()}
                        disabled={isRefetching}
                        className="text-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
                        Sync Templates
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button variant="hero" size="sm" className="text-xs font-bold bg-[#1877F2] hover:bg-[#166FE5] text-white">
                                <Plus className="w-4 h-4 mr-1.5" />
                                Submit Template to Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Submit New Template to Meta</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Create a custom message template for your store. Meta will review and approve it.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Template Name (Lowercase & Underscores)</Label>
                                    <Input
                                        placeholder="e.g. order_confirmation_v1"
                                        value={tplName}
                                        onChange={(e) => setTplName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">Example: order_update_v2</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Category</Label>
                                        <Select value={tplCategory} onValueChange={(val: any) => setTplCategory(val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTILITY">UTILITY (Order/Account)</SelectItem>
                                                <SelectItem value="MARKETING">MARKETING (Promos)</SelectItem>
                                                <SelectItem value="AUTHENTICATION">AUTHENTICATION (OTP)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Language</Label>
                                        <Select value={tplLanguage} onValueChange={setTplLanguage}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en_US">English (US)</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="ar">Arabic</SelectItem>
                                                <SelectItem value="ur">Urdu</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Header Text (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Order Update"
                                        value={tplHeader}
                                        onChange={(e) => setTplHeader(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Message Body Text</Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Hi {{1}}, thank you for your order {{2}} from Whatomatic!"
                                        value={tplBody}
                                        onChange={(e) => setTplBody(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">Use {"{{1}}, {{2}}"} for dynamic variables.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Example for {"{{1}}"}</Label>
                                        <Input
                                            placeholder="e.g. John"
                                            value={tplExample1}
                                            onChange={(e) => setTplExample1(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">Example for {"{{2}}"}</Label>
                                        <Input
                                            placeholder="e.g. #1001"
                                            value={tplExample2}
                                            onChange={(e) => setTplExample2(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Footer Text (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Whatomatic Store"
                                        value={tplFooter}
                                        onChange={(e) => setTplFooter(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Quick Reply Buttons (Optional, comma separated)</Label>
                                    <Input
                                        placeholder="e.g. Confirm Order, Cancel Order"
                                        value={tplButtons}
                                        onChange={(e) => setTplButtons(e.target.value)}
                                    />
                                </div>

                                <DialogFooter className="pt-3">
                                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createTemplateMut.isPending} className="bg-[#1877F2] hover:bg-[#166FE5] text-white">
                                        {createTemplateMut.isPending ? "Submitting to Meta..." : "Submit to Meta"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                Test your store's Meta connection by sending a direct message
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
                                    placeholder="Hello from Whatomatic Cloud API!"
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
                            Store's Meta Templates ({templates.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loadingTemplates ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
                                ))
                            ) : templates.length === 0 ? (
                                <div className="col-span-full py-10 text-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground space-y-2">
                                    <p>No Meta templates found for this store.</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} className="text-xs">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Create First Template
                                    </Button>
                                </div>
                            ) : templates.map((tmpl) => {
                                const isApproved = tmpl.status?.toUpperCase() === "APPROVED";
                                const isPending = tmpl.status?.toUpperCase() === "PENDING";
                                return (
                                    <Card key={tmpl.id || tmpl.name} className="border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-sm font-bold truncate pr-2">{tmpl.name}</CardTitle>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tight ${
                                                    isApproved ? "bg-success/10 text-success border border-success/20" :
                                                    isPending ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 border border-amber-300/30" :
                                                    "bg-destructive/10 text-destructive border border-destructive/20"
                                                }`}>
                                                    {tmpl.status || "PENDING"}
                                                </span>
                                            </div>
                                            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                                {tmpl.category || "UTILITY"} • {tmpl.language || "en"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2 space-y-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-xs"
                                                    onClick={() => handleSendTemplateTest(tmpl.name)}
                                                    disabled={sendTemplateMut.isPending || !isApproved}
                                                >
                                                    {isApproved ? "Send Test" : "Pending Review"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm(`Delete template '${tmpl.name}' from Meta?`)) {
                                                            deleteTemplateMut.mutate(tmpl.name);
                                                        }
                                                    }}
                                                    disabled={deleteTemplateMut.isPending}
                                                    title="Delete Template from Meta"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-sm">Store API Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Meta Connection</span>
                                    <span className="flex items-center gap-1 text-success font-medium">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">SaaS Engine</span>
                                    <span>Whatomatic Multi-Tenant</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span>Meta Cloud API v21.0</span>
                                </div>
                            </div>

                            <Alert className="bg-primary/5 border-primary/20">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-xs font-semibold">Webhooks Active</AlertTitle>
                                <AlertDescription className="text-[10px]">
                                    Incoming customer replies & template status updates are auto-synced.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppCloudSettings;
