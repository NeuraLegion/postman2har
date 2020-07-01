import { DefaultValidator } from './validator';
import { DefaultConverter } from './converter';
import { DefaultVariableParserFactory } from './parser';
import Har from 'har-format';
import { ok } from 'assert';

export const postman2har = async (
  spec: Postman.Collection,
  options?: {
    environments?: Record<string, string>;
  }
): Promise<Har.Request[]> => {
  ok(spec, `Please provide a valid Postman Collection.`);

  const collection = spec as Postman.Collection;

  ok(collection, 'Supplied Postman Collection is invalid.');

  const validator = new DefaultValidator();
  const parserFactory = new DefaultVariableParserFactory();

  const converter = new DefaultConverter(
    validator,
    parserFactory,
    options ?? {}
  );

  return converter.convert(collection);
};
