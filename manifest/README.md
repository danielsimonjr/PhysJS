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
| `planeWave` | Present on a rank-1 entry that also has a rank-1a theorem. Same inner fields as an entry, without a second key. |

The five rank-1 keys cover `bound.delta` at the dispersion relation. That top-level `theorem` is the reviewed reference. `ab-pendulum-linear` covers the transformation and imports Physlib.

Rank 1a proves a different statement about the same five bridges: a plane wave solves the PDE iff `ω(k)` obeys the dispersion relation. Each of those entries keeps its reviewed theorem and records the new one under `planeWave`. A second top-level key would not equal the bridge id, and replacing `theorem` would change the covers line the reviewed reference already names. UPT still has one `formalRef` per bridge id. Pointing that reference at `planeWave.theorem` is a UPT change; this file does not make it.

`ab-kg-oscillator` covers the uniform-mode restriction in Physlib's own terms.

`ab-spring-lc` and `ab-damped-rlc` cover the oscillator dictionary: time rescaling between Physlib oscillators, with the circuit names read off the parameters.
