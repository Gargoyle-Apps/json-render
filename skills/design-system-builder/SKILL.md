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

This is the main work. Import the factory hooks and the target library's components:

```typescript
"use client";

import { useState } from "react";
import {
  useBoundProp,
  useBoundField,
  useFormField,
  useStateBinding,
  type BaseComponentProps,
} from "@json-render/react";
import { type <Name>Props } from "./catalog";

export const <name>Components = {
  Card: ({ props, children }: BaseComponentProps<<Name>Props<"Card">>) => { ... },
  Button: ({ props, emit }: BaseComponentProps<<Name>Props<"Button">>) => { ... },
  // ... all 36 components
};
```

#### Factory hooks

Use these hooks from `@json-render/react` to eliminate boilerplate:

| Hook | Use for | Components |
|------|---------|------------|
| `useFormField<T>` | Bound field + validation | Input, Textarea, Select, Checkbox, Radio, Switch |
| `useBoundField<T>` | Bound-or-local state (no validation) | Tabs, Slider, Toggle, ToggleGroup, ButtonGroup |
| `useBoundProp<T>` | Write-only binding (no local fallback) | DropdownMenu, Pagination |
| `useStateBinding<T>` | Direct state path binding | Dialog, Drawer |

#### Form components — use `useFormField`

For Input, Textarea, Select, Checkbox, Radio, Switch:

```typescript
Input: ({ props, bindings, emit }: BaseComponentProps<<Name>Props<"Input">>) => {
  const { value, setValue, errors, validate, hasValidation, validateOn } =
    useFormField<string>(props.value as string | undefined, bindings?.value, "", {
      checks: props.checks ?? undefined,
      validateOn: props.validateOn ?? "blur",
    });

  return (
    <LibInput
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (hasValidation && validateOn === "change") validate();
      }}
      onBlur={() => {
        if (hasValidation && validateOn === "blur") validate();
        emit("blur");
      }}
      onKeyDown={(e) => { if (e.key === "Enter") emit("submit"); }}
      onFocus={() => emit("focus")}
      error={errors.length > 0}
      errorText={errors[0]}
    />
  );
},
```

For Checkbox/Switch (boolean, `bindings?.checked`):

```typescript
Checkbox: ({ props, bindings, emit }: BaseComponentProps<<Name>Props<"Checkbox">>) => {
  const {
    value: checked,
    setValue: setChecked,
    errors,
    validate,
    hasValidation,
    validateOn,
  } = useFormField<boolean>(
    props.checked as boolean | undefined,
    bindings?.checked,
    !!props.checked,
    { checks: props.checks ?? undefined, validateOn: props.validateOn ?? "change" },
  );

  return (
    <LibCheckbox
      checked={checked}
      onChange={(c) => {
        setChecked(c);
        if (hasValidation && validateOn === "change") validate();
        emit("change");
      }}
      label={props.label}
    />
  );
},
```

**Default `validateOn` per component:**
- `"blur"` — Input, Textarea
- `"change"` — Select, Checkbox, Radio, Switch

#### Bound-only components — use `useBoundField`

For Tabs, Slider, Toggle, ToggleGroup, ButtonGroup:

```typescript
Tabs: ({ props, children, bindings, emit }: BaseComponentProps<<Name>Props<"Tabs">>) => {
  const tabs = props.tabs ?? [];
  const [value, setValue] = useBoundField<string>(
    props.value as string | undefined,
    bindings?.value,
    props.defaultValue ?? tabs[0]?.value ?? "",
  );

  return (
    <LibTabs value={value} onChange={(v) => { setValue(v); emit("change"); }}>
      {/* tab items */}
    </LibTabs>
  );
},

Toggle: ({ props, bindings, emit }: BaseComponentProps<<Name>Props<"Toggle">>) => {
  const [pressed, setPressed] = useBoundField<boolean>(
    props.pressed as boolean | undefined,
    bindings?.pressed,
    props.pressed ?? false,
  );
  // ...
},

Slider: ({ props, bindings, emit }: BaseComponentProps<<Name>Props<"Slider">>) => {
  const [value, setValue] = useBoundField<number>(
    props.value as number | undefined,
    bindings?.value,
    props.min ?? 0,
  );
  // ...
},
```

#### State-bound components — use `useStateBinding`

For Dialog and Drawer:

```typescript
Dialog: ({ props, children }: BaseComponentProps<<Name>Props<"Dialog">>) => {
  const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
  return (
    <LibDialog open={open ?? false} onClose={() => setOpen(false)}>
      {/* title, description, children */}
    </LibDialog>
  );
},
```

#### Write-only bindings — use `useBoundProp`

For DropdownMenu and Pagination (only need the setter, not local state):

```typescript
DropdownMenu: ({ props, bindings, emit }: BaseComponentProps<<Name>Props<"DropdownMenu">>) => {
  const [, setBoundValue] = useBoundProp<string>(
    props.value as string | undefined,
    bindings?.value,
  );
  // ...
},
```

#### Event emission

- `emit("press")` — Button click
- `emit("change")` — Value changes (Select, Toggle, etc.)
- `emit("submit")` — Enter key in Input
- `emit("focus")`, `emit("blur")` — Input focus events
- `emit("select")` — DropdownMenu item selection
- `on("press")` — For Link (checks `shouldPreventDefault`)

#### Variant mapping

Map abstract variants to library-specific ones:
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

## Component categories by hook usage

| Category | Hook | Components |
|----------|------|------------|
| Form inputs (string) | `useFormField<string>` | Input, Textarea, Select, Radio |
| Form inputs (boolean) | `useFormField<boolean>` | Checkbox, Switch |
| Bound selection | `useBoundField<string>` | Tabs, ToggleGroup, ButtonGroup |
| Bound toggle | `useBoundField<boolean>` | Toggle |
| Bound number | `useBoundField<number>` | Slider |
| State-bound overlays | `useStateBinding<boolean>` | Dialog, Drawer |
| Write-only binding | `useBoundProp<string>` | DropdownMenu |
| Write-only binding | `useBoundProp<number>` | Pagination |
| No state | (none) | Card, Stack, Grid, Separator, Accordion, Collapsible, Carousel, Table, Heading, Text, Image, Avatar, Badge, Alert, Progress, Skeleton, Spinner, Tooltip, Popover, Button, Link |

## Reference files

When building a new design system, read these files for the complete patterns:

- `packages/mui/src/components.tsx` — Full MUI implementation of all 36 components
- `packages/mui/src/catalog.ts` — How to re-export from standard-catalog
- `packages/mui/package.json` — Package structure template
- `packages/core/src/standard-catalog.ts` — The shared component definitions
- `packages/react/src/component-factories.ts` — Factory hook implementations
