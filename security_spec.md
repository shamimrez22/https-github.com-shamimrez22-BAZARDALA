# Security Specification: LuxeCart Firestore Rules

## 1. Data Invariants
- **Products**: Read is public. Write is restricted to admins only. Name and price must be valid.
- **Orders**: Every order must have an `orderId`, `items`, `total`, and `customerInfo`. Public can create. Read/Update/Delete should ideally be restricted to owners or admins, but the user requested a fast "Order System" flow.
- **Settings**: Read is public (for footer links). Write is strictly restricted to admins.
- **Users**: Users can only read/write their own profile data. Admins can read all profiles.
- **Notifications**: Admins can read. System/Orders can create.

## 2. Global Helpers
- `isSignedIn()`: Verifies request has auth.
- `isAdmin()`: Verifies request email matches owner or user has admin role.
- `isValidId(id)`: Validates document IDs.
- `incoming()`: Shortcut for request resource data.
- `existing()`: Shortcut for resource data.

## 3. The "Dirty Dozen" (Attack Payloads)
1. **Privilege Escalation**: Non-admin trying to update `settings/site`.
2. **ID Spoofing**: User trying to read another user's profile in `users/{userId}`.
3. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile update.
4. **Invalid Order Status**: Setting order status to a non-existent value like `hacked`.
5. **PII Leak**: Unauthenticated user trying to list all user emails.
6. **Price Poisoning**: Non-admin trying to update a product price to 0.
7. **Orphaned Order**: Creating an order without valid `customerInfo`.
8. **Malicious Notification**: Non-admin trying to delete system notifications.
9. **Settings Wipe**: Non-admin trying to delete the `settings/site` document.
10. **Huge Document ID**: Trying to create a product with a 2MB ID string.
11. **Negative Price**: Creating a product with price `-100`.
12. **Anonymous Admin**: Trying to access admin panel without an email verified.

## 4. Requirement Sync
- **Settings Collection**: `match /settings/site` needs `allow read: if true` and `allow write: if isAdmin()`.
- **Order System**: The user previously requested that the order system be "100% speed" and "Roketer Giti" (Rocket Speed). This implies we should keep order creation very fast but secure.
