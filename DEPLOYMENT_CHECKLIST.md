# ✅ Pre-Deployment Checklist

Use this checklist before deploying to Netlify to ensure everything works correctly.

---

## 🔧 **Code Preparation**

- [ ] All files saved and committed
- [ ] No linter errors (`pnpm run lint`)
- [ ] Build succeeds locally (`pnpm run build`)
- [ ] All TypeScript errors fixed
- [ ] Removed any test/debug console.logs (optional)
- [ ] Updated README with your project info

---

## 🗄️ **Database (Supabase)**

- [ ] Supabase project created
- [ ] All tables exist:
  - [ ] `businesses`
  - [ ] `directories`
  - [ ] `users`
  - [ ] `reviews`
  - [ ] `business_images` (optional)
- [ ] Row Level Security (RLS) enabled
- [ ] Storage bucket `business-images` created
- [ ] Storage bucket is **public**
- [ ] Sample data added (optional)

---

## 💳 **Payments (Stripe)**

- [ ] Stripe account created
- [ ] Switched to **LIVE mode** (not test)
- [ ] Created $5/month subscription product
- [ ] Copied Price ID (starts with `price_`)
- [ ] Have live publishable key (starts with `pk_live_`)
- [ ] Have live secret key (starts with `sk_live_`)

---

## 🔑 **Environment Variables Ready**

### **Required (Must Have):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_BASIC_PRICE_ID`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `ADMIN_PASSWORD`

### **Optional (Nice to Have):**
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

---

## 📦 **Git Repository**

- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `.gitignore` includes:
  - [ ] `.env.local`
  - [ ] `.next`
  - [ ] `node_modules`
- [ ] Repository is accessible
- [ ] Default branch is `main` or `master`

---

## 🌐 **Netlify Account**

- [ ] Netlify account created
- [ ] Connected to Git provider
- [ ] Payment method added (optional, free tier available)

---

## 🎨 **Content Ready**

- [ ] Logo/branding set (optional)
- [ ] Default featured businesses added (optional)
- [ ] Categories configured (Therapist, Psychiatrist, etc.)
- [ ] Sample businesses for testing (optional)

---

## 🧪 **Local Testing**

Test these features locally before deploying:

### **User Features:**
- [ ] Homepage loads
- [ ] Search by zip code works
- [ ] Featured businesses show on top
- [ ] Sign up creates account
- [ ] Sign in works
- [ ] Create business listing
- [ ] Upload images (profile + gallery)
- [ ] Set business hours
- [ ] Business page displays correctly
- [ ] Edit own business works
- [ ] Sign out works

### **Admin Features:**
- [ ] Admin login requires password
- [ ] Admin dashboard loads
- [ ] Can delete businesses
- [ ] Can toggle featured status
- [ ] Can toggle verified status
- [ ] Statistics show correctly

### **Search Features:**
- [ ] Radius filtering works
- [ ] Featured businesses on top
- [ ] Distance calculation accurate
- [ ] Categories filter works
- [ ] Mobile responsive

---

## 📱 **Mobile Testing**

Test on different screen sizes:
- [ ] 320px (small phones)
- [ ] 375px (iPhone)
- [ ] 768px (tablet)
- [ ] 1024px+ (desktop)

Check:
- [ ] No content cut off
- [ ] Forms fit screen
- [ ] Navigation works
- [ ] Images scale properly
- [ ] Touch targets are 44px+

---

## 🚀 **Ready to Deploy?**

If all checkboxes are checked, you're ready! Follow these steps:

### **1. Final Code Check**
```bash
# Make sure everything is committed
git status

# Build one more time
pnpm run build

# If build succeeds, you're good!
```

### **2. Push to Git**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### **3. Deploy to Netlify**
1. Go to Netlify Dashboard
2. **"Add new site"** → **"Import an existing project"**
3. Select your Git repository
4. Add all environment variables
5. Click **"Deploy"**

### **4. Wait for Build**
- Usually takes 2-5 minutes
- Watch deploy logs for errors
- Check deploy status

### **5. Post-Deploy**
- [ ] Visit deployed site
- [ ] Test critical features
- [ ] Update `NEXT_PUBLIC_APP_URL` if needed
- [ ] Add to Supabase redirect URLs
- [ ] Test Stripe checkout (use test card)

---

## 🎉 **Launch Checklist**

After successful deployment:

- [ ] Site loads at Netlify URL
- [ ] Homepage shows featured businesses
- [ ] Search works with zip codes
- [ ] Can create account
- [ ] Can list business
- [ ] Images upload successfully
- [ ] Admin login works
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Share site with first users! 🎊

---

## 📞 **Support Resources**

If you encounter issues:

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Next.js on Netlify:** [docs.netlify.com/frameworks/next-js](https://docs.netlify.com/frameworks/next-js)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)

---

## 🎯 **You're Ready!**

Everything is configured and tested. Time to deploy! 🚀

**Next:** Open `NETLIFY_DEPLOYMENT_GUIDE.md` for detailed deployment steps.

