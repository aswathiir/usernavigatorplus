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
exports.WorkspaceOptimizer = void 0;
const vscode = __importStar(require("vscode"));
class WorkspaceOptimizer {
    constructor(contextAnalyzer) {
        this.contextAnalyzer = contextAnalyzer;
        this.disposables = [];
    }
    async initialize() {
        this.setupEventListeners();
        await this.checkWorkspaceOptimization();
    }
    setupEventListeners() {
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.checkWorkspaceOptimization();
        }), vscode.window.onDidChangeActiveTextEditor(() => {
            this.checkWorkspaceOptimization();
        }));
    }
    async checkWorkspaceOptimization() {
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        const editorContext = this.contextAnalyzer.getCurrentContext();
        if (!workspaceContext.workspaceFolders?.length)
            return;
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
    hasExtension(extensionId) {
        return vscode.extensions.getExtension(extensionId) !== undefined;
    }
    suggestExtension(name, extensionId) {
        vscode.window.showInformationMessage(`For better ${name} support, consider installing the ${name} extension.`, 'Install', 'Dismiss').then(selection => {
            if (selection === 'Install') {
                vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
            }
        });
    }
    getOptimizationTips() {
        const tips = [];
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        const editorContext = this.contextAnalyzer.getCurrentContext();
        if (workspaceContext.projectType === 'node') {
            tips.push('Consider organizing your Node.js project with a clear src/ and test/ structure.');
            if (!workspaceContext.hasNodeModules) {
                tips.push('Your project seems to be missing node_modules. Run "npm install" to install dependencies.');
            }
        }
        else if (workspaceContext.projectType === 'python') {
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
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.WorkspaceOptimizer = WorkspaceOptimizer;
//# sourceMappingURL=workspaceOptimizer.js.map