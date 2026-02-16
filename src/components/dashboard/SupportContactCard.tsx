import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SupportContactCard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground">Help & Support</h3>
                        <p className="text-xs text-muted-foreground">Get in touch with our team</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/5 text-xs h-8 px-3"
                    onClick={() => window.open('/help', '_blank')}
                >
                    Full View
                    <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Email Support</p>
                        <p className="text-sm font-medium text-foreground">support@whatomatic.com</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Phone Number</p>
                        <p className="text-sm font-medium text-foreground">+92 310-5878854</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Office Address</p>
                        <p className="text-xs font-medium text-foreground leading-relaxed">
                            Street 36 Silk Bank Plaza Lower Basement Workzone E11/3 Islamabad, Pakistan
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SupportContactCard;
