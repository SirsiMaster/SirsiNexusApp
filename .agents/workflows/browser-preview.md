---
description: How to open a local file or URL for visual preview using the SirsiMaster Chrome profile
---

# Browser Preview (SirsiMaster Profile)

When opening any local file or URL for visual verification, **always** use the SirsiMaster Chrome profile (`Profile 12`).

## For local files:
// turbo
```bash
open -na "Google Chrome" --args --profile-directory="Profile 12" "file:///path/to/file.html"
```

## For URLs:
// turbo
```bash
open -na "Google Chrome" --args --profile-directory="Profile 12" "https://example.com"
```

## Key Rules
- **Profile Directory**: `Profile 12` (mapped to SirsiMaster)
- **Profile Path**: `~/Library/Application Support/Google/Chrome/Profile 12`
- **NEVER** use the default Chrome profile or any other profile
- **NEVER** rely on the browser subagent's built-in browser for previewing authenticated content — it runs an isolated headless instance without the user's cookies/sessions
- The browser subagent is acceptable for generic/unauthenticated page testing, but for anything requiring the SirsiMaster identity, use this workflow instead
