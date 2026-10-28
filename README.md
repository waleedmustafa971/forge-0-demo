# FORGE-0 demo: a service with planted bugs

This repository is where you can watch [FORGE-0](https://github.com/waleedmustafa971/forge-0-hackathon)
work on GitHub with nothing to install. It holds a small TypeScript order-management service with
twelve planted defects; each one makes a test fail.

**How a run works.** A collaborator labels an issue `forge0`, naming a failing test. The
[FORGE-0 workflow](.github/workflows/forge0.yml) assembles FORGE-0, and FORGE-0 investigates on Meta
Muse Spark 1.3 in an offline Docker sandbox. It forms competing explanations, runs experiments that
rule some of them out, writes a patch, and has an independent verifier check it against the full
test suite. Then either:

* it opens a **pull request whose description is the evidence**, and [CI](.github/workflows/ci.yml)
  checks it test by test: exactly one planted defect now passes, and no other test changed, or
* when no fix survives verification, it **comments its evidence on the issue** instead of claiming
  a fix.

The pull requests are left unmerged because the defects are benchmark fixtures.

## Runs

| Issue | Defect | Result |
| --- | --- | --- |
| [#1](https://github.com/waleedmustafa971/forge-0-demo/issues/1) | D7: a price cache that is never invalidated | **Verified fix**, [PR #4](https://github.com/waleedmustafa971/forge-0-demo/pull/4). 3 sandbox experiments refuted 2 of 3 explanations; the fix invalidates the cached price on every price change, rather than bypassing the cache (which would break a rate-limit test in another file). 3 model calls, $0.07 |
| [#2](https://github.com/waleedmustafa971/forge-0-demo/issues/2) | D10: fees read from JSON as strings | **Verified fix**, [PR #5](https://github.com/waleedmustafa971/forge-0-demo/pull/5). The fix parses every fee when the config loads, not just the one in the failing path, so the gift-wrap fee is fixed too. 3 model calls, $0.07 |
| [#3](https://github.com/waleedmustafa971/forge-0-demo/issues/3) | D12: cart lines in a plain object keyed by numeric id | **Verified fix**, [PR #6](https://github.com/waleedmustafa971/forge-0-demo/pull/6). 3 experiments, 2 of 3 explanations refuted; the fix stores each cart in a `Map`, rather than sorting the output. 3 model calls, $0.12 |

All three ran on Muse Spark 1.3 on 2026-10-28. Their CI ran an earlier, count-only version of the
check (32 pass, 11 fail). The test-by-test check was added afterwards and passes on all three
branches: each fixes exactly its target test and changes no other. Each fix also passes its defect's hidden tests (3/3), which
are never shown to FORGE-0 and are designed to catch patches that only hide the symptom. They are in
[forge-0-hackathon](https://github.com/waleedmustafa971/forge-0-hackathon/tree/main/new/benchmarks/hidden-tests).
Costs are estimated at Muse Spark 1.3 list prices.

The first comment on #1 comes from a run before the API key was set, which ran on FORGE-0's labelled
mock provider, found no fix, and said so. The workflow now refuses to run without a key.

Each run's Actions log and full evidence report (an artifact of the run) are linked from its issue.

## Pre-existing and new

The service and defects D1–D5 existed before the Meta Global AI Developer Hackathon (they are part
of [forge-0-core](https://github.com/waleedmustafa971/forge-0-core)). Defects D6–D12, the service
code they live in, and both workflows were written during the hackathon. This repository is a
demonstration target, not the submission itself: that is
[forge-0-hackathon](https://github.com/waleedmustafa971/forge-0-hackathon).

## Run the tests yourself

The service itself is described in [SERVICE.md](SERVICE.md).

```bash
npm ci
npm test            # 31 pass, 12 fail: the planted defects
npm run typecheck
```
