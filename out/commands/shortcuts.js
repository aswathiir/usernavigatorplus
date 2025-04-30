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
exports.ShortcutManager = void 0;
const vscode = __importStar(require("vscode"));
class ShortcutManager {
    constructor(context, contextAnalyzer) {
        this.context = context;
        this.contextAnalyzer = contextAnalyzer;
        this.disposables = [];
        this.lastShortcuts = [];
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'userNavigatorPlus.showShortcuts';
        this.statusBarItem.tooltip = 'Show contextual shortcuts';
        this.statusBarItem.text = '$(keyboard) Shortcuts';
    }
    async initialize() {
        this.registerCommands();
        this.setupEventListeners();
        this.updateShortcutSuggestions();
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('userNavigatorPlus.showShortcuts', () => {
            this.showContextualShortcuts();
        }));
    }
    setupEventListeners() {
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(() => {
            this.updateShortcutSuggestions();
        }), vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('userNavigatorPlus.shortcutSuggestions')) {
                this.updateShortcutSuggestions();
            }
        }));
    }
    updateShortcutSuggestions() {
        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        if (!config.get('shortcutSuggestions', true)) {
            this.statusBarItem.hide();
            return;
        }
        const editorContext = this.contextAnalyzer.getCurrentContext();
        if (editorContext.language) {
            this.statusBarItem.show();
        }
        else {
            this.statusBarItem.hide();
        }
    }
    async showContextualShortcuts() {
        const shortcuts = await this.getContextualShortcuts();
        this.lastShortcuts = shortcuts;
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = 'Contextual Shortcuts';
        quickPick.placeholder = 'Select a shortcut to execute';
        quickPick.items = shortcuts.map(shortcut => ({
            label: shortcut.command,
            description: shortcut.keybinding,
            detail: shortcut.description
        }));
        quickPick.onDidChangeSelection(selection => {
            if (selection[0]) {
                vscode.commands.executeCommand(selection[0].label);
            }
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    }
    async getContextualShortcuts() {
        const editorContext = this.contextAnalyzer.getCurrentContext();
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
        const shortcuts = [
            {
                command: 'workbench.action.quickOpen',
                keybinding: 'Ctrl+P',
                description: 'Quick open files'
            },
            {
                command: 'workbench.action.showCommands',
                keybinding: 'Ctrl+Shift+P',
                description: 'Show all commands'
            }
        ];
        // Language-specific shortcuts
        if (editorContext.language === 'javascript' || editorContext.language === 'typescript') {
            shortcuts.push({
                command: 'editor.action.goToReferences',
                keybinding: 'Shift+F12',
                description: 'Find all references'
            }, {
                command: 'editor.action.revealDefinition',
                keybinding: 'F12',
                description: 'Go to definition'
            });
            if (workspaceContext.projectType === 'node') {
                shortcuts.push({
                    command: 'npm-script.run',
                    keybinding: 'Ctrl+R Ctrl+R',
                    description: 'Run npm script'
                });
            }
        }
        else if (editorContext.language === 'python') {
            shortcuts.push({
                command: 'python.runSelectionInTerminal',
                keybinding: 'Shift+Enter',
                description: 'Run selection in Python terminal'
            }, {
                command: 'python.selectInterpreter',
                keybinding: 'Ctrl+Shift+P → Python: Select Interpreter',
                description: 'Select Python interpreter'
            });
        }
        // Add more context-specific shortcuts as needed
        return shortcuts;
    }
    dispose() {
        this.statusBarItem.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ShortcutManager = ShortcutManager;
//# sourceMappingURL=shortcuts.js.map