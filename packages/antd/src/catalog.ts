/**
 * Ant Design component definitions for json-render catalogs.
 *
 * Re-exports from @json-render/core/standard-catalog — the single source of
 * truth for all design system packages. This ensures specs generated against
 * any design system catalog are fully interchangeable.
 */
export {
  standardComponentDefinitions as antdComponentDefinitions,
  validationCheckSchema,
  validateOnSchema,
  type StandardComponentDefinition as ComponentDefinition,
  type StandardProps as AntdProps,
} from "@json-render/core/standard-catalog";
