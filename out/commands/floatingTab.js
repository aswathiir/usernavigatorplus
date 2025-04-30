"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingTabManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
class FloatingTabManager {
    constructor(context, contextAnalyzer) {
        this.context = context;
        this.contextAnalyzer = contextAnalyzer;
        this.viewType = 'userNavigator.floatingTab';
        this.disposables = [];
        this.lastShownContext = null;
    }
    async initialize() {
        this.registerCommands();
        this.setupEventListeners();
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('userNavigatorPlus.showFloatingTab', () => {
            this.showFloatingTab('manual');
        }));
    }
    setupEventListeners() {
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(async (e) => {
            if (this.shouldShowForDocument(e.document)) {
                await this.showContextualFloatingTab(e.document);
            }
        }), vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (editor && this.shouldShowForDocument(editor.document)) {
                await this.showContextualFloatingTab(editor.document);
            }
        }));
    }
    shouldShowForDocument(document) {
        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        return config.get('enableFloatingTabs', true) &&
            document === vscode.window.activeTextEditor?.document;
    }
    async showContextualFloatingTab(document) {
        const issueType = await this.detectIssueType(document);
        if (issueType && issueType !== this.lastShownContext) {
            this.lastShownContext = issueType;
            this.showFloatingTab(issueType);
        }
    }
    async detectIssueType(document) {
        const editorContext = this.contextAnalyzer.getCurrentContext();
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        if (editorContext.hasErrors)
            return 'errors';
        if (editorContext.hasWarnings)
            return 'warnings';
        if (!workspaceContext.hasNodeModules &&
            (document.languageId === 'javascript' || document.languageId === 'typescript')) {
            return 'missingNodeModules';
        }
        if (!workspaceContext.hasVenv && document.languageId === 'python') {
            return 'missingVenv';
        }
        return null;
    }
    async showFloatingTab(context) {
        if (this.currentPanel) {
            this.currentPanel.reveal();
        }
        else {
            this.currentPanel = vscode.window.createWebviewPanel(this.viewType, 'User Navigator Guidance', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
                enableScripts: true,
                localResourceRoots: [this.context.extensionUri],
                retainContextWhenHidden: true
            });
            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
                this.lastShownContext = null;
            });
            this.currentPanel.webview.onDidReceiveMessage(message => this.handleWebviewMessage(message), undefined, this.context.subscriptions);
        }
        const content = await this.getWebviewContent(context);
        this.currentPanel.webview.html = content;
    }
    async getWebviewContent(context) {
        const templatePath = vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webviews', `${context}.html`);
        try {
            const template = await fs.readFile(templatePath.fsPath, 'utf-8');
            const nonce = this.getNonce();
            const stylesUri = this.currentPanel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webviews', 'base.css'));
            return template
                .replace(/{{nonce}}/g, nonce)
                .replace(/{{stylesUri}}/g, stylesUri.toString())
                .replace(/{{cspSource}}/g, this.currentPanel.webview.cspSource);
        }
        catch (error) {
            console.error('Failed to load webview template:', error);
            return this.getErrorWebviewContent();
        }
    }
    handleWebviewMessage(message) {
        switch (message.command) {
            case 'execute':
                vscode.commands.executeCommand(message.value);
                break;
            case 'openUrl':
                vscode.env.openExternal(vscode.Uri.parse(message.value));
                break;
        }
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    getErrorWebviewContent() {
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
    dispose() {
        this.currentPanel?.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.FloatingTabManager = FloatingTabManager;
//# sourceMappingURL=floatingTab.js.map