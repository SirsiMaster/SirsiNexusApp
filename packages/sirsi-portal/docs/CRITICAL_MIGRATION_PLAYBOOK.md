# CRITICAL Migration Playbook: Unify SirsiMaster.github.io and SirsiNexusApp

Status: Approved for ONE-NIGHT execution window (8 hours)
Owner: Migration Lead
Last Updated: 2025-09-22

This playbook describes an end-to-end, restartable, and auditable process to merge SirsiMaster.github.io (frontend/docs) with SirsiNexusApp (backend/core) into a single repository while preserving full Git history and ensuring zero downtime for GitHub Pages.

References
- Orchestrator script: scripts/migration_orchestrator.sh
- High-level plan (original): /docs/CRITICAL_MIGRATION_PLAN.md

Execution Model
- All commands run from the unified repo root (this repository) unless noted.
- Use the orchestrator to perform or resume any phase. Manual commands are provided here for transparency and emergency use.
- Every phase is idempotent and can be re-run safely.

Pre-flight Checklist (T-24h to T-2h)
1) Confirm prerequisites
   - macOS Xcode CLT installed (xcodebuild -version verified)
   - git ≥ 2.38
   - Optional: git-filter-repo installed if using the filter-repo strategy (brew install git-filter-repo)
2) Backups
   - Ensure you have a time-stamped backup of this repo and the target app repo
   - Verify you can restore quickly (spot-check a few files)
3) Freeze windows
   - Announce code freeze for both repos during the 8-hour window
   - Disable automated deploys that could interfere
4) Credentials
   - GitHub access for both repos (read/write)
   - CI/CD tokens are available and stored via env or secret manager

Migration Strategies (choose ONE, default: subtree)
A) Subtree (recommended)
   - Pros: Preserves full history, no external tooling, simpler mental model
   - Cons: History from the added repo appears under a subdirectory
B) Filter-Repo (advanced)
   - Pros: Can rewrite paths and history more flexibly
   - Cons: Requires git-filter-repo, more moving parts

Directory Layout Target
/
├── apps/portal/            # Former SirsiMaster.github.io contents
├── apps/core/              # Imported from SirsiNexusApp
├── docs/                   # Centralized docs (this playbook lives here)
├── scripts/                # Operational scripts (orchestrator lives here)
└── .github/                # Workflows consolidated

PHASES
Phase 0: Preflight and Backup
Goal: Verify environment and create local backups.
Manual commands (orchestrator does this):
- git --no-pager status -sb
- tar -czf backup-$(date +%Y%m%d_%H%M%S).tar.gz .

Phase 1: Add remote and fetch
Goal: Connect SirsiNexusApp repository as a remote and fetch.
Manual commands:
- git remote add sirsiapp git@github.com:SirsiMaster/SirsiNexusApp.git
- git fetch sirsiapp --tags --prune

Phase 2: Subtree import (default)
Goal: Bring SirsiNexusApp into apps/core preserving history.
Manual commands:
- git subtree add --prefix=apps/core sirsiapp main --squash
Notes: Omit --squash to keep full granular history (larger repo). If re-running, use git subtree pull.

Phase 3: Path normalization for this repo
Goal: Move current site into apps/portal while keeping behavior.
Manual commands:
- git mv -k sirsinexusportal apps/portal/sirsinexusportal
- git mv -k index.html apps/portal/index.html || true
- Update CI/CD and GH Pages paths as needed.

Phase 4: Resolve conflicts and reconcile tooling
Goal: Address conflicts, unify package.json, CI, linters, and scripts.
Checklist:
- Resolve merge conflicts
- Consolidate package managers and Node versions
- Update Tailwind/Jekyll build chains
- Ensure developer scripts still work from new paths

Phase 5: CI/CD updates and GH Pages continuity
Goal: Ensure deployments still work and do not break live site.
Checklist:
- Update GitHub Actions to build from apps/portal for Pages
- Ensure mkdocs/jekyll paths updated
- Keep custom domain and CNAME if applicable

Phase 6: Verification and smoke tests
Goal: Validate functionality end-to-end.
Checklist:
- ./validate-site.sh
- Local server sanity checks
- Security integration checks via browser console calls in WARP.md

Phase 7: Cutover plan and backout
Goal: Merge to main, monitor, and be ready to revert.
- Prepare revert strategy: branch backup, tags
- Announce window start/finish

Backout Procedure
- If any blocking issue arises: create emergency revert commit or reset to pre-migration tag.
- Restore from backup tarball if necessary.

Appendix: Filter-Repo variant (optional)
If choosing filter-repo to import SirsiNexusApp under apps/core while preserving paths:
- git filter-repo --to-subdirectory-filter apps/core (run inside a clone of SirsiNexusApp)
- Add the resulting directory to this repo under apps/core and commit
Caveat: This rewrites history; coordinate with stakeholders.
