'use strict';
import * as vscode from 'vscode';
import {Preview} from "./preview";
import {PreviewInEditor} from "./previewInEditor";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand(Preview.id, Preview.makeCommandHandler(context)));

    context.subscriptions.push(vscode.commands.registerCommand(PreviewInEditor.id, PreviewInEditor.makeCommandHandler(context)));
}
