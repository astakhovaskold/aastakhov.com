const createI18nContent = t => {
    const person = {
        firstName: t('person.firstName'),
        lastName: t('person.lastName'),
        get name() {
            return `${this.firstName} ${this.lastName}`;
        },
        role: t('person.role'),
        avatar: '/images/avatar.jpg',
        location: 'Europe/Madrid', // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
        languages: ['English', 'German', 'Spanish', 'Russian'], // optional: Leave the array empty if you don't want to display languages
    };

    const newsletter = {
        display: false,
        title: <>{t('newsletter.title', {firstName: person.firstName})}</>,
        description: <>{t('newsletter.description')}</>,
    };

    const social = [
        // Links are automatically displayed.
        // Import new icons in /once-ui/icons.ts
        {
            name: 'GitHub',
            icon: 'github',
            link: 'https://github.com/astakhovaskold',
        },
        {
            name: 'LinkedIn',
            icon: 'linkedin',
            link: 'https://linkedin.com/in/askold-astakhov',
        },
        {
            name: 'Telegram',
            icon: 'openLink',
            link: 'https://t.me/askold_astakhov',
        },
        {
            name: 'Email',
            icon: 'email',
            link: 'mailto:astakhovaskold@gmail.com',
        },
    ];

    const home = {
        label: t('home.label'),
        title: t('home.title', {name: person.name}),
        description: t('home.description', {role: person.role}),
        headline: <>{t('home.headline')}</>,
        subline: <>{t('home.subline')}</>,
    };

    const about = {
        label: t('about.label'),
        title: t('about.label'),
        description: t('about.description', {name: person.name, role: person.role, location: person.location}),
        schedule: t('about.schedule'),
        tableOfContent: {
            display: true,
            subItems: false,
        },
        avatar: {
            display: true,
        },
        calendar: {
            display: true,
            link: 'https://cal.com/askold-astakhov/30min',
        },
        intro: {
            display: true,
            title: t('about.intro.title'),
            description: <>{t('about.intro.description')}</>,
            download: t('about.intro.download'),
            cv: t('about.intro.cv'),
        },
        work: {
            display: true, // set to false to hide this section
            title: t('about.work.title'),
            experiences: [
                {
                    company: 'Weigandt Consulting',
                    timeframe: t('about.work.experiences.Weigandt Consulting.timeframe'),
                    role: t('about.work.experiences.Weigandt Consulting.role'),
                    achievements: t('about.work.experiences.Weigandt Consulting.achievements').split(';'),
                    images: [
                        // optional: leave the array empty if you don't want to display images
                        {
                            src: '/images/projects/rms/cover-01.jpg',
                            alt: 'Retail Merchandising System',
                            width: 16,
                            height: 9,
                        },
                        {
                            src: '/images/projects/wiishy/cover-01.jpg',
                            alt: 'Wiishy',
                            width: 16,
                            height: 9,
                        },
                    ],
                },
                {
                    company: 'Luxoft',
                    timeframe: t('about.work.experiences.Luxoft.timeframe'),
                    role: t('about.work.experiences.Luxoft.role'),
                    achievements: t('about.work.experiences.Luxoft.achievements').split(';'),
                    images: [
                        {
                            src: '/images/projects/balihelper/cover-01.jpg',
                            alt: 'BaliHelper — your assistant on Bali island',
                            width: 16,
                            height: 9,
                        },
                    ],
                },
                {
                    company: 'Webit',
                    timeframe: t('about.work.experiences.Webit.timeframe'),
                    role: t('about.work.experiences.Webit.role'),
                    achievements: t('about.work.experiences.Webit.achievements').split(';'),
                    images: [],
                },
                {
                    company: 'ICS Monitoring',
                    timeframe: t('about.work.experiences.ICS Monitoring.timeframe'),
                    role: t('about.work.experiences.ICS Monitoring.role'),
                    achievements: t('about.work.experiences.ICS Monitoring.achievements').split(';'),
                    images: [],
                },
                {
                    company: 'Seoproduction',
                    timeframe: t('about.work.experiences.Seoproduction.timeframe'),
                    role: t('about.work.experiences.Seoproduction.role'),
                    achievements: t('about.work.experiences.Seoproduction.achievements').split(';'),
                    images: [],
                },
            ],
        },
        studies: {
            display: true, // set to false to hide this section
            title: t('about.studies.title'),
            institutions: [
                {
                    name: t('about.studies.institutions.SUAI.title'),
                    description: <>{t('about.studies.institutions.SUAI.description')}</>,
                },
                {
                    name: t('about.studies.institutions.Coursera.title'),
                    description: t('about.studies.institutions.Coursera.description'),
                },
            ],
        },
        technical: {
            display: true, // set to false to hide this section
            title: t('about.technical.title'),
            skills: [
                {
                    title: 'Front-end Languages',
                    description: <>{t('about.technical.skills.Front-end Languages.description')}</>,
                    items: t('about.technical.skills.Front-end Languages.items').split(';'),
                    images: [
                        // Add images for Front-end Languages if needed
                    ],
                },
                {
                    title: 'Front-end Frameworks',
                    description: <>{t('about.technical.skills.Front-end Frameworks.description')}</>,
                    items: t('about.technical.skills.Front-end Frameworks.items').split(';'),
                    images: [
                        // Add images for Front-end Frameworks if needed
                    ],
                },
                {
                    title: 'Module Bundlers',
                    description: <>{t('about.technical.skills.Module Bundlers.description')}</>,
                    items: t('about.technical.skills.Module Bundlers.items').split(';'),
                    images: [
                        // Add images for Module Bundlers if needed
                    ],
                },
                {
                    title: 'Query Management',
                    description: <>{t('about.technical.skills.Query Management.description')}</>,
                    items: t('about.technical.skills.Query Management.items').split(';'),
                    images: [
                        // Add images for Query Management if needed
                    ],
                },
                {
                    title: 'Styling',
                    description: <>{t('about.technical.skills.Styling.description')}</>,
                    items: t('about.technical.skills.Styling.items').split(';'),
                    images: [
                        // Add images for Styling if needed
                    ],
                },
                {
                    title: 'State Managers',
                    description: <>{t('about.technical.skills.State Managers.description')}</>,
                    items: t('about.technical.skills.State Managers.items').split(';'),
                    images: [
                        // Add images for State Managers if needed
                    ],
                },
                {
                    title: 'SSR/ISR',
                    description: <>{t('about.technical.skills.SSR/ISR.description')}</>,
                    items: t('about.technical.skills.SSR/ISR.items').split(';'),
                    images: [
                        // Add images for SSR/ISR if needed
                    ],
                },
                {
                    title: 'UI-Kit',
                    description: <>{t('about.technical.skills.UI-Kit.description')}</>,
                    items: t('about.technical.skills.UI-Kit.items').split(';'),
                    images: [
                        // Add images for UI-Kit if needed
                    ],
                },
                {
                    title: 'Mobile App Development',
                    description: <>{t('about.technical.skills.Mobile App Development.description')}</>,
                    items: t('about.technical.skills.Mobile App Development.items').split(';'),
                    images: [
                        // Add images for Mobile App Development if needed
                    ],
                },
                {
                    title: 'Testing',
                    description: <>{t('about.technical.skills.Testing.description')}</>,
                    items: t('about.technical.skills.Testing.items').split(';'),
                    images: [
                        // Add images for Testing if needed
                    ],
                },
                {
                    title: 'Back-end Languages',
                    description: <>{t('about.technical.skills.Back-end Languages.description')}</>,
                    items: t('about.technical.skills.Back-end Languages.items').split(';'),
                    images: [
                        // Add images for Back-end Languages if needed
                    ],
                },
                {
                    title: 'Back-end Frameworks',
                    description: <>{t('about.technical.skills.Back-end Frameworks.description')}</>,
                    items: t('about.technical.skills.Back-end Frameworks.items').split(';'),
                    images: [
                        // Add images for Back-end Frameworks if needed
                    ],
                },
                {
                    title: 'Database',
                    description: <>{t('about.technical.skills.Database.description')}</>,
                    items: t('about.technical.skills.Database.items').split(';'),
                    images: [
                        // Add images for Database if needed
                    ],
                },
                {
                    title: 'Caching',
                    description: <>{t('about.technical.skills.Caching.description')}</>,
                    items: t('about.technical.skills.Caching.items').split(';'),
                    images: [
                        // Add images for Caching if needed
                    ],
                },
                {
                    title: 'APIs',
                    description: <>{t('about.technical.skills.APIs.description')}</>,
                    items: t('about.technical.skills.APIs.items').split(';'),
                    images: [
                        // Add images for APIs if needed
                    ],
                },
                {
                    title: 'Infrastructure',
                    description: <>{t('about.technical.skills.Infrastructure.description')}</>,
                    items: t('about.technical.skills.Infrastructure.items').split(';'),
                    images: [
                        // Add images for Infrastructure if needed
                    ],
                },
                {
                    title: 'CI/CD',
                    description: <>{t('about.technical.skills.CI/CD.description')}</>,
                    items: t('about.technical.skills.CI/CD.items').split(';'),
                    images: [
                        // Add images for CI/CD if needed
                    ],
                },
                {
                    title: 'Monitoring',
                    description: <>{t('about.technical.skills.Monitoring.description')}</>,
                    items: t('about.technical.skills.Monitoring.items').split(';'),
                    images: [
                        // Add images for Monitoring if needed
                    ],
                },
                {
                    title: 'Project Management',
                    description: <>{t('about.technical.skills.Project Management.description')}</>,
                    items: t('about.technical.skills.Project Management.items').split(';'),
                    images: [
                        // Add images for Project Management if needed
                    ],
                },
                {
                    title: 'Git Methodologies',
                    description: <>{t('about.technical.skills.Git Methodologies.description')}</>,
                    items: t('about.technical.skills.Git Methodologies.items').split(';'),
                    images: [
                        // Add images for Git Methodologies if needed
                    ],
                },
                {
                    title: 'UX/UI',
                    description: <>{t('about.technical.skills.UX/UI.description')}</>,
                    items: t('about.technical.skills.UX/UI.items').split(';'),
                    images: [
                        // Add images for UX/UI if needed
                    ],
                },
                {
                    title: 'Services',
                    description: <>{t('about.technical.skills.Services.description')}</>,
                    items: t('about.technical.skills.Services.items').split(';'),
                    images: [
                        // Add images for Services if needed
                    ],
                },
            ],
        },
    };

    const blog = {
        label: t('blog.label'),
        title: t('blog.title'),
        description: t('blog.description', {name: person.name}),
        // Create new blog posts by adding a new .mdx file to app/blog/posts
        // All posts will be listed on the /blog route
    };

    const work = {
        label: t('work.label'),
        title: t('work.title'),
        description: t('work.description', {name: person.name}),
        // Create new project pages by adding a new .mdx file to app/blog/posts
        // All projects will be listed on the /home and /work routes
    };

    const gallery = {
        label: t('gallery.label'),
        title: t('gallery.title'),
        description: t('gallery.description', {name: person.name}),
        // Images from https://pexels.com
        images: [
            {
                src: '/images/gallery/img-01.jpg',
                alt: 'image',
                orientation: 'vertical',
            },
            {
                src: '/images/gallery/img-02.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-03.jpg',
                alt: 'image',
                orientation: 'vertical',
            },
            {
                src: '/images/gallery/img-04.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-05.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-06.jpg',
                alt: 'image',
                orientation: 'vertical',
            },
            {
                src: '/images/gallery/img-07.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-08.jpg',
                alt: 'image',
                orientation: 'vertical',
            },
            {
                src: '/images/gallery/img-09.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-10.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-11.jpg',
                alt: 'image',
                orientation: 'vertical',
            },
            {
                src: '/images/gallery/img-12.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-13.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
            {
                src: '/images/gallery/img-14.jpg',
                alt: 'image',
                orientation: 'horizontal',
            },
        ],
    };
    return {
        person,
        social,
        newsletter,
        home,
        about,
        blog,
        work,
        gallery,
    };
};

export {createI18nContent};
