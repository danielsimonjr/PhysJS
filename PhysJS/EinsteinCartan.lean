/-
Copyright (c) 2026 Daniel Simon Jr.
Released under MIT license as described in the file LICENSE.
-/

import PhysJS.Dimensional
import PhysJS.Einstein
import Mathlib.Algebra.BigOperators.Ring.Finset
import Mathlib.Tactic.FieldSimp

/-!
`be-17`. Derivation step. The torsion–spin inversion, not the field equation.

`κ` is `PhysJS.Einstein.kappa`, `8πG/c⁴`. If every component satisfies
`T = κ S` and `κ ≠ 0`, the squared contractions obey

```
S·S = T·T / κ² = (c⁴ / (8πG))² T·T
```

`κ²` in the numerator is that inversion run backwards. It agrees with the
true quotient only when `κ⁴ = 1`, so the control assumes `κ⁴ ≠ 1`, and it
needs a nonzero contraction. The Einstein–Cartan field equation and any
Newtonian limit are not this statement.

`torsion_monomial` is the Buckingham step for positive magnitudes.
Its hypothesis is that a torsion component is a dimensionally homogeneous
function of `κ` and the spin component alone, with `[T] = [κ][S]`.
The conclusion is `T = C κ S` with `C = f(1, 1)`. The catalog value
`C = 1` is not derived. `coefficient_not_fixed` is that gap.
`inversion_of_unit_coefficient` applies `inversion` only after assuming
`C = 1`. The Einstein trace remains a hypothesis of
`PhysJS.Einstein.trace_eq`; this file does not discharge it.
-/

namespace PhysJS.EinsteinCartan

open Finset Real Einstein

/-- Squared contraction `v·v = ∑ vᵢ²`, summed over the components. -/
def dot {ι : Type*} [Fintype ι] (v : ι → ℝ) : ℝ :=
  ∑ i, v i ^ 2

/-- Componentwise scaling `T = κ S` inverts on the squared contraction. -/
lemma scale {ι : Type*} [Fintype ι] (κ : ℝ) (T S : ι → ℝ) (hκ : κ ≠ 0)
    (h : ∀ i, T i = κ * S i) :
    dot S = dot T / κ ^ 2 := by
  have hT : dot T = κ ^ 2 * dot S := by
    unfold dot
    simp_rw [h, mul_pow]
    rw [← Finset.mul_sum]
  rw [hT]
  field_simp [hκ]

/-- `S·S = T·T / κ²` for `κ = 8πG/c⁴ ≠ 0`.

Covers the derivation step of `be-17`. Not the Einstein–Cartan field
equation, and not a Newtonian limit. -/
theorem inversion {ι : Type*} [Fintype ι] (G c : ℝ) (T S : ι → ℝ)
    (hκ : kappa G c ≠ 0) (h : ∀ i, T i = kappa G c * S i) :
    kappa G c = 8 * π * G / c ^ 4 ∧
      dot S = dot T / kappa G c ^ 2 ∧
      dot S = (c ^ 4 / (8 * π * G)) ^ 2 * dot T := by
  refine ⟨rfl, scale (kappa G c) T S hκ h, ?_⟩
  have hnum : (8 : ℝ) * π * G ≠ 0 := by
    intro h0
    apply hκ
    simp [kappa, h0]
  have hc : c ≠ 0 := by
    intro hc0
    apply hκ
    simp [kappa, hc0]
  have hinv : (kappa G c)⁻¹ = c ^ 4 / (8 * π * G) := by
    unfold kappa
    field_simp [hnum, hc]
  rw [scale (kappa G c) T S hκ h, div_eq_mul_inv, ← inv_pow, hinv, mul_comm]

/-- Hypothesis: a positive torsion component is dimensionally homogeneous in
positive `κ` and `S`, with `[T] = [κ][S]`. Then `T = C κ S` and
`C = f(1, 1)`.

`C = 1` is not derived. Signs of a general component are not fixed by a
positive unit change. Not the Einstein–Cartan equation. -/
theorem torsion_monomial (f : ℝ → ℝ → ℝ)
    (hf : ∀ lamκ lamS κ S, 0 < lamκ → 0 < lamS → 0 < κ → 0 < S →
      f (lamκ * κ) (lamS * S) = (lamκ * lamS) * f κ S)
    {κ S : ℝ} (hκ : 0 < κ) (hS : 0 < S) :
    f κ S = f 1 1 * κ * S :=
  Dimensional.product_shape f hf hκ hS

/-- A dimensionless factor other than `1` is not the catalog coefficient. -/
theorem coefficient_not_fixed (C κ S : ℝ) (hC : C ≠ 1) (hprod : κ * S ≠ 0) :
    C * κ * S ≠ κ * S := by
  intro hEq
  have hsub : (C - 1) * (κ * S) = 0 := by
    calc
      (C - 1) * (κ * S) = C * (κ * S) - 1 * (κ * S) := by rw [sub_mul]
      _ = C * κ * S - κ * S := by rw [one_mul, mul_assoc]
      _ = 0 := sub_eq_zero.mpr hEq
  exact hC (sub_eq_zero.mp ((mul_eq_zero.mp hsub).resolve_right hprod))

/-- `inversion` applies once the dimensionless factor is assumed to be `1`.
That assumption is a hypothesis. It is not the output of `torsion_monomial`. -/
theorem inversion_of_unit_coefficient {ι : Type*} [Fintype ι] (G c C : ℝ) (T S : ι → ℝ)
    (hκ : kappa G c ≠ 0) (hC : C = 1) (h : ∀ i, T i = C * kappa G c * S i) :
    dot S = dot T / kappa G c ^ 2 := by
  have hunit : ∀ i, T i = kappa G c * S i := by
    intro i
    rw [h i, hC, one_mul]
  exact (inversion G c T S hκ hunit).2.1

/-- `κ²` in the numerator is the inversion run backwards. -/
theorem wrong_dictionary {ι : Type*} [Fintype ι] (κ : ℝ) (T S : ι → ℝ) (hκ : κ ≠ 0)
    (h : ∀ i, T i = κ * S i) (hT : dot T ≠ 0) (hκ4 : κ ^ 4 ≠ 1) :
    κ ^ 2 * dot T ≠ dot S := by
  intro hbad
  have htrue := scale κ T S hκ h
  have : κ ^ 2 * dot T = dot T / κ ^ 2 := by
    rw [← htrue]
    exact hbad
  field_simp [hκ, hT] at this
  exact hκ4 this

end PhysJS.EinsteinCartan
