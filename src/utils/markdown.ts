import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.d';
import { dump } from 'js-yaml';
import { format } from 'prettier';

export type Frontmatter = {
  title: string;
  description: string;
  image: string;
  draft: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type MarkdownPage = {
  title: string;
  body: string;
};

export const convertPagesToMarkdown = async (
  notionClient: Client,
  pages: (PageObjectResponse & { frontmatter: Frontmatter })[]
): Promise<MarkdownPage[]> => {
  const n2m = new NotionToMarkdown({ notionClient });
  return Promise.all(
    pages.map(async (page) => {
      const frontmatter = renderedMatter(page.frontmatter);
      const markdown = await pageToMarkdown(n2m, page.id);
      return {
        title: page.frontmatter.title,
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
  return [`---`, dumped, `---`].join('\n');
};
