---
'@danielsimonjr/physjs-proofs': patch
---

`PhysJS.Arrhenius.arrhenius_eq` derives `k = A exp(−Ea/(R T))` from a constant activation energy `R T² d(ln k)/dT` instead of assuming it, and proves the molecular form as the share of a Boltzmann population above `ε = Ea/N_A`. Its signature changes.
