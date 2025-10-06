# Security Checklist

This document outlines security best practices for the Wellness Directory project.

## Environment Variables Security

### ✅ Current Security Measures

1. **No Hardcoded Secrets**: All sensitive data is stored in environment variables
2. **Proper .gitignore**: `.env*` files are ignored by Git
3. **TypeScript Safety**: Environment variables use non-null assertion (`!`) to ensure they exist
4. **Netlify Configuration**: Placeholder values in `netlify.toml` prevent accidental exposure

### 🔒 Environment Variable Setup

#### Local Development
```bash
# Create .env.local file (never commit this)
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

#### Production (Netlify)
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add variables there (never in code)
3. Use different Supabase projects for different environments if possible

### ⚠️ Security Warnings

- **Never commit `.env.local`** to version control
- **Never hardcode secrets** in source code
- **Use different API keys** for development and production
- **Regularly rotate** your API keys
- **Monitor usage** of your Supabase project

## Database Security

### Row Level Security (RLS)
Consider implementing Row Level Security policies in Supabase:

```sql
-- Example: Only allow users to see their own reviews
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Only allow business owners to edit their businesses
CREATE POLICY "Business owners can edit own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);
```

### API Key Management
- Use **anon key** for client-side operations (safe to expose)
- Use **service role key** only for server-side operations (never expose)
- Consider implementing **API rate limiting**

## Deployment Security

### Netlify Security Headers
The `netlify.toml` includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### HTTPS
- Netlify automatically provides HTTPS
- Ensure all API calls use HTTPS endpoints

## Data Privacy

### User Data
- Implement proper data retention policies
- Allow users to delete their data
- Follow GDPR/CCPA compliance if applicable

### Business Data
- Verify business information before publishing
- Implement review moderation
- Allow businesses to claim and update their profiles

## Monitoring

### Recommended Monitoring
1. **Supabase Dashboard**: Monitor API usage and errors
2. **Netlify Analytics**: Track site performance
3. **Error Tracking**: Consider adding Sentry or similar
4. **Uptime Monitoring**: Use services like UptimeRobot

## Regular Security Tasks

### Monthly
- [ ] Review API key usage
- [ ] Check for security updates in dependencies
- [ ] Review access logs

### Quarterly
- [ ] Rotate API keys
- [ ] Security audit of dependencies
- [ ] Review and update security policies

## Emergency Response

### If Secrets Are Exposed
1. **Immediately rotate** the exposed API keys
2. **Check logs** for unauthorized usage
3. **Update environment variables** in all environments
4. **Review code** for other potential exposures

### Contact Information
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Netlify Support: [netlify.com/support](https://netlify.com/support)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential.



