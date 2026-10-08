---
'@danielsimonjr/physjs-proofs': minor
---

Manifest schema `physjs-bridge-manifest/v2`: every entry carries `kind`, read from the kind line of its Lean file's module docstring, and the covers line no longer opens with a kind word. A theorem that states the catalog equation is kind `bridge`, where the old covers prefix said `derivation-step`. A nested statement carries its own `kind` from a kind line labelled by the key and the field, and no nested covers line opens with a kind word.
