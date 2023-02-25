import {
  getInput,
  setFailed,
  info,
  error,
  setOutput,
  debug
} from '@actions/core';
import { mkdirP } from '@actions/io';
import { Client } from '@notionhq/client';
import { readdir, writeFile } from 'fs/promises';
import get from 'axios';

import { queryDatabase } from './utils/notion';
import {
  convertPagesToMarkdown,
  findImagesFromMarkdown,
  MarkdownPage
} from './utils/markdown';
import {
  DEFAULT_FILENAME_PROPERTY,
  DEFAULT_OUTPUT_DIR
} from './utils/constants';

const auth = process.env.NOTION_API_KEY as string;
const databaseId = process.env.NOTION_DATABASE_ID as string;

const run = async (
  auth: string,
  databaseId: string,
  outDir: string,
  filenameProperty: string
) => {
  const client = new Client({ auth });

  info('Call "Query a Database" API ...');

  const pages = await queryDatabase({ client, databaseId });

  info('Convert notion pages to markdown files ...');

  const mdResponse = await convertPagesToMarkdown(
    client,
    pages,
    filenameProperty
  );

  info('---> Successfully converted from notion pages to markdown files!');

  await mkdirP(outDir);

  info(`---> Successfully created directory! : ${outDir}`);

  await createFiles(mdResponse, outDir);

  const files = await readdir(outDir);
  debug(`Output: files_count=${files.length.toString()}`);
  setOutput('files_count', files.length.toString());

  info('---> Successfully created markdown files!');
};

const createFiles = async (pages: MarkdownPage[], outDir: string) => {
  pages.forEach(async (markdown) => {
    if (markdown.filename.length) {
      // NOTE: 現状すでにファイルが存在していても上書きする
      const filename = `${outDir}/${markdown.filename}.md`;
      await writeFile(filename, markdown.body);
      debug(`Created: ${filename}`);
      await downloadImages(markdown.filename, outDir);
    }
  });
};

const downloadImages = async (filename: string, outDir: string) => {
  const mdFile = `${outDir}/${filename}.md`;
  const { images, content } = await findImagesFromMarkdown(mdFile);
  if (images.length) {
    await mkdirP(`${outDir}/${filename}`);

    let untitledCount = 0;
    let replaced = content;
    for (const { alt, src } of images) {
      if (!alt) untitledCount++;
      const res = await get(src, { responseType: 'arraybuffer' });
      const image = `${filename}/${alt || `untitled${untitledCount}`}.png`;
      await writeFile(`${outDir}/${image}`, res.data, 'binary');

      debug(`Created image: ${outDir}/${image}`);

      replaced = replaced.replace(src, image);
    }

    if (content !== replaced) {
      await writeFile(mdFile, replaced, 'utf-8');
    }
  }
};

run(
  auth,
  databaseId,
  getInput('output_path') || DEFAULT_OUTPUT_DIR,
  getInput('filename_property') || DEFAULT_FILENAME_PROPERTY
).catch((e) => {
  error(e);
  setFailed(e.message);
});
