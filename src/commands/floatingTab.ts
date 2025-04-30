import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ContextAnalyzer } from '../providers/contextAnalyzer';

export class FloatingTabManager {
    private readonly viewType = 'userNavigator.floatingTab';
    private currentPanel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];
    private lastShownContext: string | null = null;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly contextAnalyzer: ContextAnalyzer
    ) {}

    async initialize(): Promise<void> {
        this.registerCommands();
        this.setupEventListeners();
    }

    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand('userNavigatorPlus.showFloatingTab', () => {
                this.showFloatingTab('manual');
            })
        );
    }

    private setupEventListeners(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(async e => {
                if (this.shouldShowForDocument(e.document)) {
                    await this.showContextualFloatingTab(e.document);
                }
            }),
            vscode.window.onDidChangeActiveTextEditor(async editor => {
                if (editor && this.shouldShowForDocument(editor.document)) {
                    await this.showContextualFloatingTab(editor.document);
                }
            })
        );
    }

    private shouldShowForDocument(document: vscode.TextDocument): boolean {
        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        return config.get<boolean>('enableFloatingTabs', true) && 
               document === vscode.window.activeTextEditor?.document;
    }

    private async showContextualFloatingTab(document: vscode.TextDocument): Promise<void> {
        const issueType = await this.detectIssueType(document);
        if (issueType && issueType !== this.lastShownContext) {
            this.lastShownContext = issueType;
            this.showFloatingTab(issueType);
        }
    }

    private async detectIssueType(document: vscode.TextDocument): Promise<string | null> {
        const editorContext = this.contextAnalyzer.getCurrentContext();
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();

        if (editorContext.hasErrors) return 'errors';
        if (editorContext.hasWarnings) return 'warnings';
        if (!workspaceContext.hasNodeModules && 
            (document.languageId === 'javascript' || document.languageId === 'typescript')) {
            return 'missingNodeModules';
        }
        if (!workspaceContext.hasVenv && document.languageId === 'python') {
            return 'missingVenv';
        }

        return null;
    }

    public async showFloatingTab(context: string): Promise<void> {
        if (this.currentPanel) {
            this.currentPanel.reveal();
        } else {
            this.currentPanel = vscode.window.createWebviewPanel(
                this.viewType,
                'User Navigator Guidance',
                { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
                {
                    enableScripts: true,
                    localResourceRoots: [this.context.extensionUri],
                    retainContextWhenHidden: true
                }
            );

            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
                this.lastShownContext = null;
            });

            this.currentPanel.webview.onDidReceiveMessage(
                message => this.handleWebviewMessage(message),
                undefined,
                this.context.subscriptions
            );
        }

        const content = await this.getWebviewContent(context);
        this.currentPanel.webview.html = content;
    }

    private async getWebviewContent(context: string): Promise<string> {
        const templatePath = vscode.Uri.joinPath(
            this.context.extensionUri, 
            'src', 
            'webviews', 
            `${context}.html`
        );

        try {
            const template = await fs.readFile(templatePath.fsPath, 'utf-8');
            const nonce = this.getNonce();
            const stylesUri = this.currentPanel!.webview.asWebviewUri(
                vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webviews', 'base.css')
            );

            return template
                .replace(/{{nonce}}/g, nonce)
                .replace(/{{stylesUri}}/g, stylesUri.toString())
                .replace(/{{cspSource}}/g, this.currentPanel!.webview.cspSource);
        } catch (error) {
            console.error('Failed to load webview template:', error);
            return this.getErrorWebviewContent();
        }
    }

    private handleWebviewMessage(message: any): void {
        switch (message.command) {
            case 'execute':
                vscode.commands.executeCommand(message.value);
                break;
            case 'openUrl':
                vscode.env.openExternal(vscode.Uri.parse(message.value));
                break;
        }
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private getErrorWebviewContent(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
                <title>Error</title>
            </head>
            <body>
                <h1>Error Loading Guidance</h1>
                <p>Failed to load the guidance content. Please try again.</p>
            </body>
            </html>
        `;
    }

    dispose(): void {
        this.currentPanel?.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}