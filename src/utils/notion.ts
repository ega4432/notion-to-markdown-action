import { Client } from '@notionhq/client';
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
  databaseId
}: QueryRequest): Promise<QueryResponse> => {
  const response = await client.databases.query({
    database_id: databaseId,
    filter: {
      timestamp: 'last_edited_time',
      last_edited_time: {
        past_week: {}
      }
    }
  });

  const pages = response.results.filter(
    (result) => 'properties' in result
  ) as PageObjectResponse[];

  return pages.map((page) => {
    return {
      ...page,
      frontmatter: arrangeProperties(page)
    };
  });
};

const arrangeProperties = (page: PageObjectResponse) => {
  const data = {} as Frontmatter;
  const properties = page['properties'];
  for (const property in properties) {
    const value = properties[property];

    if (value.type === 'title') {
      data.title = value.title.map((v) => v.plain_text).join(' ');
    } else if (value.type === 'rich_text') {
      data.description = value.rich_text.map((v) => v.plain_text).join(' ');
    } else if (value.type === 'checkbox') {
      data.draft = !value.checkbox;
    } else if (value.type === 'multi_select') {
      data.tags = value.multi_select.map((v) => v.name);
    }
  }
  // TODO: image, createdAt. updatedAt
  return data;
};
