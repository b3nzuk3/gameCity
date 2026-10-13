# Storefront announcement bar

The storefront reads the announcement configuration from `GET /api/public/homepage`.
The response includes a non-null `announcement` object:

```json
{
  "enabled": true,
  "text": "Gaming PCs, components & accessories • Delivery across Kenya",
  "mobileText": "Delivery across Kenya",
  "linkLabel": "Shop now",
  "linkHref": "/category/all"
}
```

`enabled` controls whether the bar is rendered and whether the header/main layout
reserves its height. The bar is 32px tall with a 20px text line height to avoid clipping glyph descenders; navbar offsets and main padding use the same 32px allowance. When enabled, the bar keeps the existing top-only behavior: it
is visible at scroll position zero and slides away after scrolling. The mobile copy
uses `mobileText`; an empty mobile value falls back to `text`.

The storefront remains backward-compatible with an older or unavailable API. Missing
announcement data, a homepage request error, or invalid non-string fields use the
default configuration above. A disabled announcement does not leave a bar link or
header gap behind.

CTA links are optional. Local paths beginning with `/` (excluding `//`) and absolute
`http:`/`https:` URLs are rendered; other schemes and malformed URLs are omitted.
External links open in a new tab with `noopener noreferrer`. While the bar is slid
off-screen, its CTA is removed from the normal keyboard tab order.

The homepage query is shared with the homepage page under the key
`['homepage', 'public']` and uses a 60-second stale time, so the layout and homepage
reuse the same cached response.