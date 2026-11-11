import type { PublicSiteSettings } from '@/lib/siteSettings'

export const mockSettings: PublicSiteSettings = {
  availability: 'Available',
  blogPage: { description: 'Posts description', title: 'Posts' },
  email: 'test@example.com',
  github: 'https://github.com/test',
  homeEyebrow: 'Eyebrow',
  homePage: {
    heroDescription: 'Hero description',
    heroTags: [],
    heroTitleLine1: 'Line 1',
    heroTitleLine2: 'Line 2',
  },
  knowsAbout: [],
  proof: [],
  linkedin: 'https://linkedin.com/in/test',
  location: 'Madrid',
  name: 'Askold Astakhov',
  projectsPage: { description: 'Projects description', title: 'Projects' },
  seo: {
    defaultDescription: 'Default description',
    defaultTitle: 'Default title',
  },
  selectedWork: [],
  services: [],
  telegram: 'https://t.me/test',
}
