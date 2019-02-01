'use strict';
import * as vscode from 'vscode';
import {Preview} from "./preview";
import {PreviewInEditor} from "./previewInEditor";

// https://code.visualstudio.com/api/references/activation-events
// noinspection JSUnusedGlobalSymbols
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand(Preview.id, Preview.makeCommandHandler(context)));

    context.subscriptions.push(vscode.commands.registerCommand(PreviewInEditor.id, PreviewInEditor.makeCommandHandler(context)));
}
