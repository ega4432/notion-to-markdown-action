import { Client } from '@notionhq/client';
import { info } from '@actions/core';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.d';

import { Frontmatter } from './markdown';

type QueryRequest = {
  client: Client;
  databaseId: string;
};

type QueryResponse = (PageObjectResponse & {
  frontmatter: Frontmatter;
})[];

type Property =
  | 'checkbox'
  | 'created_time'
  | 'date'
  | 'last_edited_time'
  | 'number'
  | 'multi_select'
  | 'rich_text'
  | 'status'
  | 'title'
  | 'url';

const filterProperties: Property[] = [
  'checkbox',
  'created_time',
  'date',
  'last_edited_time',
  'number',
  'multi_select',
  'rich_text',
  'status',
  'title',
  'url'
];

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
    },
    filter_properties: filterProperties
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

  // for (const propertyName in page.properties) {
  //   const propertyValue = page.properties[propertyName];
  //   switch (propertyName) {
  //     case 'title':
  //       // 処理
  //       console.log(propertyValue)
  //       break;
  //     case 'created_at':
  //       // 処理
  //       break;
  //     case 'updated_at':
  //       // 処理
  //       break;
  //     case 'checkbox':
  //       // 処理
  //       break;
  //     case 'multi_select':
  //       // 処理
  //       break;
  //     case 'status':
  //       // 処理
  //       break;
  //     case 'date':
  //       // 処理
  //       break;
  //     case 'rich_text':
  //       // 処理
  //       break;
  //     case 'url':
  //       // 処理
  //       break;
  //     case 'number':
  //       // 処理
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // Object.entries(page.properties).forEach(([key, value]) => {

  // })

  const properties = page.properties;
  for (const property in properties) {
    const value = properties[property];

    // if (value.type === 'title') {
    //   data.title = value.title.map((v) => v.plain_text).join(' ');
    // } else if (value.type === 'rich_text') {
    //   data.description = value.rich_text.map((v) => v.plain_text).join(' ');
    // } else if (value.type === 'checkbox') {
    //   data.draft = !value.checkbox;
    // } else if (value.type === 'multi_select') {
    //   data.tags = value.multi_select.map((v) => v.name);
    // } else if (value.type === 'created_time') {
    //   console.log(value.created_time);
    // }

    switch (value.type) {
      case 'checkbox':
        data.draft = !value.checkbox;
        break;
      case 'created_time':
        data.createdAt = convertDateToString(value.created_time);
        break;
      case 'date':
        info(
          value.date
            ? value.date.start +
                ' ' +
                value.date.end +
                ' ' +
                value.date.time_zone
            : ''
        );
        break;
      case 'last_edited_time':
        data.updatedAt = convertDateToString(value.last_edited_time);
        break;
      case 'number':
        info(value.number ? value.number.toString() : '');
        break;
      case 'multi_select':
        data.tags = value.multi_select.map((v) => v.name);
        break;
      case 'rich_text':
        data.description = value.rich_text.map((v) => v.plain_text).join(' ');
        break;
      case 'status':
        info(value.status ? value.status.name : '');
        break;
      case 'title':
        data.title = value.title.map((v) => v.plain_text).join(' ');
        break;
      case 'url':
        info(value.url || '');
        break;
      default:
        info(`${value.type} is not supported.`);
        break;
    }
  }
  // TODO: image, createdAt. updatedAt
  return data;
};

const convertDateToString = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
