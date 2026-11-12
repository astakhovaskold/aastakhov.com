# editorial-ux Specification

## Purpose

Enhances the longform reading experience for technical leadership audiences through automated Table of Contents extraction with active scrollspy, heading anchors, and high-intent B2B conversion callouts.

## Requirements

### Requirement: Heading Extraction for Table of Contents
The system SHALL parse post rich-text content to extract `h2` and `h3` headings with stable anchor IDs.

#### Scenario: Post with multiple headings
- **WHEN** a post contains rich-text content with `h2` and `h3` headings
- **THEN** the system generates a hierarchy of headings with slugified unique anchor identifiers and text labels

### Requirement: Interactive Table of Contents with Scrollspy
The post detail page SHALL display a sticky Table of Contents that dynamically highlights the heading currently in viewport.

#### Scenario: Reading through an article
- **WHEN** a reader scrolls through the article past an `h2` or `h3` heading
- **THEN** the Table of Contents highlights the active heading item and clicking a link smoothly scrolls to that section

### Requirement: Heading Anchor Permalinks
The post detail content renderer SHALL render copyable permalink anchors next to article headings.

#### Scenario: Copying section permalink
- **WHEN** a user hovers or clicks on a heading anchor icon
- **THEN** the section's URL hash is copied to the clipboard with visual confirmation

### Requirement: Contextual B2B Consultation Callout
The post detail page SHALL render a dedicated conversion callout at the end of the article, targeted at CTOs and technical founders.

#### Scenario: Viewing the end of a technical article
- **WHEN** a reader reaches the bottom of an article's body content
- **THEN** the page displays a high-contrast editorial callout with direct links to schedule an architectural consultation, connect on Telegram, or send an email

### Requirement: Related Content Recommendations
The post detail page SHALL render a recommendations section displaying related articles from the same category or linked projects.

#### Scenario: Displaying related writing
- **WHEN** an article has published peer articles in the same category or related project links
- **THEN** the page renders cards for up to 3 related items with title, reading time, and link
