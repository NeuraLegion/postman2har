import { VariableParser } from './VariableParser';
import faker from 'faker';

export abstract class BaseVariableParser implements VariableParser {
  protected constructor(private readonly variables: Postman.Variable[]) {}

  public abstract parse(value: string): string;

  public find(key: string): Postman.Variable | undefined {
    return this.variables.find((x: Postman.Variable) => x.key === key);
  }

  protected sample(variable?: Postman.Variable): string {
    switch (variable?.type?.toLowerCase()) {
      case 'string':
      case 'text':
        return faker.random.word();
      case 'number':
        return String(faker.random.number({ min: 1, max: 99 }));
      case 'any':
      default:
        return faker.random.arrayElement([
          faker.random.alphaNumeric(10),
          String(faker.random.number({ min: 1, max: 99 })),
          faker.random.uuid()
        ]);
    }
  }
}
