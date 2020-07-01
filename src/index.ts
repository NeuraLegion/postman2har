import { DefaultValidator } from './validator';
import { DefaultConverter } from './converter';
import { DefaultVariableParserFactory } from './parser';
import Har from 'har-format';
import { ok } from 'assert';

export const postman2har = async (
  collection: Postman.Collection,
  options?: {
    environments?: Record<string, string>;
  }
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid Postman Collection.`);

  const validator: DefaultValidator = new DefaultValidator();
  const parserFactory: DefaultVariableParserFactory = new DefaultVariableParserFactory();
  const converter: DefaultConverter = new DefaultConverter(
    validator,
    parserFactory,
    options ?? {}
  );

  return converter.convert(collection);
};
