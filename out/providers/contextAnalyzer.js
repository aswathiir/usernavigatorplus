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
exports.ContextAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ContextAnalyzer {
    constructor() {
        this.currentContext = {};
        this.workspaceContext = {};
        this.disposables = [];
    }
    async initialize() {
        this.setupEventListeners();
        await this.analyzeCurrentEditor();
        await this.analyzeWorkspace();
    }
    setupEventListeners() {
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (editor) {
                await this.analyzeEditor(editor);
            }
        }), vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (vscode.window.activeTextEditor?.document === event.document) {
                await this.analyzeDocumentChanges(event.document);
            }
        }), vscode.workspace.onDidChangeWorkspaceFolders(async () => {
            await this.analyzeWorkspace();
        }));
    }
    async analyzeCurrentEditor() {
        if (vscode.window.activeTextEditor) {
            await this.analyzeEditor(vscode.window.activeTextEditor);
        }
    }
    async analyzeEditor(editor) {
        this.currentContext = {
            language: editor.document.languageId,
            filePath: editor.document.fileName,
            hasErrors: await this.detectErrors(editor.document),
            hasWarnings: await this.detectWarnings(editor.document),
            dependencies: await this.detectDependencies(editor.document),
            activeEditor: editor
        };
    }
    async analyzeDocumentChanges(document) {
        this.currentContext.hasErrors = await this.detectErrors(document);
        this.currentContext.hasWarnings = await this.detectWarnings(document);
    }
    async analyzeWorkspace() {
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
    async detectProjectType(workspacePath) {
        try {
            const files = await fs.readdir(workspacePath);
            if (files.includes('package.json'))
                return 'node';
            if (files.some(f => f.endsWith('.py') || files.includes('requirements.txt') || files.includes('pyproject.toml')))
                return 'python';
            if (files.some(f => f.endsWith('.csproj')))
                return 'dotnet';
            return 'unknown';
        }
        catch {
            return 'unknown';
        }
    }
    async detectDependencies(document) {
        // Implement actual dependency detection logic
        return [];
    }
    async detectErrors(document) {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Error);
    }
    async detectWarnings(document) {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Warning);
    }
    async detectPythonVenv(workspacePath) {
        try {
            const files = await fs.readdir(workspacePath);
            return files.some(f => f.includes('venv') || f.includes('.venv') || f === 'pyvenv.cfg');
        }
        catch {
            return false;
        }
    }
    async pathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    getCurrentContext() {
        return { ...this.currentContext };
    }
    getWorkspaceContext() {
        return { ...this.workspaceContext };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ContextAnalyzer = ContextAnalyzer;
//# sourceMappingURL=contextAnalyzer.js.map