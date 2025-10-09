# Admin Authentication Testing

## ✅ **How Admin Auth Should Work:**

### **Step 1: Add Password to `.env.local`**
```env
ADMIN_PASSWORD=your-secure-password
```

### **Step 2: Restart Server**
```bash
# Stop server (Ctrl+C)
# Then restart:
pnpm run dev
```

### **Step 3: Test Admin Login**
1. Go to: `http://localhost:3000/admin/login`
2. Enter your admin password
3. Should redirect to `/admin/dashboard`

### **Step 4: Verify Protection**
1. Close browser / clear cookies
2. Try to access: `http://localhost:3000/admin/dashboard`
3. Should redirect to `/admin/login`

---

## 🔍 **If Admin Dashboard Doesn't Require Password:**

### **Possible Issues:**

#### **1. Environment Variable Not Set**
Check your `.env.local` file has:
```env
ADMIN_PASSWORD=your-password-here
```

**Restart your dev server after adding!**

#### **2. Cookie Not Being Set**
The login should set a cookie named `admin_session`.

Check in browser DevTools:
- F12 → Application → Cookies
- Look for `admin_session` cookie
- Value should be `"true"`

#### **3. Server Not Reading .env.local**
Make sure:
- File is named exactly `.env.local` (not `.env`)
- File is in the root directory
- Server was restarted after adding variable

---

## 🧪 **Manual Test:**

### **Test 1: Without Login**
```
1. Clear all cookies (DevTools → Application → Clear storage)
2. Go to: http://localhost:3000/admin/dashboard
3. Expected: Redirected to /admin/login
4. Actual: _____________
```

### **Test 2: With Wrong Password**
```
1. Go to: http://localhost:3000/admin/login
2. Enter wrong password: "wrongpassword"
3. Expected: Error message "Invalid admin password"
4. Actual: _____________
```

### **Test 3: With Correct Password**
```
1. Go to: http://localhost:3000/admin/login
2. Enter correct password from .env.local
3. Expected: Redirected to /admin/dashboard
4. Actual: _____________
```

### **Test 4: Cookie Persistence**
```
1. After successful login, go to another page
2. Return to: http://localhost:3000/admin/dashboard
3. Expected: Dashboard loads (no redirect)
4. Actual: _____________
```

---

## 🔧 **Debug Steps:**

### **1. Check Environment Variable**
Add this to `app/admin/login/page.tsx` temporarily:
```typescript
console.log('Admin password configured:', !!process.env.ADMIN_PASSWORD)
```

### **2. Check Cookie Setting**
Look at Network tab when logging in:
- POST to `/api/admin/verify`
- Check Response Headers for `Set-Cookie`
- Should see: `admin_session=true`

### **3. Check Cookie Reading**
Add to `app/admin/dashboard/page.tsx`:
```typescript
const cookieStore = await cookies()
const adminCookie = cookieStore.get('admin_session')
console.log('Admin cookie:', adminCookie)
```

---

## ✅ **Working Auth Flow:**

```
User visits /admin/dashboard
  ↓
Check admin cookie
  ↓
No cookie? → Redirect to /admin/login
  ↓
Enter password → POST /api/admin/verify
  ↓
Correct password? → Set cookie & redirect to /admin/dashboard
  ↓
Show dashboard (protected)
```

---

## 🚨 **Common Mistakes:**

1. **Forgot to restart server after adding ADMIN_PASSWORD**
2. **Used `.env` instead of `.env.local`**
3. **Typo in environment variable name**
4. **Cookie cleared / expired**
5. **Browser in incognito mode (cookies don't persist)**

---

## 📝 **What You Should See:**

### **Before Login (No Cookie):**
- Visit `/admin/dashboard` → Redirected to `/admin/login`
- Login page shows password field
- Dashboard is not accessible

### **After Login (Has Cookie):**
- Enter correct password → Redirected to `/admin/dashboard`
- Dashboard shows statistics and business table
- Can manage businesses (delete, feature, verify)

### **After 24 Hours:**
- Cookie expires
- Redirected back to `/admin/login`
- Must re-enter password

---

## 🔐 **Security Checklist:**

- ✅ Password stored in `.env.local` (not committed)
- ✅ Cookie is httpOnly (can't be accessed by JavaScript)
- ✅ Cookie is secure in production
- ✅ Session expires after 24 hours
- ✅ Admin routes check authentication
- ✅ API endpoints verify admin session

---

**If admin dashboard still doesn't require password after following all steps:**
1. Share the console logs from debug steps above
2. Share your `.env.local` (password redacted)
3. Check browser console for any errors

