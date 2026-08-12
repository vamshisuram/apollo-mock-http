# Security Policy

## Reporting a Vulnerability

Please report security issues privately via GitHub's
[Security Advisories](https://github.com/vamshisuram/apollo-mock-http/security/advisories/new)
rather than opening a public issue. You can expect an initial response within a
few business days.

## CI/CD security model

This project publishes to npm, so the build pipeline is hardened against
[poisoned pipeline execution](https://owasp.org/www-project-top-10-ci-cd-security-risks/):

- **Pull request workflows (`ci.yml`, `danger.yml`)** run on the `pull_request`
  event with `permissions: contents: read`. They hold **no** publish secrets,
  and install dependencies with `--ignore-scripts` so untrusted PR code cannot
  execute lifecycle scripts in CI.
- **Publishing (`release.yml`)** runs **only** on `push` to `main` (post-merge,
  reviewed code). `NPM_PUBLISH_TOKEN` exists only in this workflow, so PR code can never
  reach it. Packages are published with npm **provenance**.
- Dependencies are monitored by Dependabot.

### Dependency audit scope

The published package has a single runtime dependency (`apollo-link`).
`yarn audit --groups dependencies` reports **0 vulnerabilities**, and that is
the number that matters to consumers — it is what actually ships in `dist/`.

A bare `yarn audit` reports a large number, but every finding is in the build
and test toolchain (jest, rollup, danger, semantic-release), which never reaches
consumers. Yarn v1 also counts each dependency *path* separately, so a single
advisory deep in the jest tree is reported dozens of times; the count badly
overstates the number of distinct issues. Dev-tooling advisories are addressed
via Dependabot rather than treated as release blockers.

## Recommended repository settings

- Protect `main`: require PR review + passing `CI` check before merge.
- Use a **publish-only** npm granular access token for the
  `NPM_PUBLISH_TOKEN` secret, scoped to this package only. Do not set an IP
  allowlist — GitHub-hosted runners have dynamic addresses. Granular tokens
  require an expiry date, so note it: releases fail once it lapses.
- In repo Settings → Actions, set "Fork pull request workflows" to require
  approval before running for first-time / outside contributors.
