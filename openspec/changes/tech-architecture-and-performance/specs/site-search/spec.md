# Spec Delta

## Purpose

Provides visitors and recruiters with an instant, keyboard-driven Command Palette search across all articles, portfolio projects, open-source repositories, and professional competencies.

## ADDED Requirements

### Requirement: Command Palette Shortcut and Trigger
The system SHALL display an interactive search modal when triggered via keyboard shortcut (`Cmd+K` / `Ctrl+K`) or search button.

#### Scenario: Opening search via hotkey
- **WHEN** a user presses `Cmd+K` on macOS or `Ctrl+K` on Windows/Linux on any public page
- **THEN** the Command Palette opens focused with search input ready for typing

### Requirement: Unified Content Search Results
The search system SHALL return matching results grouped by category (Articles, Projects, Open Source, Skills) with instant highlight and navigation.

#### Scenario: Typing a search query
- **WHEN** a user enters a search query matching titles or descriptions
- **THEN** the system displays matched entries grouped by type with title, excerpt, and badge

### Requirement: Keyboard Navigation and Direct Link
The Command Palette SHALL support arrow keys, escape to close, and Enter to navigate directly to the selected resource.

#### Scenario: Navigating results with keyboard
- **WHEN** a user presses arrow keys and hits Enter on a search item
- **THEN** the browser navigates directly to the chosen page and the palette closes
