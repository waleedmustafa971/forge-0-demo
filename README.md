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
  checks that exactly one defect is fixed and nothing else broke, or
* when no fix survives verification, it **comments its evidence on the issue** instead of claiming
  a fix.

The pull requests are left unmerged because the defects are benchmark fixtures.

## Runs

| Issue | Defect | Result |
| --- | --- | --- |
| (runs appear here once the repository is public) | | |

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
