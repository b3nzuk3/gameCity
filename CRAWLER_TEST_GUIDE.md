# Crawler Detection Test

## Test the OG endpoint with different user agents

### 1. Test with WhatsApp User Agent

```bash
curl -H "User-Agent: WhatsApp/2.21.24.17" "https://www.gamecityelectronics.co.ke/api/og-product?slug=evga-ftw3-ultra-nvidia-rtx-3080-10gb-graphics-card-nairobi"
```

### 2. Test with Facebook User Agent

```bash
curl -H "User-Agent: facebookexternalhit/1.1" "https://www.gamecityelectronics.co.ke/api/og-product?slug=evga-ftw3-ultra-nvidia-rtx-3080-10gb-graphics-card-nairobi"
```

### 3. Test with Generic Bot User Agent

```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "https://www.gamecityelectronics.co.ke/api/og-product?slug=evga-ftw3-ultra-nvidia-rtx-3080-10gb-graphics-card-nairobi"
```

### 4. Test Direct Product URL (should redirect to OG endpoint)

```bash
curl -H "User-Agent: WhatsApp/2.21.24.17" "https://www.gamecityelectronics.co.ke/product/evga-ftw3-ultra-nvidia-rtx-3080-10gb-graphics-card-nairobi"
```

## Expected Results

All tests should return HTML with proper Open Graph meta tags:

- `og:title`
- `og:description`
- `og:image` (with JPEG format)
- `og:image:type`
- `og:image:width`
- `og:image:height`

## Debug Information

The OG endpoint now logs:

- User agent
- Accept header
- Whether it detected a crawler
- All request headers

Check Vercel function logs for debugging information.
