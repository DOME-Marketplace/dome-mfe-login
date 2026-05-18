# DOME MFE Login — Repo Guide for Claude

> **Per-repo CLAUDE.md.** Loaded only when working inside this repo. The
> SDD Constitution lives in `../eudistack-platform-dev/CLAUDE.md`.

## Identity

Angular 19 micro-frontend variant of MFE Login specifically for the
**DOME tenant**. Diverges from `eudistack-mfe-login` to handle DOME-
specific OIDC providers and onboarding flows.

> If a feature applies to both DOME and other tenants, prefer
> implementing in `eudistack-mfe-login` first and back-porting; avoid
> long-term divergence.

## Tech stack

Same as `eudistack-mfe-login` (Angular 19, standalone, OIDC, Material).

## Architecture

Strict conventions:
`../eudistack-platform-dev/.claude/rules/frontend-conventions.md`.

## Common commands

| Task | Command |
|------|---------|
| Install | `npm ci` |
| Production build | `npm run build` |
| Tests | `npm test` |
| Lint | `npx eslint .` |

## Where to find specs

`../eudistack-platform-dev/docs/EUDISTACK-12-dome-migration/` and
related folders.

## Git workflow

- **Squash merge to `main`.** Conventional Commits + Story footer.

## References

- Constitution: [`../eudistack-platform-dev/CLAUDE.md`](../eudistack-platform-dev/CLAUDE.md)
- Sibling: [`../eudistack-mfe-login/CLAUDE.md`](../eudistack-mfe-login/CLAUDE.md)
- Skills: `angular-conventions`, `commit-conventions`
- Rules: `frontend-conventions`
