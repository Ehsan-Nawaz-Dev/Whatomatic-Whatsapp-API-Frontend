import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, Calendar, User, Phone, Mail, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderItem {
    name: string;
    quantity: number;
    price: string;
}

interface OrderConfirmationProps {
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    items: OrderItem[];
    subtotal: string;
    total: string;
    shippingAddress: string;
    city: string;
    estimatedDelivery?: string;
    storeName: string;
}

const OrderConfirmationTemplate: React.FC<OrderConfirmationProps> = ({
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    total,
    shippingAddress,
    city,
    estimatedDelivery,
    storeName,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
            >
                {/* Success Header */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-2xl shadow-green-500/50 mb-6">
                        <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        Thank You for Your Order!
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Your order has been confirmed and is being processed
                    </p>
                </motion.div>

                {/* Order Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-8 shadow-xl border-2 border-green-100 dark:border-green-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                        {/* Order Number */}
                        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30">
                                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="text-xl font-bold text-foreground">{orderNumber}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Store</p>
                                <p className="font-semibold text-foreground">{storeName}</p>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Name</p>
                                        <p className="font-medium text-foreground">{customerName}</p>
                                    </div>
                                </div>
                                {customerPhone && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="font-medium text-foreground">{customerPhone}</p>
                                        </div>
                                    </div>
                                )}
                                {customerEmail && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 md:col-span-2">
                                        <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-medium text-foreground">{customerEmail}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                                Shipping Address
                            </h3>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
                                <p className="font-medium text-foreground">{shippingAddress}</p>
                                <p className="text-muted-foreground mt-1">{city}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Order Items
                            </h3>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-foreground text-lg">{item.price}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="py-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <span className="text-xl font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                        {total}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Estimated Delivery */}
                        {estimatedDelivery && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-6 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Estimated Delivery</p>
                                        <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </Card>
                </motion.div>

                {/* Footer Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mt-8"
                >
                    <p className="text-muted-foreground mb-2">
                        We'll send you a confirmation message on WhatsApp with tracking details
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Need help? Contact us anytime through WhatsApp
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrderConfirmationTemplate;
