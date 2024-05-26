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

    // Filter out unwanted directories
    const filteredEntries = dirEntries.filter(entry => !['node_modules', '.git','env'].includes(entry.name));

    let result = '';
    filteredEntries.forEach((entry, index) => {
        const isLast = index === filteredEntries.length - 1;
        const newPrefix = prefix + (isLast ? '└── ' : '├── ');

        result += newPrefix + entry.name + '\n';

        if (entry.isDirectory()) {
            const childPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateAsciiTree(path.join(dirPath, entry.name), childPrefix);
        }
    });
    return result;
}
