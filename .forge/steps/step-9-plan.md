# Step 9 Execution Plan: GHCR release workflow

## Goal
Add GitHub Actions release automation that builds the Step 8 Docker image and publishes it to GHCR when a GitHub release is published or a semver tag is pushed.

## Current Code Observations
- `.github/workflows/ci.yml` already runs Node 24, `npm ci`, lint, typecheck, and build on pushes and PRs.
- `.github/workflows/security.yml` already runs Node 24 and npm audit.
- The git remote is `https://github.com/Colorado-Mesh/coloradomesh-meshcore.git`, so `${{ github.repository }}` resolves to `Colorado-Mesh/coloradomesh-meshcore` and GHCR image naming can derive from it.
- Step 8 added a multi-stage `Dockerfile` that builds the Next standalone image and runs `node server.js` as a non-root user.
- Step 8 added `compose.yaml`, but release publishing should build directly from `Dockerfile` rather than Compose.
- There is no existing Docker release workflow.

## Files to Change
- Add `.github/workflows/docker-release.yml` for GHCR build/push on releases and semver tags.
- Modify `.github/workflows/ci.yml` to add a PR/main Docker build smoke check without pushing.
- No `package.json` script is needed because the existing Dockerfile is the release contract.

## Ordered Implementation Checklist
1. Add `.github/workflows/docker-release.yml` with triggers for `release.published`, semver tags `v*.*.*`, and `workflow_dispatch`.
2. Configure workflow permissions for GHCR publishing: `contents: read`, `packages: write`, and provenance permissions if attestations are enabled.
3. Set `REGISTRY=ghcr.io` and derive a lowercase `IMAGE_NAME=ghcr.io/${{ github.repository }}` in a shell step to avoid owner/name case issues.
4. Use `actions/checkout@v4`, `docker/setup-buildx-action`, and `docker/login-action` with `GITHUB_TOKEN` for GHCR login.
5. Use `docker/metadata-action` to generate semver tags (`type=semver` pattern variants), SHA tags, and `latest` only for published releases.
6. Use `docker/build-push-action` to build and push the Dockerfile with OCI labels and GitHub Actions cache.
7. Optionally attach build provenance/attestation if supported by `docker/build-push-action`, without requiring external secrets.
8. Add a Docker build smoke job to `.github/workflows/ci.yml` that runs on push/PR and never pushes images.
9. Verify YAML contents by inspection/grep and run local `npm run lint`, `npm run typecheck`, `npm run build`, and `docker build -t colorado-meshcore-site:release-test .`.
10. Stage Step 9 files, request Forge review, save `.forge/reviews/claude-step-9.json`, and commit if approved.

## Interfaces and Data Contracts
- Release publish or semver tag push publishes to `ghcr.io/${{ github.repository }}` lowercased by the workflow.
- Release builds push semver tags, a SHA tag, and `latest` for `release.published` only.
- PR/main CI builds the Docker image but does not authenticate or push.
- Workflow uses only `GITHUB_TOKEN`; no custom repository secrets are required.

## Verification Plan
- Automated: `npm run lint`
- Automated: `npm run typecheck`
- Automated: `npm run build`
- Docker: `docker build -t colorado-meshcore-site:release-test .`
- YAML/grep: `grep -R "ghcr.io\|docker/build-push-action\|docker/metadata-action\|packages: write\|push: true\|push: false" -n .github/workflows/docker-release.yml .github/workflows/ci.yml`
- Manual: inspect workflow triggers, permissions, image name derivation, tag rules, and push conditions.

## Stop Conditions
- If adding Docker build smoke to CI requires secrets or pushes images, stop and keep the smoke job local-only/no-push.
- If GHCR image naming cannot be derived safely from `github.repository`, use an explicit image name and document why.
- If local Docker build fails, fix the Dockerfile or workflow inputs before review.
- Do not create a GitHub release, push tags, or push images from this local session.
