# Visual Guide to Setting Up Warp Workflows

## Step 1: Open Warp Drive
![Warp Drive]
- Press `CMD + D`
- Look for the sidebar on the left

## Step 2: Create New Workflow
1. Click the + button at top of sidebar
2. Choose "New Workflow"
3. Fill in the form:
   ```
   Name: SirsiNexus - Pages Development
   Command: ./dev-context.sh pages && git status
   Description: Switch to GitHub Pages development mode
   ```

## Step 3: Create Additional Workflows
Repeat the process for:

### App Development
```
Name: SirsiNexus - App Development
Command: ./dev-context.sh app && git status
Description: Switch to application development mode
```

### Deploy Pages
```
Name: SirsiNexus - Deploy Pages
Command: ./deploy-safeguard.sh
Description: Safely deploy GitHub Pages with cooldown protection
```

## Step 4: Share with Team
1. Right-click each workflow in sidebar
2. Select "Share with Team"
3. Choose your team members

## Common Issues
- If + button isnt visible, make sure sidebar is expanded
- If commands fail, ensure youre in correct directory
- If sharing fails, verify team workspace connection

Need help? Let me know which step isnt working!
