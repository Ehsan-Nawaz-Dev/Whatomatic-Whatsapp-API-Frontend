import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Settings, Eye, Smartphone, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchChatButtonSettings, updateChatButtonSettings, getCurrentShop } from "@/lib/api";

const ChatButtonConfig = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [buttonText, setButtonText] = useState("Chat with us");
    const [position, setPosition] = useState("right");
    const [themeColor, setThemeColor] = useState("#25D366");
    const [enabled, setEnabled] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ["chat-button-settings", getCurrentShop()],
        queryFn: fetchChatButtonSettings,
    });

    useEffect(() => {
        if (data) {
            setPhoneNumber(data.phoneNumber || "");
            setButtonText(data.buttonText || "Chat with us");
            setPosition(data.position || "right");
            setThemeColor(data.color || "#25D366");
            setEnabled(data.enabled !== undefined ? data.enabled : true);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateChatButtonSettings,
        onSuccess: () => {
            toast.success("Chat button settings saved!");
        },
        onError: () => {
            toast.error("Failed to save settings");
        }
    });

    const handleSave = () => {
        mutation.mutate({
            phoneNumber,
            buttonText,
            position,
            color: themeColor,
            enabled
        });
    };

    if (isLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Storefront Chat Button</h1>
                    <p className="text-muted-foreground mt-1">
                        Let customers start a conversation directly from your website.
                    </p>
                </div>
                <Button variant="hero" onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings Form */}
                <div className="space-y-6">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-card space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">Button Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                <div>
                                    <p className="font-medium">Enable Chat Button</p>
                                    <p className="text-xs text-muted-foreground">Show the button on your storefront</p>
                                </div>
                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">WhatsApp Number</Label>
                                <Input
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+1234567890"
                                />
                                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for USA)</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="text">Button Label</Label>
                                <Input
                                    id="text"
                                    value={buttonText}
                                    onChange={(e) => setButtonText(e.target.value)}
                                    placeholder="Chat with us"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <select
                                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                    >
                                        <option value="right">Bottom Right</option>
                                        <option value="left">Bottom Left</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Theme Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={themeColor}
                                            onChange={(e) => setThemeColor(e.target.value)}
                                            className="w-12 p-1 h-10"
                                        />
                                        <Input
                                            value={themeColor}
                                            onChange={(e) => setThemeColor(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-card h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                <Eye className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">Live Preview</h2>
                        </div>

                        <div className="flex-1 bg-muted/20 rounded-2xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                            <div className="w-[280px] h-[500px] bg-card rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative p-4 flex flex-col">
                                {/* Speaker */}
                                <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mb-4" />

                                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 flex flex-col">
                                    <div className="w-full h-4 bg-slate-200 rounded-lg mb-2" />
                                    <div className="w-3/4 h-4 bg-slate-200 rounded-lg mb-4" />
                                    <div className="w-full h-32 bg-slate-200 rounded-xl mb-4" />
                                    <div className="w-2/3 h-4 bg-slate-200 rounded-lg" />
                                </div>

                                {/* The Button */}
                                {enabled && (
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            x: position === "right" ? 0 : -160,
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{ scale: { repeat: Infinity, duration: 3 } }}
                                        className="absolute bottom-10 right-10 flex items-center gap-3 px-4 py-3 rounded-full shadow-xl shadow-green-500/20"
                                        style={{ backgroundColor: themeColor, color: "#fff" }}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm font-bold whitespace-nowrap">{buttonText}</span>
                                    </motion.div>
                                )}
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                                <Smartphone className="w-4 h-4" />
                                Storefront Preview
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatButtonConfig;

