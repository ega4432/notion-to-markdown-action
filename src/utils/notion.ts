import { Client } from '@notionhq/client';
import { debug, info } from '@actions/core';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.d';

import { Frontmatter } from './markdown';

type QueryRequest = {
  client: Client;
  databaseId: string;
};

type QueryResponse = (PageObjectResponse & {
  frontmatter: Frontmatter;
})[];

export const queryDatabase = async ({
  client,
  databaseId // TODO: and properties
}: QueryRequest): Promise<QueryResponse> => {
  // const database = await client.databases.retrieve({ database_id: databaseId });
  // const propertyIds = Object.entries(database.properties)
  //   .filter(
  //     ([key, value]) => value.type === 'title' || properties.includes(key)
  //   )
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   .map(([_, value]) => value.id);
  // debug(`propertyIds: ${propertyIds}`);

  const response = await client.databases.query({
    database_id: databaseId,
    filter: {
      timestamp: 'last_edited_time',
      last_edited_time: {
        past_week: {}
      }
    }
    // TODO: filter_properties: propertyIds
    // なぜか `::error::APIResponseError: The schema for this database is malformed` になる。API/SDK の仕様がよく分からんので一旦放置
  });

  info(`---> Successfully return response from Notion via API!`);

  const pages = response.results.filter(
    (result) => 'properties' in result
  ) as PageObjectResponse[];

  return pages.map((page) => {
    info(`Convert page properties to frontmatter ...`);
    return {
      ...page,
      frontmatter: convertPropertiesToFrontmatter(page)
    };
  });
};

const convertPropertiesToFrontmatter = (page: PageObjectResponse) => {
  const frontmatter = {
    createdAt: page.created_time,
    updatedAt: page.last_edited_time
  } as Frontmatter;
  const properties = page.properties;

  for (const property in properties) {
    const value = properties[property];

    switch (value.type) {
      case 'checkbox':
        frontmatter[property] = !value.checkbox;
        break;
      case 'date': {
        let date = value.date?.start ?? '';
        if (value.date && value.date.end) date += ` -> ${value.date.end}`;
        frontmatter[property] = date;
        break;
      }
      case 'number':
        frontmatter[property] = value.number ?? '';
        break;
      case 'multi_select':
        frontmatter[property] = value.multi_select.map((v) => v.name);
        break;
      case 'rich_text':
        frontmatter[property] = value.rich_text
          .map((v) => v.plain_text)
          .join(' ');
        break;
      case 'status':
        frontmatter[property] = value.status?.name ?? '';
        break;
      case 'title':
        frontmatter.title = value.title.map((v) => v.plain_text).join(' ');
        break;
      case 'url':
        frontmatter[property] = value.url ?? '';
        break;
      default:
        debug(`${property} is not supported.`);
        break;
    }
  }

  info(`---> Successfully converted page properties to frontmatter.`);

  // TODO: image, createdAt. updatedAt
  return frontmatter;
};
