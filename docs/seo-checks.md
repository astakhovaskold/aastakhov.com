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

### Local structural check (2026-11-11)

Run against a dev server on a local database with the seed content plus one topic (pillar, spoke, related post) and one empty topic. This is a structural check of our own output, not the external validators above: those need a public URL, so task 3.8 stays open until after deploy.

| Page | Status | JSON-LD types | Result |
|---|---|---|---|
| `/ru` | 200 | Person, WebSite | OK |
| `/en/cv` | 200 | Person, WebSite, ProfilePage, BreadcrumbList | OK |
| `/ru/posts` | 200 | Person, WebSite, Blog, BreadcrumbList | OK |
| `/ru/projects` | 200 | Person, WebSite, CollectionPage, BreadcrumbList | OK |
| `/ru/topics/frontend-architecture` | 200 | Person, WebSite, CollectionPage, BreadcrumbList | OK |
| post page | 200 | Person, WebSite, BlogPosting, BreadcrumbList | OK |
| `/ru/topics/empty-topic` | 404 | none | OK |

Checks applied to every page: exactly one Person, `@id` references to the Person and WebSite resolve, no `mailto:`, breadcrumb `item` is a string URL, `ItemList.numberOfItems` matches its entries, `WebSite.inLanguage` is `["ru","en"]`, `BlogPosting` has headline, both dates, author, publisher and `mainEntityOfPage`.

Topic behaviour seen on the same server: hub lists the pillar first; the spoke post links to the topic hub and to the pillar, and its "More" list starts with the explicit related post; the pillar post links to every other post in the topic; the home page and the sitemap list the non-empty topic and not the empty one.

Still to do after deploy: run `/ru`, `/en/cv` and one post through the Rich Results Test and the schema.org validator, then record zero errors here.
