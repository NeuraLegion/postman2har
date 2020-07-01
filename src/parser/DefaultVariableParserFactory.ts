import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';

export class DefaultVariableParserFactory implements VariableParserFactory {
  public createEnvVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new EnvVariableParser(variables);
  }

  public createUrlVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new UrlVariableParser(variables);
  }
}
