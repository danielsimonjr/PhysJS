# UPT proof branches (thin-proofs implementation)

Lean proofs live in [Universal-Physics-Tensor](https://github.com/danielsimonjr/Universal-Physics-Tensor). The cloud agent could not `git push` to that repo (`403` for `cursor[bot]`). Branches were built locally with green `lake build` (4307–4308 jobs) at base `328db37`.

Apply a branch from the bundled commits in `upt-bundles/`:

```sh
cd /path/to/Universal-Physics-Tensor
git fetch /path/to/PhysJS/docs/plans/upt-bundles/be-154-158-diffusion-corollary-7e32.bundle \
  refs/heads/cursor/be-154-158-diffusion-corollary-7e32
git checkout -b cursor/be-154-158-diffusion-corollary-7e32 FETCH_HEAD
git push -u origin cursor/be-154-158-diffusion-corollary-7e32
```

Repeat for each `.bundle` (branch name matches the filename before `.bundle`).

| Branch | be-ids | Tip commit |
|--------|--------|------------|
| `cursor/be-154-158-diffusion-corollary-7e32` | be-154, be-155, be-158 | `db89fa3b5ca135ca1a3c5396702c16c8c0244854` |
| `cursor/be-156-159-heat-mass-7e32` | be-156, be-157, be-159 | `48c1c234be36944927c14b747913735caf0719b1` |
| `cursor/be-148-149-151-kinetics-7e32` | be-148, be-149, be-151 | `2ec58e675a11943438d441ec558a425b22b1a59a` |
| `cursor/be-163-170-thermo-stat-7e32` | be-163, be-164, be-168, be-170 | `d0fa787849a40dc5f0615ef89f71fca4a21b365c` |

Open one PR per branch targeting `master` on UPT after push. Merge `be-154-158` before `be-156-159` if you want Sherwood’s Nusselt transport to match the strengthened Nusselt on main.
