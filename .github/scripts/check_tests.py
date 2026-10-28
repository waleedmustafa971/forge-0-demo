"""Checks a JUnit test report against the defect contract, test by test.

    python3 check_tests.py RESULTS.xml EXPECTED.txt BRANCH
    python3 check_tests.py --write RESULTS.xml EXPECTED.txt     # record the current results

EXPECTED.txt lists every test of main with its status (`pass` or `fail`: the planted defects).
On main the results must match it exactly. On a FORGE-0 fix branch (forge0/*) exactly one listed
failing test must now pass, and every other test must keep its status: nothing that passed may
fail, no test may disappear, be added or be skipped.
"""

import re
import sys
import xml.etree.ElementTree as ET


def read_results(path):
    results = {}

    def walk(node, suites):
        for child in node:
            if child.tag == "testsuite":
                walk(child, [*suites, child.get("name", "")])
            elif child.tag == "testcase":
                file = re.split(r"[\\/]", child.get("file", ""))[-1]
                name = f"{file} :: {' > '.join([*suites, child.get('name', '')])}"
                if child.find("skipped") is not None:
                    status = "skipped"
                elif child.find("failure") is not None or child.find("error") is not None:
                    status = "fail"
                else:
                    status = "pass"
                if name in results:
                    sys.exit(f"Two tests share the name {name!r}")
                results[name] = status

    walk(ET.parse(path).getroot(), [])
    if not results:
        sys.exit("The report has no tests")
    return results


def read_expected(path):
    expected = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                status, name = line.rstrip("\n").split("\t", 1)
                expected[name] = status
    return expected


def main():
    if sys.argv[1] == "--write":
        results = read_results(sys.argv[2])
        with open(sys.argv[3], "w", encoding="utf-8", newline="\n") as f:
            f.writelines(f"{status}\t{name}\n" for name, status in sorted(results.items()))
        return

    results, expected, branch = read_results(sys.argv[1]), read_expected(sys.argv[2]), sys.argv[3]
    problems = [f"missing: {n}" for n in expected if n not in results]
    problems += [f"not in the expected list: {n}" for n in results if n not in expected]
    problems += [f"skipped: {n}" for n, s in results.items() if s == "skipped"]
    changed = {n: (expected[n], s) for n, s in results.items() if n in expected and s != expected[n]}
    fixed = [n for n, (was, now) in changed.items() if (was, now) == ("fail", "pass")]
    broken = [n for n, (was, now) in changed.items() if was == "pass"]
    problems += [f"was passing, now {changed[n][1]}: {n}" for n in broken]

    fix_branch = branch.startswith("forge0/")
    if fix_branch and len(fixed) != 1:
        problems.append(f"a fix branch must fix exactly one defect; it fixed {len(fixed)}")
    if not fix_branch and fixed:
        problems += [f"expected to fail on {branch}, now passes: {n}" for n in fixed]

    passed = sum(s == "pass" for s in results.values())
    print(f"{passed} passed, {len(results) - passed} not passing, of {len(results)} tests")
    for name in fixed:
        print(f"fixed: {name}")
    if problems:
        sys.exit("Defect contract violated:\n  " + "\n  ".join(problems))
    print("Defect contract holds" + (": one defect fixed, no other test changed" if fix_branch else ""))


if __name__ == "__main__":
    main()
