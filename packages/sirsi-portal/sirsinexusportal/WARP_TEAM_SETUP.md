# SirsiNexus Warp Team Setup

## Setting Up Warp Workflows

1. **Install Base Configuration**
   ```bash
   ./setup_warp_dev.sh
   ```

2. **Import Team Workflows**
   1. Open Warp Drive (CMD + D)
   2. Click + > Import Workflow
   3. Select `~/.warp/workflows/sirsinexus_complete.yml`

3. **Create Quick Access Workflows**
   Use Command Palette (CMD + P) to create:
   - "SirsiNexus - Pages Development"
   - "SirsiNexus - App Development"
   - "SirsiNexus - Deploy Pages"

4. **Share with Team**
   1. Open Warp Drive
   2. Right-click each workflow
   3. Select "Share with Team"
   4. Choose team members

## Using Workflows

### From Sidebar
1. Open Warp Drive (CMD + D)
2. Click desired workflow
3. Fill in any required parameters

### From Command Palette
1. Press CMD + P
2. Type "SirsiNexus"
3. Select desired workflow

## Best Practices
1. Always use workflows for context switching
2. Follow deployment safeguards
3. Keep workflows updated with team

## Troubleshooting
- If workflows don't appear, try importing again
- Ensure you're connected to team workspace
- Check ~/.warp/workflows/ for proper installation

