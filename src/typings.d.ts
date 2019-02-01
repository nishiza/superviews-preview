declare module 'package.json' {
  const value: { contributes: Contributes };
  // noinspection JSUnusedGlobalSymbols
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
