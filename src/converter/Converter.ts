import HarV1 from 'har-format';

export interface Converter {
  convert(collection: PostmanV2.Collection): Promise<HarV1.Request[]>;
}
