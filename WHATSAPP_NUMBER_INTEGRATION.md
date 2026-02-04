# Dynamic WhatsApp Number Integration

## Overview
The system now automatically captures and saves the merchant's WhatsApp phone number when they connect their WhatsApp account. This eliminates the need for manual entry and ensures the correct number is used for sending automated messages.

## How It Works

### 1. **QR Code Connection**
When a merchant scans the QR code with their WhatsApp:
- The backend (`whatsappService.js` lines 189-215) detects the successful connection
- It extracts the connected phone number from `sock.user.id`
- Automatically updates the `Merchant` record with `whatsappNumber`
- The number is saved in the format: `1234567890` (no special characters)

### 2. **Pairing Code Connection**  
When a merchant enters their phone number for a pairing code:
- The phone number is saved **immediately** when the pairing code is requested (`whatsappService.js` lines 420-430)
- When the connection completes, the number is confirmed and re-saved
- This ensures the number is captured even if the user doesn't complete the pairing

### 3. **Frontend Auto-Refresh**
The frontend automatically updates when WhatsApp connects:
- `WhatsAppConnection.tsx` watches for connection status changes (lines 37-44)
- When `status.connected` becomes `true`, it invalidates the `merchant-settings` cache
- The Settings page automatically reloads and displays the captured WhatsApp number
- No manual page refresh required!

### 4. **Settings Page Defaults**
The `MerchantSettings.tsx` component now:
- Uses `data.storeName` (from Shopify) instead of "My Shopify Store"
- Uses `data.whatsappNumber` (from WhatsApp connection) or falls back to `data.phone` (from Shopify)
- Uses `data.country` (from Shopify) for the default country
- Removes static placeholder values for a more personalized experience

## Message Sending Flow

1. When an order is created, the system needs to send a WhatsApp message
2. It fetches the merchant's `whatsappNumber` from the database
3. This number was automatically captured when WhatsApp was connected
4. The message is sent using this verified, connected number
5. No manual configuration needed!

## Benefits

✅ **Automatic**: No need to manually copy/paste phone numbers  
✅ **Accurate**: Uses the actual connected WhatsApp number  
✅ **Real-time**: Settings update instantly when WhatsApp connects  
✅ **Seamless**: Works with both QR code and pairing code methods  
✅ **Future-proof**: If merchant reconnects with a different number, it auto-updates

## Technical Details

### Backend Files Modified:
- `src/services/whatsappService.js` - Lines 189-215 (QR connection) and 418-430 (Pairing code)
- Already had auto-save on connection, added auto-save during pairing request

### Frontend Files Modified:
- `src/components/dashboard/WhatsAppConnection.tsx` - Added settings cache invalidation on connect
- `src/components/dashboard/MerchantSettings.tsx` - Improved fallback logic for dynamic data
- `src/components/dashboard/AutomationsOverview.tsx` - Uses merchant's store name in previews

### Database Schema:
The `Merchant` model stores:
```javascript
{
  shopDomain: "store.myshopify.com",
  storeName: "Beautiful Store Name",    // From Shopify
  phone: "+1234567890",                 // From Shopify (optional)
  whatsappNumber: "1234567890",         // From WhatsApp connection (auto-captured)
  // ... other fields
}
```

## Next Steps

When you deploy the backend to production:
1. The WhatsApp connection flow will automatically save phone numbers
2. Existing settings pages will show the dynamic values
3. All message sending will use the verified WhatsApp number
4. Merchants will see their actual store name and phone number pre-filled

The system is now fully automated and self-configuring! 🚀
