# Spec Delta

## Purpose

Defines which URLs the site advertises to search crawlers (sitemap, canonical, hreflang, noindex) so every advertised URL is a live, final, indexable page.

## ADDED Requirements

### Requirement: One canonical URL form per page
The site SHALL use a single URL form for each page, with no trailing slash and a locale prefix (for example `/ru`, `/en`, `/ru/projects`), in canonical links, hreflang alternates, `og:url`, sitemap entries and structured-data URLs. The advertised URL SHALL return HTTP 200 without redirecting.

#### Scenario: Home page canonical
- **WHEN** a crawler fetches `/ru` or `/en`
- **THEN** the canonical link, `og:url` and hreflang `ru`/`en` alternates are `https://www.aastakhov.com/ru` and `https://www.aastakhov.com/en`, and each of those URLs returns 200 without redirecting

#### Scenario: Inner page canonical
- **WHEN** a crawler fetches `/en/projects`
- **THEN** its canonical and alternates use the same no-trailing-slash form

### Requirement: Consistent x-default
The site SHALL declare one `x-default` target, the same in the HTML alternates and in the HTTP `Link` header, and it SHALL be a URL that returns 200 without redirecting.

#### Scenario: x-default matches in HTML and header
- **WHEN** a page response is inspected
- **THEN** the HTML `x-default` alternate and the `Link` header `x-default` point at the same URL, which returns 200

### Requirement: Sitemap lists each locale as its own URL
The sitemap SHALL contain one `<url>` entry per locale per public page. Each entry SHALL carry the full reciprocal alternate set for the locales in which that page exists, including `x-default`.

#### Scenario: Both locales listed
- **WHEN** a client fetches `/sitemap.xml`
- **THEN** it contains `<loc>` entries for both `/ru/...` and `/en/...` URLs of a page that exists in both locales, each with `ru`, `en` and `x-default` alternates

#### Scenario: Page exists in one locale only
- **WHEN** a project or post has no `en` translation
- **THEN** the sitemap lists only its `ru` URL and emits no `en` alternate for it

### Requirement: Sitemap matches page availability
The sitemap SHALL include a detail URL only if the corresponding detail page would return 200 and be indexable. The sitemap and the detail routes SHALL use one shared publication rule.

#### Scenario: Unpublished or hidden record
- **WHEN** a project record would make its detail route return 404
- **THEN** its URL does not appear in the sitemap

#### Scenario: Every sitemap URL resolves
- **WHEN** every URL in the sitemap is requested
- **THEN** each returns HTTP 200 with no redirect

### Requirement: Empty listing pages are not indexed or advertised
A listing or category page with zero public items SHALL carry `noindex` and SHALL NOT appear in the sitemap. When the page gains items, it SHALL become indexable and appear in the sitemap without a code change.

#### Scenario: Empty posts index
- **WHEN** no posts are published and `/en/posts` is requested
- **THEN** the page returns 200 with `robots` set to `noindex` and `/en/posts` is absent from the sitemap

#### Scenario: Index gains its first item
- **WHEN** the first post is published
- **THEN** `/en/posts` is indexable and listed in the sitemap

### Requirement: Sitemap carries real modification dates
Each sitemap entry SHALL include `lastmod` taken from the underlying record's last content change, not from build or request time. Entries with no known change date SHALL omit `lastmod`.

#### Scenario: Post with a modification date
- **WHEN** a post has a `lastModified` value
- **THEN** its sitemap entry's `lastmod` equals that value

#### Scenario: Static page without a date
- **WHEN** a page has no recorded change date
- **THEN** its sitemap entry has no `lastmod`

### Requirement: Not-found responses are not canonicalised to other pages
A response with status 404 SHALL carry `noindex`, SHALL NOT declare a canonical link to another page, and SHALL render a document with a `lang` attribute and a title that identifies it as not found.

#### Scenario: Unknown project slug
- **WHEN** `/ru/projects/does-not-exist` is requested
- **THEN** the response status is 404, `robots` is `noindex`, there is no canonical link to the home page, and the `<html>` element has `lang="ru"`
