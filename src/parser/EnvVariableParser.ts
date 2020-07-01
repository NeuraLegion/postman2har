import { Replacer } from './Replacer';
import { BaseVariableParser } from './BaseVariableParser';

export class EnvVariableParser extends BaseVariableParser {
  private readonly REGEX_EXTRACT_VARS = /{{([^{}]*?)}}/g;
  private readonly VARS_SUBREPLACE_LIMIT = 30;

  constructor(variables: Postman.Variable[]) {
    super(variables);
  }

  public parse(value: string): string {
    let replacer: Replacer = new Replacer(value);

    do {
      replacer = replacer.replace(
        this.REGEX_EXTRACT_VARS,
        (_match: string, token: string) => this.replace(token)
      );
    } while (
      replacer.replacements &&
      replacer.substitutions < this.VARS_SUBREPLACE_LIMIT
    );

    return replacer.valueOf();
  }

  private replace(token: string): string {
    const variable = this.find(token);

    if (!variable || !variable.value) {
      return this.sample();
    }

    return variable.value;
  }
}
