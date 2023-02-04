import { getInput, setFailed, info, error } from '@actions/core';
import { mkdirP } from '@actions/io';
import { Client } from '@notionhq/client';
import { writeFile } from 'fs/promises';

import { queryDatabase } from './utils/notion';
import { convertPagesToMarkdown, MarkdownPage } from './utils/markdown';

const DEFAULT_OUTPUT = 'output';

const auth = process.env.NOTION_API_KEY as string;
const databaseId = process.env.NOTION_DATABASE_ID as string;

const run = async (auth: string, databaseId: string, outDir: string) => {
  const client = new Client({ auth });

  info('Call "Query a Database" API ...');

  const pages = await queryDatabase({ client, databaseId });

  info(`Convert notion pages to markdown files ...`);

  const mdResponse = await convertPagesToMarkdown(client, pages);

  info(`---> Successfully converted from notion pages to markdown files!`);

  await mkdirP(outDir);

  info(`---> Successfully created directory! : ${outDir}`);

  await createFiles(mdResponse, outDir);

  info(`---> Successfully created markdown files!`);
};

const createFiles = async (pages: MarkdownPage[], outDir: string) => {
  pages.forEach(async (markdown) => {
    // TODO: ファイルの存在チェック
    await writeFile(`${outDir}/${markdown.title}.md`, markdown.body);
  });
};

run(auth, databaseId, getInput('output_path') || DEFAULT_OUTPUT).catch((e) => {
  error(e);
  setFailed(e.message);
});
