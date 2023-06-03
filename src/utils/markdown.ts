import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.d';
import { dump } from 'js-yaml';
import { format } from 'prettier';
import { slug } from 'github-slugger';
import { readFile } from 'fs/promises';

export type Frontmatter = {
  title: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | boolean | string[];
};

export type MarkdownPage = {
  filename: string;
  body: string;
};

type MarkdownImage = {
  alt: string;
  src: string;
};

export const convertPagesToMarkdown = async (
  notionClient: Client,
  pages: (PageObjectResponse & {
    frontmatter: Frontmatter;
  })[],
  prop: string
): Promise<MarkdownPage[]> => {
  const n2m = new NotionToMarkdown({ notionClient });
  return Promise.all(
    pages.map(async (page) => {
      const frontmatter = renderedMatter(page.frontmatter);
      const markdown = await pageToMarkdown(n2m, page.id);
      const filename = slug(detectFilenameFromProperty(page.frontmatter, prop));
      return {
        filename,
        body: format([frontmatter, markdown.parent].join('\n'), {
          parser: 'markdown'
        })
      };
    })
  );
};

const pageToMarkdown = async (n2m: NotionToMarkdown, pageId: string) => {
  const mdblocks = await n2m.pageToMarkdown(pageId, 2);
  return n2m.toMarkdownString(mdblocks);
};

const renderedMatter = (matter: Frontmatter) => {
  const dumped = dump(matter, { forceQuotes: true });
  return ['---', dumped, '---'].join('\n');
};

export const findImagesFromMarkdown = async (filename: string) => {
  const content = await readFile(filename, 'utf-8');
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: MarkdownImage[] = [];
  let match;
  while ((match = regex.exec(content))) {
    const [, alt, src] = match;
    if (!src) continue;
    if (
      src.includes('secure.notion-static.com') &&
      src.includes('X-Amz-Algorithm') &&
      src.includes('X-Amz-Content-Sha256') &&
      src.includes('X-Amz-Credential') &&
      src.includes('X-Amz-Date') &&
      src.includes('X-Amz-SignedHeaders') &&
      src.includes('X-Amz-Signature')
    ) {
      images.push({ alt: alt ? slug(alt) : '', src });
    }
  }
  return { images, content };
};

const detectFilenameFromProperty = (frontmatter: Frontmatter, prop: string) => {
  if (prop === 'title' || !(prop in frontmatter)) {
    return frontmatter.title;
  }

  return typeof frontmatter[prop] === 'string'
    ? (frontmatter[prop] as string)
    : frontmatter.title;
};
