# Project Pages Design

Date: 2026-08-26
Scope: task 09 `/projects`, task 10 `/projects/[slug]`

## Goals

- Build a projects index that reads as a list of products, companies, concepts, and initiatives rather than a client portfolio.
- Build a universal project detail page that works for any project and supports richer content for `automatica` through content structure, not route-specific UI logic.
- Keep the implementation aligned with the existing zero-design frontend and current Payload collections.

## Route Structure

- `src/app/(frontend)/projects/page.tsx`
- `src/app/(frontend)/projects/[slug]/page.tsx`

Both routes stay as server pages in the App Router and use `getPayload({ config })` directly, following the current frontend pattern.

## Data Access

### Projects index

- Query the `projects` collection.
- Sort by `order`, then `year`, then `updatedAt`, matching collection intent.
- Return an empty state if no projects are available or if Payload is unavailable during safe fallback scenarios.

### Project detail

- Query one project by `slug`.
- Call `notFound()` when the project does not exist.
- Resolve related posts with this order:
  1. `posts.relatedProjects` includes the current project id.
  2. Fallback to `projects.relatedPosts[].slug` for compatibility with the current schema.

## UI Structure

### `/projects`

- Intro block with page title and short framing copy.
- Dense list of project rows.
- Each row can show:
  - `previewImage`, optional
  - `title`
  - `description`
  - `type`
  - `status`
  - `year`
  - link to `/projects/[slug]`
- Archived and future projects are labeled in text rather than styled as badges or cards.

### `/projects/[slug]`

- Header with:
  - `title`
  - `description`
  - `status`
  - `role`
  - `type`
  - `year` or `startedAt`
  - optional `externalUrl`
- Optional `coverImage`
- Content body rendered with a shared project content renderer local to this work.
- Related posts section when posts exist.
- Contact / external links section when links are available.

## Component Strategy

Use a minimal shared layer under `src/components/site` for project-facing pieces needed by both routes and reusable by the home page later:

- project list item / list wrapper
- project meta formatting helpers
- lightweight rich-text renderer for project content
- post summary list for related posts if needed

This avoids repeating page-local markup without pulling task 15 fully into scope.

## Automatica Handling

No route-specific template.

`/projects/automatica` should work by:

- rendering structured rich text content;
- showing related case notes and posts through the related-posts logic;
- exposing external/contact links from project data and site settings.

The expected sections such as "What it is" or "Current directions" are content concerns, not special route code.

## Error Handling

- Index page: degrade to an empty list if Payload cannot be reached.
- Detail page: use `notFound()` for missing slugs.
- Related content fetch failures should not break page rendering if the project itself is available.

## Verification

- Run `pnpm lint`.
- Run `pnpm build` if the environment allows it.
- Update `tasks/INDEX.md` checkboxes for 09 and 10 and append implementation log entries.

## Commit Plan

- `task-9 ...`
- `task-10 ...`

If integration touches both areas after worker output, keep the task-specific commits scoped to the dominant change set and do final index/log updates after both are complete.
