# Spec Delta

## Purpose

Defines the page titles, descriptions and JSON-LD entities the site publishes so search and AI engines can identify the site's owner, language and content types.

## ADDED Requirements

### Requirement: Localized descriptive home metadata
The home page of each locale SHALL have a title and meta description written in that locale, naming the owner and the professional focus. Titles SHALL be at most 60 characters and descriptions 120-160 characters. OG and Twitter tags SHALL reuse the same text.

#### Scenario: Russian home page
- **WHEN** `/ru` is fetched
- **THEN** the title and description are in Russian, name "Аскольд Астахов" and the role, and no English default string such as "Personal site for" appears

#### Scenario: English home page
- **WHEN** `/en` is fetched
- **THEN** the title and description are in English and differ from the Russian ones

### Requirement: Descriptive section titles with site name
Titles of list and detail pages SHALL follow `<page title> — <site name>` in the page's locale, and SHALL describe the page content rather than only its section name.

#### Scenario: Blog index title
- **WHEN** `/ru/posts` is fetched
- **THEN** the title contains the page's descriptive title and ends with the Russian site name

### Requirement: Single linked entity graph
Every page SHALL publish one JSON-LD `@graph` in which the `Person` has the stable `@id` `https://www.aastakhov.com/#person` and the `WebSite` has the stable `@id` `https://www.aastakhov.com/#website`. All other schema objects (ProfilePage, BlogPosting, CreativeWork) SHALL reference the Person by `@id` for author and main entity.

#### Scenario: Person defined once
- **WHEN** any page's JSON-LD is parsed
- **THEN** exactly one Person object defines the owner, and no other object embeds a separate Person with only a name

#### Scenario: CV ProfilePage references the Person
- **WHEN** `/en/cv` JSON-LD is parsed
- **THEN** the ProfilePage `mainEntity` is `{ "@id": "https://www.aastakhov.com/#person" }`

### Requirement: Complete Person entity
The Person object SHALL include `name`, `alternateName` (Cyrillic form), `jobTitle`, `description`, `image`, `url`, `knowsAbout`, and `sameAs` links to every configured public profile (LinkedIn, GitHub, Telegram, dev.to). Fields with no configured value SHALL be omitted, not emitted empty or as placeholders. The email address SHALL NOT appear in JSON-LD.

#### Scenario: Configured profiles
- **WHEN** site settings have LinkedIn, GitHub, Telegram and dev.to URLs
- **THEN** `sameAs` lists all four

#### Scenario: Missing optional value
- **WHEN** no portrait image is configured
- **THEN** the Person has no `image` property

### Requirement: WebSite entity covers both locales
The WebSite object SHALL have `url` set to the site root, `inLanguage` listing both locales, and `publisher` referencing the Person by `@id`.

#### Scenario: WebSite fields
- **WHEN** any page's JSON-LD is parsed
- **THEN** WebSite `url` is `https://www.aastakhov.com/`, `inLanguage` is `["ru","en"]`, and `publisher` is the Person `@id`

### Requirement: BlogPosting for posts
Each post detail page SHALL publish a `BlogPosting` with `headline`, `description`, `image` when a cover exists, `datePublished`, `dateModified`, `inLanguage`, `mainEntityOfPage`, and author and publisher referencing the Person `@id`. The published and modified dates SHALL also be visible on the page.

#### Scenario: Post with modification date
- **WHEN** a post has `publishedAt` and `lastModified`
- **THEN** its JSON-LD has matching `datePublished` and `dateModified`, and a visible date appears in the page body

### Requirement: Valid BreadcrumbList
A BreadcrumbList SHALL list `ListItem` entries with `position`, `name` and `item` as an absolute URL string, with no repeated `@context` inside items. Crumb names SHALL describe the page they point at (for example "CV"), and SHALL NOT repeat the site name for every item. Detail and list pages SHALL publish one.

#### Scenario: CV breadcrumb
- **WHEN** `/en/cv` JSON-LD is parsed
- **THEN** item 1 is Home, item 2 is named "CV", and each `item` is a string URL

### Requirement: Collection pages typed
The posts index SHALL publish `Blog` or `CollectionPage` schema and the projects index SHALL publish `CollectionPage` with an `ItemList` of its public items. Project detail pages SHALL publish a creative-work or software type linked to the Person.

#### Scenario: Projects index with items
- **WHEN** `/en/projects` has public projects
- **THEN** its JSON-LD includes an `ItemList` whose entries match the visible projects
