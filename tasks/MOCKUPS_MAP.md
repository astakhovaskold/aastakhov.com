# Mockups map

## Approved implementation references

- `02-base-layout-zero-design/mockups/askold-home-contrast-v7.html` - global zero-design baseline.
- `08-home-page/mockups/askold-home-contrast-v7.html` - approved home page baseline.
- `11-posts-index/mockups/askold-posts-page-v1.html` - approved posts index reference.
- `13-post-detail/mockups/askold-post-detail-zero-design-v2.html` - approved post detail reference.
- `16-content-renderer/mockups/content-renderer-reference.html` - shared content renderer reference.

## Legacy or context-only references

- `09-projects-index/mockups/askold-work-page-v1-legacy-reference.html` - old `/work` page. Use as layout reference only; final route is `/projects` and content should be projects-only.
- `08-home-page/mockups/archive/*` - design history. Do not copy rejected patterns.
- `13-post-detail/mockups/archive/*` - heavier article page direction rejected in favor of zero design.
- `22-ui-cleanup/mockups/archive-rejected-directions/*` - examples of what to avoid.

## Current routing decision

```txt
/
/projects
/projects/:slug
/posts
/posts/category/:slug
/posts/:slug
/cv
```

No `/work`, `/works`, `/cases`, `/services`, or `/open-source` routes in MVP.
