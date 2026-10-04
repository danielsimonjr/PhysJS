# `@danielsimonjr/physjs-core`

SI constants, a quantity that carries a MathTS `Unit`, and the expression binding for `e`, `E`, and `exp`.

Bare `e` is the elementary charge (`1.602176634e-19`). `E` is energy and stays unbound until the caller supplies it. Euler's number is `exp(1)`. The name `euler` is refused.

`quantity('25degC').toSI()` is 298.15 K, via MathTS `Unit.toSI`.

This package is private. It is not published.
The layout is specified in `docs/design/library-architecture.md`.
