import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  ProjectDetailBody,
  ProjectDetailContacts,
  ProjectDetailContent,
  ProjectDetailCover,
  ProjectDetailMeta,
  ProjectDetailRelatedPosts,
  ProjectDetailStack,
} from '@/components/site/project-detail-content'
import { getProjectDetailBySlug } from '@/lib/project-detail'
import { getSiteSettings } from '@/lib/siteSettings'

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params
  const [{ project, relatedPosts }, settings] = await Promise.all([
    getProjectDetailBySlug(slug),
    getSiteSettings(),
  ])

  if (!project) {
    notFound()
  }

  const contactLinks = [
    project.externalUrl ? { href: project.externalUrl, label: 'Project link' } : null,
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link))
  const hasProjectBody = Boolean(project.coverImage || project.content?.root?.children?.length)

  return (
    <>
      <section className="hero">
        <ProjectDetailStack>
          <p className="eyebrow">Project detail</p>
          <ProjectDetailBody>
            <h1>{project.title}</h1>
            <p className="lede">{project.description}</p>
            <ProjectDetailMeta project={project} />
            <nav className="topic-links" aria-label="Project navigation">
              <Link href="/projects">All projects</Link>
              {relatedPosts.length > 0 ? <a href="#related-posts">Related posts</a> : null}
              {contactLinks.length > 0 ? <a href="#contact">Contact</a> : null}
            </nav>
          </ProjectDetailBody>
        </ProjectDetailStack>
      </section>

      {hasProjectBody ? (
        <section className="section" id="project">
          <ProjectDetailStack>
            <ProjectDetailCover project={project} />
            <ProjectDetailContent project={project} />
          </ProjectDetailStack>
        </section>
      ) : null}

      <ProjectDetailRelatedPosts posts={relatedPosts} />
      <ProjectDetailContacts links={contactLinks} />
    </>
  )
}
