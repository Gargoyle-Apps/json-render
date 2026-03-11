# json-render-adapters

Design system adapters and translator tool for [json-render](https://github.com/Gargoyle-Apps/json-render).

This repo provides ready-to-use adapter packages that map json-render's 36 standard components to popular UI libraries, plus a translator tool for creating new adapters.

## Adapters

| Package | Library | Install |
|---------|---------|---------|
| `@json-render/shadcn` | [shadcn/ui](https://ui.shadcn.com/) | `npm install @json-render/shadcn` |
| `@json-render/mui` | [Material UI](https://mui.com/) | `npm install @json-render/mui` |
| `@json-render/carbon` | [IBM Carbon](https://carbondesignsystem.com/) | `npm install @json-render/carbon` |
| `@json-render/antd` | [Ant Design](https://ant.design/) | `npm install @json-render/antd` |

Each adapter implements all 36 standard components. Specs are fully interchangeable -- generate with any catalog, render with any adapter's registry.

## Usage

```tsx
import { defineRegistry } from "@json-render/react";
import { antdComponents, antdComponentDefinitions } from "@json-render/antd";

const catalog = defineCatalog(antdComponentDefinitions);
const { registry } = defineRegistry(catalog, {
  components: antdComponents,
});
```

## Translator Tool

The translator tool at `tools/design-system-generator/` lets you create new adapters from structured mapping files rather than writing 1000+ lines of component code by hand.

### How it works

1. Describe how each standard component maps to the target library in a TypeScript mapping file
2. Run the generator to produce a complete adapter package
3. Review and adjust

### Creating a new adapter

```bash
# 1. Create a mapping (use mappings/antd.ts as reference)
cp tools/design-system-generator/mappings/antd.ts tools/design-system-generator/mappings/chakra.ts
# Edit chakra.ts to map components to Chakra UI

# 2. Generate the package
pnpm generate tools/design-system-generator/mappings/chakra.ts packages/chakra

# 3. Install and verify
pnpm install
pnpm type-check
```

See `tools/design-system-generator/SKILL.md` for detailed instructions.

## Architecture

All adapters share one abstract catalog from `@json-render/core/standard-catalog` (36 component definitions with Zod schemas). Each adapter only provides:

- **`catalog.ts`** -- Re-exports standard definitions under a library-specific name
- **`components.tsx`** -- Maps each component to the target library's React components

Factory hooks from `@json-render/react` handle the common patterns:

| Hook | Purpose |
|------|---------|
| `useFormField<T>` | Bound state + validation for form inputs |
| `useBoundField<T>` | Bound-or-local state management |
| `useStateBinding<T>` | Direct state path binding (Dialog/Drawer) |
| `useBoundProp<T>` | One-way prop binding |

## Development

```bash
pnpm install
pnpm build
pnpm type-check
```
