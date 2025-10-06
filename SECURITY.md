# Security Guide

This document outlines the security measures implemented in the Business Directory application and provides guidelines for maintaining a secure environment.

## 🔒 Security Features

### 1. **No Hardcoded Secrets**
All sensitive data is stored in environment variables and never committed to version control.

### 2. **Environment Variable Validation**
- All required environment variables are validated at startup
- Clear error messages guide developers to missing configuration
- Type-safe access to environment variables

### 3. **API Key Management**
- **Supabase Anon Key**: Safe to expose (client-side)
- **Supabase Service Role Key**: Server-side only (never exposed)
- **Stripe Publishable Key**: Safe to expose (client-side)
- **Stripe Secret Key**: Server-side only (never exposed)
- **Stripe Webhook Secret**: Server-side only (never exposed)

### 4. **Database Security**
- Row Level Security (RLS) policies protect data access
- User authentication required for sensitive operations
- Business owners can only access their own data

### 5. **Payment Security**
- Stripe handles all payment processing
- No sensitive payment data stored locally
- Webhook signature verification

## 🛡️ Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

### Optional Variables
```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_ENVIRONMENT=test
NODE_ENV=development
```

## 🔐 Security Best Practices

### 1. **Never Commit Secrets**
- Add `.env.local` to `.gitignore`
- Use `env.example` as a template
- Regularly audit committed files for secrets

### 2. **Use Different Keys for Different Environments**
- Development: Test keys
- Production: Live keys
- Staging: Separate test keys

### 3. **Regular Key Rotation**
- Rotate API keys quarterly
- Monitor key usage for anomalies
- Revoke compromised keys immediately

### 4. **Environment-Specific Configuration**
- Use different Supabase projects for dev/prod
- Use different Stripe accounts for dev/prod
- Use different domains for different environments

## 🚨 Security Checklist

### Before Deployment
- [ ] All secrets are in environment variables
- [ ] No hardcoded API keys in code
- [ ] Environment variables are properly set
- [ ] RLS policies are enabled
- [ ] Webhook signatures are verified
- [ ] HTTPS is enabled in production

### Regular Maintenance
- [ ] Review API key usage
- [ ] Check for unauthorized access
- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Review access logs
- [ ] Test security measures

### Incident Response
- [ ] Rotate exposed API keys immediately
- [ ] Check logs for unauthorized usage
- [ ] Notify affected users
- [ ] Update security measures
- [ ] Document incident

## 🔍 Security Monitoring

### Key Metrics to Track
- API key usage patterns
- Failed authentication attempts
- Unusual payment activity
- Database access patterns
- Webhook delivery success rates

### Alerts to Set Up
- Unusual API key usage
- Failed webhook signatures
- Multiple failed login attempts
- Unauthorized database access
- Payment processing errors

## 🛠️ Security Tools

### Development
- Environment variable validation
- Type-safe configuration access
- Linting rules for secrets
- Pre-commit hooks

### Production
- Stripe webhook verification
- Supabase RLS policies
- HTTPS enforcement
- Rate limiting
- Error monitoring

## 📚 Additional Resources

- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security](https://stripe.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

## 🆘 Support

If you discover a security vulnerability, please:
1. **Do not** create a public issue
2. Email security concerns to: [your-security-email]
3. Include steps to reproduce the issue
4. Wait for confirmation before public disclosure

## 📝 Security Updates

This document is updated regularly. Last updated: [Current Date]

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential for maintaining a secure application.