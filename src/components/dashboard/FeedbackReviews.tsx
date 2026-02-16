import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, MessageSquare, TrendingUp, User, Calendar, ExternalLink } from "lucide-react";
import { fetchFeedback, fetchFeedbackStats, getCurrentShop } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeedbackReviews = () => {
    const shop = getCurrentShop();

    const { data: feedback = [], isLoading } = useQuery({
        queryKey: ["feedback", shop],
        queryFn: fetchFeedback,
    });

    const { data: stats } = useQuery({
        queryKey: ["feedback-stats", shop],
        queryFn: fetchFeedbackStats,
    });

    const averageRating = stats?.averageRating?.toFixed(1) || "0.0";
    const totalReviews = stats?.totalFeedback || 0;
    const positiveRate = totalReviews > 0
        ? Math.round((stats?.positiveCount || 0) / totalReviews * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Customer Feedback</h1>
                    <p className="text-sm text-muted-foreground mt-1 text-xs xl:text-sm">
                        View and manage customer ratings received via WhatsApp
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            Average Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{averageRating} / 5.0</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on {totalReviews} reviews</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            Positive Sentiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{positiveRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Customers rated 4+ stars</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            Total Responses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-muted-foreground mt-1">Captured via automated polls</p>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold px-1">Recent Reviews</h3>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : feedback.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No feedback received yet.
                            <p className="text-xs mt-2">Feedback is collected automatically after order confirmation.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {feedback.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden group hover:border-primary/30 transition-colors">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className={`w-1.5 sm:w-2 shrink-0 ${item.rating >= 4 ? 'bg-green-500' : (item.rating <= 2 ? 'bg-red-500' : 'bg-yellow-500')
                                                }`} />
                                            <div className="p-5 flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 ${i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted border-0"}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <Badge variant="secondary" className="text-[10px] py-0">
                                                                Order #{item.orderId}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-semibold flex items-center gap-2">
                                                            {item.customerName || "Customer"}
                                                            <span className="text-xs font-normal text-muted-foreground">({item.customerPhone})</span>
                                                        </h4>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-foreground/90 italic">
                                                    "{item.comment || "No comment provided."}"
                                                </p>

                                                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                        <span className="flex items-center gap-1 uppercase tracking-wider font-bold">
                                                            Sentiment:
                                                            <span className={item.sentiment === 'positive' ? 'text-green-600' : (item.sentiment === 'negative' ? 'text-red-600' : 'text-yellow-600')}>
                                                                {item.sentiment}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                                                        View Order <ExternalLink className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackReviews;
