declare module 'package.json' {
  const value: { contributes: Contributes };
  export default value;
}

interface Contributes {
  commands: command[];
}

interface command {
  id: string;
  command: string;
  title: string;
}
