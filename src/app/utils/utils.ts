import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type Team = {
    name: string;
    role: string;
    avatar: string;
    linkedIn: string;
};

type Metadata = {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
    images: string[];
    tag?: string;
    team: Team[];
};

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }

    if (typeof value === 'string' && value.length > 0) {
        return value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    return [];
}

function extractSummary(content: string) {
    const firstParagraph = content
        .split('\n')
        .map(line => line.trim())
        .find(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('```'));

    return firstParagraph || '';
}

function getMDXFiles(dir: string) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${dir}`);
    }

    return fs.readdirSync(dir).filter(file => path.extname(file) === '.mdx');
}

function readMDXFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const {data, content} = matter(rawContent);
    const images = toStringArray(data.images);
    const tags = toStringArray(data.tag ?? data.tags);
    const summary = data.summary || data.description || extractSummary(content);

    const metadata: Metadata = {
        title: data.title || '',
        publishedAt: data.publishedAt || '',
        summary,
        image: data.image || images[0] || '',
        images,
        tag: tags[0] || '',
        team: data.team || [],
    };

    return {metadata, content};
}

function getMDXData(dir: string) {
    const mdxFiles = getMDXFiles(dir);
    return mdxFiles.map(file => {
        const {metadata, content} = readMDXFile(path.join(dir, file));
        const slug = path.basename(file, path.extname(file));

        return {
            metadata,
            slug,
            content,
        };
    });
}

export function getPosts(customPath = ['', '', '', '']) {
    const postsDir = path.join(process.cwd(), ...customPath);
    return getMDXData(postsDir);
}
