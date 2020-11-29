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

const getMatchingPair = (char: string) => {
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
// TODO: reports errors to user, and add settings to enable silent fail ??
// TODO: ignore escaped character like "jflskjf\"fjdslf\"jfsdlf"
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('delete-inside.delete-inside', async () => {
    let editor = vscode.window.activeTextEditor;
    if (!editor) return;
    if (!editor.selection.isEmpty) return;

    const targetChar = await getTargetChar(context);
    const matchingChar = getMatchingPair(targetChar);
    if (!matchingChar) return; // Character not supported

    // Do search in async  ?? need big files to test it
    let startPosition: vscode.Position | undefined;
    let startLine = editor.selection.start.line;
    let char = editor.selection.start.character;
    let lineContent = editor.document.lineAt(startLine).text;
    while (startLine >= 0 && !startPosition) {
      while (char >= 0 && !startPosition) {
        if (lineContent[char] === targetChar)
          startPosition = new vscode.Position(startLine, char + 1);
        char--;
      }
      startLine--;
      if (startLine >= 0) lineContent = editor.document.lineAt(startLine).text;
    }
    if (!startPosition) return; // character not found

    let endPosition: vscode.Position | undefined;
    let endLine = editor.selection.start.line;
    char = editor.selection.start.character;
    lineContent = editor.document.lineAt(endLine).text;
    while (endLine < editor.document.lineCount && !endPosition) {
      while (char < lineContent.length && !endPosition) {
        if (lineContent[char] === matchingChar) endPosition = new vscode.Position(endLine, char);
        char++;
      }
      endLine++;
      if (endLine < editor.document.lineCount) lineContent = editor.document.lineAt(endLine).text;
    }
    if (!endPosition) return; // matching character not found

    editor.edit(editBuilder => {
      if (!endPosition || !startPosition) return; // to shutup typescript compiler
      editBuilder.delete(new vscode.Range(startPosition, endPosition));
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
