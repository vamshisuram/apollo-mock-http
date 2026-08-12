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
  reviewed code), and uses npm **trusted publishing** rather than a stored
  token. There is no long-lived npm credential in this repository at all, so
  there is nothing for PR code to reach even in principle. Packages are
  published with npm **provenance**.
- Dependencies are monitored by Dependabot.

### How publishing authenticates

`release.yml` requests a short-lived OIDC token from GitHub describing the
workflow itself — repository, workflow file, ref — and npm exchanges it for a
credential valid for minutes. npm verifies the request originated from this
repository and this workflow, which a leaked string cannot forge.

Two consequences worth knowing:

- The workflow **filename** is part of the identity registered on npm. Renaming
  `release.yml` breaks publishing until the trusted publisher is updated.
- Trusted publishing only applies to CI. Publishing manually from a laptop still
  uses your npm account and its 2FA.

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
- On npm, configure the package's **trusted publisher**: GitHub Actions,
  repository `vamshisuram/apollo-mock-http`, workflow `release.yml`. This must
  be in place before the first release run.
- Keep account-level 2FA enabled. It protects the things that outlast any single
  release: minting tokens, adding maintainers, transferring the package.
- Avoid reintroducing a long-lived npm token. If one is ever needed as a
  fallback, scope it to this package, make it publish-only, and leave the IP
  allowlist empty — GitHub-hosted runners have dynamic addresses.
- In repo Settings → Actions, set "Fork pull request workflows" to require
  approval before running for first-time / outside contributors.
