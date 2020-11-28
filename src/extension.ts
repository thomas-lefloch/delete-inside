// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getTargetChar({ subscriptions }: vscode.ExtensionContext): Promise<String> {
  return new Promise(resolve => {
    const targetCharTrap = vscode.commands.registerCommand('type', e => {
      targetCharTrap.dispose();
      resolve(e.text);
    });
    subscriptions.push(targetCharTrap);
  });
}

export function activate(context: vscode.ExtensionContext) {
  //
  let disposable = vscode.commands.registerCommand('delete-inside.delete', async () => {
    let targetChar = await getTargetChar(context);
    vscode.window.showInformationMessage('target char: ' + targetChar);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
