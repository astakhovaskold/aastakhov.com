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

## 3. Owner decisions (task 4.1)

Recorded 2026-11-12. Approved by the site owner in chat.

| Fact | Decision |
|---|---|
| Location | Remote, no city, in both locales (RU: «Удалённо») |
| Canonical role title | Frontend Architect & Tech Lead, in both locales |
| Availability | Available for external projects (RU: «Доступен для внешних проектов»). The owner works at a company and stays open to external work as an independent expert |
| Employment framing | Current position at Philosophy.IT stays on the CV; the independent offer stays on the home page |
| Team size | 6–8 engineers in direct management (as in the EN CV); Philosophy.IT is a 47-engineer consultancy |
| Services | Already on the home page (Audit, Consulting, Development, Support and retainer) |
| Proof points | The four metrics of the EN CV (-60% project setup, PR merge 1.5 to 0.4 days, -78% contract-mismatch rejections, 2.8 s to 300 ms) |
| RU CV | Synced with the EN CV, including metrics |

Open: the education entries differ between the locales (EN: Tula College of Arts 2015–2019, SUAI studied 2023–2024; RU: SUAI 2015–2019). The RU CV was not changed for education; the owner decides which is right.

Applied by the data migration `20261112_120000_owner_decisions_content`.

### External validation, schema.org validator (2026-11-12)

Run against production (deploy `aastakhov-yc2aikged`, commit `d62c974`) at `https://validator.schema.org/`:

| URL | Items found | Errors | Warnings |
|---|---|---|---|
| `/ru` | WebSite (Person nested as publisher) | 0 | 0 |
| `/en/cv` | BreadcrumbList, ProfilePage, WebSite | 0 | 0 |
| `/ru/posts/frontend-that-does-not-collapse` | BreadcrumbList, BlogPosting, WebSite | 0 | 0 |

The Google Rich Results Test was not run: it needs an interactive Google session. None of these types is eligible for a rich result, so the schema.org validator is the relevant check.

Seen while validating: `WebSite.description` is the site `seo.defaultDescription`, which is still «Личный сайт» in RU. Update that field in the admin to a descriptive text.
