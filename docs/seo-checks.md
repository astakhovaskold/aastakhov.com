# SEO Checks and Verification Guide

## 1. Sitemap Verification

To verify that all URLs in `/sitemap.xml` return HTTP 200 without redirects or errors:

```bash
# Against local dev server (default http://localhost:3000)
pnpm tsx scripts/check-sitemap.ts

# Against production or staging
pnpm tsx scripts/check-sitemap.ts https://www.aastakhov.com
```

### Criteria
- Status must be `200 OK`.
- Any `3xx` redirect (e.g. 301, 307, 308) is treated as a failure.
- Any `4xx` or `5xx` response is treated as a failure.
- Both `/ru` and `/en` URLs are validated.

## 2. Structured Data Validation

- Test URLs with Google Rich Results Test:
  - `https://search.google.com/test/rich-results`
- Test with Schema.org Validator:
  - `https://validator.schema.org/`
