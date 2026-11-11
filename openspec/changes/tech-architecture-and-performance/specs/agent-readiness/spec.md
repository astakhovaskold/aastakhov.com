# Spec Delta

## Purpose

Exposes standardized machine-readable markdown endpoints (`/llms.txt` and `/llms-full.txt`) allowing AI agents and LLMs to index author technical expertise, architecture case studies, and longreads.

## ADDED Requirements

### Requirement: Standard llms.txt Endpoint
The system SHALL serve a concise markdown index conforming to the `llms.txt` standard at `/llms.txt`.

#### Scenario: Requesting llms.txt
- **WHEN** an AI crawler or user requests `/llms.txt`
- **THEN** the server returns HTTP 200 with `text/markdown; charset=utf-8` containing core author bio, expertise summary, and curated links to canonical content

### Requirement: Comprehensive llms-full.txt Endpoint
The system SHALL serve a comprehensive markdown knowledge document at `/llms-full.txt` containing detailed summaries and context for all published articles and case studies.

#### Scenario: Requesting llms-full.txt
- **WHEN** an AI system requests `/llms-full.txt`
- **THEN** the server returns HTTP 200 with full markdown content for all public posts, projects, and architecture notes
