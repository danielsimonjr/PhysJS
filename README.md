# PhysJS

**Out-of-tree Lean 4 proofs of the [Universal Physics Tensor](https://github.com/danielsimonjr/universal-physics-tensor)
bridge dictionaries.**

## Why this repository exists

UPT's Phase 4 exit criterion asks for **≥ 5 bridges with a reviewed `formalRef`**. On 2026-09-22 that
criterion was measured rather than assumed, and it came back at **1**.

The measurement is worth stating, because it is the reason this repository is honest:

- Every candidate file in [Physlib](https://github.com/leanprover-community/physlib) at `5ad56e2` was
  searched and read.
- Lean was **built locally** and the axioms were measured with `#print axioms` — not inferred from
  documentation.
- A **positive control** was run first: a deliberate `sorry` correctly printed `sorryAx`, confirming
  the checker could detect the thing it was looking for.

Result: exactly **one** bridge has a real checked counterpart —
`ab-pendulum-linear → linearizedEquationOfMotion_iff`. d'Alembert exists only in the **converse**
direction. Nothing else has a counterpart at all.

The count moved from 5 to 1 because the honesty rule held. **An exit criterion honestly open is worth
more than one nominally met.**

## What goes in here

Proofs of the bridge dictionaries Physlib does not carry:

| Target | Note |
|---|---|
| spring ↔ LC, via ω² | dictionary equivalence |
| damped oscillator, the ζ² map | |
| Stokes–Einstein substitution | |
| Klein–Gordon dispersion limits | |
| d'Alembert, the missing direction | Physlib has only the converse |

## What this is NOT

**These are algebra-level lemmas and the ceiling is modest.** This repository does not claim deep
formalisation of physics. Its value is that UPT's `formalRef` criterion stops being aspirational — a
bridge marked `formally-proved` points at something a checker has actually verified.

`formally-proved` in UPT is only ever **derived**, never hand-set. A reference here is the evidence
that derivation rests on.

## Why out of tree

UPT's ROADMAP requires the proof artifacts to live outside the main repository, so that the library
under test and the thing testing it cannot drift into each other.

## Status

**Scaffolding.** No proofs yet. This README exists before the content deliberately: the repository was
created the moment it was authorised, so the record of *why* it exists is written while the reasoning
is fresh rather than reconstructed later.

## Licence

MIT — matching UPT.
