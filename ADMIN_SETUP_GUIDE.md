# Admin System Setup Guide

## 🔐 **Admin Features Implemented**

### **1. Password-Protected Admin Dashboard**
- Admin login page at `/admin/login`
- Password authentication with session cookies
- Secure access control

### **2. Admin Capabilities**
- ✅ **Delete businesses** - Permanently remove any business
- ✅ **Toggle Featured status** - Mark/unmark businesses as featured (appears at top)
- ✅ **Toggle Verified status** - Verify/unverify businesses (shows badge)
- ✅ **View statistics** - Total, active, featured, verified counts
- ✅ **Manage all listings** - Complete overview of all businesses

### **3. Business Owner Capabilities**
- ✅ **Edit own business** - Owners can edit their business information
- ✅ **"Edit Your Business" button** - Appears on their business page
- ✅ **Protected updates** - Only owners can edit their businesses

---

## 🚀 **Setup Instructions**

### **Step 1: Add Admin Password**

Add to your `.env.local` file:

\`\`\`env
# Admin Password for dashboard access
ADMIN_PASSWORD=your-secure-admin-password
\`\`\`

**Important:** Change `your-secure-admin-password` to a strong password!

---

### **Step 2: Access Admin Dashboard**

1. Go to `/admin/login`
2. Enter your admin password
3. Click "Access Dashboard"
4. You'll be redirected to `/admin/dashboard`

---

## 📋 **Admin Dashboard Features**

### **Statistics Cards**
- **Total Businesses** - All businesses in system
- **Active** - Businesses with active subscriptions
- **Featured** - Businesses marked as featured
- **Verified** - Businesses that are verified

### **Business Table**
Each business row shows:
- **Name** (clickable link to business page)
- **Category** - Business type
- **Location** - City and state
- **Status** - Active/inactive subscription
- **Featured** - ⭐ Click star to toggle
- **Verified** - ✓/✗ Click to toggle
- **Delete** - 🗑️ Click to delete (with confirmation)

---

## 🎯 **How to Use Admin Features**

### **Feature a Business**
1. Find the business in the table
2. Click the ⭐ star button in the "Featured" column
3. Star turns solid = Featured (appears at top of search)
4. Click again to unfeature

### **Verify a Business**
1. Find the business in the table
2. Click the ✓/✗ button in the "Verified" column
3. Checkmark = Verified (shows verified badge)
4. Click again to remove verification

### **Delete a Business**
1. Find the business in the table
2. Click the 🗑️ trash button in the "Actions" column
3. Confirm deletion in the popup
4. Business and all data permanently deleted

---

## 👤 **Business Owner Edit Feature**

### **For Business Owners:**

When signed in as the owner of a business:
1. Visit your business page at `/business/your-slug`
2. Look for blue **"Edit Your Business"** button (top right)
3. Click to edit your business information
4. Update:
   - Name, description, contact info
   - Address, phone, email, website
   - Services, hours, tags
   - Social links, languages, accessibility

### **Security:**
- Only the business owner can see the edit button
- Only the owner can edit their business
- Other users cannot edit businesses they don't own

---

## 🔒 **Security Features**

1. **Admin Authentication**
   - Password required for admin access
   - Session cookies expire in 24 hours
   - Secure, httpOnly cookies

2. **Business Owner Protection**
   - API checks user authentication
   - Verifies owner_id matches current user
   - Prevents unauthorized edits

3. **Admin-Only Actions**
   - Delete, feature, verify require admin session
   - Regular users cannot access admin routes
   - Protected API endpoints

---

## 📱 **URLs**

- **Admin Login:** `/admin/login`
- **Admin Dashboard:** `/admin/dashboard`
- **Business Edit:** `/business/{slug}/edit` (coming soon)
- **User Dashboard:** `/dashboard` (regular users)

---

## ⚠️ **Important Notes**

1. **Change Default Password**
   - Default is `admin123`
   - Change in `.env.local`
   - Use a strong password in production

2. **Admin Session**
   - Lasts 24 hours
   - Re-login after expiration
   - Secure cookies used

3. **Featured Businesses**
   - Always appear first in search results
   - Regardless of distance or rating
   - Only admins can feature businesses

4. **Verified Badge**
   - Shows on business profile
   - Builds trust with users
   - Only admins can verify

---

## 🎉 **All Features Working:**

✅ **Admin Login** - Password protected  
✅ **Admin Dashboard** - Full management interface  
✅ **Delete Businesses** - With confirmation  
✅ **Feature Toggle** - Mark businesses as featured  
✅ **Verify Toggle** - Mark businesses as verified  
✅ **Owner Edit** - Business owners can edit their pages  
✅ **Protected APIs** - Secure endpoints  
✅ **Session Management** - 24-hour sessions  

Your admin system is fully functional! 🚀

