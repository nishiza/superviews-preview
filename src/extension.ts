'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as superviews from 'superviews.js';
import * as sanitize from 'sanitize-html';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "superviews-preview" is now active!');

    class SuperviewsResultProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

        public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

        public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
            let editor = vscode.window.activeTextEditor;
            if (!(editor.document.languageId === 'html')) {
				return '<code>unsupported format.</code>'
			}

            let configuration = vscode.workspace.getConfiguration('superviews');
            let mode = configuration.get('mode');
            let result = superviews(editor.document.getText(), undefined, undefined, mode);
            let escaped = sanitize(result);
            return `<pre><code>${escaped}</code></pre>`;
        }
    }

    let scheme = 'superviews-preview';
    let previewUri = vscode.Uri.parse(`${scheme}://authority/superviews-preview`);
    let provider = new SuperviewsResultProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider(scheme, provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

    let disposable = vscode.commands.registerCommand('extension.showSuperviewsPreview', () => {
		return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Superviews.js Preview').then((success) => {
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
	});

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
