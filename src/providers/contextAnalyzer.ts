import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EditorContext, WorkspaceContext } from '../types';

export class ContextAnalyzer {
    private currentContext: EditorContext = {};
    private workspaceContext: WorkspaceContext = {};
    private disposables: vscode.Disposable[] = [];

    async initialize(): Promise<void> {
        this.setupEventListeners();
        await this.analyzeCurrentEditor();
        await this.analyzeWorkspace();
    }

    private setupEventListeners(): void {
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(async editor => {
                if (editor) {
                    await this.analyzeEditor(editor);
                }
            }),
            vscode.workspace.onDidChangeTextDocument(async event => {
                if (vscode.window.activeTextEditor?.document === event.document) {
                    await this.analyzeDocumentChanges(event.document);
                }
            }),
            vscode.workspace.onDidChangeWorkspaceFolders(async () => {
                await this.analyzeWorkspace();
            })
        );
    }

    private async analyzeCurrentEditor(): Promise<void> {
        if (vscode.window.activeTextEditor) {
            await this.analyzeEditor(vscode.window.activeTextEditor);
        }
    }

    private async analyzeEditor(editor: vscode.TextEditor): Promise<void> {
        this.currentContext = {
            language: editor.document.languageId,
            filePath: editor.document.fileName,
            hasErrors: await this.detectErrors(editor.document),
            hasWarnings: await this.detectWarnings(editor.document),
            dependencies: await this.detectDependencies(editor.document),
            activeEditor: editor
        };
    }

    private async analyzeDocumentChanges(document: vscode.TextDocument): Promise<void> {
        this.currentContext.hasErrors = await this.detectErrors(document);
        this.currentContext.hasWarnings = await this.detectWarnings(document);
    }

    private async analyzeWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.workspaceContext = {};
            return;
        }

        const primaryFolder = workspaceFolders[0].uri.fsPath;
        this.workspaceContext = {
            projectType: await this.detectProjectType(primaryFolder),
            hasNodeModules: await this.pathExists(path.join(primaryFolder, 'node_modules')),
            hasVenv: await this.detectPythonVenv(primaryFolder),
            hasGit: await this.pathExists(path.join(primaryFolder, '.git')),
            workspaceFolders: [...workspaceFolders]
        };
    }

    private async detectProjectType(workspacePath: string): Promise<'node' | 'python' | 'dotnet' | 'unknown'> {
        try {
            const files = await fs.readdir(workspacePath);
            
            if (files.includes('package.json')) return 'node';
            if (files.some(f => f.endsWith('.py') || files.includes('requirements.txt') || files.includes('pyproject.toml'))) return 'python';
            if (files.some(f => f.endsWith('.csproj'))) return 'dotnet';
            
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    private async detectDependencies(document: vscode.TextDocument): Promise<string[]> {
        // Implement actual dependency detection logic
        return [];
    }

    private async detectErrors(document: vscode.TextDocument): Promise<boolean> {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Error);
    }

    private async detectWarnings(document: vscode.TextDocument): Promise<boolean> {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Warning);
    }

    private async detectPythonVenv(workspacePath: string): Promise<boolean> {
        try {
            const files = await fs.readdir(workspacePath);
            return files.some(f => f.includes('venv') || f.includes('.venv') || f === 'pyvenv.cfg');
        } catch {
            return false;
        }
    }

    private async pathExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    getCurrentContext(): EditorContext {
        return { ...this.currentContext };
    }

    getWorkspaceContext(): WorkspaceContext {
        return { ...this.workspaceContext };
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}