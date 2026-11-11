# Spec Delta

## Purpose

Defines what a visitor sees and can do on the home page and in primary navigation: a clear offer, a primary contact action, reachable sections, and consistent locale-correct facts about the owner.

## ADDED Requirements

### Requirement: Home page states the offer
The home page SHALL state the owner's role, what they offer (at least three services, each with scope), and at least two verifiable proof points, in the visitor's locale. Visible body text SHALL be at least 250 words.

#### Scenario: Services and proof visible
- **WHEN** `/ru` is rendered
- **THEN** the page shows a services section with three or more offers and two or more proof points drawn from the CV

### Requirement: One primary contact action
The home page SHALL present one primary contact action styled as a button, plus secondary contact links. On a 375x812 viewport the primary action SHALL be visible without scrolling.

#### Scenario: Mobile fold
- **WHEN** `/ru` is rendered at 375x812
- **THEN** the primary contact button is within the first 812 px of the page

#### Scenario: Desktop
- **WHEN** `/ru` is rendered at 1920x1080
- **THEN** exactly one contact link is styled as the primary action

### Requirement: Primary navigation reaches every public section
The primary navigation SHALL link to every section that has public items: blog, projects and CV. A section with no public items SHALL NOT appear in navigation or in topic or category lists.

#### Scenario: Projects linked
- **WHEN** at least one project is public
- **THEN** the navigation contains a link to the projects index

#### Scenario: Empty category hidden
- **WHEN** a post category has no public posts
- **THEN** it is absent from the "Темы"/"Topics" list

### Requirement: No orphan public pages
Every public detail page SHALL be linked from at least one listing page, and the projects index SHALL list every public project.

#### Scenario: Project listed
- **WHEN** `/ru/projects/personal-website` returns 200
- **THEN** `/ru/projects` links to it

### Requirement: Consistent owner facts across pages and locales
The owner's role, location, availability, employment status and team size SHALL be the same on the home page, the CV and structured data in both locales, except for translation. Metrics present in one CV locale SHALL be present in the other.

#### Scenario: Location agrees
- **WHEN** the home page and CV are compared in both locales
- **THEN** the location value is the same everywhere

### Requirement: Locale-correct microcopy
All visible text and meta text on a locale's pages SHALL be in that locale, except proper names and technical terms.

#### Scenario: Russian eyebrow
- **WHEN** `/ru` is rendered
- **THEN** the eyebrow line is in Russian

### Requirement: Readable headings and tap targets
Headings that use line breaks SHALL keep a real space between words in the extracted text. Interactive navigation and contact links SHALL have a hit area of at least 44 px.

#### Scenario: H1 text extraction
- **WHEN** the H1 text content is extracted
- **THEN** words are separated by spaces

#### Scenario: Mobile tap target
- **WHEN** a navigation link is measured at 375 px width
- **THEN** its hit area is at least 44 px tall
