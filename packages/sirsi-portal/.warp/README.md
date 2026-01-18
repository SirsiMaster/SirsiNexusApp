# SirsiNexus Warp Configuration

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone git@github.com:SirsiMaster/SirsiNexusPortal.git
   ```

2. Run the installation script:
   ```bash
   cd SirsiNexus
   .warp/install_warp_config.sh
   ```

## Available Workflows

### GitHub Pages Development
```bash
warp workflow pages_workflow
```

### Application Development
```bash
warp workflow app_workflow
```

## Rules and Guidelines
All development rules are enforced through these workflows. See WARP_DEVELOPMENT_GUIDE.md for detailed information.

## Updating Workflows

1. Make changes in `.warp/workflows/`
2. Commit and push changes
3. Team members run installation script again

## Support
Contact team lead for workflow customization requests.
