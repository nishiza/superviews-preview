import * as vscode from 'vscode';

declare module 'package.json' {
  const value: { contribusions: Contributes };
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
