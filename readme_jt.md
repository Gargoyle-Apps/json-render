# JT Branch - Experiment Notes

## Goal

Build swappable design system registries for json-render (Option A architecture).
Same abstract catalog, different renderers per design system.

## Architecture Decision

**Option A: Swappable Registries** - One abstract component catalog with identical Zod prop schemas across all design systems. A spec generated against any catalog works with any registry.

### Single Source of Truth

The shared catalog lives in `@json-render/core/standard-catalog`. This is a new subpath export from core containing:
- `standardComponentDefinitions` — 36 component definitions with Zod prop schemas
- `validationCheckSchema`, `validateOnSchema` — shared form validation schemas
- `StandardProps<K>` — type helper to infer props from definitions

Each design system package re-exports these under its own name (e.g. `muiComponentDefinitions`, `shadcnComponentDefinitions`) and provides platform-specific component implementations. **No duplication.**

The catalog defines 36 components in 4 categories:
- **Layout** (10): Card, Stack, Grid, Separator, Tabs, Accordion, Collapsible, Dialog, Drawer, Carousel
- **Data Display** (12): Table, Heading, Text, Image, Avatar, Badge, Alert, Progress, Skeleton, Spinner, Tooltip, Popover
- **Form Inputs** (7): Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- **Actions** (7): Button, Link, DropdownMenu, Toggle, ToggleGroup, ButtonGroup, Pagination

## Packages

### @json-render/core (modified)
- Added `./standard-catalog` subpath export
- Contains the shared component definitions all design systems use
- Entry: `packages/core/src/standard-catalog.ts`

### @json-render/shadcn (existing)
- Radix UI + Tailwind CSS
- 36 components, fully implemented
- Entry: `packages/shadcn/`
- Note: still uses its own copy of definitions (could be migrated to standard-catalog)

### @json-render/mui (new - this branch)
- Material UI v7 + Emotion
- 36 components, all implemented
- Entry: `packages/mui/`
- Status: **Type-checked and built successfully**
- Imports catalog from `@json-render/core/standard-catalog`

### @json-render/carbon (new - this branch)
- IBM Carbon Design System (`@carbon/react` v1.102)
- 36 components, all implemented
- Entry: `packages/carbon/`
- Status: **Type-checked and built successfully**
- Imports catalog from `@json-render/core/standard-catalog`

## Design System Roadmap

| Order | System | Status |
|-------|--------|--------|
| 1 | shadcn (Radix + Tailwind) | Existing |
| 2 | MUI (Material UI v7) | Done |
| 3 | Carbon (@carbon/react v1.102) | Done |
| 4 | Bootstrap (react-bootstrap) | Planned |
| 5 | Lightning (Salesforce) | Planned |
| 6 | tw-elements | Planned |

## How It Works

```tsx
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { defineRegistry, Renderer } from "@json-render/react";

// Catalog — all design system packages re-export from the same source
import { muiComponentDefinitions } from "@json-render/mui/catalog";
// OR: import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
// OR: import { standardComponentDefinitions } from "@json-render/core/standard-catalog";
// All produce identical spec shapes — they're the same definitions

const catalog = defineCatalog(schema, {
  components: {
    Card: muiComponentDefinitions.Card,
    Button: muiComponentDefinitions.Button,
    Input: muiComponentDefinitions.Input,
  },
  actions: {},
});

// Registry - swap this to change design system
import { muiComponents } from "@json-render/mui";
// OR: import { shadcnComponents } from "@json-render/shadcn";

const { registry } = defineRegistry(catalog, {
  components: {
    Card: muiComponents.Card,
    Button: muiComponents.Button,
    Input: muiComponents.Input,
  },
});

// Same spec renders with whichever design system you choose
<Renderer spec={spec} registry={registry} />
```

## Factory Hooks (Boilerplate Reduction)

All 3 design system packages had ~60% repeated boilerplate in `components.tsx` — the same bound-state + validation hook pattern copy-pasted across every form component.

Two factory hooks now live in `@json-render/react` (`packages/react/src/component-factories.ts`):

| Hook | Replaces | Used by |
|------|----------|---------|
| `useBoundField<T>` | `useBoundProp` + `useState` + `isBound` pattern (5 lines → 1 call) | Tabs, Slider, Toggle, ToggleGroup, ButtonGroup |
| `useFormField<T>` | `useBoundField` + `useFieldValidation` pattern (10 lines → 1 call) | Input, Textarea, Select, Checkbox, Radio, Switch |

All 3 packages (shadcn, MUI, Carbon) have been refactored — 12 components per package now use the factory hooks. Line counts after refactoring:

| Package | Before | After | Saved |
|---------|--------|-------|-------|
| shadcn  | 1247   | 1188  | 59    |
| MUI     | 1204   | 1143  | 61    |
| Carbon  | 1191   | 1130  | 61    |

The `design-system-builder` skill has been updated to teach agents the factory hook patterns.

## Completed

- [x] Install MUI deps (`pnpm install` from root)
- [x] Type-check the MUI package — clean pass
- [x] Build the MUI package — CJS + ESM + DTS
- [x] Extract shared catalog to `@json-render/core/standard-catalog`
- [x] MUI catalog re-exports from standard-catalog (no duplication)
- [x] Create a Cursor skill for the design-system-builder pattern (`skills/design-system-builder/SKILL.md`)
- [x] Build `useBoundField` and `useFormField` factory hooks in `@json-render/react`
- [x] Refactor shadcn, MUI, and Carbon to use factory hooks
- [x] Update design-system-builder skill with factory hook patterns

## Next Steps

- [ ] Create individual skills per design system (MUI first)
- [ ] Add Bootstrap as the next design system
- [ ] Migrate shadcn catalog to also re-export from standard-catalog
- [ ] Add an example app that demos swapping between shadcn and MUI
- [ ] Consider a `npx @json-render/create-design-system <name>` CLI tool

## Environment Notes

- pnpm installed via Homebrew
- Turbo installed globally via npm
- Aikido security wrapper intercepts pnpm as a shell function
- portless needed globally for dev servers
- See `.cursor/rules/local-environment.mdc` for details
