# Manifest

`bridges.json` is the file UPT consumes. One entry is one manifest key:

- the key and the UPT bridge id
- the Lean theorem name
- the covers line

A `formalRef` that names the key is resolved when that entry exists and its theorem name matches. The Lean proof is not copied into UPT.

The file arrives with the milestone 1 theorems. Until then this directory only records the contract.
