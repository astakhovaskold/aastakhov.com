# Spec Delta

## Purpose

Defines the HTTP security headers, cache behaviour and image delivery of public pages so the site resists clickjacking and content sniffing, answers quickly, and can be cached at the edge.

## ADDED Requirements

### Requirement: Baseline security headers
Every response for a public page SHALL carry `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, a `Permissions-Policy` that disables unused features, a frame-ancestors restriction (CSP `frame-ancestors` or `X-Frame-Options`), and a `Content-Security-Policy` that allows only the origins the site uses. Responses SHALL NOT include an `X-Powered-By` header.

#### Scenario: Public page headers
- **WHEN** `/ru` is requested
- **THEN** the response includes the five headers above and has no `X-Powered-By`

#### Scenario: Analytics still works
- **WHEN** the Umami analytics script is configured
- **THEN** the CSP allows its script and beacon origins and the page loads without CSP violations in the console

### Requirement: Admin and API behaviour preserved
Security headers SHALL NOT break the Payload admin UI, the MCP and OAuth endpoints, or their existing CORS headers.

#### Scenario: Admin loads
- **WHEN** an authenticated user opens `/admin`
- **THEN** the admin UI renders without CSP violations

#### Scenario: MCP CORS unchanged
- **WHEN** a browser client sends an `OPTIONS` request to `/api/mcp`
- **THEN** the response still carries the existing `Access-Control-Allow-*` headers

### Requirement: HSTS scope
The site SHALL send `Strict-Transport-Security` with `max-age` of at least one year. It SHALL add `includeSubDomains` only after every subdomain of `aastakhov.com` is confirmed to serve HTTPS.

#### Scenario: Subdomain not confirmed
- **WHEN** a subdomain such as `umami.aastakhov.com` has not been confirmed HTTPS-only
- **THEN** `includeSubDomains` is not sent

### Requirement: Public pages are edge-cacheable
Public, non-personalised pages (home, list, detail, CV) SHALL be served with cache headers that permit shared-cache reuse, and SHALL be revalidated when their content changes in the CMS within a bounded time. They SHALL NOT send `no-store`.

#### Scenario: Repeat request hits the cache
- **WHEN** the same public page is requested twice within its revalidation window
- **THEN** the second response is served from cache and time to first byte is below 800 ms

#### Scenario: Content edit propagates
- **WHEN** an editor publishes a change to a post
- **THEN** the public page reflects it within the configured revalidation time

### Requirement: Above-the-fold image is not lazy-loaded
The home page's above-the-fold portrait SHALL load eagerly with high fetch priority, and SHALL have explicit dimensions.

#### Scenario: Hero portrait attributes
- **WHEN** the home page HTML is inspected
- **THEN** the portrait `<img>` has no `loading="lazy"` and has `fetchpriority="high"` and width and height

### Requirement: Optimised images are long-cached
Optimised image responses SHALL carry a cache lifetime of at least one day, and static assets with hashed names SHALL stay immutable.

#### Scenario: Optimised avatar cache header
- **WHEN** the optimised avatar URL is requested
- **THEN** `Cache-Control` has `max-age` of at least 86400
