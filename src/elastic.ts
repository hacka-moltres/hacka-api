import { Client } from '@elastic/elasticsearch';

import { ELASTIC_API } from './configs';
import { enIndex } from './interfaces/enIndex';

const elastic = new Client({ node: ELASTIC_API });

export async function findByEmailOrPhone(search: string): Promise<any> {
  try {
    const data = {
      index: enIndex.user,
      type: 'document',
      body: {
        query: {
          bool: {
            must: [
              {
                // eslint-disable-next-line camelcase
                query_string: {
                  query: search,
                  // eslint-disable-next-line camelcase
                  analyze_wildcard: true,
                  // eslint-disable-next-line camelcase
                  default_field: '*'
                }
              }
            ]
          }
        }
      }
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function findByFingerPrint(fingerPrint: string): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        query: {
          match: {
            tags: fingerPrint.toString(),
          },
        },
      },
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    console.error(e);
    return null;
  }
}
export async function findTagsByUser(userIds: string[]): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        query: {
          bool: {
            filter: {
              terms: {
                userIndex: userIds
              }
            }
          }
        }
      }
    };
    const result = await elastic.search(data);
    return result.body;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function checkIndicesExist(): Promise<void> {
  const { body: bodyTags } = await elastic.indices.exists({ index: enIndex.tags });
  const { body: bodyUser } = await elastic.indices.exists({ index: enIndex.user });

  if (!bodyTags) {
    await elastic.indices.create({ index: enIndex.tags });
  }

  if (!bodyUser) {
    await elastic.indices.create({ index: enIndex.user });
  }
}

export default elastic;