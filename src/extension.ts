// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getTargetChar({ subscriptions }: vscode.ExtensionContext): Promise<string> {
  return new Promise(resolve => {
    const targetCharTrap = vscode.commands.registerCommand('type', e => {
      targetCharTrap.dispose();
      resolve(e.text);
    });
    subscriptions.push(targetCharTrap);
  });
}

const matchingPair = (char: string) => {
  switch (char) {
    case "'":
      return char;
    case '"':
      return char;
    case '(':
      return ')';
    case '{':
      return '}';
    case '[':
      return ']';
    default:
      undefined;
  }
};

// TODO: manage recursive character like (afjfk())
// TODO: reports errors to user, add settings to enable silent fail ??
// TODO: ignore escaped character like "jflskjf\"fjdslf\"jfsdlf"
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('delete-inside.delete-inside', async () => {
    let editor = vscode.window.activeTextEditor;
    if (!editor) return;
    if (!editor.selection.isEmpty) return;

    const targetChar = await getTargetChar(context);
    const matchingChar = matchingPair(targetChar);
    if (!matchingChar) return; // Char not supported

    // Do search in async  ?? need big files to test it
    let startIndex: vscode.Position | undefined;
    let startLine = editor.selection.start.line;
    while (startLine >= 0 && !startIndex) {
      const lineContent = editor.document.lineAt(startLine).text;
      let startSearchAt;
      if (startLine === editor.selection.start.line)
        startSearchAt = editor.selection.start.character;
      const index = lineContent.lastIndexOf(targetChar, startSearchAt);
      if (index >= 0) startIndex = new vscode.Position(startLine, index + 1);
      startLine--;
    }
    if (!startIndex) return; // character not found

    let endIndex: vscode.Position | undefined;
    let endLine = editor.selection.start.line;
    while (endLine < editor.document.lineCount && !endIndex) {
      const lineContent = editor.document.lineAt(endLine).text;
      let startSearchAt;
      if (endLine === editor.selection.start.line) startSearchAt = editor.selection.start.character;

      const index = lineContent.indexOf(matchingChar, startSearchAt);
      if (index >= 0) endIndex = new vscode.Position(endLine, index);
      endLine++;
    }
    if (!endIndex) return; // character not found

    editor.edit(editBuilder => {
      if (!endIndex || !startIndex) return; // to shutup typescript compiler
      editBuilder.delete(new vscode.Range(startIndex, endIndex));
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
