'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as superviews from 'superviews.js';
import * as sanitize from 'sanitize-html';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const scheme = 'superviews-preview';

    const superview = async (source: vscode.Uri): Promise<string> => {
                    const config = vscode.workspace.getConfiguration('superviews');
                    const mode = config.get('mode');
                    const document = await vscode.workspace.openTextDocument(source);
                    const text = await document.getText();
                    const result = superviews(text, undefined, undefined, mode);
                    return `<pre><code>${sanitize(result, {  })}</code></pre>`;
                };

    const disposable = vscode.commands.registerCommand('extension.showSuperviewsPreview', async resource => {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }

        if (editor.document.languageId != 'html') {
            return;
        }

        const uri = resource instanceof vscode.Uri ? resource : editor.document.uri;
        const viewColumn = editor.viewColumn;
       
        const panel = await vscode.window.createWebviewPanel(scheme, 'Superviews Preview', { viewColumn: viewColumn, preserveFocus: true });

        panel.webview.html = await superview(uri);

        const d = vscode.workspace.onDidChangeTextDocument(async (e: vscode.TextDocumentChangeEvent) => {
            if (e.document.uri == uri) {
                panel.webview.html = await superview(uri)
            }
        });

        panel.onDidDispose((e) => {
            if (d) {
                d.dispose();
            }
        }, null, context.subscriptions);

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

