'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as superviews from 'superviews.js';
import * as sanitize from 'sanitize-html';
import {TextDocumentShowOptions, WebviewPanelOptions} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const scheme = 'superviews-preview';
    const title = 'Superviews Preview';

    const superview = async (source: vscode.Uri): Promise<string> => {
                    const config = vscode.workspace.getConfiguration('superviews');
                    const mode = config.get('mode');
                    const document = await vscode.workspace.openTextDocument(source);
                    const text = await document.getText();
                    return superviews(text, undefined, undefined, mode);
                };

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showSuperviewsPreview', async resource => {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (editor.document.languageId !== 'html') {
                return;
            }

            const uri = resource instanceof vscode.Uri ? resource : editor.document.uri;
            const viewColumn = editor.viewColumn;

            const showOptions = { viewColumn: viewColumn, preserveFocus: true };
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
        })
    );

    const provider = new class implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        get onDidChange(): vscode.Event<vscode.Uri>  {
            return this._onDidChange.event;
        }

        provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
            const resource = vscode.Uri.parse(uri.fragment);
            return superview(resource);
        }

        public update(resource: vscode.Uri) {
            this._onDidChange.fire(resource);
        }
    };

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, provider));

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showSuperviewsPreviewInEditor', async resource => {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (editor.document.languageId != 'html') {
                return;
            }

            const uri = resource instanceof vscode.Uri ? resource : editor.document.uri;
            const viewColumn = editor.viewColumn;

            const encapsulated = uri.with({ scheme: scheme, fragment: uri.toString() });

            const document = await vscode.workspace.openTextDocument(encapsulated);
            vscode.languages.setTextDocumentLanguage(document, 'javascript');


            const options: TextDocumentShowOptions = {viewColumn: viewColumn, preview: true};
            const textEditor = await vscode.window.showTextDocument(document, options);

            const d = vscode.workspace.onDidChangeTextDocument(async (e) => {
                if (e.document.uri == uri) {
                    provider.update(encapsulated);
                }
            });

            vscode.workspace.onDidCloseTextDocument(async (e) => {
                if (e.uri == uri) {
                }
            });
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}

