# Spec Delta

## Purpose

Provides automated, standardized RSS 2.0 and Atom syndication feeds for published articles, enabling engineering audiences, feed aggregators, and automated cross-posting platforms to consume content.

## ADDED Requirements

### Requirement: RSS 2.0 Feed Generation
The system SHALL generate a valid RSS 2.0 XML document at `/feed.xml` and `/rss.xml` containing published articles ordered by publication date descending.

#### Scenario: Requesting global RSS feed
- **WHEN** a client sends an HTTP GET request to `/feed.xml` or `/rss.xml`
- **THEN** the server returns HTTP 200 with `Content-Type: application/rss+xml; charset=utf-8` containing the latest published posts with title, description, link, pubDate, and author

### Requirement: Localized RSS Feeds
The system SHALL support locale-specific RSS feeds at `/ru/feed.xml` and `/en/feed.xml` containing content localized to the requested language.

#### Scenario: Requesting localized feed
- **WHEN** a client sends an HTTP GET request to `/<locale>/feed.xml` with a valid locale
- **THEN** the server returns an RSS feed filtered to posts localized in that language with canonical links matching that locale

### Requirement: Syndication Autodiscovery
The site layout SHALL include autodiscovery `<link>` elements in the HTML `<head>` advertising the available RSS feeds to browsers and feed readers.

#### Scenario: Inspecting page head for feed autodiscovery
- **WHEN** a browser or feed reader inspects the HTML `<head>` of any public page
- **THEN** it finds `<link rel="alternate" type="application/rss+xml">` pointing to the localized feed URL
