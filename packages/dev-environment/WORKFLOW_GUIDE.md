# Development Workflow Guide

## 🎯 How Your New Environment Works

Your development environment is now organized as a unified workspace that allows you to efficiently manage and work across all your projects. Here's how everything fits together:

## 🏗️ Architecture Overview

```
Your Development Environment
├── Central Hub (~/Development)
│   ├── Unified Commands (dev.sh)
│   ├── VS Code Workspace
│   └── Documentation
│
├── Quick Navigation (Shell Aliases)
│   └── Jump between projects instantly
│
└── Individual Projects
    ├── SirsiNexusApp
    ├── SirsiMaster.github.io
    ├── assiduous
    └── sirsi-pitch-deck
```

## 🚀 Daily Workflow

### Starting Your Day

1. **Open Terminal** and check project status:
   ```bash
   dev status
   ```
   This shows:
   - Git status for each project
   - Running servers
   - Branch information
   - Sync status with remotes

2. **Open VS Code Workspace**:
   ```bash
   code ~/Development/workspace.code-workspace
   ```
   This opens all projects in a single VS Code window with:
   - Each project as a separate folder
   - Shared settings and extensions
   - Integrated terminals for each project

3. **Start Required Services**:
   ```bash
   # Start a specific project
   dev start SirsiNexusApp
   
   # Or navigate and start manually
   cdapp
   npm start
   ```

### Navigation Shortcuts

You can jump to any project instantly from anywhere:

| Command | Goes To | Purpose |
|---------|---------|---------|
| `cddev` | ~/Development | Main development directory |
| `cdapp` | SirsiNexusApp | Main application |
| `cdportal` | SirsiMaster.github.io | Website/portal |
| `cdassiduous` | assiduous | Assiduous project |
| `cddeck` | sirsi-pitch-deck | Presentation materials |

### The `dev` Command

The `dev` command is your central control panel:

```bash
dev status          # Check all projects
dev start [project] # Start a project server
dev stop [project]  # Stop a project server
dev update         # Pull latest changes for all
dev clean          # Clean temp files
dev help           # Show all commands
```

## 💻 VS Code Workspace Features

### Multi-Root Benefits

When you open the workspace file, you get:

1. **Unified Explorer**: All projects in one sidebar
2. **Smart Search**: Search across all projects or specific ones
3. **Integrated Terminals**: Open terminals for each project
4. **Shared Settings**: Consistent formatting and linting
5. **Quick Switching**: Cmd+P to jump between files across projects

### Keyboard Shortcuts

- `Cmd+P`: Quick file open (works across all projects)
- `Cmd+Shift+F`: Search across all projects
- `Cmd+\``: Toggle integrated terminal
- `Cmd+Shift+E`: Focus on Explorer
- `Cmd+B`: Toggle sidebar

### Tasks and Debugging

The workspace includes pre-configured tasks:
- **Build Task** (Cmd+Shift+B): Start all servers
- **Test Task**: Check project status
- **Custom Tasks**: Update repos, clean files

## 📝 Common Scenarios

### Scenario 1: Working on SirsiNexusApp

```bash
# Quick way
cdapp               # Navigate to app
npm start           # Start development server
# Work on your code in VS Code

# Or use the dev command
dev start SirsiNexusApp
```

### Scenario 2: Updating the Website

```bash
cdportal            # Navigate to website
bundle exec jekyll serve  # Start Jekyll
# Open browser to localhost:4000
# Edit in VS Code, see live updates
```

### Scenario 3: Checking Everything Before EOD

```bash
dev status          # See what needs attention
# Commit any uncommitted changes
cdapp && git add . && git commit -m "EOD commit"
cdportal && git push
dev clean           # Clean up temp files
```

### Scenario 4: Starting Fresh in the Morning

```bash
dev update          # Pull all latest changes
dev status          # Check everything is clean
code ~/Development/workspace.code-workspace
```

## 🔄 Git Workflow

### Quick Git Aliases

Your environment includes git shortcuts:
- `gs` = `git status`
- `ga` = `git add`
- `gc` = `git commit`
- `gp` = `git push`
- `gl` = `git pull`

### Recommended Git Flow

1. **Check status** before starting work:
   ```bash
   dev status
   ```

2. **Create feature branches**:
   ```bash
   cdapp
   git checkout -b feature/new-feature
   ```

3. **Commit frequently**:
   ```bash
   ga .
   gc -m "Add new feature"
   ```

4. **Keep synced**:
   ```bash
   gl origin main  # Pull latest
   gp origin feature/new-feature  # Push your branch
   ```

## 🛠️ Troubleshooting

### Port Already in Use

If you get "port already in use" errors:
```bash
dev stop SirsiNexusApp  # Stop the project
# Or kill specific port
lsof -ti:3000 | xargs kill
```

### Aliases Not Working

Reload your shell configuration:
```bash
source ~/.zshrc
```

### Can't Find Project

Check the Development directory:
```bash
ls -la ~/Development
```

## 🎨 Customization

### Adding New Projects

1. Move/create project in ~/Development
2. Edit `~/Development/dev.sh` to add to PROJECTS array
3. Add alias in ~/.zshrc if desired
4. Update VS Code workspace file

### Changing Ports

Edit the port checks in `dev.sh` for your specific needs.

### Custom Commands

Add your own functions to `dev.sh` for repeated tasks.

## 📊 Best Practices

1. **Use the workspace**: Always work through the VS Code workspace for consistency
2. **Check status regularly**: Run `dev status` to stay aware of changes
3. **Commit before switching**: Always commit or stash before switching projects
4. **Use branches**: Don't work directly on main/master
5. **Document changes**: Update READMEs when you change project structure

## 🚦 Status Indicators

When you run `dev status`, you'll see:

- ✅ **Green**: Everything is good
- 🟡 **Yellow**: Needs attention (uncommitted changes, behind remote)
- 🔴 **Red**: Issues (conflicts, errors)
- ⚪ **Gray**: Not applicable (no git repo)

## 🔗 Quick Reference

### Essential Commands
```bash
# Navigation
cddev, cdapp, cdportal, cdassiduous, cddeck

# Management
dev status
dev start [project]
dev stop [project]
dev update
dev clean

# Git
gs, ga, gc, gp, gl

# VS Code
code ~/Development/workspace.code-workspace
```

### Project Ports
- SirsiNexusApp: 3000
- SirsiMaster.github.io: 4000
- sirsi-pitch-deck: 8000
- assiduous: TBD

### File Locations
- Main workspace: `~/Development/`
- Dev script: `~/Development/dev.sh`
- VS Code workspace: `~/Development/workspace.code-workspace`
- Shell config: `~/.zshrc`

---

## 💡 Pro Tips

1. **Terminal Splits**: Use iTerm2 or Terminal splits to monitor multiple projects
2. **VS Code Terminal**: Use VS Code's integrated terminal for project-specific commands
3. **Git Graph**: Install Git Graph extension in VS Code for visual git history
4. **Live Server**: Some projects support live reload - changes appear instantly
5. **Keyboard Maestro**: Consider setting up macros for common workflows

---

*Need help? Check the README.md in ~/Development for project-specific details.*
