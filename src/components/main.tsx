import { createSignal, Show, type Component } from 'solid-js';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { CopyIcon, InfoIcon } from './common/icons';

export const Main: Component = () => {
  const [input, setInput] = createSignal('');
  const [output, setOutput] = createSignal('');
  const [error, setError] = createSignal('');
  const [showInfo, setShowInfo] = createSignal(false);

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
        outputValue.push(`export type ${name} = {`);
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
    const outputValue: string[] = [];
    let enumName = '';

    for (let line of lines) {
      line = line.trim().replace(',', '').replace('}', '');
      if (!line) {
        continue;
      }

      if (line.includes('enum')) {
        const words = line.split(' ');
        if (words.length < 3) {
          setError(`The line "${line}" is not valid, please format it correctly`);
          return;
        }
        enumName = words[2];
        outputValue.push(`export const ${enumName}Enum = {`);
        continue;
      }

      outputValue.push(`  ${line}: "${line}",`);
    }

    outputValue.push('} as const;');
    outputValue.push(`export type ${enumName} = EnumValues<typeof ${enumName}Enum>;`);
    setOutput(outputValue.join('\n'));
  };

  const convert = () => {
    setError('');
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output());
  };

  return (
    <main class="flex h-fit flex-col gap-8 p-8">
      <div>
        <h1 class="text-center text-4xl font-bold">Convert Java class to Typescript type</h1>
        <h2 class="text-center font-bold text-muted-foreground">And also Java enum to Typescript const enum</h2>
      </div>
      <div class="relative flex h-fit gap-8">
        <Textarea
          name="input"
          class="h-[35rem] min-h-[35rem]"
          placeholder='Copy your java class/enum here, for example:
          public class CustomerModel {
            private String customerId;
            private CustomerType customerType;
            private String firstName;
            private String lastName;
            private Long age;
            private Boolean isVerified = false;
            private List<AddressModel> addresses = new ArrayList<AddressModel>();
            private List<String> phoneNumbers = new ArrayList<String>();
          
            public String getDisplayName() {
              return this.firstName + " " + this.lastName;
            }
          }'
          onChange={(e) => setInput(e.target.value)}
        />
        <div class="flex h-[35rem] flex-col justify-center">
          <Button size="lg" onClick={convert} aria-label="go" class="transition-none">
            GO
          </Button>
        </div>
        <div class="relative h-fit w-full">
          <Textarea name="output" value={output()} placeholder="Typescript output" class="h-[35rem] min-h-[35rem]" />
          <Button
            aria-label="copy"
            class="absolute bottom-2 right-2 transition-none"
            variant="ghost"
            size="icon"
            onClick={() => void copyToClipboard()}
          >
            <CopyIcon class="h-6 w-6" />
          </Button>
          <Button
            aria-label="info"
            class="absolute bottom-2 right-12 transition-none"
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <InfoIcon class="h-6 w-6" />
          </Button>
        </div>
      </div>
      <Show when={showInfo()}>
        <div class="relative top-[-30px] flex justify-end">
          <span class="text-sm text-muted-foreground">
            Copy this type if you don't already have it for the enums:{' '}
            <span class="font-bold">{'export type EnumValues<T> = T[keyof T];'}</span>
          </span>
        </div>
      </Show>
      <Show when={error()}>
        <p class="text-center text-destructive">{error()}</p>
      </Show>
    </main>
  );
};
