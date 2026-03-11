---
name: design-system-translator
description: Add or update a json-render design system adapter using the structured mapping format. Use when asked to add support for a new UI library, translate a design system, create a mapping, or update an existing adapter.
---

# Design System Translator

Translate any React UI library into a json-render adapter using the structured mapping format. This tool replaces manual component-by-component implementation with a data-driven approach.

## How it works

1. **Read** the target library's documentation
2. **Create** a mapping file (TypeScript) describing how each of the 36 standard components maps to the library
3. **Run** the generator to produce a complete `@json-render/<name>` package
4. **Review** the output and adjust the mapping if needed

## Directory structure

```
tools/design-system-generator/
  src/
    types.ts        # DesignSystemMapping type definitions
    generate.ts     # Generator that turns mapping -> package
  mappings/
    antd.ts         # Reference mapping (Ant Design)
    <name>.ts       # Your new mapping goes here
```

## Step 1: Read the types

Before creating a mapping, read `tools/design-system-generator/src/types.ts` to understand the full `DesignSystemMapping` interface.

Key concepts:
- **`DataDrivenMapping`**: For simple components where prop/value translation is sufficient
- **`RenderOverrideMapping`**: For complex components that need custom JSX
- **`HookType`**: Which factory hook the component uses (determines state management pattern)
- **`GlobalPatterns`**: Shared label/error rendering conventions

## Step 2: Study the reference mapping

Read `tools/design-system-generator/mappings/antd.ts` — this is a complete, working mapping extracted from the hand-written `@json-render/antd` package. Use it as your template.

## Step 3: Create a new mapping

Create `tools/design-system-generator/mappings/<name>.ts`:

```typescript
import type { DesignSystemMapping } from "../src/types";

export const <name>Mapping: DesignSystemMapping = {
  name: "<name>",
  displayName: "<Display Name>",
  packageName: "@json-render/<name>",
  library: { ... },
  patterns: { ... },
  components: { ... },
};
```

### Filling in `library`

```typescript
library: {
  packageName: "<npm-package>",
  version: "^X.0.0",
  peerDeps: { /* optional icon packages, etc. */ },
  imports: [
    {
      from: "<npm-package>",
      named: [
        "Button",
        { name: "Input", alias: "LibInput" },  // alias if it conflicts
      ],
    },
  ],
},
```

### Filling in `patterns`

These define how labels and errors are rendered across all form components:

```typescript
patterns: {
  label: {
    component: "FormLabel",     // or "Label", "Text", etc.
    position: "above",          // "above" | "inline" | "left"
    wrapper: '<div style={{ marginBottom: 4 }}>', // optional wrapper
  },
  error: {
    component: "FormErrorMessage",  // or "Text", "HelperText", etc.
    props: { color: '"red.500"' },  // props on the error component
    inputErrorProp: { name: "isInvalid", value: "true" }, // error state on input
  },
  formFieldWrapper: "<FormControl>", // optional wrapping element
},
```

### Filling in `components`

Each of the 36 standard components needs a mapping. Use the hook reference table:

| Hook | Use for | Components |
|------|---------|------------|
| `none` | Pure display, no state | Card, Stack, Grid, Separator, Accordion, Collapsible, Carousel, Table, Heading, Text, Image, Avatar, Badge, Alert, Progress, Skeleton, Spinner, Tooltip, Popover, Button, Link |
| `useFormField<string>` | Text form fields with validation | Input, Textarea, Select, Radio |
| `useFormField<boolean>` | Boolean form fields with validation | Checkbox, Switch |
| `useBoundField<string>` | Bound string state, no validation | Tabs, Toggle (via boolean), ToggleGroup, ButtonGroup |
| `useBoundField<number>` | Bound number state | Slider |
| `useBoundField<boolean>` | Bound boolean state | Toggle |
| `useStateBinding<boolean>` | Direct state path binding | Dialog, Drawer |
| `useBoundProp<string>` | One-way bound prop | DropdownMenu |
| `useBoundProp<number>` | One-way bound prop | Pagination |

#### Data-driven mapping (simple components)

Use `type: "data-driven"` when the library component is a straightforward prop translation:

```typescript
Alert: {
  type: "data-driven",
  hook: "none",
  libraryComponent: "AlertComponent",
  propMap: { title: "heading", message: "description" },
  valueMap: {
    type: { info: "info", success: "success", warning: "warning", error: "error" },
  },
  staticProps: { showIcon: true },
},
```

#### Render override (complex components)

Use `type: "render-override"` when the component needs custom JSX structure:

```typescript
Card: {
  type: "render-override",
  hook: "none",
  render: `({ props, children }: BaseComponentProps<Props<"Card">>) => {
    return (
      <LibCard title={props.title}>
        {children}
      </LibCard>
    );
  }`,
  notes: "Library Card accepts title as a prop.",
},
```

The `render` field contains the complete arrow function body. It has access to:
- `props` — the standard component props
- `children` — child elements (for slot components)
- `bindings` — state binding paths
- `emit` — event emitter
- `on` — event handler factory (for Link pattern)
- All hooks imported at the top of the file
- All library components from the imports

### Tips for creating mappings

1. **Start with the reference**: Copy `antd.ts` and replace component-by-component
2. **Identify analogues**: For each standard component, find the closest library equivalent
3. **Check prop names**: Libraries often use different names for the same concept (e.g., `isDisabled` vs `disabled`, `colorScheme` vs `variant`)
4. **Check event shapes**: Some libraries pass `(value)` to onChange, others pass `(event)` — this matters for form fields
5. **Use render-override liberally**: If in doubt, use a render override. Data-driven mappings are an optimization, not a requirement
6. **Add notes**: The `notes` field helps future LLMs understand why decisions were made

## Step 4: Generate the package

```bash
cd tools/design-system-generator
npx tsx src/generate.ts mappings/<name>.ts ../../packages/<name>
```

This creates a complete package at `packages/<name>/` with all the scaffold files.

## Step 5: Review and adjust

1. Run `pnpm install` from the repo root to link the new package
2. Run `pnpm type-check` to verify types
3. If there are errors, update the mapping and regenerate
4. Test with an example app if available

## Updating an existing mapping

To update an adapter when a library releases a new version:

1. Read the library's changelog/migration guide
2. Update the mapping file (version, changed prop names, new components)
3. Regenerate the package
4. Run type-check to verify

## Available mappings

| Mapping | Library | File |
|---------|---------|------|
| antd | Ant Design 5.x | `mappings/antd.ts` |

(More mappings are added as new adapters are created)
