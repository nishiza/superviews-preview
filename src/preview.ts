'use strict';
import * as vscode from "vscode";
import * as sanitize from "sanitize-html";
import {scheme, title, superview} from "./global";
import * as packageInfo from "../package.json";

export class Preview {
    static get id(): string {
        return packageInfo.contributes.commands.find(command => command.id === Preview.name).command;
    }

    static makeCommandHandler(context: vscode.ExtensionContext): (...args: any[]) => any {
        return async (resource) => {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (editor.document.languageId !== 'html') {
                return;
            }

            const uri = resource instanceof vscode.Uri ? resource : editor.document.uri;
            const viewColumn = editor.viewColumn;

            const showOptions = {viewColumn: viewColumn, preserveFocus: true};
            const panel = await vscode.window.createWebviewPanel(scheme, title, showOptions);

            const sanitizing = async (resource: vscode.Uri): Promise<string> => {
                const result = await superview(resource);
                return Promise.resolve(`<pre><code>${sanitize(result)}</code></pre>`);
            };

            panel.webview.html = await sanitizing(uri);

            const d = vscode.workspace.onDidChangeTextDocument(async (e) => {
                if (e.document.uri == uri) {
                    panel.webview.html = await sanitizing(uri);
                }
            });

            panel.onDidDispose((e) => {
                if (d) {
                    d.dispose();
                }
            }, null, context.subscriptions);
        }
    }
}