# Fix SEO Redirect Issues - 308 to 301 & Single-Step Redirects

## Current Issues

From your test results:

- ❌ **308 redirects** (should be 301 for SEO)
- ❌ **Multiple redirect hops** (2 redirects instead of 1)

## Goal

✅ All redirects should be **301 Permanent Redirect**  
✅ All redirects should be **single-step** (1 redirect, not 2+)

---

## Issue 1: Fix 308 Redirects → 301

### Where 308 Redirects Come From

308 redirects are typically from:

1. **Cloudflare** "Automatic HTTPS Rewrites" or redirect rules
2. **DNS/CDN level** HTTP→HTTPS redirects
3. **HostAfrica** redirect features (if enabled)

### Solution A: If Using Cloudflare

#### Step 1: Disable Automatic HTTPS Rewrites

1. **Login to Cloudflare Dashboard**
2. **Select your domain:** `gamecityelectronics.co.ke`
3. **Go to:** SSL/TLS → Edge Certificates
4. **Find:** "Automatic HTTPS Rewrites"
5. **Set to:** OFF (disabled)
6. **Save**

#### Step 2: Check Redirect Rules

1. **Go to:** Rules → Redirect Rules
2. **Review all redirect rules:**
   - Look for any rules using **308** status
   - Edit them to use **301** instead
   - Or delete them if Vercel handles redirects

#### Step 3: Create Proper Redirect Rules (Optional)

If you want Cloudflare to handle redirects:

1. **Go to:** Rules → Redirect Rules
2. **Create rule for HTTP → HTTPS:**

   - **Rule name:** "HTTP to HTTPS"
   - **When:** `http.request.protocol eq "http"`
   - **Then:** Redirect to `https://$1` with status **301**
   - **URL pattern:** `*gamecityelectronics.co.ke/*`

3. **Create rule for non-www → www:**
   - **Rule name:** "Non-www to www"
   - **When:** `http.host eq "gamecityelectronics.co.ke"`
   - **Then:** Redirect to `https://www.gamecityelectronics.co.ke$1` with status **301**

**OR** let Vercel handle all redirects (recommended):

- Disable all Cloudflare redirect rules
- Let Vercel's `vercel.json` handle redirects

### Solution B: If Using HostAfrica Redirect Features

1. **Login to HostAfrica Control Panel**
2. **Go to:** Domain Management → Redirects
3. **Check for any redirects:**
   - If redirects exist, ensure they use **301** (not 307/308)
   - Or disable them and let Vercel handle redirects

### Solution C: If Using Other DNS/CDN

Check your DNS/CDN provider for:

- HTTP→HTTPS redirect settings
- Domain redirect features
- Ensure they use **301** (not 308)

---

## Issue 2: Fix Multiple Redirect Hops → Single-Step

### Current Problem

`http://gamecityelectronics.co.ke` shows:

1. **308** → `http://gamecityelectronics.co.ke` (HTTP→HTTPS)
2. **301** → `https://www.gamecityelectronics.co.ke/` (Domain redirect)

**Result:** 2 redirects instead of 1

### Solution: Consolidate Redirects

You have two options:

#### Option 1: Let Vercel Handle Everything (Recommended)

**Steps:**

1. **Disable all Cloudflare/DNS redirects**
2. **Let Vercel handle:**
   - HTTP → HTTPS (automatic)
   - Domain redirects (via `vercel.json`)

**How:**

- In Cloudflare: Disable "Always Use HTTPS" and all redirect rules
- In HostAfrica: Disable any redirect features
- Vercel will handle both HTTP→HTTPS and domain redirects in one step

#### Option 2: Consolidate at Cloudflare Level

**Steps:**

1. **Create single redirect rule** in Cloudflare:

   - **Rule name:** "All to Canonical"
   - **When:** `(http.host ne "www.gamecityelectronics.co.ke") or (http.request.protocol eq "http")`
   - **Then:** Redirect to `https://www.gamecityelectronics.co.ke$1` with status **301**
   - This handles both HTTP→HTTPS and domain redirect in one step

2. **Disable Vercel redirects** (or keep them as backup)

---

## Recommended Configuration

### Best Practice: Vercel Handles All Redirects

**Why:**

- Single source of truth
- Easier to manage
- Consistent behavior
- Better performance

**Setup:**

1. **Cloudflare Settings:**

   - SSL/TLS → Edge Certificates → "Always Use HTTPS": **OFF**
   - SSL/TLS → Edge Certificates → "Automatic HTTPS Rewrites": **OFF**
   - Rules → Redirect Rules: **Delete all** (or disable)

2. **Vercel Configuration:**

   - Your `vercel.json` already has correct redirects
   - Ensure all redirects use `"permanent": true` (generates 301)

3. **HostAfrica:**
   - Disable any redirect features
   - Only manage DNS records (A, CNAME)

---

## Step-by-Step Fix Guide

### Step 1: Check What's Causing 308 Redirects

**Test to identify source:**

```bash
# Test HTTP request
curl -I http://gamecityelectronics.co.ke

# Check response headers
# Look for "Location" header and status code
```

**If you see 308:**

- Check Cloudflare redirect rules
- Check HostAfrica redirect settings
- Check any CDN/proxy in front of Vercel

### Step 2: Disable 308 Redirects

**If using Cloudflare:**

1. Login to Cloudflare
2. SSL/TLS → Edge Certificates → "Always Use HTTPS": **OFF**
3. SSL/TLS → Edge Certificates → "Automatic HTTPS Rewrites": **OFF**
4. Rules → Redirect Rules → Review and fix/delete 308 rules

**If using HostAfrica:**

1. Check for redirect features
2. Disable or change to 301

### Step 3: Consolidate Redirects

**Option A: Let Vercel handle (Recommended)**

- Disable all Cloudflare/DNS redirects
- Vercel will handle HTTP→HTTPS + domain redirects

**Option B: Single Cloudflare rule**

- Create one rule that redirects everything to canonical with 301

### Step 4: Test After Changes

Wait 15-30 minutes for changes to propagate, then test:

```bash
# Should show single 301 redirect
curl -I -L http://gamecityelectronics.co.ke

# Expected output:
# HTTP/1.1 301 Moved Permanently
# Location: https://www.gamecityelectronics.co.ke/
# ...
# HTTP/2 200
```

**Verify:**

- ✅ Only **1 redirect** in chain
- ✅ Status code is **301** (not 308)
- ✅ Final status is **200 OK**

---

## Testing Checklist

After making changes:

- [ ] `http://gamecityelectronics.co.ke` → Single 301 → 200 OK
- [ ] `https://gamecityelectronics.co.ke` → Single 301 → 200 OK
- [ ] `http://www.gamecityelectronics.co.ke` → Single 301 → 200 OK
- [ ] `https://www.gamecityelectronics.co.ke` → 200 OK (no redirect)
- [ ] All redirects show **301** (not 308)
- [ ] All redirects are **single-step** (not 2+)

---

## Quick Fix Summary

### If Using Cloudflare:

1. **Disable:**

   - "Always Use HTTPS"
   - "Automatic HTTPS Rewrites"
   - All redirect rules using 308

2. **Let Vercel handle redirects** (your `vercel.json` is already configured)

### If NOT Using Cloudflare:

1. **Check HostAfrica** for redirect features
2. **Disable** any redirects or change to 301
3. **Let Vercel handle** all redirects

---

## Expected Results After Fix

| URL                                     | Redirects | Status Codes | Final Status |
| --------------------------------------- | --------- | ------------ | ------------ |
| `http://gamecityelectronics.co.ke`      | **1**     | **301**      | **200 OK**   |
| `https://gamecityelectronics.co.ke`     | **1**     | **301**      | **200 OK**   |
| `http://www.gamecityelectronics.co.ke`  | **1**     | **301**      | **200 OK**   |
| `https://www.gamecityelectronics.co.ke` | **0**     | -            | **200 OK**   |

---

## Still Having Issues?

1. **Check redirect source:**

   ```bash
   curl -I -L http://gamecityelectronics.co.ke 2>&1 | grep -i "HTTP\|Location"
   ```

2. **Review all layers:**

   - DNS provider (HostAfrica)
   - CDN (Cloudflare, if used)
   - Vercel configuration

3. **Test incrementally:**
   - Disable one layer at a time
   - Test after each change
   - Identify which layer is causing issues

---

**After fixing, your redirects will be SEO-optimized with single-step 301 redirects!**
