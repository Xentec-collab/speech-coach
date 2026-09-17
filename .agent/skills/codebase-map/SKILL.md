---
name: codebase-map
description: >-
  Use when you need to understand the structure, dependencies, or architecture of
  the codebase. Generates comprehensive project maps optimized for LLM context.
  Activate when the user asks to map, index, visualize, or understand codebase
  structure, or when you need a high-level overview before making changes.
---

# codebase-map Skill

A lightweight TypeScript/JavaScript code indexer installed globally via npm that
generates comprehensive project maps optimized for LLM consumption.

## When to Use

- User asks to "map the codebase" or "show project structure"
- You need a high-level architecture overview before making changes
- You need to understand file dependencies and entry points
- You need to identify leaf files, entry points, or dependency hotspots

## Commands

### Scan (Generate Index)

```bash
codebase-map scan [options]
```

Options:
- `-r, --root <path>` — Root directory to scan (default: auto-detect)
- `-o, --output <path>` — Output file path (default: `.codebasemap`)
- `-v, --verbose` — Show detailed progress
- `--include <patterns>` — Include file patterns (glob syntax)
- `--exclude <patterns>` — Exclude file patterns (glob syntax)

### Format (Output for LLM)

```bash
codebase-map format [options]
```

Options:
- `-f, --format <type>` — Output format: `auto|json|dsl|graph|markdown|tree`
- `-s, --stats` — Show statistics to stderr
- `--include <patterns...>` — Include file patterns (glob)
- `--exclude <patterns...>` — Exclude file patterns (glob)

### Update (Single File)

```bash
codebase-map update <file> [options]
```

### List (Query Index)

```bash
codebase-map list [options]
```

Options:
- `-d, --deps` — Show files with most dependencies
- `-e, --entries` — Show entry point files
- `-l, --leaves` — Show leaf files (no dependencies)

## Common Patterns

```bash
# Full scan with verbose output
codebase-map scan --verbose

# Scan only frontend source
codebase-map scan --include "frontend/src/**"

# Exclude test files
codebase-map scan --exclude "**/*.test.ts" --exclude "**/*.spec.ts"

# Format as markdown for reading
codebase-map format --format markdown

# Format as compact DSL for LLM context
codebase-map format --format dsl

# Show entry points
codebase-map list --entries

# Show leaf files
codebase-map list --leaves
```

## Notes

- The `.codebasemap` index file is generated in the project root. Consider
  adding it to `.gitignore`.
- On Windows, the bin script was patched to fix an ESM `import()` path issue
  (using `pathToFileURL` instead of raw path in dynamic import).
- The tool is installed globally: `npm install -g codebase-map`
