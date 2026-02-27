# Change Management — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Change Control Process

### Classification
| Type | Examples | Approval Required |
|------|----------|-------------------|
| **Standard** | Bug fix, dependency update, doc update | Self-approved (push to main) |
| **Significant** | New feature, API change, new package | Sprint plan + USER approval (Rule 17) |
| **Critical** | Architecture change, security model change, decommission | ADR + Sprint plan + USER approval |

### Workflow
1. **Propose**: Present sprint plan per Rule 17
2. **Review**: USER approves plan
3. **Implement**: Follow plan, commit with descriptive messages
4. **Verify**: Test in browser (Rule 3), check CI/CD
5. **Deploy**: Push to main → GitHub Actions → Firebase
6. **Document**: Update ADRs and canonical docs as needed (Rule 18)

### ADR Requirements
An ADR is **required** for:
- Adding or removing a technology from the stack
- Changing the database schema
- Modifying the authentication/authorization model
- Decommissioning any service or component
- Changing the deployment architecture

### Rollback Procedure
1. `git revert <commit>` — create revert commit
2. Push to main — triggers automatic redeployment
3. Verify production is restored
4. Post-mortem: document what went wrong in ADR or changelog
