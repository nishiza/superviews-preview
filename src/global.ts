import * as vscode from "vscode";
import * as superviews from 'superviews.js';

export
const scheme = 'superviews-preview';

export
const title = 'Superviews Preview';

export
async function superview(source: vscode.Uri): Promise<string> {
    const config = vscode.workspace.getConfiguration('superviews');
    const mode = config.get('mode');
    const document = await vscode.workspace.openTextDocument(source);
    const text = await document.getText();
    return superviews(text, undefined, undefined, mode);
}
