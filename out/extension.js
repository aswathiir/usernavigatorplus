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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const contextAnalyzer_1 = require("./providers/contextAnalyzer");
const shortcuts_1 = require("./commands/shortcuts");
const floatingTab_1 = require("./commands/floatingTab");
const notificationManager_1 = require("./providers/notificationManager");
const workspaceOptimizer_1 = require("./providers/workspaceOptimizer");
async function activate(context) {
    try {
        const contextAnalyzer = new contextAnalyzer_1.ContextAnalyzer();
        const shortcutManager = new shortcuts_1.ShortcutManager(context, contextAnalyzer);
        const floatingTabManager = new floatingTab_1.FloatingTabManager(context, contextAnalyzer);
        const notificationManager = new notificationManager_1.NotificationManager(contextAnalyzer);
        const workspaceOptimizer = new workspaceOptimizer_1.WorkspaceOptimizer(contextAnalyzer);
        // Initialize all components
        await Promise.all([
            contextAnalyzer.initialize(),
            shortcutManager.initialize(),
            floatingTabManager.initialize(),
            notificationManager.initialize(),
            workspaceOptimizer.initialize()
        ]);
        console.log('User Navigator Plus is now active!');
    }
    catch (error) {
        console.error('Extension activation failed:', error);
        vscode.window.showErrorMessage('User Navigator Plus failed to initialize. Please check the output logs.');
    }
}
function deactivate() {
    // Clean up resources if needed
}
//# sourceMappingURL=extension.js.map