# Shopify Order Tagging System

## 🏷️ Complete Tagging Flow

### Overview
The system automatically applies and updates Shopify order tags based on customer WhatsApp interactions. This creates a clear audit trail in Shopify and helps you track order status in real-time.

---

## 📊 The Three Tag States

### 1. **Pending Confirmation** (Initial State)
- ⏳ **When Applied**: Immediately when order is created
- 📍 **What It Means**: Order placed, waiting for customer confirmation via WhatsApp
- 🎯 **Business Value**: You can see which orders are awaiting confirmation

### 2. **Order Confirmed** (Success State)
- ✅ **When Applied**: Customer clicks "✅ Yes, Confirm ✅" in WhatsApp
- 📍 **What It Means**: Customer has verified and confirmed their order
- 🎯 **Business Value**: Safe to proceed with fulfillment

### 3. **Order Cancel By customer** (Cancellation State)
- ❌ **When Applied**: Customer clicks "❌ No, Cancel ❌" in WhatsApp
- 📍 **What It Means**: Customer wants to cancel the order
- 🎯 **Business Value**: Stop fulfillment, process refund

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: ORDER CREATED (Shopify)                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Backend Receives Webhook                               │
│  Topic: orders/create                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  🏷️ SHOPIFY TAG ADDED                                   │
│  Tag: "Pending Confirmation"                            │
│  Remove: "Order Confirmed", "Order Cancel By customer"  │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  📱 WhatsApp Message Sent                               │
│  Message: Beautiful order confirmation with poll        │
│  Buttons: [✅ Yes, Confirm] [❌ No, Cancel]             │
└─────────────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ↓                     ↓
    ┌─────────────────┐   ┌─────────────────┐
    │ Customer        │   │ Customer        │
    │ Clicks CONFIRM  │   │ Clicks CANCEL   │
    └─────────────────┘   └─────────────────┘
              │                     │
              ↓                     ↓
    ┌────────────────────────────────────────────┐
    │  🏷️ UPDATE SHOPIFY TAG                    │
    │  Add: "Order Confirmed"                    │
    │  Remove: "Pending Confirmation"            │
    │          "Order Cancel By customer"        │
    └────────────────────────────────────────────┘
              │                     
              ↓                     
    ┌────────────────────────────────────────────┐
    │  🏷️ UPDATE SHOPIFY TAG                    │
    │  Add: "Order Cancel By customer"           │
    │  Remove: "Pending Confirmation"            │
    │          "Order Confirmed"                 │
    └────────────────────────────────────────────┘
              │                     │
              ↓                     ↓
    ┌────────────────┐    ┌────────────────┐
    │ Send Thank You │    │ Send Cancel    │
    │ Message 🎉     │    │ Message 😔     │
    └────────────────┘    └────────────────┘
              │                     │
              ↓                     ↓
    ┌────────────────┐    ┌────────────────┐
    │ Send Admin     │    │ Order Status:  │
    │ Alert 🔔       │    │ Cancelled      │
    └────────────────┘    └────────────────┘
```

---

## 🛠️ Technical Implementation

### File: `src/routes/webhooks/shopify.js` (Lines 213-228)
**When Order is Created:**
```javascript
if (updatedMerchant?.shopifyAccessToken) {
    console.log(`[ShopifyWebhook] Applying pending tag to order ${orderId}`);
    const tagResult = await shopifyService.addOrderTag(
        shopDomain,
        updatedMerchant.shopifyAccessToken,
        orderId,
        updatedMerchant.pendingConfirmTag || "Pending Confirmation",
        [updatedMerchant.orderConfirmTag, updatedMerchant.orderCancelTag]
    );
}
```
**What It Does:**
- Adds: `Pending Confirmation` tag
- Removes: `Order Confirmed` and `Order Cancel By customer` (if they existed)

---

### File: `src/services/whatsappService.js` (Lines 308-318)
**When Customer Responds:**
```javascript
if (log && log.orderId) {
    console.log(`[Interaction] SUCCESS: Linking ${activityStatus} reply to Order ${log.orderId}`);

    const isConfirm = activityStatus === "confirmed";
    const tagsToRemove = isConfirm
        ? [merchant.pendingConfirmTag, merchant.orderCancelTag]
        : [merchant.pendingConfirmTag, merchant.orderConfirmTag];

    const tagResult = await shopifyService.addOrderTag(
        shopDomain, 
        merchant.shopifyAccessToken, 
        log.orderId, 
        tagToAdd,  // "Order Confirmed" or "Order Cancel By customer"
        tagsToRemove
    );
}
```
**What It Does:**
- If customer confirms:
  - Adds: `Order Confirmed`
  - Removes: `Pending Confirmation`, `Order Cancel By customer`
- If customer cancels:
  - Adds: `Order Cancel By customer`
  - Removes: `Pending Confirmation`, `Order Confirmed`

---

## 🎨 How It Appears in Shopify

### In Shopify Admin > Orders

**New Order (Just Created):**
```
Order #1234
Status: Unfulfilled
Tags: Pending Confirmation
```

**After Customer Confirms:**
```
Order #1234
Status: Unfulfilled
Tags: Order Confirmed
```

**If Customer Cancels:**
```
Order #1234
Status: Cancelled (you manually cancel it)
Tags: Order Cancel By customer
```

---

## ⚙️ Customizing Tag Names

You can customize the tag names in **Settings** page:

1. Go to **Settings** tab
2. Scroll to **Order Tagging** section
3. Edit the tag names:
   - **Pending tag**: Default = "Pending Confirmation"
   - **Confirm tag**: Default = "Order Confirmed"
   - **Cancel tag**: Default = "Order Cancel By customer"
4. Click **Save settings**

**Example Custom Tags:**
```
Pending tag: "⏳ Awaiting Confirmation"
Confirm tag: "✅ Verified by Customer"
Cancel tag: "❌ Cancelled via WhatsApp"
```

---

## 📋 Use Cases

### Filter Orders in Shopify
You can create saved filters in Shopify:

**Filter 1: "Pending Confirmation Orders"**
```
Tag: Pending Confirmation
Status: Any
```
→ See all orders waiting for customer response

**Filter 2: "Confirmed Orders Ready to Ship"**
```
Tag: Order Confirmed
Fulfillment Status: Unfulfilled
```
→ See all verified orders ready for packing

**Filter 3: "Customer Cancelled Orders"**
```
Tag: Order Cancel By customer
```
→ See all orders cancelled by customers via WhatsApp

---

## 🚨 Important Notes

### 1. **Tag Removal is Automatic**
When a new tag is applied, conflicting tags are automatically removed. You don't need to manually clean up tags.

### 2. **Tags Require OAuth**
The system needs a valid Shopify access token to update tags. Ensure you've completed the Shopify OAuth flow.

### 3. **Old Tags are Preserved**
Only the three confirmation-related tags are modified. Any other tags on the order remain unchanged.

### 4. **Activity Log Tracking**
Every tag change is logged in the Activity Log for your records.

---

## 🔍 Debugging Tag Issues

### Tag Not Appearing?
**Check:**
1. Is WhatsApp connected? (View WhatsApp Connection tab)
2. Does the merchant have a valid Shopify access token?
3. Check backend logs for `[ShopifyWebhook] Tagging result`
4. Verify the order ID is correct

### Wrong Tag Applied?
**Check:**
1. Verify the tag names in Settings match what you expect
2. Check if customer response was detected (look for `[Interaction] Matched intent`)
3. Ensure the phone number matches between order and WhatsApp reply

---

## 🎯 Summary

The tagging system creates a **visual workflow in Shopify** that mirrors the WhatsApp confirmation flow:

| Stage | Shopify Tag | WhatsApp Status |
|-------|-------------|-----------------|
| Order Placed | Pending Confirmation | Message sent with poll |
| Customer Confirmed | Order Confirmed | Thank you message sent |
| Customer Cancelled | Order Cancel By customer | Cancel confirmation sent |

This gives you **complete visibility** into customer engagement directly in your Shopify dashboard! 📊

---

## 🚀 Deployment Required

After deploying the updated backend:
```bash
cd "c:\Users\Ehsan Nawaz\Downloads\backend"
vercel --prod
```

All new orders will automatically receive the improved tag names:
- ✅ "Order Confirmed" (instead of "Confirmed")
- ❌ "Order Cancel By customer" (instead of "Cancelled")
