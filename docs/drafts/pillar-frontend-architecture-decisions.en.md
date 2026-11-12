---
slug: frontend-architecture-decisions
title: Frontend architecture for a growing product: the decisions that matter and when to make them
description: Six architecture decisions that keep the cost of change flat as a frontend grows in people, features and years, and the order in which to make them.
tags: architecture, frontend, boundaries
readingTime: 8
topic: frontend-architecture
related: frontend-that-does-not-collapse, frontend-architecture-for-data-heavy-workflows, react-protected, frontend-technical-audit
---

Most architecture discussions in frontend teams happen at the wrong moment. Either on day one, when nobody knows what the product will become, or in month thirty, as the opening argument for a rewrite. In between, the decisions that decide how the codebase ages get made by accident, one pull request at a time, usually by whoever was in a hurry.

This post is a map of the decisions I consider worth making on purpose, and a rough order for making them. Each one links to a longer write-up where I have one.

## What "survives growth" means

A frontend grows along four axes: more engineers, more features (roles, locales, integrations), more years, and more deployments. Architecture is the set of decisions that keep the cost of a change roughly flat while those axes move. You can check it without any diagrams:

- How long a new engineer needs to get a first change merged.
- How many folders a typical feature touches.
- How many teams must agree before one change ships.
- How long a merge takes to reach staging.

If these numbers drift upward every quarter, the architecture is losing, whatever the folder structure looks like on a slide.

## Six decisions that matter

**1. The boundary between UI and transport.** Components should not know endpoint URLs, auth headers or status codes. The UI asks for data and renders state. A schema-first contract (OpenAPI, GraphQL, tRPC) with generated types covers most of this. Hand-written mappers for every response look like protection and mostly double the maintenance, so I keep them for places where the screen really needs a different shape than the server sends. The long version is in [how to design a frontend that does not collapse as the product grows](/en/posts/frontend-that-does-not-collapse).

**2. Where each kind of state lives.** Server data, URL state (filters, sorting, pagination), and local UI state have different lifetimes and different owners. Mixing them in one store is the most common reason a screen becomes slow and impossible to deep-link. For dense screens with large tables and live updates, the rules get stricter, and I collected them in [frontend architecture for data-heavy workflows](/en/posts/frontend-architecture-for-data-heavy-workflows).

**3. How the code is organized.** Group by domain or feature, give every feature a small public surface, and let imports point in one direction. The test I use is deletion: can you remove a feature by deleting one folder and fixing a handful of imports? If yes, the boundaries are real. If removing it means a week of archaeology, they exist only in the diagram.

**4. What is shared, and what is deliberately duplicated.** Share the design system, infrastructure and utilities. Duplicate business UI between domains until two copies change for the same reason. Two cards that look alike today but belong to different parts of the business will diverge, and a shared component then ties two teams together. Fifteen duplicated lines are cheaper than a flexible component with thirty props.

**5. Cross-cutting rules in one place.** Access control, feature flags, localization and error reporting should each have a single mechanism that the rest of the code calls. When route protection is a set of conditions scattered over components, every new role becomes a hunt through the codebase. Declaring access rules next to the routes keeps this reviewable; I wrote a small library for it, [react-protected](/en/posts/react-protected).

**6. Delivery coupling.** Build time, test time, and who has to wait for whom. A slow pipeline shapes the architecture as much as folders do, because it decides how often people integrate. In one project a four-minute production build blocked a shared runner pool until the move to Vite ([the case](/en/posts/ci-runner-bottleneck-vite-migration)). Micro-frontends belong in this decision too. They make sense when teams need independent release cadence, and they cost shared dependencies, version negotiation and extra weight in the browser. As a way to organize code inside one team, they are an expensive choice.

## When to make each one

Decisions 1 and 2 are cheap on day one and expensive after a year, so they come first. Decisions 3 and 4 start to matter when more than one engineer works on the same area at the same time. Decisions 5 and 6 appear once there are several teams, several roles and a release process with real consequences.

Designing decision 6 on day one produces a lot of infrastructure for a product that may never need it. Skipping decision 1 on day one is the usual root of a later rewrite.

## Signs the architecture is losing

- A small change touches many folders.
- A "common" or "shared" folder gets new files every week.
- Reviewers argue about where code should live, and the answer changes by reviewer.
- Nobody wants to delete anything.
- New engineers keep asking the same three questions in their first month.
- Integration happens less often because the pipeline is slow.

An audit is the quickest way to put numbers on these; what I look at is described in [frontend technical audit: what it covers and what you get](/en/posts/frontend-technical-audit).

## What I would avoid

A rewrite as the first response. Adopting a named methodology (domain-driven frontend, feature-sliced design, clean architecture) wholesale because the name sounds like a plan. Each of them contains useful ideas, mostly about boundaries and dependency direction, and each becomes a source of ceremony when applied without a current pain to solve. I take the part that removes a problem the team already has.

## Where to start

Pick one pain that the team can feel, such as slow onboarding or a feature that always breaks something else. Measure it with a number. Change one boundary that is responsible for it. Measure again. Two or three of these cycles usually give a clearer picture than a month of planning.

Which of the six decisions was made by accident in your codebase?
