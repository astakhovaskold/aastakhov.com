# caching-and-revalidation Specification

## Purpose
Enables low-latency edge caching with automatic on-demand revalidation, keeping public pages fast and fresh without unnecessary database queries.

## Requirements

### Requirement: Edge Caching for Public Routes
The system SHALL cache public HTML pages at the edge and serve them with low latency for repeat requests.

#### Scenario: Repeat page request
- **WHEN** an unauthenticated visitor requests an existing public page
- **THEN** the edge server delivers the cached response without querying the origin database

### Requirement: Granular On-Demand Cache Invalidation
The system SHALL invalidate cached pages and tags when content is created, modified, or deleted in Payload CMS.

#### Scenario: Updating a blog post in CMS
- **WHEN** an editor saves an update to an article in Payload CMS
- **THEN** the system triggers revalidation for that article's route, the posts index, and the sitemap

### Requirement: Global Settings and CV Revalidation
The system SHALL invalidate relevant page caches when site-wide globals or CV records are updated.

#### Scenario: Updating Site Settings or CV
- **WHEN** changes to SiteSettings or CV globals are saved in Payload CMS
- **THEN** the system invalidates root layouts, homepage, and CV pages across all active locales
