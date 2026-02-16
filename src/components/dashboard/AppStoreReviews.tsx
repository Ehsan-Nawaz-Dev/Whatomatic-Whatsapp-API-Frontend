import { motion } from "framer-motion";
import { Star, MessageSquare, ExternalLink, ShieldCheck, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AppStoreReviews = () => {
    const reviews = [
        {
            id: 1,
            author: "Organic Styles",
            rating: 5,
            comment: "This app is a game-changer! Automated WhatsApp notifications have saved us so much time and our customers love the instant updates.",
            date: "Jan 12, 2024"
        },
        {
            id: 2,
            author: "Tech Gadgets Pro",
            rating: 5,
            comment: "Support is amazing. We had a small issue with template setup and they resolved it in minutes. Highly recommended for any Shopify store.",
            date: "Feb 05, 2024"
        },
        {
            id: 3,
            author: "Fashion Nova Clone",
            rating: 4,
            comment: "Great app. The poll features for order confirmation work perfectly. Helped reduce our order cancellation rate significantly.",
            date: "Feb 10, 2024"
        }
    ];

    const openAppStore = () => {
        window.open("https://apps.shopify.com/whatomation-order-notification/reviews", "_blank");
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Whatomation Reviews
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            4.9/5 ⭐
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        See what other merchants are saying about Whatomation on the Shopify App Store.
                    </p>
                </div>
                <button
                    onClick={openAppStore}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm font-medium"
                >
                    <Heart className="w-4 h-4 fill-current" />
                    Leave a Review
                </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4 flex items-center gap-3 text-sm font-medium">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        Verified Merchant Reviews
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4 flex items-center gap-3 text-sm font-medium">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Top Rated WhatsApp App
                    </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4 flex items-center gap-3 text-sm font-medium">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        24/7 Priority Support
                    </CardContent>
                </Card>
            </div>

            {/* Review List */}
            <div className="grid grid-cols-1 gap-4">
                {reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="group hover:border-primary/20 transition-all shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted border-0"}`}
                                                />
                                            ))}
                                        </div>
                                        <h4 className="font-semibold text-foreground">{review.author}</h4>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{review.date}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="pt-4 text-center">
                <button
                    onClick={openAppStore}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                >
                    View all reviews on Shopify App Store <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default AppStoreReviews;
