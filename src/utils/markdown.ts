import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.d';
import { dump } from 'js-yaml';
import { format } from 'prettier';
import { slug } from 'github-slugger';

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

export const convertPagesToMarkdown = async (
  notionClient: Client,
  pages: (PageObjectResponse & {
    frontmatter: Frontmatter;
  })[]
): Promise<MarkdownPage[]> => {
  const n2m = new NotionToMarkdown({ notionClient });
  return Promise.all(
    pages.map(async (page) => {
      const frontmatter = renderedMatter(page.frontmatter);
      const markdown = await pageToMarkdown(n2m, page.id);
      return {
        filename: slug(page.frontmatter.title),
        body: format([frontmatter, markdown].join('\n'), { parser: 'markdown' })
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
