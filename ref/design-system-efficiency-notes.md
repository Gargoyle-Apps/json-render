# Design System Mapping - Efficiency & Templatization Notes

Notes for a future chat on making the design system builder more efficient, 
potentially turning into a more powerful skill or automated tool.

## Current State

We have 3 design system packages (shadcn, MUI, Carbon) each with a ~1000-line 
`components.tsx` that maps 36 standard components to library-specific implementations.
The catalog (Zod schemas) is already shared via `@json-render/core/standard-catalog`.
The problem is the component implementations — they're 90% identical logic with 
library-specific JSX sprinkled in.

## What's Repeated Across Every Package

### 1. Bound vs Local State Boilerplate

Every form component repeats this exact pattern:

```tsx
const [boundValue, setBoundValue] = useBoundProp<string>(props.value, bindings?.value);
const [localValue, setLocalValue] = useState("");
const isBound = !!bindings?.value;
const value = isBound ? (boundValue ?? "") : localValue;
const setValue = isBound ? setBoundValue : setLocalValue;
```

This appears 10+ times per package (Input, Textarea, Select, Checkbox, Radio, 
Switch, Slider, Toggle, ToggleGroup, ButtonGroup, Pagination, DropdownMenu, Tabs).

### 2. Validation Boilerplate

Every form component repeats:

```tsx
const validateOn = props.validateOn ?? "blur";
const hasValidation = !!(bindings?.value && props.checks?.length);
const { errors, validate } = useFieldValidation(
  bindings?.value ?? "",
  hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
);
```

### 3. Variant Mapping

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

| Package | components.tsx lines | Unique JSX lines (est.) | Boilerplate lines (est.) |
|---------|---------------------|------------------------|-------------------------|
| shadcn  | ~1246               | ~500                   | ~746                    |
| MUI     | ~1204               | ~480                   | ~724                    |
| Carbon  | ~1132               | ~450                   | ~682                    |

~60% of each file is repeated boilerplate. With factories, each package could 
be ~450-500 lines instead of ~1200.

## Next Steps for Future Chat

1. Build `createBoundField` and `createBoundCheckbox` factory hooks in core
2. Build `createFormComponent` and `createActionComponent` factory wrappers
3. Refactor MUI and Carbon to use factories as proof of concept
4. Measure line reduction and developer experience
5. Update the design-system-builder skill with factory patterns
6. Consider a `npx @json-render/create-design-system <name>` CLI tool
