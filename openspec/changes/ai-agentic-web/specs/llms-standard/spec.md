# Spec Delta

## Purpose

Provides machine-readable markdown discovery endpoints (`/llms.txt` and `/llms-full.txt`) that enable search engines, AI agents, and LLMs to index author expertise and longread content cleanly.

## ADDED Requirements

### Requirement: Standard llms.txt Discovery Endpoint
The system SHALL expose an HTTP GET endpoint at `/llms.txt` returning a structured, concise Markdown index conforming to the `llms.txt` format.

#### Scenario: Agent requests /llms.txt
- **WHEN** an AI crawler or user sends a GET request to `/llms.txt`
- **THEN** the server returns HTTP 200 with `Content-Type: text/plain; charset=utf-8` (so browsers display it instead of downloading) containing author summary, engineering focus, and categorized links to key articles

### Requirement: Comprehensive llms-full.txt Ingestion Endpoint
The system SHALL expose an HTTP GET endpoint at `/llms-full.txt` returning complete, aggregated Markdown representations of all published articles and case studies.

#### Scenario: Agent requests /llms-full.txt
- **WHEN** an AI model or crawler requests `/llms-full.txt`
- **THEN** the server returns HTTP 200 with `Content-Type: text/plain; charset=utf-8` and full Markdown texts for all public posts and case notes, formatted with titles, dates, and clean content

### Requirement: Well-Known Standard Aliasing
The system SHALL support the standard path `/.well-known/llms.txt` by redirecting or aliasing to `/llms.txt`.

#### Scenario: Requesting well-known discovery path
- **WHEN** a client sends a GET request to `/.well-known/llms.txt`
- **THEN** the request successfully resolves to the identical content served by `/llms.txt`
