export interface VariableParser {
  find(key: string): Postman.Variable | undefined;

  parse(value: string): string;
}
