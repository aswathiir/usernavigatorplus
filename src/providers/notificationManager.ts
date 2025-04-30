import * as vscode from 'vscode';
import { ContextAnalyzer } from './contextAnalyzer';
import { Notification, NotificationAction } from '../types';

export class NotificationManager {
    private disposables: vscode.Disposable[] = [];
    private shownNotifications = new Set<string>();
    private notificationQueue: Notification[] = [];
    private isProcessingQueue = false;

    constructor(private readonly contextAnalyzer: ContextAnalyzer) {}

    async initialize(): Promise<void> {
        this.registerNotifications();
        this.setupEventListeners();
        this.startNotificationQueue();
    }

    private registerNotifications(): void {
        this.notificationQueue.push(
            {
                id: 'gitNotification',
                message: 'This workspace is not a Git repository. Would you like to initialize one?',
                actions: [
                    { title: 'Initialize Git', command: 'git.init' },
                    { title: 'Learn More', url: 'https://git-scm.com/doc' },
                    { title: 'Dismiss' }
                ],
                condition: async () => {
                    const context = this.contextAnalyzer.getWorkspaceContext();
                    return !context.hasGit && !!context.workspaceFolders?.length;
                }
            },
            {
                id: 'venvNotification',
                message: 'Python virtual environment not detected. For better dependency management, consider creating one.',
                actions: [
                    { title: 'Create Virtual Env', command: 'python.createTerminal' },
                    { title: 'Python Docs', url: 'https://docs.python.org/3/tutorial/venv.html' },
                    { title: 'Dismiss' }
                ],
                condition: async () => {
                    const editorContext = this.contextAnalyzer.getCurrentContext();
                    const workspaceContext = this.contextAnalyzer.getWorkspaceContext();
                    return editorContext.language === 'python' && !workspaceContext.hasVenv;
                }
            }
            // Add more notifications as needed
        );
    }

    private setupEventListeners(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('userNavigatorPlus.notificationDelay')) {
                    this.startNotificationQueue();
                }
            })
        );
    }

    private async startNotificationQueue(): Promise<void> {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        const delay = config.get<number>('notificationDelay', 3000);

        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            if (!notification || this.shownNotifications.has(notification.id)) continue;

            const shouldShow = await notification.condition();
            if (shouldShow) {
                await this.showNotification(notification);
                this.shownNotifications.add(notification.id);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        this.isProcessingQueue = false;
    }

    private async showNotification(notification: Notification): Promise<void> {
        const actions = notification.actions.map(a => a.title);
        const result = await vscode.window.showInformationMessage(
            notification.message,
            ...actions
        );

        if (!result) return;

        const selectedAction = notification.actions.find(a => a.title === result);
        if (!selectedAction) return;

        if (selectedAction.command) {
            vscode.commands.executeCommand(selectedAction.command);
        } else if (selectedAction.url) {
            vscode.env.openExternal(vscode.Uri.parse(selectedAction.url));
        }
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}