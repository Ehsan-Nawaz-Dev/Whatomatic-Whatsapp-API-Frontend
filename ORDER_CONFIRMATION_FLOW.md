# Order Confirmation Flow - Complete Workflow

## 📱 Complete Message Flow

### Step 1: Order Created (Shopify Webhook)
```
Shopify → Backend Webhook → WhatFlow
```
**What Happens:**
1. Customer places order on Shopify
2. Shopify sends webhook to `/api/webhooks/shopify`
3. Backend finds template for event: `orders/create`
4. Sends WhatsApp message with poll buttons:
   - ✅ Yes, Confirm ✅
   - ❌ No, Cancel ❌

**Example Message Sent:**
```
✅ Order Confirmed!

Hi John Doe,

Great news! Your order #1001 has been officially confirmed by Your Store. 🛍️

---
📦 Order Summary:
1x Wireless Headphones - $199.99

💰 Grand Total: $214.99
---

📍 Shipping to:
123 Main Street
New York

We are getting your package ready for shipping. We'll send you another message with the tracking details as soon as it's on the way! 🚚

Thank you for shopping with us!
- Your Store Team
```

---

### Step 2: Customer Confirms (WhatsApp Reply)
```
Customer clicks "✅ Yes, Confirm ✅"
↓
WhatsApp → Backend Message Handler
```

**What Happens:**
1. Customer clicks the confirm button (or types "yes", "confirm", etc.)
2. Backend detects the poll response or keyword
3. System performs these actions **automatically**:
   - ✅ Updates Shopify order tags (removes "Pending Confirmation", adds "Confirmed")
   - ✅ Updates activity log with customer response
   - ✅ **Sends Post-Confirmation Reply** (Beautiful thank you message)
   - ✅ Sends Admin Order Alert (if enabled)

---

### Step 3: Post-Confirmation Reply (NEW! 🎉)
```
Backend → Fetch Template (orders/confirmed)
↓
Replace Placeholders
↓
Send Beautiful Message
```

**Template Used:** `orders/confirmed` event type

**Example Message Sent:**
```
🎉 Thank You for Confirming! 🎉

Hi John Doe! 

We're so excited to prepare your order #1001! 🛍️✨

Your confirmation means the world to us, and we're already getting everything ready for you.

---
📦 What's Next:
• Our team is packing your items with care
• You'll receive tracking information soon
• Expected delivery: 3-5 business days

---

If you have any questions, just reply to this message!

With gratitude,
Your Store Team 💙

P.S. Thank you for choosing us! 🙏
```

**Smart Features:**
- Uses your custom template from "Message Templates" tab
- Replaces all {{placeholders}} with real order data:
  - `{{customer_name}}` → Actual customer name
  - `{{order_number}}` → Real order number
  - `{{store_name}}` → Your store name
  - `{{grand_total}}` → Order total
  - And more!
- Falls back to basic message if template not found

---

### Step 4: Admin Alert (Optional)
```
Backend → Fetch Admin Template
↓
Send to Admin Phone Number
```

**Only if:**
- Admin Order Alert automation is **enabled**
- `adminPhoneNumber` is set in merchant settings

**Example Message Sent (to Admin):**
```
🔔 New Order Alert!

Order: #1001
Customer: John Doe
Total: $214.99
Items: 1x Wireless Headphones - $199.99
Address: 123 Main Street, New York
```

---

## 🎯 Template Priority System

### For Confirmation Response:
```
1. Check if "Post-Confirmation Reply" template exists (event: orders/confirmed)
   ✅ YES → Use that template with placeholder replacement
   ❌ NO  → Use merchant.orderConfirmReply from settings

2. Fetch order data from Shopify
3. Replace all placeholders
4. Send formatted message
```

### For Cancellation Response:
```
Uses: merchant.orderCancelReply from settings
(Simple message, no template lookup)
```

---

## 📝 How to Customize

### Option 1: Use the Beautiful Template (Recommended)
1. Go to **Message Templates** tab
2. Find "Post-Confirmation Thank You" template
3. Click **Edit**
4. Customize the message with your brand voice
5. Save

### Option 2: Use Basic Reply (Quick & Simple)
1. Go to **Settings** tab
2. Find "Confirmation Reply" under "Auto-reply messages"
3. Edit the simple text message
4. Save settings

---

## 🔥 What Makes This Special

### Before (Old Flow):
```
Order Created → Send Confirmation Poll → Customer Confirms → Send Basic "Thanks" → Done
```

### Now (New Enhanced Flow):
```
Order Created 
  → Send Beautiful Confirmation Poll with Order Details
  → Customer Confirms 
  → Fetch Order Data from Shopify
  → Replace ALL Placeholders
  → Send Personalized Thank You with Emojis & Formatting
  → Optional: Alert Admin
  → Done!
```

---

## 💡 Pro Tips

1. **Emojis Matter**: Use emojis to make messages feel warm and personal
2. **Placeholders**: Use {{customer_name}} and {{order_number}} for personalization
3. **Formatting**: Use *bold* and line breaks for better readability
4. **Tone**: Match your brand - friendly, professional, or playful!
5. **Length**: Keep it concise but meaningful

---

## 🚀 What Happens Next

When you deploy the backend:
```bash
cd "c:\Users\Ehsan Nawaz\Downloads\backend"
vercel --prod
```

Every confirmation will:
1. ✅ Use your beautiful custom template
2. ✅ Include real customer and order data
3. ✅ Send a memorable, branded experience
4. ✅ Make customers feel valued and excited

Your customers will receive professional, personalized messages that make them smile! 😊
