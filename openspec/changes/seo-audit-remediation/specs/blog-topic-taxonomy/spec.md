# Spec Delta

## Purpose

Lets posts be grouped by subject (topic hubs with pillar and supporting posts) as well as by format, so related posts reinforce each other through internal links.

## ADDED Requirements

### Requirement: Posts belong to a topic
Each post SHALL be assignable to at most one localized topic, separate from its format category. Topics SHALL have a localized title, slug and description, and an optional pillar post.

#### Scenario: Assign a topic
- **WHEN** an editor assigns a topic to a post in the CMS
- **THEN** the post is saved with that topic and keeps its format category

#### Scenario: Topic localized
- **WHEN** a topic has Russian and English titles
- **THEN** each locale's pages show the title for that locale

### Requirement: Explicit related posts
A post SHALL have an optional list of related posts that the editor selects. Related posts SHALL be limited to published posts in the same locale.

#### Scenario: Unpublished post excluded
- **WHEN** a selected related post is a draft
- **THEN** it is not shown on the public post page

### Requirement: Topic hub pages
Each topic with at least one public post SHALL have a public hub page that shows its description, its pillar post first, and the other posts in the topic. A topic with no public posts SHALL return 404 and be absent from the sitemap.

#### Scenario: Hub with posts
- **WHEN** `/en/topics/frontend-architecture` is requested and the topic has public posts
- **THEN** the page returns 200, lists the pillar first and the other posts after it, and appears in the sitemap

#### Scenario: Empty topic
- **WHEN** the topic has no public posts
- **THEN** the page returns 404 and is not in the sitemap

### Requirement: Same-topic related links on post pages
A post page SHALL show "more in this topic" with the post's explicitly related posts first, then other public posts of the same topic, then the latest posts, up to a fixed limit and excluding the current post.

#### Scenario: Same-topic first
- **WHEN** a post has a topic with two other public posts
- **THEN** those two appear before any unrelated latest post

### Requirement: Pillar-spoke linking
A pillar post page SHALL link to every other public post in its topic, and each spoke post page SHALL link back to the pillar.

#### Scenario: Spoke links to pillar
- **WHEN** a spoke post of a topic with a pillar is rendered
- **THEN** it contains a link to the pillar post

### Requirement: Home page surfaces topic hubs
The home page SHALL link to each topic hub that has public posts.

#### Scenario: Hub linked from home
- **WHEN** a topic has public posts
- **THEN** `/ru` contains a link to its hub page
