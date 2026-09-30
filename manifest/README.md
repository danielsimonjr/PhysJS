# Manifest

`bridges.json` is the file UPT consumes. One entry is one manifest key:

| Field | Meaning |
|---|---|
| `key`, `bridgeId` | The UPT bridge id. A `formalRef` names this key. |
| `theorem` | The Lean name the key resolves to. |
| `covers` | What that theorem certifies. It does not certify the rest of the bridge. |
| `coverage` | `covers its statement only`. A partial proof is marked the same way. |
| `leanProof` | `complete` when the Lean proof of that statement has no `sorry`. `partial` when it does not. |
| `axioms` | The axioms `#print axioms` reported for the theorem. |
| `imports` | Present when the proof is an import of a Physlib theorem rather than a new argument. |

The five rank-1 keys cover `bound.delta` at the dispersion relation. `ab-pendulum-linear` covers the transformation and imports Physlib. None of them derives a dispersion relation from a PDE.

`ab-spring-lc` and `ab-damped-rlc` cover the oscillator dictionary: time rescaling between Physlib oscillators, with the circuit names read off the parameters.
