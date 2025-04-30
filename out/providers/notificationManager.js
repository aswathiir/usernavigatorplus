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
exports.NotificationManager = void 0;
const vscode = __importStar(require("vscode"));
class NotificationManager {
    constructor(contextAnalyzer) {
        this.contextAnalyzer = contextAnalyzer;
        this.disposables = [];
        this.shownNotifications = new Set();
        this.notificationQueue = [];
        this.isProcessingQueue = false;
    }
    async initialize() {
        this.registerNotifications();
        this.setupEventListeners();
        this.startNotificationQueue();
    }
    registerNotifications() {
        this.notificationQueue.push({
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
        }, {
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
    setupEventListeners() {
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('userNavigatorPlus.notificationDelay')) {
                this.startNotificationQueue();
            }
        }));
    }
    async startNotificationQueue() {
        if (this.isProcessingQueue)
            return;
        this.isProcessingQueue = true;
        const config = vscode.workspace.getConfiguration('userNavigatorPlus');
        const delay = config.get('notificationDelay', 3000);
        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            if (!notification || this.shownNotifications.has(notification.id))
                continue;
            const shouldShow = await notification.condition();
            if (shouldShow) {
                await this.showNotification(notification);
                this.shownNotifications.add(notification.id);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        this.isProcessingQueue = false;
    }
    async showNotification(notification) {
        const actions = notification.actions.map(a => a.title);
        const result = await vscode.window.showInformationMessage(notification.message, ...actions);
        if (!result)
            return;
        const selectedAction = notification.actions.find(a => a.title === result);
        if (!selectedAction)
            return;
        if (selectedAction.command) {
            vscode.commands.executeCommand(selectedAction.command);
        }
        else if (selectedAction.url) {
            vscode.env.openExternal(vscode.Uri.parse(selectedAction.url));
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.NotificationManager = NotificationManager;
//# sourceMappingURL=notificationManager.js.map