import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Bell, 
  MessageSquare, 
  Tags, 
  Zap, 
  Shield,
  QrCode,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Abandoned Cart Recovery",
    description: "Automatically remind customers about items left in their cart after 24 hours with personalized WhatsApp messages.",
  },
  {
    icon: Bell,
    title: "Order Notifications",
    description: "Send instant confirmations, shipping updates, and delivery notifications directly to customers' WhatsApp.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Messaging",
    description: "Enable customers to confirm or cancel orders with simple replies. Their responses automatically update Shopify.",
  },
  {
    icon: Tags,
    title: "Smart Order Tagging",
    description: "Automatically tag orders based on customer responses—'Confirmed', 'Cancelled', or custom tags you define.",
  },
  {
    icon: QrCode,
    title: "Easy QR Setup",
    description: "Connect your WhatsApp in seconds by scanning a QR code. No complex API setup or technical knowledge needed.",
  },
  {
    icon: Zap,
    title: "Custom Templates",
    description: "Create personalized message templates with dynamic placeholders for order ID, total, tracking links, and more.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track message delivery rates, response rates, and cart recovery success with detailed analytics dashboard.",
  },
  {
    icon: Shield,
    title: "Privacy Compliant",
    description: "Built with Shopify's privacy requirements in mind. Customer data is handled securely and never shared.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-4"
          >
            FEATURES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Everything You Need to Automate WhatsApp
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Powerful features designed to streamline customer communication and boost your Shopify store's performance.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
