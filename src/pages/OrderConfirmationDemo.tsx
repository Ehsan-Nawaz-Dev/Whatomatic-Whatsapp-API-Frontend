import React from "react";
import OrderConfirmationTemplate from "@/components/dashboard/OrderConfirmationTemplate";

const OrderConfirmationDemo = () => {
    // Sample order data
    const sampleOrder = {
        orderNumber: "#WF-2026-001234",
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        customerPhone: "+1 555 123 4567",
        items: [
            {
                name: "Premium Wireless Headphones",
                quantity: 1,
                price: "$199.99",
            },
            {
                name: "Phone Case - Black",
                quantity: 2,
                price: "$39.98",
            },
            {
                name: "USB-C Cable (2m)",
                quantity: 1,
                price: "$19.99",
            },
        ],
        subtotal: "$259.96",
        total: "$279.96",
        shippingAddress: "123 Main Street, Apt 4B",
        city: "New York, NY 10001, USA",
        estimatedDelivery: "February 7-9, 2026",
        storeName: "WhatFlow Store",
    };

    return <OrderConfirmationTemplate {...sampleOrder} />;
};

export default OrderConfirmationDemo;
