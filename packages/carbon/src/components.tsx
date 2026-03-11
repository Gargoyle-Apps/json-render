"use client";

import { useState, useRef } from "react";
import {
  useBoundProp,
  useStateBinding,
  useFieldValidation,
  type BaseComponentProps,
} from "@json-render/react";

import {
  Accordion as CarbonAccordion,
  AccordionItem,
  Button as CarbonButton,
  Checkbox as CarbonCheckbox,
  ClickableTile,
  ComposedModal,
  ContainedList,
  ContainedListItem,
  Dropdown,
  FormGroup,
  FormLabel,
  Grid as CarbonGrid,
  Column,
  IconButton,
  InlineNotification,
  Layer,
  Link as CarbonLink,
  Loading,
  Modal,
  ModalBody,
  ModalHeader,
  OverflowMenu,
  OverflowMenuItem,
  Pagination as CarbonPagination,
  Popover as CarbonPopover,
  PopoverContent,
  ProgressBar,
  RadioButton,
  RadioButtonGroup,
  Select as CarbonSelect,
  SelectItem,
  SkeletonPlaceholder,
  Slider as CarbonSlider,
  Stack as CarbonStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs as CarbonTabs,
  Tag,
  TextArea,
  TextInput,
  Tile,
  Toggle as CarbonToggle,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  Tooltip as CarbonTooltip,
} from "@carbon/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "@carbon/icons-react";

import { type CarbonProps } from "./catalog";

// =============================================================================
// Carbon Component Implementations
// =============================================================================

/**
 * IBM Carbon Design System component implementations for json-render.
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/react";
 * import { carbonComponents } from "@json-render/carbon";
 *
 * const { registry } = defineRegistry(catalog, {
 *   components: {
 *     Card: carbonComponents.Card,
 *     Button: carbonComponents.Button,
 *   },
 * });
 * ```
 */
export const carbonComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Card: ({ props, children }: BaseComponentProps<CarbonProps<"Card">>) => {
    const maxWidthMap: Record<string, string> = {
      sm: "280px",
      md: "320px",
      lg: "360px",
      full: "100%",
    };
    return (
      <Tile
        style={{
          maxWidth: maxWidthMap[props.maxWidth ?? "full"] ?? "100%",
          ...(props.centered ? { margin: "0 auto" } : {}),
        }}
      >
        {props.title && (
          <h4 style={{ marginBottom: props.description ? "0.25rem" : "1rem" }}>
            {props.title}
          </h4>
        )}
        {props.description && (
          <p className="cds--label" style={{ marginBottom: "1rem" }}>
            {props.description}
          </p>
        )}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {children}
        </div>
      </Tile>
    );
  },

  Stack: ({ props, children }: BaseComponentProps<CarbonProps<"Stack">>) => {
    const gapMap: Record<string, number> = { none: 0, sm: 3, md: 5, lg: 7 };
    return (
      <CarbonStack
        orientation={
          props.direction === "horizontal" ? "horizontal" : "vertical"
        }
        gap={gapMap[props.gap ?? "md"] ?? 5}
        style={{
          alignItems:
            props.align === "center"
              ? "center"
              : props.align === "end"
                ? "flex-end"
                : props.align === "stretch"
                  ? "stretch"
                  : "flex-start",
          justifyContent:
            props.justify === "center"
              ? "center"
              : props.justify === "end"
                ? "flex-end"
                : props.justify === "between"
                  ? "space-between"
                  : props.justify === "around"
                    ? "space-around"
                    : undefined,
          flexWrap: props.direction === "horizontal" ? "wrap" : undefined,
        }}
      >
        {children}
      </CarbonStack>
    );
  },

  Grid: ({ props, children }: BaseComponentProps<CarbonProps<"Grid">>) => {
    const columns = Math.max(1, Math.min(6, props.columns ?? 1));
    const gapMap: Record<string, string> = {
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
    };
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapMap[props.gap ?? "md"] ?? "1rem",
        }}
      >
        {children}
      </div>
    );
  },

  Separator: ({ props }: BaseComponentProps<CarbonProps<"Separator">>) => {
    const isVertical = props.orientation === "vertical";
    return (
      <hr
        style={{
          border: "none",
          borderTop: isVertical
            ? "none"
            : "1px solid var(--cds-border-subtle, #e0e0e0)",
          borderLeft: isVertical
            ? "1px solid var(--cds-border-subtle, #e0e0e0)"
            : "none",
          margin: isVertical ? "0 0.5rem" : "0.75rem 0",
          height: isVertical ? "100%" : undefined,
        }}
      />
    );
  },

  Tabs: ({
    props,
    children,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Tabs">>) => {
    const tabs = props.tabs ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(
      props.defaultValue ?? tabs[0]?.value ?? "",
    );
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? tabs[0]?.value ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const selectedIndex = Math.max(
      0,
      tabs.findIndex((t) => t.value === value),
    );

    return (
      <CarbonTabs
        selectedIndex={selectedIndex}
        onChange={({ selectedIndex: idx }: { selectedIndex: number }) => {
          const tab = tabs[idx];
          if (tab) {
            setValue(tab.value);
            emit("change");
          }
        }}
      >
        <TabList aria-label="Tabs">
          {tabs.map((tab) => (
            <Tab key={tab.value}>{tab.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab) => (
            <TabPanel key={tab.value}>
              {tab.value === value ? children : null}
            </TabPanel>
          ))}
        </TabPanels>
      </CarbonTabs>
    );
  },

  Accordion: ({ props }: BaseComponentProps<CarbonProps<"Accordion">>) => {
    const items = props.items ?? [];
    return (
      <CarbonAccordion>
        {items.map((item, i) => (
          <AccordionItem key={i} title={item.title}>
            <p>{item.content}</p>
          </AccordionItem>
        ))}
      </CarbonAccordion>
    );
  },

  Collapsible: ({
    props,
    children,
  }: BaseComponentProps<CarbonProps<"Collapsible">>) => {
    const [open, setOpen] = useState(props.defaultOpen ?? false);
    return (
      <div style={{ width: "100%" }}>
        <CarbonButton
          kind="ghost"
          onClick={() => setOpen(!open)}
          style={{ width: "100%", justifyContent: "space-between" }}
          renderIcon={() => (
            <ChevronDown
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          )}
        >
          {props.title}
        </CarbonButton>
        {open && <div style={{ paddingTop: "0.5rem" }}>{children}</div>}
      </div>
    );
  },

  Dialog: ({ props, children }: BaseComponentProps<CarbonProps<"Dialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <Modal
        open={open ?? false}
        onRequestClose={() => setOpen(false)}
        modalHeading={props.title}
        passiveModal
      >
        {props.description && <p className="cds--label">{props.description}</p>}
        {children}
      </Modal>
    );
  },

  Drawer: ({ props, children }: BaseComponentProps<CarbonProps<"Drawer">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <Modal
        open={open ?? false}
        onRequestClose={() => setOpen(false)}
        modalHeading={props.title}
        passiveModal
        size="sm"
      >
        {props.description && <p className="cds--label">{props.description}</p>}
        <div style={{ padding: "1rem 0" }}>{children}</div>
      </Modal>
    );
  },

  Carousel: ({ props }: BaseComponentProps<CarbonProps<"Carousel">>) => {
    const items = props.items ?? [];
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = items.length;

    return (
      <div style={{ width: "100%" }}>
        {items[activeStep] && (
          <Tile>
            {items[activeStep]!.title && (
              <h5 style={{ marginBottom: "0.25rem" }}>
                {items[activeStep]!.title}
              </h5>
            )}
            {items[activeStep]!.description && (
              <p className="cds--label">{items[activeStep]!.description}</p>
            )}
          </Tile>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "0.5rem",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <IconButton
            label="Previous"
            kind="ghost"
            size="sm"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
          >
            <ChevronLeft />
          </IconButton>
          <span className="cds--label">
            {activeStep + 1} / {maxSteps}
          </span>
          <IconButton
            label="Next"
            kind="ghost"
            size="sm"
            onClick={() =>
              setActiveStep((prev) => Math.min(maxSteps - 1, prev + 1))
            }
            disabled={activeStep === maxSteps - 1}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: BaseComponentProps<CarbonProps<"Table">>) => {
    const columns = props.columns ?? [];
    const rows = (props.rows ?? []).map((row) => row.map(String));

    return (
      <div className="cds--data-table-container">
        <table className="cds--data-table cds--data-table--compact">
          {props.caption && <caption>{props.caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>
                  <span className="cds--table-header-label">{col}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  Heading: ({ props }: BaseComponentProps<CarbonProps<"Heading">>) => {
    const level = props.level ?? "h2";
    const classMap: Record<string, string> = {
      h1: "cds--type-productive-heading-05",
      h2: "cds--type-productive-heading-04",
      h3: "cds--type-productive-heading-03",
      h4: "cds--type-productive-heading-02",
    };
    const className = classMap[level] ?? "";
    if (level === "h1") return <h1 className={className}>{props.text}</h1>;
    if (level === "h3") return <h3 className={className}>{props.text}</h3>;
    if (level === "h4") return <h4 className={className}>{props.text}</h4>;
    return <h2 className={className}>{props.text}</h2>;
  },

  Text: ({ props }: BaseComponentProps<CarbonProps<"Text">>) => {
    if (props.variant === "code") {
      return (
        <code
          className="cds--type-code-02"
          style={{ padding: "0.125rem 0.375rem" }}
        >
          {props.text}
        </code>
      );
    }
    const classMap: Record<string, string> = {
      body: "cds--type-body-long-01",
      caption: "cds--type-helper-text-01",
      muted: "cds--type-body-long-01",
      lead: "cds--type-body-long-02",
    };
    return (
      <p
        className={
          classMap[props.variant ?? "body"] ?? "cds--type-body-long-01"
        }
        style={
          props.variant === "muted"
            ? { color: "var(--cds-text-secondary, #525252)" }
            : undefined
        }
      >
        {props.text}
      </p>
    );
  },

  Image: ({ props }: BaseComponentProps<CarbonProps<"Image">>) => {
    if (props.src) {
      return (
        <img
          src={props.src}
          alt={props.alt ?? ""}
          width={props.width ?? undefined}
          height={props.height ?? undefined}
          style={{ maxWidth: "100%", borderRadius: "4px" }}
        />
      );
    }
    return (
      <div
        style={{
          width: props.width ?? 80,
          height: props.height ?? 60,
          background: "var(--cds-layer-02, #e0e0e0)",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="cds--label">{props.alt || "img"}</span>
      </div>
    );
  },

  Avatar: ({ props }: BaseComponentProps<CarbonProps<"Avatar">>) => {
    const name = props.name || "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const sizeMap: Record<string, number> = { sm: 32, md: 40, lg: 48 };
    const size = sizeMap[props.size ?? "md"] ?? 40;

    if (props.src) {
      return (
        <img
          src={props.src}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--cds-interactive, #0f62fe)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          fontWeight: 600,
        }}
      >
        {initials}
      </div>
    );
  },

  Badge: ({ props }: BaseComponentProps<CarbonProps<"Badge">>) => {
    const typeMap: Record<string, "blue" | "gray" | "red" | "outline"> = {
      default: "blue",
      secondary: "gray",
      destructive: "red",
      outline: "outline",
    };
    return (
      <Tag
        type={typeMap[props.variant ?? "default"] ?? ("blue" as any)}
        size="sm"
      >
        {props.text}
      </Tag>
    );
  },

  Alert: ({ props }: BaseComponentProps<CarbonProps<"Alert">>) => {
    const kindMap: Record<string, "info" | "success" | "warning" | "error"> = {
      info: "info",
      success: "success",
      warning: "warning",
      error: "error",
    };
    return (
      <InlineNotification
        kind={kindMap[props.type ?? "info"] ?? "info"}
        title={props.title}
        subtitle={props.message ?? undefined}
        lowContrast
        hideCloseButton
      />
    );
  },

  Progress: ({ props }: BaseComponentProps<CarbonProps<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <ProgressBar
        label={props.label ?? ""}
        value={value}
        max={props.max ?? 100}
      />
    );
  },

  Skeleton: ({ props }: BaseComponentProps<CarbonProps<"Skeleton">>) => {
    return (
      <SkeletonPlaceholder
        style={{
          width: props.width ?? "100%",
          height: props.height ?? "1.25rem",
          borderRadius: props.rounded ? "50%" : "4px",
        }}
      />
    );
  },

  Spinner: ({ props }: BaseComponentProps<CarbonProps<"Spinner">>) => {
    const sizeMap: Record<string, boolean> = { sm: true, md: false, lg: false };
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Loading
          small={sizeMap[props.size ?? "md"] ?? false}
          withOverlay={false}
          description={props.label ?? "Loading"}
        />
        {props.label && <span className="cds--label">{props.label}</span>}
      </div>
    );
  },

  Tooltip: ({ props }: BaseComponentProps<CarbonProps<"Tooltip">>) => {
    return (
      <Toggletip>
        <ToggletipButton label={props.text}>
          <span style={{ textDecoration: "underline dotted", cursor: "help" }}>
            {props.text}
          </span>
        </ToggletipButton>
        <ToggletipContent>
          <p>{props.content}</p>
        </ToggletipContent>
      </Toggletip>
    );
  },

  Popover: ({ props }: BaseComponentProps<CarbonProps<"Popover">>) => {
    const [open, setOpen] = useState(false);
    return (
      <Toggletip>
        <ToggletipButton label={props.trigger}>
          <CarbonButton kind="ghost" size="sm" onClick={() => setOpen(!open)}>
            {props.trigger}
          </CarbonButton>
        </ToggletipButton>
        <ToggletipContent>
          <p>{props.content}</p>
        </ToggletipContent>
      </Toggletip>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Input: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Input">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <TextInput
        id={props.name ?? "input"}
        labelText={props.label}
        name={props.name ?? undefined}
        type={props.type ?? "text"}
        placeholder={props.placeholder ?? ""}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter") emit("submit");
        }}
        onFocus={() => emit("focus")}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
          emit("blur");
        }}
        invalid={errors.length > 0}
        invalidText={errors[0] ?? undefined}
        size="md"
      />
    );
  },

  Textarea: ({
    props,
    bindings,
  }: BaseComponentProps<CarbonProps<"Textarea">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <TextArea
        id={props.name ?? "textarea"}
        labelText={props.label}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        rows={props.rows ?? 3}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
        }}
        invalid={errors.length > 0}
        invalidText={errors[0] ?? undefined}
      />
    );
  },

  Select: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Select">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState<string>("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <CarbonSelect
        id={props.name ?? "select"}
        labelText={props.label}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
          emit("change");
        }}
        invalid={errors.length > 0}
        invalidText={errors[0] ?? undefined}
      >
        <SelectItem value="" text={props.placeholder ?? "Select..."} />
        {options.map((opt, idx) => (
          <SelectItem
            key={`${idx}-${opt}`}
            value={opt || `option-${idx}`}
            text={opt}
          />
        ))}
      </CarbonSelect>
    );
  },

  Checkbox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Checkbox">>) => {
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      props.checked as boolean | undefined,
      bindings?.checked,
    );
    const [localChecked, setLocalChecked] = useState(!!props.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.checked && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.checked ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <div>
        <CarbonCheckbox
          id={props.name ?? "checkbox"}
          labelText={props.label}
          checked={checked}
          onChange={(
            _: React.ChangeEvent<HTMLInputElement>,
            { checked: c }: { checked: boolean },
          ) => {
            setChecked(c);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        />
        {errors.length > 0 && (
          <p
            className="cds--form-requirement"
            style={{ color: "var(--cds-text-error, #da1e28)" }}
          >
            {errors[0]}
          </p>
        )}
      </div>
    );
  },

  Radio: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Radio">>) => {
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(options[0] ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <FormGroup legendText={props.label ?? ""}>
        <RadioButtonGroup
          name={props.name ?? "radio"}
          valueSelected={value}
          onChange={(selection: string | number | undefined) => {
            const v = String(selection ?? "");
            setValue(v);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {options.map((opt, idx) => (
            <RadioButton
              key={`${idx}-${opt}`}
              value={opt || `option-${idx}`}
              id={`${props.name}-${idx}-${opt}`}
              labelText={opt}
            />
          ))}
        </RadioButtonGroup>
        {errors.length > 0 && (
          <p
            className="cds--form-requirement"
            style={{ color: "var(--cds-text-error, #da1e28)" }}
          >
            {errors[0]}
          </p>
        )}
      </FormGroup>
    );
  },

  Switch: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Switch">>) => {
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      props.checked as boolean | undefined,
      bindings?.checked,
    );
    const [localChecked, setLocalChecked] = useState(!!props.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.checked && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.checked ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    return (
      <div>
        <CarbonToggle
          id={props.name ?? "switch"}
          labelText={props.label}
          toggled={checked}
          onToggle={(c: boolean) => {
            setChecked(c);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
          size="sm"
        />
        {errors.length > 0 && (
          <p
            className="cds--form-requirement"
            style={{ color: "var(--cds-text-error, #da1e28)" }}
          >
            {errors[0]}
          </p>
        )}
      </div>
    );
  },

  Slider: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Slider">>) => {
    const [boundValue, setBoundValue] = useBoundProp<number>(
      props.value as number | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.min ?? 0);
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? props.min ?? 0) : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <CarbonSlider
        labelText={props.label ?? ""}
        value={value}
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        onChange={({ value: v }: { value: number }) => {
          setValue(v);
          emit("change");
        }}
      />
    );
  },

  // ── Actions ───────────────────────────────────────────────────────────

  Button: ({ props, emit }: BaseComponentProps<CarbonProps<"Button">>) => {
    const kindMap: Record<string, "primary" | "secondary" | "danger"> = {
      primary: "primary",
      secondary: "secondary",
      danger: "danger",
    };
    return (
      <CarbonButton
        kind={kindMap[props.variant ?? "primary"] ?? "primary"}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
        size="md"
      >
        {props.label}
      </CarbonButton>
    );
  },

  Link: ({ props, on }: BaseComponentProps<CarbonProps<"Link">>) => {
    return (
      <CarbonLink
        href={props.href ?? "#"}
        onClick={(e: React.MouseEvent) => {
          const press = on("press");
          if (press.shouldPreventDefault) e.preventDefault();
          press.emit();
        }}
      >
        {props.label}
      </CarbonLink>
    );
  },

  DropdownMenu: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"DropdownMenu">>) => {
    const items = props.items ?? [];
    const [, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );

    return (
      <Dropdown
        id={`dropdown-${props.label}`}
        titleText=""
        label={props.label}
        items={items}
        itemToString={(item: { label: string; value: string } | null) =>
          item?.label ?? ""
        }
        onChange={({
          selectedItem,
        }: {
          selectedItem: { label: string; value: string } | null;
        }) => {
          if (selectedItem) {
            setBoundValue(selectedItem.value);
            emit("select");
          }
        }}
        size="md"
      />
    );
  },

  Toggle: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Toggle">>) => {
    const [boundPressed, setBoundPressed] = useBoundProp<boolean>(
      props.pressed as boolean | undefined,
      bindings?.pressed,
    );
    const [localPressed, setLocalPressed] = useState(props.pressed ?? false);
    const isBound = !!bindings?.pressed;
    const pressed = isBound ? (boundPressed ?? false) : localPressed;
    const setPressed = isBound ? setBoundPressed : setLocalPressed;

    return (
      <CarbonButton
        kind={pressed ? "primary" : "ghost"}
        size="sm"
        onClick={() => {
          setPressed(!pressed);
          emit("change");
        }}
      >
        {props.label}
      </CarbonButton>
    );
  },

  ToggleGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"ToggleGroup">>) => {
    const items = props.items ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(items[0]?.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const isMultiple = props.type === "multiple";

    if (isMultiple) {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <div style={{ display: "inline-flex", gap: "1px" }}>
          {items.map((item) => (
            <CarbonButton
              key={item.value}
              kind={selected.includes(item.value) ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                const next = selected.includes(item.value)
                  ? selected.filter((v) => v !== item.value)
                  : [...selected, item.value];
                setValue(next.join(","));
                emit("change");
              }}
            >
              {item.label}
            </CarbonButton>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "inline-flex", gap: "1px" }}>
        {items.map((item) => (
          <CarbonButton
            key={item.value}
            kind={value === item.value ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setValue(item.value);
              emit("change");
            }}
          >
            {item.label}
          </CarbonButton>
        ))}
      </div>
    );
  },

  ButtonGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    const [boundSelected, setBoundSelected] = useBoundProp<string>(
      props.selected as string | undefined,
      bindings?.selected,
    );
    const [localValue, setLocalValue] = useState(buttons[0]?.value ?? "");
    const isBound = !!bindings?.selected;
    const value = isBound ? (boundSelected ?? "") : localValue;
    const setValue = isBound ? setBoundSelected : setLocalValue;

    return (
      <div style={{ display: "inline-flex", gap: "1px" }}>
        {buttons.map((btn) => (
          <CarbonButton
            key={btn.value}
            kind={value === btn.value ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setValue(btn.value);
              emit("change");
            }}
          >
            {btn.label}
          </CarbonButton>
        ))}
      </div>
    );
  },

  Pagination: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CarbonProps<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined,
      bindings?.page,
    );
    const currentPage = boundPage ?? 1;
    const totalPages = props.totalPages ?? 1;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <IconButton
          label="Previous"
          kind="ghost"
          size="sm"
          onClick={() => {
            if (currentPage > 1) {
              setBoundPage(currentPage - 1);
              emit("change");
            }
          }}
          disabled={currentPage <= 1}
        >
          <ChevronLeft />
        </IconButton>
        <span className="cds--label">
          Page {currentPage} of {totalPages}
        </span>
        <IconButton
          label="Next"
          kind="ghost"
          size="sm"
          onClick={() => {
            if (currentPage < totalPages) {
              setBoundPage(currentPage + 1);
              emit("change");
            }
          }}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight />
        </IconButton>
      </div>
    );
  },
};
