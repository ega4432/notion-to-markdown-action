import { getInput, setFailed } from '@actions/core';
import { Client } from '@notionhq/client';
import { stat, mkdir, writeFile } from 'fs/promises';

import { queryDatabase } from './utils/notion';
import { convertPagesToMarkdown, MarkdownPage } from './utils/markdown';

const run = async (auth: string, databaseId: string, outDir: string) => {
  const client = new Client({ auth });
  const pages = await queryDatabase({ client, databaseId });

  const mdResponse = await convertPagesToMarkdown(client, pages);

  await createDirectory(outDir);

  await createFiles(mdResponse, outDir);
};

const createDirectory = async (outDir: string) => {
  await stat(outDir).catch((e) => {
    if (e.code === 'ENOENT') {
      mkdir(outDir, { recursive: true });
    }
  });
};

const createFiles = async (pages: MarkdownPage[], outDir: string) => {
  pages.forEach(async (markdown) => {
    // TODO: ファイルの存在チェック
    await writeFile(`${outDir}/${markdown.title}.md`, markdown.body);
  });
};

run(
  getInput('notion_api_key'),
  getInput('notion_database_id'),
  getInput('output_path')
).catch((e) => {
  setFailed(e.message);
});
