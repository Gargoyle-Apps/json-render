# Design System Mapping - Efficiency & Templatization Notes

Notes on making the design system builder more efficient. Steps 1-5 from the 
original plan have been completed. This file now serves as a record of what was 
done and what could still be explored.

## Current State (Updated)

We have 3 design system packages (shadcn, MUI, Carbon) that map 36 standard 
components to library-specific implementations. The catalog (Zod schemas) is 
shared via `@json-render/core/standard-catalog`.

**Completed:** Two factory hooks (`useBoundField`, `useFormField`) now live in 
`@json-render/react` and eliminate the repeated state-binding and validation 
boilerplate. All 3 packages have been refactored to use them (12 components 
per package). The `design-system-builder` skill has been updated.

| Package | Before | After | Saved |
|---------|--------|-------|-------|
| shadcn  | 1247   | 1188  | 59    |
| MUI     | 1204   | 1143  | 61    |
| Carbon  | 1191   | 1130  | 61    |

The remaining ~1100-1200 lines per package are primarily library-specific JSX, 
variant/size mappings, and structural patterns that are inherently per-library.

## What Was Repeated (Now Solved)

### 1. Bound vs Local State Boilerplate — SOLVED with `useBoundField`

Previously every form component repeated this 5-line pattern:

```tsx
const [boundValue, setBoundValue] = useBoundProp<string>(props.value, bindings?.value);
const [localValue, setLocalValue] = useState("");
const isBound = !!bindings?.value;
const value = isBound ? (boundValue ?? "") : localValue;
const setValue = isBound ? setBoundValue : setLocalValue;
```

Now replaced with:

```tsx
const [value, setValue] = useBoundField<string>(props.value, bindings?.value, "");
```

Used by: Tabs, Slider, Toggle, ToggleGroup, ButtonGroup (11 components per pkg).

### 2. Validation Boilerplate — SOLVED with `useFormField`

Previously every form component also added:

```tsx
const validateOn = props.validateOn ?? "blur";
const hasValidation = !!(bindings?.value && props.checks?.length);
const { errors, validate } = useFieldValidation(
  bindings?.value ?? "",
  hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
);
```

Now the full bound-state + validation pattern is a single call:

```tsx
const { value, setValue, errors, validate, hasValidation, validateOn } =
  useFormField<string>(props.value, bindings?.value, "", {
    checks: props.checks ?? undefined,
    validateOn: props.validateOn ?? "blur",
  });
```

Used by: Input, Textarea, Select, Checkbox, Radio, Switch (6 components per pkg).

### 3. Variant Mapping (Still Per-Library)

Every package maps the same abstract variants to library-specific values:
- `primary` / `secondary` / `danger` → MUI: `contained`/`outlined` + `primary`/`secondary`/`error`, Carbon: `primary`/`secondary`/`danger`
- `info` / `success` / `warning` / `error` → direct map in Carbon, variant + custom class in shadcn, `severity` in MUI

### 4. Size Mapping

Abstract sizes (`sm`, `md`, `lg`) → library-specific values (pixel numbers, 
string tokens, className tokens). Every package has its own mapping objects.

### 5. Structural Patterns

Components like Card, Table, Accordion, Tabs, Dialog, Drawer follow the same 
structural pattern in every package — just with different wrapper components.

## Ideas for Templatization

### Option 1: Component Template DSL

Define each component's behavior as a declarative template, then generate the 
library-specific JSX. Example:

```yaml
Button:
  type: action
  props_used: [label, variant, disabled]
  events: [press]
  variant_map:
    primary: { mui: {variant: "contained", color: "primary"}, carbon: {kind: "primary"} }
    secondary: { mui: {variant: "outlined", color: "secondary"}, carbon: {kind: "secondary"} }
    danger: { mui: {variant: "contained", color: "error"}, carbon: {kind: "danger"} }
  render: |
    <LibButton {variant_props} disabled={props.disabled} onClick={() => emit("press")}>
      {props.label}
    </LibButton>
```

The skill would take this DSL + a library mapping and generate the full 
`components.tsx`. Problem: JSX generation from YAML is fragile and hard to debug.

### Option 2: Higher-Order Component Factory

Extract the repeated logic into shared HOCs or wrapper functions:

```tsx
// In @json-render/core or a new @json-render/design-system-utils package
export function createBoundInput<P extends { value?: string | null }>(
  render: (value: string, setValue: (v: string) => void, errors: string[], inputProps: P) => JSX.Element
) {
  return ({ props, bindings, emit }: BaseComponentProps<P>) => {
    const [value, setValue] = useBoundField(props.value, bindings?.value);
    const { errors, validate } = useValidation(bindings?.value, props);
    return render(value, setValue, errors, props);
  };
}

// Then in each package, the Input is just:
Input: createBoundInput<CarbonProps<"Input">>((value, setValue, errors, props) => (
  <TextInput
    labelText={props.label}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    invalid={errors.length > 0}
    invalidText={errors[0]}
  />
)),
```

This would cut each component from ~40 lines to ~10 lines. The factory handles 
all the bound/local state, validation, and event emission. Each package only 
provides the JSX shell.

### Option 3: Mapping Table + Code Generator Script

Create a mapping file per library that describes which library component maps 
to each standard component, and how props translate:

```ts
// packages/carbon/src/mapping.ts
export const carbonMapping = {
  Button: {
    component: "CarbonButton",
    import: "@carbon/react",
    propMap: {
      label: "children",
      variant: { prop: "kind", values: { primary: "primary", secondary: "secondary", danger: "danger" } },
      disabled: "disabled",
    },
    eventMap: { press: "onClick" },
  },
  Input: {
    component: "TextInput",
    import: "@carbon/react",
    propMap: {
      label: "labelText",
      value: "value",
      placeholder: "placeholder",
      type: "type",
    },
    eventMap: { change: "onChange", blur: "onBlur", focus: "onFocus", submit: "onKeyDown:Enter" },
    validation: { errorProp: "invalid", errorTextProp: "invalidText" },
  },
  // ...
};
```

A script reads this mapping and generates `components.tsx`. Benefits:
- Adding a new library is filling out a JSON/TS table, not writing 1000 lines of JSX
- The generator handles all boilerplate (state binding, validation, events)
- Mapping tables are easy for an AI agent to produce from library docs
- Easy to audit and diff across libraries

### Option 4: Hybrid (Recommended for Skill)

Combine Option 2 (factories) and Option 3 (mapping tables):

1. **Shared factories** in `@json-render/core` or a utility package handle all the 
   repeated logic (state binding, validation, events, variant mapping)
2. **Per-library mapping** defines component imports, prop translations, and JSX wrappers
3. **The skill** teaches agents to:
   a. Read the target library's docs/types to understand its component API
   b. Fill out the mapping table for all 36 components
   c. Use the factories to keep implementations minimal
   d. Handle edge cases that don't fit the factory pattern with manual overrides

This keeps the skill focused on the creative work (understanding a new library's 
API and mapping it) while the factories handle the mechanical work.

## What the Improved Skill Would Look Like

### Input: Library name + docs URL

The agent would:
1. Fetch/read the library docs to understand its component API
2. For each of the 36 standard components, identify the corresponding library component
3. Map props (naming, values, structure differences)
4. Identify edge cases (components that don't have a 1:1 mapping)
5. Generate the mapping table
6. Run the factory/generator to produce `components.tsx`
7. Fix any type errors from edge cases

### Key Insight

The mapping from "standard component" to "library component" is the valuable work.
Everything else (state binding, validation, events, package scaffolding) is 
mechanical. The improved skill should focus the agent's effort on the mapping 
and automate everything else.

## Concrete Patterns Observed Across MUI and Carbon

### Components with Identical Logic (Only JSX Wrapper Differs)

These could be fully factory-generated:
- **Card** — wrapper with title/description header + content slot
- **Stack** — flex container with direction/gap/align/justify mapping
- **Grid** — CSS grid with columns + gap
- **Separator** — horizontal/vertical divider
- **Heading** — level → element tag or typography variant
- **Text** — variant → style mapping
- **Image** — img tag with placeholder fallback
- **Avatar** — circular container with initials fallback
- **Badge** — variant → color/style mapping
- **Progress** — value/max/label → progress bar
- **Skeleton** — width/height/rounded placeholder
- **Spinner** — size → loading indicator
- **Button** — variant/color mapping + onClick → emit("press")
- **Link** — href + onClick with shouldPreventDefault check

### Components with Moderate Library Differences

Need factory + small per-library customization:
- **Alert** — MUI has `severity`, Carbon has `kind`, shadcn maps to variant + custom class
- **Table** — same structure but different component names per library
- **Accordion** — single vs multiple behavior differs per library API
- **Tabs** — index-based (Carbon) vs value-based (MUI, shadcn) selection
- **Dialog/Drawer** — controlled open state, different close mechanisms
- **Select** — MUI uses custom Select, Carbon uses native, shadcn uses Radix

### Components That Need Manual Implementation

Too library-specific for factories:
- **Carousel** — no native equivalent in most libraries, custom implementation each time
- **Tooltip/Popover** — very different trigger/positioning APIs per library
- **DropdownMenu** — Dropdown (Carbon) vs Menu (MUI) vs Radix DropdownMenu (shadcn)

## File Size Comparison

| Package | Original | After factory hooks | Savings |
|---------|----------|-------------------|---------|
| shadcn  | 1247     | 1188              | 59      |
| MUI     | 1204     | 1143              | 61      |
| Carbon  | 1191     | 1130              | 61      |

The hook-level refactoring saved ~60 lines per package. The remaining lines are 
mostly library-specific JSX that can't be abstracted without a code generator.

## Completed Steps

1. ~~Build `createBoundField` and `createBoundCheckbox` factory hooks in core~~
   **Done** — `useBoundField<T>` and `useFormField<T>` in `@json-render/react`
   (file: `packages/react/src/component-factories.ts`)
2. ~~Build `createFormComponent` and `createActionComponent` factory wrappers~~
   **Simplified** — `useFormField` handles all form components; higher-order 
   component factories were not needed since the hook approach is cleaner
3. ~~Refactor MUI and Carbon to use factories as proof of concept~~
   **Done** — All 3 packages (shadcn, MUI, Carbon) refactored
4. ~~Measure line reduction and developer experience~~
   **Done** — ~60 lines saved per package, 12 components per package simplified
5. ~~Update the design-system-builder skill with factory patterns~~
   **Done** — `skills/design-system-builder/SKILL.md` updated with hook usage 
   tables, code examples, and component-by-hook-category mapping

## Design System Translator Tool (Built)

The "Option 4: Hybrid" approach has been implemented as a standalone tool at
`tools/design-system-generator/`. This is the foundation for the `json-render-adapters`
repository — a translator tool that helps convert design systems to work with
json-render using structured mappings.

### How it works

1. A `DesignSystemMapping` type defines how a UI library maps to the 36 standard
   components — imports, prop translations, value mappings, and JSX overrides
2. Each mapping is a TypeScript file in `tools/design-system-generator/mappings/`
3. A generator script reads a mapping and produces a complete `@json-render/<name>`
   package (package.json, tsconfig, catalog, index, and components.tsx)
4. The `SKILL.md` teaches LLMs how to create and update mappings

### Component mapping types

- **`DataDrivenMapping`** — For simple components (Badge, Alert, Input, Checkbox)
  where prop/value translation tables are sufficient. The generator handles the
  JSX structure automatically.
- **`RenderOverrideMapping`** — For complex components (Card, Table, Tabs, Carousel)
  where the JSX structure varies too much between libraries. The mapping contains
  the complete render function body.

### Shipped mappings

| Library | Mapping file | Status |
|---------|-------------|--------|
| Ant Design 5.x | `mappings/antd.ts` | Complete (extracted from hand-written package) |

### Vision

This tool is designed to be used by LLMs:
- Ships with proven mappings out of the box (antd, and later shadcn, MUI, Carbon)
- LLMs can create new mappings by reading a library's docs and filling in the
  structured format
- LLMs can update existing mappings when a library releases a new version
- The mapping format is the single source of truth for each adapter; regenerate
  the package any time the mapping changes

### Files

```
tools/design-system-generator/
  src/types.ts      — DesignSystemMapping interface
  src/generate.ts   — Generator: mapping -> complete package
  mappings/antd.ts  — Reference mapping (Ant Design)
  SKILL.md          — Instructions for LLMs
  package.json      — Tool dependencies (tsx)
  tsconfig.json     — TypeScript config
```

## Remaining Ideas (Future Work)

- Extract shadcn, MUI, and Carbon mappings from existing packages
- Add a `npx @json-render/create-design-system <name>` CLI wrapper
- Web UI for interactive mapping creation (drag-and-drop prop mapping)
- AI-powered workflow: paste a library's docs URL, auto-generate mapping
