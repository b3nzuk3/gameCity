# Dynamic Sitemap Configuration

## Overview

The sitemap is now dynamically generated using a Vercel serverless function that fetches products from your backend API and includes individual product URLs for better SEO.

## Configuration

### 1. Backend URL Setup

You need to set the `BACKEND_URL` environment variable in your Vercel deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add a new variable:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://your-backend-url.com` (replace with your actual backend URL)
   - **Environment**: Production, Preview, Development

### 2. Backend API Requirements

Your backend must have an endpoint that returns products in this format:

```
GET /api/products?pageNumber=1&limit=1000
```

Response format:

```json
{
  "products": [
    {
      "id": "product-id",
      "name": "Product Name",
      "category": "Category Name",
      "updatedAt": "2025-01-27T00:00:00Z",
      "createdAt": "2025-01-27T00:00:00Z"
    }
  ],
  "page": 1,
  "pages": 1,
  "count": 100
}
```

### 3. Fallback Behavior

If the backend API is unavailable, the sitemap will fall back to a static version with category pages only.

## Features

✅ **Dynamic Product URLs**: Each product gets its own sitemap entry
✅ **SEO-Friendly Slugs**: Product URLs use SEO-friendly slugs with location suffix
✅ **High Priority**: Product pages have priority 0.9 (higher than categories)
✅ **Fresh Timestamps**: Uses actual product update timestamps
✅ **Caching**: Sitemap is cached for 1 hour for better performance
✅ **Error Handling**: Graceful fallback if backend is unavailable

## Testing

After deployment, test your sitemap at:

- `https://www.gamecityelectronics.co.ke/sitemap.xml`

The sitemap should include:

- Homepage (priority 1.0)
- Category pages (priority 0.8)
- Individual product pages (priority 0.9) ← **Key feature!**
- Static pages (various priorities)
