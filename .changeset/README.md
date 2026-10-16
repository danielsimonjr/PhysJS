# Changesets

Add one with `bun run changeset` in every pull request that changes a published package. On a push to `main`, `.github/workflows/release.yml` turns pending changesets into the "chore: release packages" pull request (see that file for the repository setting it needs). This directory does not publish.

A file name says what changed. It carries no round number and no bridge number.
