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
  reviewed code). `NPM_TOKEN` exists only in this workflow, so PR code can never
  reach it. Packages are published with npm **provenance**.
- Dependencies are monitored by Dependabot; `yarn audit` is expected to report
  zero vulnerabilities.

## Recommended repository settings

- Protect `main`: require PR review + passing `CI` check before merge.
- Use a **granular, publish-only** npm automation token for `NPM_TOKEN`, scoped
  to this package only.
- In repo Settings → Actions, set "Fork pull request workflows" to require
  approval before running for first-time / outside contributors.
