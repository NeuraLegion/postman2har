import { Validator } from './Validator';
import semver from 'semver';
import { ok } from 'assert';

export class DefaultValidator implements Validator {
  private readonly ALLOWED_SCHEMAS: ReadonlyArray<string> = [
    'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
    'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  ];
  private readonly MIN_ALLOWED_VERSION = '2.0.0';

  public async verify(collection: Postman.Collection): Promise<void> {
    ok(collection, 'Postman collection is not provided.');
    ok(collection.info, '"info" section is missed in the collection.');

    const versionMismatch: Error = new Error(
      'Postman v1 collections are not supported. If you are using an older format, convert it to v2 and try again.'
    );

    if (collection.info.version) {
      const { version: versionObject } = collection.info;

      const version: string =
        typeof versionObject === 'string'
          ? versionObject
          : `${versionObject.major}.${versionObject.minor}.${versionObject.patch}`;

      if (!semver.gte(version, this.MIN_ALLOWED_VERSION)) {
        throw versionMismatch;
      }
    }

    if (!this.ALLOWED_SCHEMAS.includes(collection.info.schema.trim())) {
      throw versionMismatch;
    }
  }
}
