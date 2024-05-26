import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.viewAsAscii', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const rootPath = workspaceFolders[0].uri.fsPath;
            const asciiTree = generateAsciiTree(rootPath);

            const document = await vscode.workspace.openTextDocument({ content: asciiTree, language: 'plaintext' });
            await vscode.window.showTextDocument(document, { preview: false });
        } else {
            vscode.window.showErrorMessage('No workspace folder is open.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function generateAsciiTree(dirPath: string, prefix: string = ''): string {
    const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });
    const entries = dirEntries.filter(entry => entry.name !== 'node_modules').map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory()
    }));

    let result = '';
    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const newPrefix = prefix + (isLast ? '└── ' : '├── ');

        result += newPrefix + entry.name + '\n';

        if (entry.isDirectory) {
            const childPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateAsciiTree(path.join(dirPath, entry.name), childPrefix);
        }
    });
    return result;
}
