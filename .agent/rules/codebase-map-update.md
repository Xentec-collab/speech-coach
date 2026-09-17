---
trigger: always_on
---

# Codebase Map — Mandatory Update Rule

After **any** code change — file created, modified, or deleted — you **must** run:

```bash
codebase-map scan
```

This keeps the `.codebasemap` index in sync with the current state of the project.

## When to Run

- After writing or editing any source file (`.ts`, `.tsx`, `.py`, `.json`, etc.)
- After deleting any source file
- After adding new files or directories
- After bulk refactors, renames, or moves
- After installing/removing dependencies that change source files

## How to Run

```bash
# From the project root
codebase-map scan
```

No flags needed for the default update. Use `--verbose` only if debugging.

## Do NOT Skip

This rule is **non-negotiable**. The codebase map is used for architecture awareness and must always reflect the latest state of the code.
