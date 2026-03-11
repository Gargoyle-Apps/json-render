---
name: design-system-builder
description: Create a new json-render design system package. Use when adding support for a new UI component library (e.g. Bootstrap, Carbon, Lightning, Ant Design), scaffolding a design system package, or implementing component registries for a new framework.
---

# Design System Builder

Build a new `@json-render/<name>` package that renders the standard 36-component catalog using a specific UI library.

## Architecture

All design system packages share one abstract catalog from `@json-render/core/standard-catalog`. Each package only provides:
1. A `catalog.ts` that re-exports the standard definitions under a library-specific name
2. A `components.tsx` that maps each component to the target library's React components

Specs are fully interchangeable — generate with any catalog, render with any registry.

## Step-by-step

### 1. Scaffold the package

Create `packages/<name>/` with these files:

**package.json** — Use `packages/mui/package.json` as template. Change:
- `name` to `@json-render/<name>`
- `description` for the target library
- `dependencies`: replace MUI packages with target library deps
- Keep `@json-render/core`, `@json-render/react` as workspace deps
- Keep `zod` as peer dep

**tsconfig.json** — Copy from `packages/mui/tsconfig.json` (no changes needed).

**tsup.config.ts** — Copy from `packages/mui/tsup.config.ts`. Update `external` array to list the target library's packages instead of MUI's.

### 2. Create catalog.ts (6 lines)

```typescript
export {
  standardComponentDefinitions as <name>ComponentDefinitions,
  validationCheckSchema,
  validateOnSchema,
  type StandardComponentDefinition as ComponentDefinition,
  type StandardProps as <Name>Props,
} from "@json-render/core/standard-catalog";
```

### 3. Create index.ts

```typescript
export { <name>Components } from "./components";
export {
  <name>ComponentDefinitions,
  type ComponentDefinition,
  type <Name>Props,
} from "./catalog";
```

### 4. Create components.tsx

This is the main work. Follow the pattern in `packages/mui/src/components.tsx`:

**Component signature** — Every component receives `BaseComponentProps<Props>`:

```typescript
import { useBoundProp, useStateBinding, useFieldValidation, type BaseComponentProps } from "@json-render/react";
import { type <Name>Props } from "./catalog";

export const <name>Components = {
  Card: ({ props, children }: BaseComponentProps<<Name>Props<"Card">>) => { ... },
  Button: ({ props, emit }: BaseComponentProps<<Name>Props<"Button">>) => { ... },
  // ... all 36 components
};
```

**Key hooks from `@json-render/react`:**

| Hook | Use for | Example |
|------|---------|---------|
| `useBoundProp<T>(staticValue, binding)` | Two-way state binding on form fields | `const [value, setValue] = useBoundProp<string>(props.value, bindings?.value)` |
| `useStateBinding<T>(path)` | Direct state path binding (Dialog/Drawer open) | `const [open, setOpen] = useStateBinding<boolean>(props.openPath)` |
| `useFieldValidation(binding, config)` | Form validation with checks/timing | `const { errors, validate } = useFieldValidation(bindings?.value, { checks, validateOn })` |

**Bound vs local state pattern** — Every form component needs:

```typescript
const [boundValue, setBoundValue] = useBoundProp<string>(props.value, bindings?.value);
const [localValue, setLocalValue] = useState("");
const isBound = !!bindings?.value;
const value = isBound ? (boundValue ?? "") : localValue;
const setValue = isBound ? setBoundValue : setLocalValue;
```

**Event emission:**
- `emit("press")` — Button click
- `emit("change")` — Value changes (Select, Toggle, etc.)
- `emit("submit")` — Enter key in Input
- `emit("focus")`, `emit("blur")` — Input focus events
- `on("press")` — For Link (checks `shouldPreventDefault`)

**Variant mapping** — Map abstract variants to library-specific ones:
- `primary` / `secondary` / `danger` -> library's variant/color system
- `default` / `outline` -> library's styling variants

### 5. Validate

```bash
cd packages/<name> && npx tsc --noEmit   # type-check
cd packages/<name> && npx tsup           # build
```

### 6. Install deps

From repo root: `pnpm install --no-frozen-lockfile`

## 36 Standard Components

Implement all of these. Reference `packages/mui/src/components.tsx` for the complete implementation pattern of each.

**Layout:** Card, Stack, Grid, Separator, Tabs, Accordion, Collapsible, Dialog, Drawer, Carousel
**Data Display:** Table, Heading, Text, Image, Avatar, Badge, Alert, Progress, Skeleton, Spinner, Tooltip, Popover
**Form Inputs:** Input, Textarea, Select, Checkbox, Radio, Switch, Slider
**Actions:** Button, Link, DropdownMenu, Toggle, ToggleGroup, ButtonGroup, Pagination

## Reference files

When building a new design system, read these files for the complete patterns:

- `packages/mui/src/components.tsx` — Full MUI implementation of all 36 components
- `packages/mui/src/catalog.ts` — How to re-export from standard-catalog
- `packages/mui/package.json` — Package structure template
- `packages/core/src/standard-catalog.ts` — The shared component definitions
