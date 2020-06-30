export interface Loader {
  normalize(
    collection: PostmanV1.Collection | PostmanV2.Collection
  ): Promise<PostmanV2.Collection | undefined>;

  load(
    path: string
  ): Promise<PostmanV1.Collection | PostmanV2.Collection | undefined>;
}
