import * as vscode from 'vscode';

export interface EditorContext {
    language?: string;
    filePath?: string;
    hasErrors?: boolean;
    hasWarnings?: boolean;
    dependencies?: string[];
    activeEditor?: vscode.TextEditor;
}

export interface WorkspaceContext {
    projectType?: 'node' | 'python' | 'dotnet' | 'unknown';
    hasNodeModules?: boolean;
    hasVenv?: boolean;
    hasGit?: boolean;
    workspaceFolders?: vscode.WorkspaceFolder[];
}

export interface Shortcut {
    command: string;
    keybinding: string;
    description: string;
    when?: string;
}

export interface Notification {
    id: string;
    message: string;
    actions: NotificationAction[];
    condition: () => boolean | Promise<boolean>;
}

export interface NotificationAction {
    title: string;
    command?: string;
    url?: string;
}