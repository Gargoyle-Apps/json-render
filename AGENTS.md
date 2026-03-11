# AGENTS.md

Instructions for AI coding agents working with the json-render-adapters repository.

## What this repo is

This is the **design system adapters** repo for [json-render](https://github.com/Gargoyle-Apps/json-render). It contains:

1. **Adapter packages** (`packages/shadcn`, `packages/mui`, `packages/carbon`, `packages/antd`) — map json-render's 36 standard components to specific UI libraries
2. **Translator tool** (`tools/design-system-generator/`) — structured mapping format + code generator for creating new adapters
3. **Skills** (`skills/design-system-builder/`) — instructions for LLMs to build adapters

The core `json-render` framework (`@json-render/core`, `@json-render/react`) is a **dependency**, not part of this repo.

## Package Management

**Always check the latest version before installing a package.**

```bash
npm view <package-name> version
```

## Code Style

- Do not use emojis in code or UI
- Use the factory hooks from `@json-render/react` (`useBoundField`, `useFormField`, `useStateBinding`, `useBoundProp`) in all component implementations

## Workflow

- Run `pnpm type-check` after each turn to ensure type safety
- When adding a new adapter, use the translator tool workflow:
  1. Create a mapping in `tools/design-system-generator/mappings/<name>.ts`
  2. Run the generator to scaffold the package
  3. Review and adjust the generated code
  4. Update the SKILL.md and this file if needed

## Adding a New Adapter

Read `tools/design-system-generator/SKILL.md` for the complete workflow. The short version:

1. Study the target library's docs
2. Create a mapping file (use `mappings/antd.ts` as reference)
3. Run: `pnpm generate mappings/<name>.ts ../../packages/<name>`
4. Install deps: `pnpm install`
5. Type-check: `pnpm type-check`

## Existing Adapters

| Package | Library | Status |
|---------|---------|--------|
| `@json-render/shadcn` | shadcn/ui | Complete |
| `@json-render/mui` | Material UI | Complete |
| `@json-render/carbon` | IBM Carbon | Complete |
| `@json-render/antd` | Ant Design | Complete |
