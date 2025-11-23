# Critical Redirect Issues - Fix Guide

## 🚨 Critical Issues Identified

1. **403 Forbidden** on canonical domain (MOST CRITICAL)
2. **308 Redirects** instead of 301
3. **Multiple redirect hops** (2 redirects instead of 1)

---

## Issue 1: 403 Forbidden on Canonical Domain

**Problem:** `https://www.gamecityelectronics.co.ke/` returns **403 Forbidden**

**This must be fixed FIRST** - the site is not accessible.

### Fix Steps:

#### A. Verify Vercel Domain Configuration

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Verify `www.gamecityelectronics.co.ke` is added and verified
3. Check domain status:
   - ✅ **Verified** (green checkmark)
   - ✅ **Production** deployment assigned
   - ✅ DNS records are correct

#### B. Check DNS Configuration

Verify these DNS records exist for `www.gamecityelectronics.co.ke`:

**If using Cloudflare:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: ON (orange cloud)
```

**If NOT using Cloudflare:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
```

#### C. Verify Deployment

1. Check Vercel Dashboard → Deployments
2. Ensure latest deployment is **Production**
3. Verify deployment succeeded (not failed)
4. Check deployment logs for errors

#### D. Check Vercel Project Settings

1. Settings → General
2. Verify **Production Branch** is set correctly (usually `main` or `master`)
3. Check **Build Command** and **Output Directory** are correct

#### E. Temporary Workaround

If domain isn't working, check if the Vercel preview URL works:
- Go to Vercel Dashboard → Deployments
- Click on latest deployment
- Copy the deployment URL (e.g., `your-project.vercel.app`)
- Test if this URL works (should return 200)

If Vercel URL works but custom domain doesn't:
- **DNS issue** - wait 24-48 hours for DNS propagation
- **Domain verification issue** - re-verify domain in Vercel
- **SSL certificate issue** - Vercel should auto-generate, but check SSL status

---

## Issue 2: 308 Redirects Instead of 301

**Problem:** Redirects show **308** status code instead of **301**

**Cause:** Cloudflare or DNS/CDN is adding 308 redirects before Vercel's 301 redirects

### Fix Steps:

#### A. Cloudflare Configuration (If Using Cloudflare)

1. **Login to Cloudflare Dashboard**
2. **Go to:** SSL/TLS → Overview
3. **Set SSL/TLS encryption mode to:** "Full" or "Full (strict)"
4. **Go to:** SSL/TLS → Edge Certificates
5. **Disable:** "Automatic HTTPS Rewrites" (this can cause 308s)
6. **Disable:** "Always Use HTTPS" (let Vercel handle redirects)
7. **Go to:** Rules → Redirect Rules
8. **Remove or disable** any redirect rules that use 308
9. **Create new redirect rule** (if needed):
   - Rule name: "HTTP to HTTPS"
   - When: `http.request.protocol eq "http"`
   - Then: Redirect to `https://www.gamecityelectronics.co.ke$1` with status **301**

#### B. Alternative: Use Cloudflare Page Rules

1. **Go to:** Rules → Page Rules
2. **Create rule for:** `http://*gamecityelectronics.com/*`
3. **Settings:**
   - Forwarding URL: `301 Permanent Redirect`
   - Destination: `https://www.gamecityelectronics.co.ke/$1`
4. **Create rule for:** `https://gamecityelectronics.com/*` (non-www)
5. **Settings:**
   - Forwarding URL: `301 Permanent Redirect`
   - Destination: `https://www.gamecityelectronics.co.ke/$1`

#### C. If NOT Using Cloudflare

The 308 redirects might be coming from:
- **DNS provider** redirects
- **CDN** in front of Vercel
- **Load balancer** configuration

Check with your DNS/CDN provider for redirect settings.

---

## Issue 3: Multiple Redirect Hops (2 Redirects)

**Problem:** Some URLs show **2 redirects** instead of **1**

**Cause:** HTTP → HTTPS redirect (308) + Domain redirect (301) = 2 hops

### Fix Strategy:

**Option 1: Let Vercel Handle Everything (Recommended)**

1. **Disable all Cloudflare/DNS redirects**
2. **Let Vercel handle:**
   - HTTP → HTTPS (automatic)
   - Domain redirects (via vercel.json)

**Option 2: Consolidate at Cloudflare Level**

1. **Create single redirect rule** in Cloudflare that:
   - Catches all non-canonical domains
   - Redirects directly to `https://www.gamecityelectronics.co.ke/` with 301
   - Handles both HTTP and HTTPS in one rule

---

## Updated Vercel Configuration

Your `vercel.json` is correct, but here's an optimized version that ensures proper redirect order:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.gamecityelectronics.com"
        }
      ],
      "destination": "https://www.gamecityelectronics.co.ke/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "gamecityelectronics.com"
        }
      ],
      "destination": "https://www.gamecityelectronics.co.ke/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "gamecityelectronics.co.ke"
        }
      ],
      "destination": "https://www.gamecityelectronics.co.ke/$1",
      "permanent": true
    }
  ]
}
```

**Note:** Changed `((?!api).*)` to `(.*)` to catch all paths. The API routes are handled separately by rewrites.

---

## Testing After Fixes

### 1. Test 403 Fix First

```bash
curl -I https://www.gamecityelectronics.co.ke/
```

**Expected:** `HTTP/2 200`

### 2. Test Redirects

```bash
# Should show single 301 redirect
curl -I -L http://gamecityelectronics.com
curl -I -L https://gamecityelectronics.com
curl -I -L http://www.gamecityelectronics.com
curl -I -L https://www.gamecityelectronics.com
```

**Expected:** 
- First response: `HTTP/1.1 301` or `HTTP/2 301`
- Final response: `HTTP/2 200`
- Only **1 redirect** in chain

### 3. Verify No 308 Redirects

```bash
curl -I -L http://gamecityelectronics.com 2>&1 | grep -i "HTTP"
```

**Should NOT see:** `308`
**Should see:** `301`

---

## Priority Order

1. **🔴 CRITICAL:** Fix 403 error on canonical domain
2. **🟡 HIGH:** Fix 308 redirects (change to 301)
3. **🟢 MEDIUM:** Consolidate to single redirect hop

---

## Quick Checklist

- [ ] Verify domain is added in Vercel Dashboard
- [ ] Check DNS records are correct
- [ ] Verify latest deployment is Production
- [ ] Test Vercel preview URL works
- [ ] Disable Cloudflare "Automatic HTTPS Rewrites"
- [ ] Disable Cloudflare "Always Use HTTPS"
- [ ] Remove Cloudflare redirect rules using 308
- [ ] Test canonical domain returns 200
- [ ] Test all redirects show 301 (not 308)
- [ ] Verify single redirect hop for all URLs

---

## Still Having Issues?

1. **Check Vercel Logs:**
   - Dashboard → Your Project → Logs
   - Look for errors related to domain or deployment

2. **Check DNS Propagation:**
   - Use https://dnschecker.org/
   - Verify DNS records are propagated globally

3. **Contact Support:**
   - Vercel Support (if domain/SSL issues)
   - Cloudflare Support (if using Cloudflare)
   - DNS Provider Support (if DNS issues)

---

**Last Updated:** After redirect test results analysis

