type ClassValue = string | number | boolean | undefined | null;
type ClassObject = { [key: string]: any };
type ClassArray = ClassValue[];
type ClassInput = ClassValue | ClassObject | ClassArray;

export function cn(...inputs: ClassInput[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.filter(Boolean).join(' ');
}