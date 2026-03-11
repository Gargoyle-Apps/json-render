/**
 * Design System Mapping — the structured format that describes how a UI library
 * maps to json-render's 36 standard components.
 *
 * LLMs produce these mappings by reading a library's documentation.
 * The generator turns a mapping into a complete @json-render/<name> package.
 *
 * Mappings ship out of the box for popular libraries (antd, shadcn, mui, carbon)
 * and can be added or updated at any time.
 */

// =============================================================================
// Top-level mapping
// =============================================================================

export interface DesignSystemMapping {
  /** Short machine name, e.g. "antd", "shadcn", "chakra" */
  name: string;

  /** Human-readable display name, e.g. "Ant Design" */
  displayName: string;

  /** npm package name for the generated adapter, e.g. "@json-render/antd" */
  packageName: string;

  /** Information about the target UI library */
  library: LibraryInfo;

  /** Global patterns used across many components */
  patterns: GlobalPatterns;

  /** Per-component mappings keyed by standard component name */
  components: Record<StandardComponentName, ComponentMapping>;
}

export interface LibraryInfo {
  /** npm package name, e.g. "antd" */
  packageName: string;
  /** Version range, e.g. "^5.0.0" */
  version: string;
  /** Additional peer dependencies, e.g. { "@ant-design/icons": "^5.0.0" } */
  peerDeps?: Record<string, string>;
  /** Import statements the generated file needs (raw strings) */
  imports: ImportDeclaration[];
}

export interface ImportDeclaration {
  from: string;
  named: (string | { name: string; alias: string })[];
  /** Destructured sub-imports, e.g. Typography.Text */
  destructure?: { source: string; members: Record<string, string> }[];
}

// =============================================================================
// Global patterns — shared rendering conventions
// =============================================================================

export interface GlobalPatterns {
  /** How form labels are rendered */
  label: LabelPattern;
  /** How validation errors are displayed */
  error: ErrorPattern;
  /** Default wrapper for form fields */
  formFieldWrapper?: string;
}

export interface LabelPattern {
  /** Library component/element used for labels, e.g. "<Label>" or "<AntText>" */
  component: string;
  /** Where the label appears relative to the input */
  position: "above" | "inline" | "left";
  /** Extra wrapper around the label, e.g. '<div style={{ marginBottom: 4 }}>' */
  wrapper?: string;
}

export interface ErrorPattern {
  /** Library component/element used for error text */
  component: string;
  /** Props to apply to the error component */
  props?: Record<string, string>;
  /** Library prop on the input component that indicates error state, e.g. "status" */
  inputErrorProp?: { name: string; value: string };
}

// =============================================================================
// Per-component mapping
// =============================================================================

export type ComponentMapping = DataDrivenMapping | RenderOverrideMapping;

/** For components that can be expressed as prop/value translations */
export interface DataDrivenMapping {
  type: "data-driven";
  /** Which hook this component uses */
  hook: HookType;
  /** The primary library component to render */
  libraryComponent: string;
  /** Standard prop name -> library prop name */
  propMap?: Record<string, string>;
  /** Standard enum values -> library enum values, keyed by prop name */
  valueMap?: Record<string, Record<string, string | number | boolean>>;
  /** Props always passed to the library component */
  staticProps?: Record<string, string | number | boolean>;
  /** Whether this component renders a label (uses global label pattern) */
  hasLabel?: boolean;
  /** Whether this component renders validation errors (uses global error pattern) */
  hasError?: boolean;
  /** Notes for the LLM about special handling needed */
  notes?: string;
}

/**
 * For components with structural complexity that can't be expressed
 * as pure prop mapping. The render field contains the full JSX body.
 */
export interface RenderOverrideMapping {
  type: "render-override";
  /** Which hook this component uses */
  hook: HookType;
  /** The complete render function body (JSX string) */
  render: string;
  /** Notes for the LLM about why this needs an override */
  notes?: string;
}

export type HookType =
  | "none"
  | "useFormField<string>"
  | "useFormField<boolean>"
  | "useBoundField<string>"
  | "useBoundField<number>"
  | "useBoundField<boolean>"
  | "useStateBinding<boolean>"
  | "useBoundProp<string>"
  | "useBoundProp<number>";

// =============================================================================
// Standard component names (the 36 from the standard catalog)
// =============================================================================

export type StandardComponentName =
  // Layout
  | "Card"
  | "Stack"
  | "Grid"
  | "Separator"
  | "Tabs"
  | "Accordion"
  | "Collapsible"
  | "Dialog"
  | "Drawer"
  | "Carousel"
  // Data Display
  | "Table"
  | "Heading"
  | "Text"
  | "Image"
  | "Avatar"
  | "Badge"
  | "Alert"
  | "Progress"
  | "Skeleton"
  | "Spinner"
  | "Tooltip"
  | "Popover"
  // Form Inputs
  | "Input"
  | "Textarea"
  | "Select"
  | "Checkbox"
  | "Radio"
  | "Switch"
  | "Slider"
  // Actions
  | "Button"
  | "Link"
  | "DropdownMenu"
  | "Toggle"
  | "ToggleGroup"
  | "ButtonGroup"
  | "Pagination";
