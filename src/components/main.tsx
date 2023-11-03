import { createSignal, Show, type Component } from 'solid-js';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

export const Main: Component = () => {
  const testInput =
    'public class CustomerModel {\n  private String customerId;\n  private String organizationId;\n  private CustomerType customerType;\n  private String firstName;\n  private String lastName;\n  private String email;\n  private Long version;\n  private Boolean requiresValidation = false;\n  private List<AddressModel> addresses = new ArrayList<AddressModel>();\n  private List<String> phoneNumbers = new ArrayList<String>();\n\n  public String getDisplayName() {\n    return this.firstName + " " + this.lastName;\n  }\n}';
  const [input, setInput] = createSignal(testInput);
  const [output, setOutput] = createSignal('');
  const [error, setError] = createSignal('');

  const containsAccessModifier = (word: string) =>
    word.includes('public') || word.includes('private') || word.includes('protected');

  const TypeMapping = {
    boolean: 'boolean',
    string: 'string',
    long: 'number',
    int: 'number',
    short: 'number',
    char: 'string',
    byte: 'number',
    float: 'number',
    double: 'number',
  } as const;

  const handleClassConvert = (lines: string[]) => {
    const outputValue: string[] = [];
    for (let line of lines) {
      line = line.trim().replace(';', '');
      if (!line) {
        continue;
      }
      const words = line.trim().split(' ');

      const accessModifier = words[0];

      if (!containsAccessModifier(accessModifier)) {
        continue;
      } else if (words.length < 3) {
        setError(`The line "${line}" is not valid, please format it correctly`);
        return;
      }

      const type = words[1];
      const name = words[2];

      let convertedType = '';
      if (type === 'class') {
        outputValue.push(`export type ${name} {`);
        continue;
      } else if (type.toLowerCase() in TypeMapping) {
        convertedType = TypeMapping[type.toLowerCase() as keyof typeof TypeMapping];
      } else if (type.includes('<') && type.includes('>')) {
        const arrayType = type.split('<')[1].split('>')[0];
        if (arrayType.toLowerCase() in TypeMapping) {
          convertedType = `${TypeMapping[arrayType.toLowerCase() as keyof typeof TypeMapping]}[]`;
        } else {
          convertedType = `${arrayType}[]`;
        }
      } else {
        convertedType = type;
      }

      let convertedName = '';
      if (name.startsWith('get')) {
        const replacedName = name.replace('get', '').replace('()', '');
        convertedName = replacedName[0].toLowerCase() + replacedName.slice(1);
      } else {
        convertedName = name;
      }

      outputValue.push(`  ${convertedName}: ${convertedType};`);
    }

    outputValue.push('}');
    setOutput(outputValue.join('\n'));
  };

  const handleEnumConvert = (lines: string[]) => {
    for (const line of lines) {
    }
  };

  const convert = () => {
    const intputValue = input();
    if (intputValue) {
      if (!intputValue.includes('\n')) {
        setError("The input doesn't contains any line return, please format it correctly");
        return;
      }

      const lines = intputValue.split('\n');
      if (lines[0].includes('class')) {
        handleClassConvert(lines);
      } else if (lines[0].includes('enum')) {
        handleEnumConvert(lines);
      } else {
        setError('Cannot detect the type of the input, please format it correctly');
      }
    }
  };

  const copyToClipboard = () => {
    console.log('copyToClipboard');
  };

  return (
    <main class="flex flex-col gap-8 p-8">
      <div>
        <h1 class="text-center text-4xl font-bold">Convert Java class to Typescript type</h1>
        <h2 class="text-center font-bold text-muted-foreground">And also Java enum to Typescript const enum</h2>
      </div>
      <div class="relative flex h-[35rem] gap-8">
        <Textarea
          placeholder='Copy your java class/enum here, for example:
          public class CustomerModel {
            private String customerId;
            private CustomerType customerType;
            private String firstName;
            private String lastName;
            private Long age;
            private Boolean isAdult = false;
            private List<AddressModel> addresses = new ArrayList<AddressModel>();
            private List<String> phoneNumbers = new ArrayList<String>();
          
            public String getDisplayName() {
              return this.firstName + " " + this.lastName;
            }
          }'
          onChange={(e) => setInput(e.target.value)}
        />
        <div class="flex flex-col justify-center">
          <Button variant="outline" size="lg" onClick={convert}>
            GO
          </Button>
        </div>
        <Textarea value={output()} placeholder="Typescript output" />
        <Button class="absolute right-2 top-2" variant="ghost" size="icon" onClick={copyToClipboard}>
          C
        </Button>
      </div>
      <Show when={error()}>
        <p class="text-center text-destructive">{error()}</p>
      </Show>
    </main>
  );
};
