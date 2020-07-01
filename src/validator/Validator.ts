export interface Validator {
  verify(collection: Postman.Collection): Promise<void | never>;
}
