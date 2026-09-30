## Summary

What this changes, and which UPT bridge it touches if it touches one.

## Checklist

- [ ] `lake build` succeeds
- [ ] The axiom audit is clean: no `sorry`, no `native_decide`, no axiom beyond `propext`, `Classical.choice`, and `Quot.sound`
- [ ] A new or changed theorem updates `manifest/bridges.json` (theorem name, bridge id, covers line)
- [ ] A partial proof is marked `covers its statement only` in the manifest
- [ ] No secrets, credentials, or private notes

## Testing

How the Lean proofs were checked.
