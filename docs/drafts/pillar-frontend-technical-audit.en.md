---
slug: frontend-technical-audit
title: Frontend technical audit: what it covers and what you get
description: What a frontend technical audit looks at, how it runs, and what you receive at the end: findings ranked by impact, a baseline to measure against, and a position on rewrite versus incremental change.
tags: audit, quality, frontend
readingTime: 7
topic: quality-and-audits
related: technical-audit-checklist, ci-runner-bottleneck-vite-migration, frontend-architecture-for-data-heavy-workflows
---

Teams ask for a frontend audit with five different problems in mind. A CTO wants evidence before agreeing to a rewrite. A new head of engineering wants to know what they inherited. An investor wants to know what the codebase will cost to keep alive. A team that just had a bad release wants an outside pair of eyes. A company changing contractors wants a handover that does not depend on the people who are leaving. One word, five different deliverables, and when nobody says which one is wanted, the audit turns into an 80-page list of lint complaints that nobody acts on.

This post describes what I include in a frontend technical audit, how the work runs, and what you hold in your hands at the end. The output is a short list of changes ordered by impact, with evidence for each one.

## What a frontend audit covers

I look at six areas. Each has a few measurable questions, so findings can be checked later by someone who was not in the room.

**1. Delivery pipeline.** How long a pull request waits for CI, how long a merge takes to reach staging, how often the pipeline fails for reasons unrelated to the change, and how a bad release gets rolled back. Pipeline time shapes behavior: once checks take 25 minutes, people stop waiting for them. In one case I wrote up, a post-merge production build of a Create React App project took almost 4 minutes and blocked a shared runner pool. After the move to Vite it took about 10 seconds ([the full case](/en/posts/ci-runner-bottleneck-vite-migration)). Release practice is a separate question, covered in [release process for an enterprise frontend team](/en/posts/release-process-for-enterprise-frontend-team).

**2. The critical user path.** I pick the one journey that earns money (sign-in, checkout, order submission) and trace it from the click to the backend response. What happens on a timeout? Does one failed widget take the whole screen with it? Can a double click create two payments? These checks are cheap, and the failures are expensive when they happen in production. The [technical audit checklist](/en/posts/technical-audit-checklist) walks through this part in detail.

**3. Architecture and boundaries.** Where state lives, who is allowed to import from whom, how API details leak into components, and whether a change in one feature forces edits in five others. Screens with large tables and live data get more specific questions: is filter state in the URL, how often does the UI re-render under streaming updates, who does the sorting. I wrote about those patterns in [frontend architecture for data-heavy workflows](/en/posts/frontend-architecture-for-data-heavy-workflows).

**4. Runtime performance.** Bundle size and duplicated dependencies, render cost on the heaviest screens, and Core Web Vitals from real users when the site has enough traffic to measure. A lab score from one run on a fast laptop says little, so field data comes first and lab runs explain it.

**5. Code health.** Type coverage in the modules that matter, the state of dependencies (unmaintained packages, two libraries doing the same job), and tests that protect revenue paths versus a coverage percentage that protects nothing. I read code in samples, chosen by where incidents and change requests concentrate. Git history and the bug tracker show that quickly.

**6. Team and process.** Can a new engineer run the project in two commands, who owns each area, how long reviews wait, and which knowledge sits in one person's head. Most audits give this area the least attention, and it explains a lot about the other five.

## What it does not cover

Backend design, infrastructure security testing, visual design and UX research are separate pieces of work. If the frontend problems start in an API that returns inconsistent data, the audit points that out with examples, and the API redesign is a different engagement. Penetration testing needs its own scope and its own specialists.

## How the work runs

- **Access and context.** Read access to the repository, CI, the error tracker and analytics. Then 30 to 60 minute conversations with two or three people: someone who ships features, someone who handles releases, someone from product. The people closest to the code usually know where the problems are, and the audit measures them.
- **Measure first.** Pipeline durations from CI history, bundle analysis, a snapshot of field performance, dependency and type reports. This produces the baseline numbers.
- **Trace one journey** end to end, then sample the code around the places that the measurements and conversations pointed to.
- **Triage.** Every finding goes into one of three buckets: quick wins (hours to a couple of days), strategic stabilization (tied to business deliverables and planned across sprints), and leave alone (ugly, stable code that is rarely touched and not worth rewriting).
- **Walk the team through it.** A findings session where the engineers are free to disagree. I update the report after it, because they are right more often than an outside reader expects.

## What you receive

- A report of findings ranked by impact and effort. Each finding carries evidence: a measurement, a code reference or a reproduction, so the team can verify it instead of taking it on trust.
- A baseline: CI duration, bundle size, field LCP and INP, dependency age. These are the numbers to compare against in three months.
- The three-bucket plan, with quick wins written so they can become tickets the same day.
- A position on rewrite versus incremental change, with the reasoning. A rewrite is sometimes the right call, and the report says when and for which modules.
- A session with the team where the results are discussed.

The report is a short document. If it needs 80 pages to be understood, the triage did not happen.

## Signs you need an audit

- Sprints miss estimates in the same places again and again.
- Releases get postponed to avoid Fridays, or need a specific person present.
- Engineers propose a rewrite and cannot say what the rewrite would fix.
- A CI run takes longer than a coffee break, and people merge without waiting for it.
- Onboarding takes weeks before the first merged change.
- Contractors are about to rotate, or already have.
- Investors or a buyer are going to look at the code.

## Limits

An audit finds problems and ranks them. It does not fix them and it does not decide the budget. Findings also depend on access: without CI history or an error tracker, some conclusions will carry the label "not measured". I keep those labels in the report instead of guessing.

If you had to guess which of the six areas would hurt most in your project, which would you pick? I am curious how often that guess matches the measurements.
