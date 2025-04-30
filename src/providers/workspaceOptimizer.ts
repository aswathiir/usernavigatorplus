import * as vscode from 'vscode';
import { ContextAnalyzer } from './contextAnalyzer';

export class WorkspaceOptimizer {
    private disposables: vscode.Disposable[] = [];

    constructor(private readonly contextAnalyzer: ContextAnalyzer) {}

    async initialize(): Promise<void> {
        this.setupEventListeners();
        await this.checkWorkspaceOptimization();
    }

    private setupEventListeners(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                this.checkWorkspaceOptimization();
            }),
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.checkWorkspaceOptimization();
            })
        );
    }

    private async checkWorkspaceOptimization(): Promise<void> {
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        const editorContext = this.contextAnalyzer.getCurrentContext();

        if (!workspaceContext.workspaceFolders?.length) return;

        // Check for recommended extensions
        if (workspaceContext.projectType === 'node' && 
            !this.hasExtension('dbaeumer.vscode-eslint')) {
            this.suggestExtension('ESLint', 'dbaeumer.vscode-eslint');
        }

        if (editorContext.language === 'python' && 
            !this.hasExtension('ms-python.python')) {
            this.suggestExtension('Python', 'ms-python.python');
        }
    }

    private hasExtension(extensionId: string): boolean {
        return vscode.extensions.getExtension(extensionId) !== undefined;
    }

    private suggestExtension(name: string, extensionId: string): void {
        vscode.window.showInformationMessage(
            `For better ${name} support, consider installing the ${name} extension.`,
            'Install',
            'Dismiss'
        ).then(selection => {
            if (selection === 'Install') {
                vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
            }
        });
    }

    public getOptimizationTips(): string[] {
        const tips: string[] = [];
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        const editorContext = this.contextAnalyzer.getCurrentContext();

        if (workspaceContext.projectType === 'node') {
            tips.push('Consider organizing your Node.js project with a clear src/ and test/ structure.');
            if (!workspaceContext.hasNodeModules) {
                tips.push('Your project seems to be missing node_modules. Run "npm install" to install dependencies.');
            }
        } else if (workspaceContext.projectType === 'python') {
            tips.push('Python projects benefit from a clear separation of source code and tests.');
            if (!workspaceContext.hasVenv) {
                tips.push('Consider using a virtual environment for better dependency management.');
            }
        }

        if (!workspaceContext.hasGit) {
            tips.push('Using version control (Git) is recommended for all projects.');
        }

        if (editorContext.language === 'typescript' && !this.hasExtension('ms-vscode.vscode-typescript-next')) {
            tips.push('For better TypeScript support, consider installing the TypeScript Nightly extension.');
        }

        return tips;
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}