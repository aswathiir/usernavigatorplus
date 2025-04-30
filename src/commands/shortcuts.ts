import * as vscode from 'vscode';
import { ContextAnalyzer } from '../providers/contextAnalyzer';
import { Shortcut } from '../types';

export class ShortcutManager {
    private disposables: vscode.Disposable[] = [];
    private statusBarItem: vscode.StatusBarItem;
    private lastShortcuts: Shortcut[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly contextAnalyzer: ContextAnalyzer
    ) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'userNavigatorPlus.showShortcuts';
        this.statusBarItem.tooltip = 'Show contextual shortcuts';
        this.statusBarItem.text = '$(keyboard) Shortcuts';
    }

    async initialize(): Promise<void> {
        this.registerCommands();
        this.setupEventListeners();
        this.updateShortcutSuggestions();
    }

    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand('userNavigatorPlus.showShortcuts', () => {
                this.showContextualShortcuts();
            })
        );
    }

    private setupEventListeners(): void {
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.updateShortcutSuggestions();
            }),
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('userNavigatorPlus.shortcutSuggestions')) {
                    this.updateShortcutSuggestions();
                }
            })
        );
    }

    private updateShortcutSuggestions(): void {
        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        if (!config.get<boolean>('shortcutSuggestions', true)) {
            this.statusBarItem.hide();
            return;
        }

        const editorContext = this.contextAnalyzer.getCurrentContext();
        if (editorContext.language) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    private async showContextualShortcuts(): Promise<void> {
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

    private async getContextualShortcuts(): Promise<Shortcut[]> {
        const editorContext = this.contextAnalyzer.getCurrentContext();
        const workspaceContext = this.contextAnalyzer.getWorkspaceContext();

        const shortcuts: Shortcut[] = [
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
            shortcuts.push(
                {
                    command: 'editor.action.goToReferences',
                    keybinding: 'Shift+F12',
                    description: 'Find all references'
                },
                {
                    command: 'editor.action.revealDefinition',
                    keybinding: 'F12',
                    description: 'Go to definition'
                }
            );

            if (workspaceContext.projectType === 'node') {
                shortcuts.push(
                    {
                        command: 'npm-script.run',
                        keybinding: 'Ctrl+R Ctrl+R',
                        description: 'Run npm script'
                    }
                );
            }
        } else if (editorContext.language === 'python') {
            shortcuts.push(
                {
                    command: 'python.runSelectionInTerminal',
                    keybinding: 'Shift+Enter',
                    description: 'Run selection in Python terminal'
                },
                {
                    command: 'python.selectInterpreter',
                    keybinding: 'Ctrl+Shift+P → Python: Select Interpreter',
                    description: 'Select Python interpreter'
                }
            );
        }

        // Add more context-specific shortcuts as needed
        return shortcuts;
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}