declare module 'postman-collection-transformer' {
  export function convert(
    collection: any,
    options: {
      inputVersion: string;
      outputVersion: string;
      retainIds: boolean;
    },
    callback: (err: Error, result: any) => unknown
  ): void;
}
