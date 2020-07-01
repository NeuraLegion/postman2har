import { BaseVariableParser } from './BaseVariableParser';

export class UrlVariableParser extends BaseVariableParser {
  private readonly PATH_VARIABLE_IDENTIFIER = ':';

  constructor(variables: Postman.Variable[]) {
    super(variables);
  }

  public parse(value: string): string {
    if (
      value.startsWith(this.PATH_VARIABLE_IDENTIFIER) &&
      value !== this.PATH_VARIABLE_IDENTIFIER
    ) {
      const variable = this.find(this.normalizeKey(value));

      if (
        variable &&
        typeof variable.value === 'string' &&
        variable.value !== 'schema type not provided'
      ) {
        return variable.value;
      }

      return this.sample(variable);
    }

    return value;
  }

  private normalizeKey(token: string): string {
    return token.replace(/^:/, '');
  }
}
