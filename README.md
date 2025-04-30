# User Navigator Plus for VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/aswathiir.usernavigatorplus)](https://marketplace.visualstudio.com/items?itemName=aswathiir.usernavigatorplus)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/aswathiir.usernavigatorplus)](https://marketplace.visualstudio.com/items?itemName=aswathiir.usernavigatorplus)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/aswathiir.usernavigatorplus)](https://marketplace.visualstudio.com/items?itemName=aswathiir.usernavigatorplus)
[![License](https://img.shields.io/github/license/yourusername/usernavigatorplus)](LICENSE)

![Extension Demo](resources/demo.gif)

## The Ultimate VS Code Productivity Booster

User Navigator Plus enhances your VS Code workflow with intelligent context-aware assistance, helping you work faster and smarter.

## ✨ Features

### 🎯 Contextual Shortcut Suggestions
- Displays relevant keyboard shortcuts based on:
  - Current file type (JavaScript, Python, etc.)
  - Project structure
  - Cursor position
- Learns from your usage patterns

### 🚦 Smart Floating Tabs
- Automatic guidance when issues are detected:
  - Missing dependencies (`node_modules`, `venv`)
  - Syntax errors
  - Configuration problems
- One-click solutions for common issues

### 🛠 Workspace Optimization
- Recommends:
  - Missing VS Code extensions
  - Project structure improvements
  - Performance optimizations

### 🔔 Intelligent Notifications
- Helpful reminders about:
  - Version control (Git)
  - Environment setup
  - Best practices

## 🚀 Installation

1. Open **Extensions** view in VS Code (`Ctrl+Shift+X`)
2. Search for `User Navigator Plus`
3. Click **Install**
4. Reload VS Code when prompted

**Alternative**: Install from [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=aswathiir.usernavigatorplus)

## 🛠 Usage

### Basic Commands
| Command | Description | Shortcut |
|---------|-------------|----------|
| `Show Contextual Shortcuts` | Displays relevant shortcuts | `Ctrl+Shift+P` then type command |
| `Open Guidance Panel` | Shows floating help tab | `Ctrl+Alt+G` |

### Automatic Features
- Shortcut suggestions appear in status bar
- Guidance tabs open automatically when issues are detected
- Notifications appear for important reminders

## ⚙ Configuration

Add these to your VS Code `settings.json`:

```json
{
  "userNavigatorPlus.enableFloatingTabs": true,
  "userNavigatorPlus.shortcutSuggestions": true,
  "userNavigatorPlus.notificationDelay": 3000
}
```
## 📦 Extension Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `enableFloatingTabs` | Show automatic guidance panels | `true` |
| `shortcutSuggestions` | Display contextual shortcuts | `true` |
| `notificationDelay` | Delay before notifications (ms) | `3000` |

## 🛠 Development

### Build from Source
```bash
git clone https://github.com/aswathiir/usernavigatorplus
cd usernavigatorplus
npm install
npm run compile
```

### Test in VS Code
1. Press `F5` to launch Extension Development Host
2. Test all features in the new window

### Package for Distribution
```bash
npm run package
```

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## 📜 License

MIT © [Aswathi Ranjith](https://github.com/aswathiir)

>>>>>>> 8b77d1f (Initial Commit)
