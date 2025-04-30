import * as vscode from 'vscode';
import { ContextAnalyzer } from './providers/contextAnalyzer';
import { ShortcutManager } from './commands/shortcuts';
import { FloatingTabManager } from './commands/floatingTab';
import { NotificationManager } from './providers/notificationManager';
import { WorkspaceOptimizer } from './providers/workspaceOptimizer';

export async function activate(context: vscode.ExtensionContext) {
    try {
        const contextAnalyzer = new ContextAnalyzer();
        const shortcutManager = new ShortcutManager(context, contextAnalyzer);
        const floatingTabManager = new FloatingTabManager(context, contextAnalyzer);
        const notificationManager = new NotificationManager(contextAnalyzer);
        const workspaceOptimizer = new WorkspaceOptimizer(contextAnalyzer);

        // Initialize all components
        await Promise.all([
            contextAnalyzer.initialize(),
            shortcutManager.initialize(),
            floatingTabManager.initialize(),
            notificationManager.initialize(),
            workspaceOptimizer.initialize()
        ]);

        console.log('User Navigator Plus is now active!');
    } catch (error) {
        console.error('Extension activation failed:', error);
        vscode.window.showErrorMessage(
            'User Navigator Plus failed to initialize. Please check the output logs.'
        );
    }
}

export function deactivate() {
    // Clean up resources if needed
}