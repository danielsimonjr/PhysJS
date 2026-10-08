# Changesets

`.github/workflows/release.yml` versions packages from these files once a workspace package is public. Packages stay `"private": true` until a later tier removes that flag; until then the Version job is skipped. This directory does not publish.

A file name says what changed. It carries no round number and no bridge number.
