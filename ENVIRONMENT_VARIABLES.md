# 🔑 Environment Variables Setup

## Required for Netlify Deployment

Copy these to **Netlify Dashboard → Site Settings → Environment Variables**

---

## 📝 **All Environment Variables**

### **Supabase (Required)**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

**Where to find:**
- Supabase Dashboard → Project Settings → API
- Copy "Project URL" and "anon public" key

---

### **Stripe (Required)**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_BASIC_PRICE_ID=
```

**Where to find:**
- Stripe Dashboard → Developers → API Keys
- Use **LIVE** keys for production (pk_live_, sk_live_)
- Create $5/month subscription product → Copy Price ID

---

### **App Configuration (Required)**
```
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
ADMIN_PASSWORD=your-very-secure-password-123
```

**Notes:**
- Update `NEXT_PUBLIC_APP_URL` after first deploy with actual Netlify URL
- Use a strong admin password (mix of letters, numbers, symbols)

---

### **Optional (Enhanced Features)**
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Where to find:**
- Supabase service role: Project Settings → API → service_role secret
- Stripe webhook: Developers → Webhooks → Add endpoint

---

## ⚠️ **Important Security Notes**

### **1. Never Commit Secrets**
- ✅ `.env.local` is in `.gitignore`
- ✅ Never push API keys to Git
- ✅ Use Netlify environment variables

### **2. Production vs Development**

**Development (.env.local):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  ← Test keys
STRIPE_SECRET_KEY=sk_test_...                   ← Test keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Netlify):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  ← Live keys
STRIPE_SECRET_KEY=sk_live_...                   ← Live keys
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### **3. Test Mode vs Live Mode**

- Development: Use Stripe **test** keys
- Production: Use Stripe **live** keys
- Never mix test/live keys

---

## 🚀 **Quick Setup for Netlify**

### **Step 1: Copy All Variables**
Copy this template and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_BASIC_PRICE_ID=
NEXT_PUBLIC_APP_URL=
ADMIN_PASSWORD=
```

### **Step 2: Add to Netlify**
1. Go to Netlify Dashboard
2. Your Site → **Site Settings**
3. **Environment Variables**
4. Click **"Add a variable"**
5. Paste each key and value
6. Click **"Save"**

### **Step 3: Redeploy**
- **Deploys** → **Trigger deploy** → **Deploy site**

---

## ✅ **Verification Checklist**

After setting environment variables, verify:

- [ ] All 7 required variables are set
- [ ] Using **live** Stripe keys (not test)
- [ ] Supabase URL is correct
- [ ] Admin password is strong
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] App URL matches actual site URL

---

## 🔄 **Updating Environment Variables**

### **When to Update:**

1. **After first deploy** → Update `NEXT_PUBLIC_APP_URL`
2. **Adding custom domain** → Update `NEXT_PUBLIC_APP_URL`
3. **Changing admin password** → Update `ADMIN_PASSWORD`
4. **Stripe webhook** → Add `STRIPE_WEBHOOK_SECRET`

### **How to Update:**

1. Netlify Dashboard → Site Settings → Environment Variables
2. Find the variable
3. Click edit icon
4. Update value
5. **Important:** Trigger a new deploy for changes to take effect!

---

## 🎓 **Variable Prefixes Explained**

### **`NEXT_PUBLIC_` Prefix:**
- **Exposed to browser** (client-side)
- Use for: Supabase URL, Stripe publishable key, App URL
- These are safe to expose (public keys)

### **No Prefix:**
- **Server-side only** (never exposed to browser)
- Use for: Secret keys, passwords, service role keys
- These must remain private

---

## 