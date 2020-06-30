// import { JSONLoader } from './loader';
import HarV1 from 'har-format';
import { ok } from 'assert';
import { DefaultConverter } from './converter';

export const postman2har = async (
  spec: PostmanV1.Collection | PostmanV2.Collection,
  options?: {
    baseUri?: string;
  }
): Promise<HarV1.Request[]> => {
  ok(spec, `Please provide a valid Postman Collection.`);

  // const loader = new JSONLoader();
  const collection = spec as PostmanV2.Collection;

  ok(collection, 'Supplied Postman Collection is invalid.');

  const converter = new DefaultConverter(options ?? {});

  return converter.convert(collection);
};
