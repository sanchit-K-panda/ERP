# Contributing

Short checklist to avoid non-production-ready or ad-hoc code and keep the codebase production-ready.

1. Run lint & typecheck before opening a PR

```bash
pnpm lint
pnpm typecheck
pnpm format
```

2. No hardcoded/dev data in main branches
- Avoid committing files with hardcoded IDs, credentials, or sample company/hub data.
- Use `NEXT_PUBLIC_USE_DEV_CONTEXT=true` in local `.env` when you need dev defaults.

3. PR checklist
- Small focused changes per PR.
- Add changelog entry if behavior or API changed.
- Include screenshots for UI changes and acceptance steps.

4. Code style
- Follow existing project conventions (TypeScript, Tailwind, React hooks).
- Avoid `console.log` in commits; use proper logging or remove before PR.

5. Tests & safety
- Add unit tests for shared logic and small integration checks for critical flows.
- Ensure migrations and schema changes are reviewed with backend lead.

6. CI and pre-merge
- CI must run lint, typecheck, and build. Fix failures before merging.

7. When in doubt
- Ask on the PR or ping the relevant owner listed in `Docs/CONTEXT.md`.

This file is intentionally short—add more organization-specific rules here as needed.
