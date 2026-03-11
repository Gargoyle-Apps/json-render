#!/usr/bin/env node
/// <reference path="./env.d.ts" />
/**
 * Design System Generator
 *
 * Takes a DesignSystemMapping and produces a complete @json-render/<name> package:
 *   - package.json
 *   - tsconfig.json
 *   - tsup.config.ts
 *   - src/catalog.ts
 *   - src/index.ts
 *   - src/components.tsx
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type {
  DesignSystemMapping,
  ImportDeclaration,
  ComponentMapping,
  DataDrivenMapping,
} from "./types";

// =============================================================================
// Entry point
// =============================================================================

export function generate(
  mapping: DesignSystemMapping,
  outputDir: string,
): void {
  fs.mkdirSync(path.join(outputDir, "src"), { recursive: true });

  const files: Record<string, string> = {
    "package.json": generatePackageJson(mapping),
    "tsconfig.json": generateTsConfig(),
    "tsup.config.ts": generateTsupConfig(mapping),
    "src/catalog.ts": generateCatalog(mapping),
    "src/index.ts": generateIndex(mapping),
    "src/components.tsx": generateComponents(mapping),
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(outputDir, filePath);
    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`  wrote ${filePath}`);
  }
}

// =============================================================================
// package.json
// =============================================================================

function generatePackageJson(mapping: DesignSystemMapping): string {
  const pkg = {
    name: mapping.packageName,
    version: "0.0.0",
    private: true,
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
    },
    scripts: {
      build: "tsup",
      "type-check": "tsc --noEmit",
    },
    dependencies: {
      "@json-render/core": "workspace:*",
      "@json-render/react": "workspace:*",
      [mapping.library.packageName]: mapping.library.version,
      ...(mapping.library.peerDeps ?? {}),
    },
    devDependencies: {
      "@types/react": "^19.0.0",
      tsup: "^8.0.0",
      typescript: "^5.0.0",
    },
    peerDependencies: {
      react: "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0",
    },
  };

  return JSON.stringify(pkg, null, 2) + "\n";
}

// =============================================================================
// tsconfig.json
// =============================================================================

function generateTsConfig(): string {
  const config = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src",
      jsx: "react-jsx",
    },
    include: ["src"],
    exclude: ["node_modules", "dist"],
  };

  return JSON.stringify(config, null, 2) + "\n";
}

// =============================================================================
// tsup.config.ts
// =============================================================================

function generateTsupConfig(mapping: DesignSystemMapping): string {
  const externals = [
    `"${mapping.library.packageName}"`,
    ...Object.keys(mapping.library.peerDeps ?? {}).map((d) => `"${d}"`),
    '"react"',
    '"react-dom"',
  ];

  return `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [${externals.join(", ")}],
});
`;
}

// =============================================================================
// src/catalog.ts
// =============================================================================

function generateCatalog(mapping: DesignSystemMapping): string {
  const Name = capitalize(mapping.name);
  return `export {
  standardComponentDefinitions as ${mapping.name}ComponentDefinitions,
  type StandardProps as ${Name}Props,
} from "@json-render/core/standard-catalog";
`;
}

// =============================================================================
// src/index.ts
// =============================================================================

function generateIndex(mapping: DesignSystemMapping): string {
  const Name = capitalize(mapping.name);
  return `export { ${mapping.name}Components } from "./components";
export {
  ${mapping.name}ComponentDefinitions,
  type ${Name}Props,
} from "./catalog";
`;
}

// =============================================================================
// src/components.tsx — the main event
// =============================================================================

function generateComponents(mapping: DesignSystemMapping): string {
  const Name = capitalize(mapping.name);
  const lines: string[] = [];

  lines.push('"use client";');
  lines.push("");

  // React imports
  const reactImports = collectReactImports(mapping);
  if (reactImports.length > 0) {
    lines.push(`import { ${reactImports.join(", ")} } from "react";`);
  }

  // json-render hook imports
  const hookImports = collectHookImports(mapping);
  lines.push(
    `import {\n  ${hookImports.join(",\n  ")},\n  type BaseComponentProps,\n} from "@json-render/react";`,
  );
  lines.push("");

  // Library imports
  for (const imp of mapping.library.imports) {
    lines.push(formatImport(imp));
    if (imp.destructure) {
      for (const d of imp.destructure) {
        const members = Object.entries(d.members)
          .map(([k, v]) => (k === v ? k : `${k}: ${v}`))
          .join(", ");
        lines.push(`const { ${members} } = ${d.source};`);
      }
    }
  }
  lines.push("");

  // Catalog type import
  lines.push(`import { type ${Name}Props } from "./catalog";`);
  lines.push("");

  // Convenience type alias
  lines.push(
    `type Props<K extends keyof typeof import("./catalog").${mapping.name}ComponentDefinitions> = ${Name}Props<K>;`,
  );
  lines.push("");

  // Component export
  lines.push(`export const ${mapping.name}Components = {`);

  const componentNames = Object.keys(mapping.components) as Array<
    keyof typeof mapping.components
  >;

  let currentCategory = "";
  for (const name of componentNames) {
    const category = getCategory(name);
    if (category !== currentCategory) {
      if (currentCategory) lines.push("");
      lines.push(`  // -- ${category} ${"─".repeat(66 - category.length)}`);
      currentCategory = category;
    }
    lines.push("");
    const comp = mapping.components[name];
    lines.push(generateComponent(name, comp, mapping));
  }

  lines.push("};");
  lines.push("");

  return lines.join("\n");
}

// =============================================================================
// Component generation
// =============================================================================

function generateComponent(
  name: string,
  comp: ComponentMapping,
  _mapping: DesignSystemMapping,
): string {
  if (comp.type === "render-override") {
    return `  ${name}: ${comp.render},`;
  }

  return generateDataDrivenComponent(name, comp, _mapping);
}

function generateDataDrivenComponent(
  name: string,
  comp: DataDrivenMapping,
  mapping: DesignSystemMapping,
): string {
  const lines: string[] = [];
  const propsType = `Props<"${name}">`;

  // Determine destructured args
  const needsBindings = comp.hook !== "none";
  const needsEmit =
    comp.hook.includes("useFormField") ||
    comp.hook.includes("useBoundField") ||
    comp.hook.includes("useBoundProp");
  const needsChildren = ["Card", "Stack", "Grid", "Collapsible"].includes(name);

  const args: string[] = ["props"];
  if (needsChildren) args.push("children");
  if (needsBindings) args.push("bindings");
  if (needsEmit) args.push("emit");

  lines.push(
    `  ${name}: ({ ${args.join(", ")} }: BaseComponentProps<${propsType}>) => {`,
  );

  // Hook call (for data-driven form fields)
  if (comp.hook.includes("useFormField<string>")) {
    lines.push(
      `    const { value, setValue, errors, validate, hasValidation, validateOn } =`,
    );
    lines.push(
      `      useFormField<string>(props.value as string | undefined, bindings?.value, "", {`,
    );
    lines.push(
      `        checks: props.checks ?? undefined, validateOn: props.validateOn ?? "blur",`,
    );
    lines.push(`      });`);
  } else if (comp.hook.includes("useFormField<boolean>")) {
    lines.push(
      `    const { value: checked, setValue: setChecked, errors, validate, hasValidation, validateOn } =`,
    );
    lines.push(
      `      useFormField<boolean>(props.checked as boolean | undefined, bindings?.checked, !!props.checked, {`,
    );
    lines.push(
      `        checks: props.checks ?? undefined, validateOn: props.validateOn ?? "change",`,
    );
    lines.push(`      });`);
  }

  // JSX
  lines.push(`    return (`);
  if (comp.hasLabel || comp.hasError) {
    lines.push(`      <${mapping.patterns.formFieldWrapper || "div"}>`);
  }

  if (comp.hasLabel) {
    const lbl = mapping.patterns.label;
    if (lbl.wrapper) {
      lines.push(
        `        {props.label && ${lbl.wrapper}<${lbl.component}>{props.label}</${lbl.component}></div>}`,
      );
    } else {
      lines.push(
        `        {props.label && <${lbl.component}>{props.label}</${lbl.component}>}`,
      );
    }
  }

  // Main library component
  const libComp = comp.libraryComponent;
  const propEntries = buildPropEntries(comp);
  const errorProp = mapping.patterns.error.inputErrorProp;
  if (comp.hasError && errorProp) {
    propEntries.push(
      `${errorProp.name}={errors.length > 0 ? ${errorProp.value} : undefined}`,
    );
  }

  if (comp.hook.includes("useFormField<string>")) {
    propEntries.push(`value={value}`);
    propEntries.push(
      `onChange={(e) => { setValue(e.target.value); if (hasValidation && validateOn === "change") validate(); }}`,
    );
    propEntries.push(
      `onBlur={() => { if (hasValidation && validateOn === "blur") validate(); }}`,
    );
  } else if (comp.hook.includes("useFormField<boolean>")) {
    propEntries.push(`checked={checked}`);
    propEntries.push(
      `onChange={(e) => { setChecked(e.target.checked); if (hasValidation && validateOn === "change") validate(); emit("change"); }}`,
    );
  }

  const indent = comp.hasLabel || comp.hasError ? "        " : "      ";
  if (propEntries.length <= 2) {
    lines.push(`${indent}<${libComp} ${propEntries.join(" ")} />`);
  } else {
    lines.push(`${indent}<${libComp}`);
    for (const entry of propEntries) {
      lines.push(`${indent}  ${entry}`);
    }
    lines.push(`${indent}/>`);
  }

  if (comp.hasError) {
    const err = mapping.patterns.error;
    const errProps = Object.entries(err.props ?? {})
      .map(([k, v]) => `${k}=${v}`)
      .join(" ");
    lines.push(
      `        {errors.length > 0 && <${err.component} ${errProps}>{errors[0]}</${err.component}>}`,
    );
  }

  if (comp.hasLabel || comp.hasError) {
    lines.push(
      `      </${(mapping.patterns.formFieldWrapper || "div").replace("<", "")}>`,
    );
  }

  lines.push(`    );`);
  lines.push(`  },`);

  return lines.join("\n");
}

// =============================================================================
// Helpers
// =============================================================================

function collectReactImports(mapping: DesignSystemMapping): string[] {
  const imports = new Set<string>();
  for (const comp of Object.values(mapping.components)) {
    if (comp.type === "render-override" && comp.render.includes("useRef")) {
      imports.add("useRef");
    }
    if (comp.type === "render-override" && comp.render.includes("useState")) {
      imports.add("useState");
    }
  }
  return Array.from(imports);
}

function collectHookImports(mapping: DesignSystemMapping): string[] {
  const hooks = new Set<string>();
  for (const comp of Object.values(mapping.components)) {
    const hookStr = comp.hook;
    if (hookStr.startsWith("useFormField")) hooks.add("useFormField");
    if (hookStr.startsWith("useBoundField")) hooks.add("useBoundField");
    if (hookStr.startsWith("useStateBinding")) hooks.add("useStateBinding");
    if (hookStr.startsWith("useBoundProp")) hooks.add("useBoundProp");
  }
  return Array.from(hooks);
}

function formatImport(imp: ImportDeclaration): string {
  const names = imp.named.map((n) =>
    typeof n === "string" ? n : `${n.name} as ${n.alias}`,
  );

  if (names.length <= 3) {
    return `import { ${names.join(", ")} } from "${imp.from}";`;
  }

  return `import {\n  ${names.join(",\n  ")},\n} from "${imp.from}";`;
}

function buildPropEntries(comp: DataDrivenMapping): string[] {
  const entries: string[] = [];

  for (const [stdProp, libProp] of Object.entries(comp.propMap ?? {})) {
    entries.push(`${libProp}={props.${stdProp} ?? undefined}`);
  }

  for (const [prop, val] of Object.entries(comp.staticProps ?? {})) {
    if (typeof val === "boolean") {
      entries.push(val ? prop : `${prop}={false}`);
    } else if (typeof val === "number") {
      entries.push(`${prop}={${val}}`);
    } else {
      entries.push(`${prop}="${val}"`);
    }
  }

  return entries;
}

function getCategory(name: string): string {
  const layout = [
    "Card",
    "Stack",
    "Grid",
    "Separator",
    "Tabs",
    "Accordion",
    "Collapsible",
    "Dialog",
    "Drawer",
    "Carousel",
  ];
  const display = [
    "Table",
    "Heading",
    "Text",
    "Image",
    "Avatar",
    "Badge",
    "Alert",
    "Progress",
    "Skeleton",
    "Spinner",
    "Tooltip",
    "Popover",
  ];
  const form = [
    "Input",
    "Textarea",
    "Select",
    "Checkbox",
    "Radio",
    "Switch",
    "Slider",
  ];
  if (layout.includes(name)) return "Layout";
  if (display.includes(name)) return "Data Display";
  if (form.includes(name)) return "Form Inputs";
  return "Actions";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// =============================================================================
// CLI
// =============================================================================

if (
  process.argv[1]?.endsWith("generate.ts") ||
  process.argv[1]?.endsWith("generate.js")
) {
  const mappingPath = process.argv[2];
  const outputDir = process.argv[3];

  if (!mappingPath || !outputDir) {
    console.error("Usage: generate <mapping-file> <output-dir>");
    console.error(
      "  e.g.: npx tsx src/generate.ts ../mappings/antd.ts ../../packages/antd",
    );
    process.exit(1);
  }

  import(path.resolve(mappingPath)).then((mod) => {
    const mapping: DesignSystemMapping = mod.default ?? Object.values(mod)[0];

    console.log(`Generating ${mapping.displayName} adapter -> ${outputDir}`);
    generate(mapping, outputDir);
    console.log("Done.");
  });
}
