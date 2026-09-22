# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Repository created 2026-09-22.** Authorised by the owner after UPT's Phase 4 formalRef criterion
  was MEASURED at 1 of 5 rather than assumed — every candidate file in Physlib at `5ad56e2` read,
  Lean built locally, axioms checked with `#print axioms`, and a positive control (`sorry` →
  `sorryAx`) run first to prove the checker could detect what it was looking for. Exactly one bridge
  has a real checked counterpart; d'Alembert exists only in the converse direction.
- README recording *why* this repository exists, written at creation rather than reconstructed later.
- MIT licence, matching UPT.

### Not yet

- No Lean project scaffolding and no proofs. The repository is deliberately empty of content until the
  UPT session — which holds the domain context and an already-built toolchain — adds them.
