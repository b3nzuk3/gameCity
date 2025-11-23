# Domain Redirect Testing Guide

## Overview

This guide helps you test that all domain variations properly redirect to the canonical domain `https://www.gamecityelectronics.co.ke/` with single-step 301 redirects.

## ✅ Test Requirements

All test URLs must:
- Show exactly **1 redirect** (301 → 200)
- Redirect to `https://www.gamecityelectronics.co.ke/`
- Use **301 (Permanent)** status code (not 308)
- Final response should be **200 OK**

## Test URLs

Test these 8 variations:

1. `http://gamecityelectronics.com`
2. `https://gamecityelectronics.com`
3. `http://www.gamecityelectronics.com`
4. `https://www.gamecityelectronics.com`
5. `http://gamecityelectronics.co.ke`
6. `https://gamecityelectronics.co.ke`
7. `http://www.gamecityelectronics.co.ke`
8. `https://www.gamecityelectronics.co.ke` (should return 200 directly, no redirect)

## Automated Testing

### Option 1: Bash Script (Linux/Mac/Git Bash)

```bash
cd greenbits-store
chmod +x scripts/test-redirects.sh
./scripts/test-redirects.sh
```

### Option 2: PowerShell Script (Windows)

```powershell
cd greenbits-store
.\scripts\test-redirects.ps1
```

### Option 3: Manual cURL Testing

```bash
# Test each URL individually
curl -I -L http://gamecityelectronics.com
curl -I -L https://gamecityelectronics.com
curl -I -L http://www.gamecityelectronics.com
curl -I -L https://www.gamecityelectronics.com
curl -I -L http://gamecityelectronics.co.ke
curl -I -L https://gamecityelectronics.co.ke
curl -I -L http://www.gamecityelectronics.co.ke
curl -I -L https://www.gamecityelectronics.co.ke
```

**Expected output for redirects:**
```
HTTP/1.1 301 Moved Permanently
Location: https://www.gamecityelectronics.co.ke/
...
HTTP/2 200
```

**Expected output for canonical:**
```
HTTP/2 200
```

## Manual Browser Testing

1. Open browser developer tools (F12)
2. Go to Network tab
3. Visit each test URL
4. Check:
   - First request shows **301** status
   - Final request shows **200** status
   - Final URL is `https://www.gamecityelectronics.co.ke/`
   - Only **1 redirect** in the chain

## Online Tools

### Redirect Checker Tools

1. **Redirect Checker** - https://www.redirectchecker.org/
   - Enter test URL
   - Check "Follow redirects"
   - Verify: 1 redirect, 301 status, correct destination

2. **HTTP Status Checker** - https://httpstatus.io/
   - Enter all test URLs
   - Verify status codes and redirect chains

3. **Google Search Console URL Inspection**
   - Test each URL
   - Check "Page indexing" section
   - Verify redirect chain shows only 1 step

## Common Issues

### ❌ Issue: Multiple Redirects (2+ hops)

**Symptoms:**
- Redirect chain: `301 → 301 → 200`
- Multiple redirects in browser network tab

**Fix:**
- Check Vercel redirect rules for conflicts
- Ensure no Cloudflare redirect rules overlap
- Verify DNS settings don't cause additional redirects

### ❌ Issue: 308 Redirects

**Symptoms:**
- Status code shows `308 Permanent Redirect`
- Browser shows "308" in network tab

**Fix:**
- Disable Cloudflare "Automatic HTTPS Rewrites" if using 308
- Ensure Vercel uses `"permanent": true` (generates 301)
- Check server config for 308 redirects

### ❌ Issue: Redirect Loop

**Symptoms:**
- Browser shows "too many redirects" error
- Infinite redirect chain

**Fix:**
- Check redirect rules don't redirect canonical domain to itself
- Verify `vercel.json` redirects exclude canonical domain
- Check for conflicting redirect rules

### ❌ Issue: Wrong Destination

**Symptoms:**
- Redirects to wrong domain
- Redirects to non-www version

**Fix:**
- Verify `vercel.json` redirect destination is correct
- Check all redirect rules use canonical domain
- Ensure no conflicting rules

## Verification Checklist

After running tests, verify:

- [ ] All 7 non-canonical URLs redirect with 301
- [ ] Canonical URL returns 200 directly (no redirect)
- [ ] All redirects go to `https://www.gamecityelectronics.co.ke/`
- [ ] Each redirect chain has exactly 1 step
- [ ] No 308 redirects found
- [ ] Browser shows correct final URL
- [ ] Google Search Console URL Inspection shows clean redirect

## Post-Testing Actions

1. **Submit Updated Sitemap**
   - Submit `https://www.gamecityelectronics.co.ke/sitemap.xml` to Google Search Console

2. **Request Indexing**
   - Use Google Search Console URL Inspection tool
   - Request indexing for:
     - Homepage
     - Top category pages
     - Top product pages

3. **Monitor Search Console**
   - Check "Coverage" report for redirect issues
   - Monitor "Indexing" status
   - Watch for "Crawled - currently not indexed" issues

4. **Update Internal Links**
   - Ensure all internal links use canonical domain
   - Update any hardcoded domain references

## Support

If tests fail:
1. Check `vercel.json` redirect configuration
2. Verify DNS settings
3. Check Cloudflare redirect rules (if applicable)
4. Review server logs for redirect issues

