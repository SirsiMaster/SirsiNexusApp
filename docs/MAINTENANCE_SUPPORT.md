# Maintenance & Support — SirsiNexusApp

**Version:** 1.0.0  
**Date:** February 27, 2026

---

## Support Tiers

| Tier | Response Time | Description |
|------|--------------|-------------|
| P0 (Critical) | 1 hour | Production down, data breach, payment failure |
| P1 (High) | 4 hours | Feature broken, security vulnerability |
| P2 (Medium) | 24 hours | UI issue, non-blocking bug |
| P3 (Low) | 1 week | Enhancement request, documentation update |

## Routine Maintenance

### Weekly
- Review Dependabot security alerts
- Check Firebase usage/billing dashboard
- Review error logs in Cloud Logging

### Monthly
- Dependency updates (Node, Go modules)
- Firebase CLI version check
- Review and prune stale feature branches

### Quarterly
- Full security audit
- Performance review
- ADR review and cleanup
- Canonical doc review (per PORTFOLIO_CANONICAL_STANDARD.md)

## Monitoring
- **Cloud Logging**: All Go services log to Cloud Logging
- **Firebase Analytics**: User engagement metrics
- **Stripe Dashboard**: Payment health monitoring
- **GitHub Actions**: CI/CD pipeline status
