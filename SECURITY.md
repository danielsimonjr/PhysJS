# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| `main` | yes |

There is no published npm release yet. The supported surface is the `main` branch of this repository.

## Reporting a vulnerability

Do not open a public GitHub issue for a security report.

Use a [private security advisory](https://github.com/danielsimonjr/PhysJS/security/advisories/new). Include:

- the affected file, theorem, or workflow
- the commit or tag
- the steps that show the problem
- the impact you believe it has

Please allow a few days for a first reply. A fix for a confirmed report is prepared before the report is made public.

## What this repository builds

CI runs `lake build` and an axiom audit. It does not publish packages, and it does not receive credentials beyond the default read-only checkout token.
