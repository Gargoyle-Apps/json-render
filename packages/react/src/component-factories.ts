"use client";

import { useState } from "react";
import type { ValidationConfig } from "@json-render/core";
import { useBoundProp } from "./hooks";
import { useFieldValidation } from "./contexts/validation";

// =============================================================================
// useBoundField — Bound/local state for a single prop
// =============================================================================

/**
 * Combined bound-or-local state for a component prop.
 *
 * When a binding path is present (i.e. the spec used `$bindState` or
 * `$bindItem`), reads and writes go through the global state store.
 * Otherwise a local `useState` provides the value.
 *
 * Replaces the repetitive pattern:
 * ```ts
 * const [bound, setBound] = useBoundProp<T>(propValue, bindings?.prop);
 * const [local, setLocal] = useState(defaultValue);
 * const isBound = !!bindings?.prop;
 * const value = isBound ? (bound ?? defaultValue) : local;
 * const setValue = isBound ? setBound : setLocal;
 * ```
 *
 * @example
 * ```tsx
 * const [value, setValue] = useBoundField<string>(
 *   props.value as string | undefined,
 *   bindings?.value,
 *   "",
 * );
 * ```
 */
export function useBoundField<T>(
  propValue: T | undefined,
  bindingPath: string | undefined,
  defaultValue: T,
): [value: T, setValue: (v: T) => void] {
  const [boundValue, setBoundValue] = useBoundProp<T>(propValue, bindingPath);
  const [localValue, setLocalValue] = useState<T>(defaultValue);
  const isBound = !!bindingPath;
  const value = isBound ? (boundValue ?? defaultValue) : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  return [value, setValue];
}

// =============================================================================
// useFormField — Bound field + validation
// =============================================================================

/**
 * Options for {@link useFormField}.
 */
export interface UseFormFieldOptions {
  /** Validation checks from the component props. */
  checks?: ValidationConfig["checks"];
  /** When to run validation (from props, falls back to `"blur"`). */
  validateOn?: ValidationConfig["validateOn"];
}

/**
 * Return value from {@link useFormField}.
 */
export interface UseFormFieldReturn<T> {
  /** Current field value (bound or local). */
  value: T;
  /** Update the field value. */
  setValue: (value: T) => void;
  /** Current validation error messages (empty when valid). */
  errors: string[];
  /** Trigger validation manually. */
  validate: () => void;
  /** Whether the field has active validation (bound + has checks). */
  hasValidation: boolean;
  /** Resolved `validateOn` strategy. */
  validateOn: NonNullable<ValidationConfig["validateOn"]>;
}

/**
 * Combined bound field state + field validation.
 *
 * Wraps {@link useBoundField} and {@link useFieldValidation} into a single
 * hook, eliminating ~10 lines of boilerplate per form component.
 *
 * @example
 * ```tsx
 * const { value, setValue, errors, validate, hasValidation, validateOn } =
 *   useFormField<string>(props.value as string | undefined, bindings?.value, "", {
 *     checks: props.checks,
 *     validateOn: props.validateOn ?? "blur",
 *   });
 * ```
 */
export function useFormField<T>(
  propValue: T | undefined,
  bindingPath: string | undefined,
  defaultValue: T,
  options?: UseFormFieldOptions,
): UseFormFieldReturn<T> {
  const [value, setValue] = useBoundField<T>(
    propValue,
    bindingPath,
    defaultValue,
  );

  const validateOn = options?.validateOn ?? "blur";
  const hasValidation = !!(bindingPath && options?.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindingPath ?? "",
    hasValidation ? { checks: options?.checks ?? [], validateOn } : undefined,
  );

  return { value, setValue, errors, validate, hasValidation, validateOn };
}
