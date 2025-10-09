# 🚀 Netlify Deployment Guide for Health Directory

## 📋 **Pre-Deployment Checklist**

Before deploying to Netlify, ensure you have:

- ✅ Supabase project created
- ✅ Stripe account with $5/month product created
- ✅ All environment variables ready
- ✅ Code pushed to Git repository (GitHub, GitLab, or Bitbucket)

---

## 🔧 **Step 1: Prepare Your Project**

### **1. Install Netlify CLI (Optional)**
```bash
pnpm add -D netlify-cli
```

### **2. Test Build Locally**
```bash
pnpm run build
```

Make sure the build completes without errors!

---

## 🌐 **Step 2: Connect to Netlify**

### **Option A: Netlify Dashboard (Recommended)**

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Build command:** `pnpm run build`
   - **Publish directory:** `.next`
   - **Node version:** `20`

### **Option B: Netlify CLI**

```bash
# Login to Netlify
pnpm netlify login

# Initialize site
pnpm netlify init

# Follow the prompts to connect your repo
```

---

## 🔑 **Step 3: Add Environment Variables**

In Netlify dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add each of the following:

### **Required Variables:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_BASIC_PRICE_ID=price_your_5_dollar_plan_id

# App URL (Update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app

# Admin Password
ADMIN_PASSWORD=your-secure-admin-password
```

### **Optional Variables:**

```env
# Supabase Service Role (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Webhook Secret (for payment processing)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## ⚙️ **Step 4: Configure Netlify Settings**

### **Build Settings**
- **Base directory:** (leave empty)
- **Build command:** `pnpm run build`
- **Publish directory:** `.next`
- **Functions directory:** (leave empty)

### **Deploy Settings**
- **Production branch:** `main` or `master`
- **Deploy previews:** Enable for pull requests
- **Branch deploys:** Enable if you want staging

---

## 🎯 **Step 5: Deploy**

### **Initial Deployment:**

1. **Push your code to Git**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Netlify auto-deploys** when you push to main branch

3. **Wait for build** (usually 2-5 minutes)

4. **Check deploy logs** for any errors

### **Manual Deploy:**

```bash
pnpm netlify deploy --prod
```

---

## 🔒 **Step 6: Post-Deployment Configuration**

### **1. Update App URL**

After first deploy, update environment variable:
```env
NEXT_PUBLIC_APP_URL=https://your-actual-site.netlify.app
```

Then redeploy:
- Netlify Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

### **2. Configure Supabase**

Add your Netlify URL to Supabase allowed URLs:
1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add to **Site URL:** `https://your-site.netlify.app`
4. Add to **Redirect URLs:**
   - `https://your-site.netlify.app/**`
   - `https://your-site.netlify.app/auth/callback`

### **3. Configure Stripe**

Update Stripe webhook endpoint (if using webhooks):
1. Go to Stripe Dashboard
2. **Developers** → **Webhooks**
3. Add endpoint: `https://your-site.netlify.app/api/webhooks/stripe`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

---

## 🎨 **Step 7: Custom Domain (Optional)**

### **Add Custom Domain:**

1. Netlify Dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `healthdirectory.com`)
4. Follow DNS configuration instructions
5. Netlify auto-provisions SSL certificate

### **Update Environment Variables:**

After adding custom domain, update:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

And update Supabase & Stripe URLs accordingly.

---

## 🐛 **Common Deployment Issues & Fixes**

### **Issue 1: Build Fails**

**Error:** `Module not found` or dependency issues

**Fix:**
```bash
# Clear node_modules and rebuild locally
rm -rf node_modules .next
pnpm install
pnpm run build

# If successful, commit and push
git add .
git commit -m "Fix dependencies"
git push
```

### **Issue 2: Environment Variables Not Working**

**Error:** API calls fail or features don't work

**Fix:**
- Double-check all env vars are set in Netlify
- Make sure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding env vars

### **Issue 3: Images Not Loading**

**Error:** Broken image links

**Fix:**
1. Check Supabase Storage is enabled
2. Make bucket `business-images` public
3. In Supabase: **Storage** → **business-images** → **Configuration** → **Public**

### **Issue 4: Authentication Fails**

**Error:** Can't sign in/sign up

**Fix:**
1. Add Netlify URL to Supabase redirect URLs
2. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clear browser cookies and try again

### **Issue 5: Admin Login Doesn't Work**

**Error:** Can't access admin dashboard

**Fix:**
1. Make sure `ADMIN_PASSWORD` is set in Netlify env vars
2. Redeploy after setting password
3. Clear cookies and try `/admin/login`

---

## 📊 **Step 8: Monitor Your Deployment**

### **Check These After Deploy:**

1. **Homepage loads** → `https://your-site.netlify.app`
2. **Search works** → Try searching by zip code
3. **Sign up/Sign in** → Create test account
4. **List business** → Create test listing
5. **Upload images** → Test image uploads
6. **Business hours** → Set and view hours
7. **Admin login** → Test with password
8. **Featured businesses** → Show on homepage

---

## 🔐 **Security Best Practices**

### **1. Use Production Stripe Keys**

Don't use test keys in production!
```env
# Production keys (pk_live_, sk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### **2. Strong Admin Password**

```env
ADMIN_PASSWORD=Use-A-Very-Strong-Password-123!@#
```

### **3. Enable Supabase RLS**

Make sure Row Level Security is enabled on all tables in Supabase.

### **4. Regular Backups**

Set up automated backups in Supabase Dashboard.

---

## 📈 **Step 9: Performance Optimization**

### **After Deploy, Enable:**

1. **Netlify Analytics** (optional, paid)
2. **Asset Optimization** (automatic)
3. **Image CDN** (automatic through Netlify)
4. **Caching** (configured in `netlify.toml`)

---

## 🎉 **Deployment Checklist**

Before going live, verify:

- [ ] All environment variables set
- [ ] Build succeeds locally
- [ ] Supabase URLs configured
- [ ] Stripe webhooks configured (if using)
- [ ] Admin password is strong
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (automatic)
- [ ] Test all major features:
  - [ ] Homepage loads
  - [ ] Search works
  - [ ] Sign up/Sign in
  - [ ] Create business listing
  - [ ] Upload images
  - [ ] Edit business
  - [ ] Admin dashboard
  - [ ] Featured businesses
  - [ ] Business hours

---

## 🔄 **Continuous Deployment**

### **Auto-Deploy on Push:**

Once connected, every push to `main` branch:
1. Triggers automatic build
2. Runs tests (if configured)
3. Builds Next.js app
4. Deploys to production
5. Sends notification

### **Preview Deploys:**

Pull requests get preview URLs:
- Test changes before merging
- Share with stakeholders
- Automatic cleanup after merge

---

## 📱 **Mobile & SEO**

Your site is already optimized for:
- ✅ Mobile responsiveness
- ✅ SEO metadata
- ✅ Open Graph tags
- ✅ Twitter cards
- ✅ Fast page loads
- ✅ Image optimization

---

## 🆘 **Support & Troubleshooting**

### **View Deploy Logs:**
1. Netlify Dashboard → **Deploys**
2. Click on deploy
3. View **Deploy log**

### **View Function Logs:**
1. Netlify Dashboard → **Functions**
2. Click on function
3. View **Function logs**

### **Roll Back Deploy:**
1. Netlify Dashboard → **Deploys**
2. Find previous working deploy
3. Click **"Publish deploy"**

---

## 🎊 **You're Ready to Deploy!**

Your Health Directory app is production-ready with:
- 5 healthcare categories
- Zip code + radius search
- Featured listings
- Business hours
- Image uploads
- Admin dashboard
- Owner editing
- Mobile responsive
- Secure authentication

**Next Step:** Push to Git and watch it deploy! 🚀

