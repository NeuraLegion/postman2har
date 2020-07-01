import { VariableParser } from './VariableParser';

export interface VariableParserFactory {
  createEnvVariableParser(variables: Postman.Variable[]): VariableParser;

  createUrlVariableParser(variables: Postman.Variable[]): VariableParser;
}
