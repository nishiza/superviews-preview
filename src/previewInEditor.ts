'use strict';
import * as vscode from "vscode";
import {scheme, superview} from "./global";
import * as packageInfo from "../package.json";

export class PreviewInEditor {
    static get id(): string {
        return packageInfo.contributes.commands.find(command => command.id === PreviewInEditor.name).command;
    }

    static makeCommandHandler(context: vscode.ExtensionContext): (...args: any[]) => any {

        const provider = new class implements vscode.TextDocumentContentProvider {
            private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

            get onDidChange(): vscode.Event<vscode.Uri> {
                return this._onDidChange.event;
            }

            provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
                const resource = vscode.Uri.parse(uri.fragment);
                return superview(resource);
            }

            public update(resource: vscode.Uri) {
                this._onDidChange.fire(resource);
            }
        }();

        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, provider));

        return async resource => {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (editor.document.languageId != 'html') {
                return;
            }

            const uri = resource instanceof vscode.Uri ? resource : editor.document.uri;
            const viewColumn = editor.viewColumn;

            const encapsulated = uri.with({scheme: scheme, fragment: uri.toString()});

            const document = await vscode.workspace.openTextDocument(encapsulated);
            vscode.languages.setTextDocumentLanguage(document, 'javascript');


            const options: vscode.TextDocumentShowOptions = {viewColumn: viewColumn, preview: true};
            const textEditor = await vscode.window.showTextDocument(document, options);

            const d = vscode.workspace.onDidChangeTextDocument(async (e) => {
                if (e.document.uri == uri) {
                    provider.update(encapsulated);
                }
            });

            vscode.workspace.onDidCloseTextDocument(async (e) => {
                if (e.uri == uri) {
                    // vscode.window.closeTextDocument(document);
                }
            });
        }
    }
}