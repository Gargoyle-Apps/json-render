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

## Design System Roadmap

| Order | System | Status |
|-------|--------|--------|
| 1 | shadcn (Radix + Tailwind) | Existing |
| 2 | **MUI (Material UI)** | **In progress** |
| 3 | Bootstrap (react-bootstrap) | Planned |
| 4 | Carbon (@carbon/react) | Planned |
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

## Completed

- [x] Install MUI deps (`pnpm install` from root)
- [x] Type-check the MUI package — clean pass
- [x] Build the MUI package — CJS + ESM + DTS
- [x] Extract shared catalog to `@json-render/core/standard-catalog`
- [x] MUI catalog re-exports from standard-catalog (no duplication)

## Next Steps

- [x] Create a Cursor skill for the design-system-builder pattern (`skills/design-system-builder/SKILL.md`)
- [ ] Create individual skills per design system (MUI first)
- [ ] Add Bootstrap as the next design system
- [ ] Migrate shadcn catalog to also re-export from standard-catalog
- [ ] Add an example app that demos swapping between shadcn and MUI

## Environment Notes

- pnpm installed via Homebrew
- Turbo installed globally via npm
- Aikido security wrapper intercepts pnpm as a shell function
- portless needed globally for dev servers
- See `.cursor/rules/local-environment.mdc` for details
