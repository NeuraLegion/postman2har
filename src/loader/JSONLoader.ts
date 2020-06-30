import { Loader } from './Loader';
import fs from 'fs';
import { promisify } from 'util';
import { ok } from 'assert';
import { URL } from 'url';
import transformer from 'postman-collection-transformer';

const readFile: (
  path: string | Buffer | URL | number,
  encoding: 'utf8'
) => Promise<string> = promisify(fs.readFile);

const convert: (
  collection: PostmanV1.Collection | PostmanV2.Collection,
  options: {
    inputVersion: '1.0.0';
    outputVersion: '2.1.0';
    retainIds: boolean;
  }
) => Promise<PostmanV2.Collection> = promisify(transformer.convert);

export class JSONLoader implements Loader {
  public async load(
    path: string
  ): Promise<PostmanV1.Collection | PostmanV2.Collection | undefined> {
    ok(path, 'Path is not provided.');

    const content: string | undefined = await this.read(path);

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        throw new Error('Cannot parse file.');
      }
    }
  }

  public normalize(
    collection: PostmanV1.Collection | PostmanV2.Collection
  ): Promise<PostmanV2.Collection | undefined> {
    return convert(collection, {
      inputVersion: '1.0.0',
      outputVersion: '2.1.0',
      retainIds: true
    });
  }

  private async read(path: string): Promise<string | undefined> {
    try {
      return await readFile(path, 'utf8');
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw new Error('Cannot read file.');
      }
    }
  }
}
