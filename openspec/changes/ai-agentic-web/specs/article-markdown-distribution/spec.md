# Spec Delta

## Purpose

Enables one-click copying and raw HTTP retrieval of clean Markdown content for individual articles and case studies, optimized for direct ingestion into AI context windows.

## ADDED Requirements

### Requirement: Raw Article Markdown Endpoint
The system SHALL expose raw Markdown representations for published articles at `/<locale>/posts/<slug>.md`.

#### Scenario: Requesting article in raw Markdown format
- **WHEN** an HTTP client sends a GET request to `/<locale>/posts/<slug>.md`
- **THEN** the server returns HTTP 200 with `Content-Type: text/markdown; charset=utf-8` containing frontmatter metadata and the article body formatted as clean Markdown

### Requirement: Interactive Copy Markdown Button
The post detail interface SHALL display a "Copy Markdown" action in the side column above the table of contents (in the header on pages without one, such as projects) that places the full article Markdown onto the user's clipboard.

#### Scenario: User clicks Copy Markdown button
- **WHEN** a user clicks the "Copy Markdown" button on an article page
- **THEN** the system copies the article's title, description, and Markdown body to the clipboard and displays visual confirmation
