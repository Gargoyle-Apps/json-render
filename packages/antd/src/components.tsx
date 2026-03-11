"use client";

import { useState, useRef } from "react";
import {
  useBoundProp,
  useBoundField,
  useFormField,
  useStateBinding,
  type BaseComponentProps,
} from "@json-render/react";

import {
  Alert as AntAlert,
  Avatar as AntAvatar,
  Badge as AntBadge,
  Button as AntButton,
  Card as AntCard,
  Carousel as AntCarousel,
  Checkbox as AntCheckbox,
  Collapse as AntCollapse,
  Divider,
  Drawer as AntDrawer,
  Dropdown,
  Flex,
  Image as AntImage,
  Input as AntInput,
  Modal as AntModal,
  Pagination as AntPagination,
  Popover as AntPopover,
  Progress as AntProgress,
  Radio as AntRadio,
  Select as AntSelect,
  Skeleton as AntSkeleton,
  Slider as AntSlider,
  Space,
  Spin,
  Switch as AntSwitch,
  Table as AntTable,
  Tabs as AntTabs,
  Tag,
  Tooltip as AntTooltip,
  Typography,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { type AntdProps } from "./catalog";

const { Title, Paragraph, Text: AntText, Link: AntLink } = Typography;
const { TextArea: AntTextArea } = AntInput;

// =============================================================================
// Ant Design Component Implementations
// =============================================================================

/**
 * Ant Design component implementations for json-render.
 *
 * Pass to `defineRegistry()` from `@json-render/react` to create a
 * component registry for rendering JSON specs with Ant Design components.
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/react";
 * import { antdComponents } from "@json-render/antd";
 *
 * const { registry } = defineRegistry(catalog, {
 *   components: {
 *     Card: antdComponents.Card,
 *     Button: antdComponents.Button,
 *   },
 * });
 * ```
 */
export const antdComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Card: ({ props, children }: BaseComponentProps<AntdProps<"Card">>) => {
    const maxWidthMap: Record<string, number | string> = {
      sm: 280,
      md: 320,
      lg: 360,
      full: "100%",
    };
    const maxWidth = maxWidthMap[props.maxWidth ?? "full"] ?? "100%";

    return (
      <AntCard
        title={props.title}
        style={{
          maxWidth,
          ...(props.centered ? { margin: "0 auto" } : {}),
        }}
      >
        {props.description && !props.title && (
          <Paragraph type="secondary">{props.description}</Paragraph>
        )}
        <Flex vertical gap={12}>
          {children}
        </Flex>
      </AntCard>
    );
  },

  Stack: ({ props, children }: BaseComponentProps<AntdProps<"Stack">>) => {
    const gapMap: Record<string, number> = {
      none: 0,
      sm: 8,
      md: 12,
      lg: 16,
    };
    const alignMap: Record<
      string,
      "flex-start" | "center" | "flex-end" | "stretch"
    > = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      stretch: "stretch",
    };
    const justifyMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      between: "space-between",
      around: "space-around",
    };

    return (
      <Flex
        vertical={props.direction !== "horizontal"}
        gap={gapMap[props.gap ?? "md"] ?? 12}
        align={alignMap[props.align ?? "start"] ?? "flex-start"}
        justify={justifyMap[props.justify ?? ""] ?? undefined}
        wrap={props.direction === "horizontal" ? "wrap" : undefined}
      >
        {children}
      </Flex>
    );
  },

  Grid: ({ props, children }: BaseComponentProps<AntdProps<"Grid">>) => {
    const columns = Math.max(1, Math.min(6, props.columns ?? 1));
    const gapMap: Record<string, number> = { sm: 8, md: 12, lg: 16 };
    const gap = gapMap[props.gap ?? "md"] ?? 12;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {children}
      </div>
    );
  },

  Separator: ({ props }: BaseComponentProps<AntdProps<"Separator">>) => {
    return (
      <Divider
        type={props.orientation === "vertical" ? "vertical" : "horizontal"}
        style={
          props.orientation === "vertical"
            ? { height: "100%", margin: "0 8px" }
            : { margin: "12px 0" }
        }
      />
    );
  },

  Tabs: ({
    props,
    children,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Tabs">>) => {
    const tabs = props.tabs ?? [];
    const [value, setValue] = useBoundField<string>(
      props.value as string | undefined,
      bindings?.value,
      props.defaultValue ?? tabs[0]?.value ?? "",
    );

    return (
      <AntTabs
        activeKey={value}
        onChange={(key) => {
          setValue(key);
          emit("change");
        }}
        items={tabs.map((tab) => ({
          key: tab.value,
          label: tab.label,
          children: tab.value === value ? children : null,
        }))}
      />
    );
  },

  Accordion: ({ props }: BaseComponentProps<AntdProps<"Accordion">>) => {
    const items = props.items ?? [];
    const collapseItems = items.map((item, i) => ({
      key: String(i),
      label: item.title,
      children: <Paragraph>{item.content}</Paragraph>,
    }));

    if (props.type === "multiple") {
      return <AntCollapse items={collapseItems} />;
    }
    return <AntCollapse accordion items={collapseItems} />;
  },

  Collapsible: ({
    props,
    children,
  }: BaseComponentProps<AntdProps<"Collapsible">>) => {
    return (
      <AntCollapse
        defaultActiveKey={props.defaultOpen ? ["0"] : []}
        items={[
          {
            key: "0",
            label: props.title,
            children,
          },
        ]}
      />
    );
  },

  Dialog: ({ props, children }: BaseComponentProps<AntdProps<"Dialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <AntModal
        open={open ?? false}
        onCancel={() => setOpen(false)}
        title={props.title}
        footer={null}
      >
        {props.description && (
          <Paragraph type="secondary">{props.description}</Paragraph>
        )}
        {children}
      </AntModal>
    );
  },

  Drawer: ({ props, children }: BaseComponentProps<AntdProps<"Drawer">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <AntDrawer
        open={open ?? false}
        onClose={() => setOpen(false)}
        title={props.title}
        placement="bottom"
      >
        {props.description && (
          <Paragraph type="secondary">{props.description}</Paragraph>
        )}
        {children}
      </AntDrawer>
    );
  },

  Carousel: ({ props }: BaseComponentProps<AntdProps<"Carousel">>) => {
    const items = props.items ?? [];
    const carouselRef = useRef<any>(null);

    return (
      <div style={{ width: "100%" }}>
        <AntCarousel ref={carouselRef} dots>
          {items.map((item, i) => (
            <div key={i}>
              <AntCard size="small">
                {item.title && (
                  <AntText strong style={{ display: "block", marginBottom: 4 }}>
                    {item.title}
                  </AntText>
                )}
                {item.description && (
                  <AntText type="secondary">{item.description}</AntText>
                )}
              </AntCard>
            </div>
          ))}
        </AntCarousel>
      </div>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: BaseComponentProps<AntdProps<"Table">>) => {
    const columns = (props.columns ?? []).map((col, idx) => ({
      title: col,
      dataIndex: String(idx),
      key: String(idx),
    }));
    const dataSource = (props.rows ?? []).map((row, i) => {
      const record: Record<string, string> = { key: String(i) };
      row.forEach((cell, j) => {
        record[String(j)] = String(cell);
      });
      return record;
    });

    return (
      <AntTable
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        title={props.caption ? () => props.caption : undefined}
      />
    );
  },

  Heading: ({ props }: BaseComponentProps<AntdProps<"Heading">>) => {
    const levelMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
      h1: 2,
      h2: 3,
      h3: 4,
      h4: 5,
    };
    return (
      <Title level={levelMap[props.level ?? "h2"] ?? 3}>{props.text}</Title>
    );
  },

  Text: ({ props }: BaseComponentProps<AntdProps<"Text">>) => {
    if (props.variant === "code") {
      return <AntText code>{props.text}</AntText>;
    }
    if (props.variant === "caption") {
      return (
        <AntText style={{ fontSize: 12 }} type="secondary">
          {props.text}
        </AntText>
      );
    }
    if (props.variant === "muted") {
      return <AntText type="secondary">{props.text}</AntText>;
    }
    if (props.variant === "lead") {
      return (
        <Paragraph style={{ fontSize: 18 }} type="secondary">
          {props.text}
        </Paragraph>
      );
    }
    return <Paragraph>{props.text}</Paragraph>;
  },

  Image: ({ props }: BaseComponentProps<AntdProps<"Image">>) => {
    if (props.src) {
      return (
        <AntImage
          src={props.src}
          alt={props.alt ?? ""}
          width={props.width ?? undefined}
          height={props.height ?? undefined}
          style={{ maxWidth: "100%", borderRadius: 4 }}
          preview={false}
        />
      );
    }
    return (
      <div
        style={{
          width: props.width ?? 80,
          height: props.height ?? 60,
          background: "#f5f5f5",
          border: "1px solid #d9d9d9",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AntText type="secondary" style={{ fontSize: 12 }}>
          {props.alt || "img"}
        </AntText>
      </div>
    );
  },

  Avatar: ({ props }: BaseComponentProps<AntdProps<"Avatar">>) => {
    const name = props.name || "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const sizeMap: Record<string, number> = { sm: 32, md: 40, lg: 48 };
    const size = sizeMap[props.size ?? "md"] ?? 40;

    return (
      <AntAvatar src={props.src ?? undefined} size={size}>
        {initials}
      </AntAvatar>
    );
  },

  Badge: ({ props }: BaseComponentProps<AntdProps<"Badge">>) => {
    const colorMap: Record<string, string> = {
      default: "blue",
      secondary: "default",
      destructive: "red",
      outline: "default",
    };
    return (
      <Tag
        color={colorMap[props.variant ?? "default"] ?? "blue"}
        bordered={props.variant === "outline"}
      >
        {props.text}
      </Tag>
    );
  },

  Alert: ({ props }: BaseComponentProps<AntdProps<"Alert">>) => {
    return (
      <AntAlert
        type={props.type ?? "info"}
        message={props.title}
        description={props.message ?? undefined}
        showIcon
      />
    );
  },

  Progress: ({ props }: BaseComponentProps<AntdProps<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <div style={{ width: "100%" }}>
        {props.label && (
          <AntText type="secondary" style={{ fontSize: 12 }}>
            {props.label}
          </AntText>
        )}
        <AntProgress percent={value} showInfo={false} />
      </div>
    );
  },

  Skeleton: ({ props }: BaseComponentProps<AntdProps<"Skeleton">>) => {
    if (props.rounded) {
      return (
        <AntSkeleton.Avatar
          active
          shape="circle"
          size={typeof props.width === "number" ? props.width : 40}
        />
      );
    }
    return (
      <AntSkeleton.Button
        active
        block
        style={{
          width: props.width ?? "100%",
          height: props.height ?? 20,
          borderRadius: 4,
        }}
      />
    );
  },

  Spinner: ({ props }: BaseComponentProps<AntdProps<"Spinner">>) => {
    const sizeMap: Record<string, "small" | "default" | "large"> = {
      sm: "small",
      md: "default",
      lg: "large",
    };
    return (
      <Space>
        <Spin size={sizeMap[props.size ?? "md"] ?? "default"} />
        {props.label && <AntText type="secondary">{props.label}</AntText>}
      </Space>
    );
  },

  Tooltip: ({ props }: BaseComponentProps<AntdProps<"Tooltip">>) => {
    return (
      <AntTooltip title={props.content}>
        <AntText style={{ textDecoration: "underline dotted", cursor: "help" }}>
          {props.text}
        </AntText>
      </AntTooltip>
    );
  },

  Popover: ({ props }: BaseComponentProps<AntdProps<"Popover">>) => {
    return (
      <AntPopover content={<Paragraph>{props.content}</Paragraph>}>
        <AntButton type="default">{props.trigger}</AntButton>
      </AntPopover>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Input: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Input">>) => {
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(
        props.value as string | undefined,
        bindings?.value,
        "",
        {
          checks: props.checks ?? undefined,
          validateOn: props.validateOn ?? "blur",
        },
      );

    return (
      <div>
        {props.label && (
          <div style={{ marginBottom: 4 }}>
            <AntText>{props.label}</AntText>
          </div>
        )}
        <AntInput
          name={props.name ?? undefined}
          type={props.type ?? "text"}
          placeholder={props.placeholder ?? ""}
          value={value}
          status={errors.length > 0 ? "error" : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") emit("submit");
          }}
          onFocus={() => emit("focus")}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
            emit("blur");
          }}
        />
        {errors.length > 0 && (
          <AntText type="danger" style={{ fontSize: 12 }}>
            {errors[0]}
          </AntText>
        )}
      </div>
    );
  },

  Textarea: ({
    props,
    bindings,
  }: BaseComponentProps<AntdProps<"Textarea">>) => {
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(
        props.value as string | undefined,
        bindings?.value,
        "",
        {
          checks: props.checks ?? undefined,
          validateOn: props.validateOn ?? "blur",
        },
      );

    return (
      <div>
        {props.label && (
          <div style={{ marginBottom: 4 }}>
            <AntText>{props.label}</AntText>
          </div>
        )}
        <AntTextArea
          name={props.name ?? undefined}
          placeholder={props.placeholder ?? ""}
          rows={props.rows ?? 3}
          value={value}
          status={errors.length > 0 ? "error" : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
          }}
        />
        {errors.length > 0 && (
          <AntText type="danger" style={{ fontSize: 12 }}>
            {errors[0]}
          </AntText>
        )}
      </div>
    );
  },

  Select: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Select">>) => {
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(
        props.value as string | undefined,
        bindings?.value,
        "",
        {
          checks: props.checks ?? undefined,
          validateOn: props.validateOn ?? "change",
        },
      );
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );

    return (
      <div>
        {props.label && (
          <div style={{ marginBottom: 4 }}>
            <AntText>{props.label}</AntText>
          </div>
        )}
        <AntSelect
          value={value || undefined}
          placeholder={props.placeholder ?? "Select..."}
          style={{ width: "100%" }}
          status={errors.length > 0 ? "error" : undefined}
          onChange={(v: string) => {
            setValue(v);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
          options={options.map((opt, idx) => ({
            label: opt,
            value: opt || `option-${idx}`,
          }))}
        />
        {errors.length > 0 && (
          <AntText type="danger" style={{ fontSize: 12 }}>
            {errors[0]}
          </AntText>
        )}
      </div>
    );
  },

  Checkbox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Checkbox">>) => {
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
      {
        checks: props.checks ?? undefined,
        validateOn: props.validateOn ?? "change",
      },
    );

    return (
      <div>
        <AntCheckbox
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {props.label}
        </AntCheckbox>
        {errors.length > 0 && (
          <div>
            <AntText type="danger" style={{ fontSize: 12 }}>
              {errors[0]}
            </AntText>
          </div>
        )}
      </div>
    );
  },

  Radio: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Radio">>) => {
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(
        props.value as string | undefined,
        bindings?.value,
        options[0] ?? "",
        {
          checks: props.checks ?? undefined,
          validateOn: props.validateOn ?? "change",
        },
      );

    return (
      <div>
        {props.label && (
          <div style={{ marginBottom: 4 }}>
            <AntText>{props.label}</AntText>
          </div>
        )}
        <AntRadio.Group
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          <Space direction="vertical">
            {options.map((opt, idx) => (
              <AntRadio key={`${idx}-${opt}`} value={opt || `option-${idx}`}>
                {opt}
              </AntRadio>
            ))}
          </Space>
        </AntRadio.Group>
        {errors.length > 0 && (
          <AntText type="danger" style={{ fontSize: 12 }}>
            {errors[0]}
          </AntText>
        )}
      </div>
    );
  },

  Switch: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Switch">>) => {
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
      {
        checks: props.checks ?? undefined,
        validateOn: props.validateOn ?? "change",
      },
    );

    return (
      <div>
        <Flex justify="space-between" align="center">
          <AntText>{props.label}</AntText>
          <AntSwitch
            checked={checked}
            onChange={(c) => {
              setChecked(c);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
            size="small"
          />
        </Flex>
        {errors.length > 0 && (
          <AntText type="danger" style={{ fontSize: 12 }}>
            {errors[0]}
          </AntText>
        )}
      </div>
    );
  },

  Slider: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Slider">>) => {
    const [value, setValue] = useBoundField<number>(
      props.value as number | undefined,
      bindings?.value,
      props.min ?? 0,
    );

    return (
      <div style={{ width: "100%" }}>
        {props.label && (
          <Flex justify="space-between">
            <AntText>{props.label}</AntText>
            <AntText type="secondary">{value}</AntText>
          </Flex>
        )}
        <AntSlider
          value={value}
          min={props.min ?? 0}
          max={props.max ?? 100}
          step={props.step ?? 1}
          onChange={(v) => {
            setValue(v);
            emit("change");
          }}
        />
      </div>
    );
  },

  // ── Actions ───────────────────────────────────────────────────────────

  Button: ({ props, emit }: BaseComponentProps<AntdProps<"Button">>) => {
    const typeMap: Record<string, "primary" | "default" | "primary"> = {
      primary: "primary",
      secondary: "default",
      danger: "primary",
    };

    return (
      <AntButton
        type={typeMap[props.variant ?? "primary"] ?? "primary"}
        danger={props.variant === "danger"}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
      >
        {props.label}
      </AntButton>
    );
  },

  Link: ({ props, on }: BaseComponentProps<AntdProps<"Link">>) => {
    return (
      <AntLink
        href={props.href ?? "#"}
        onClick={(e: React.MouseEvent) => {
          const press = on("press");
          if (press.shouldPreventDefault) e.preventDefault();
          press.emit();
        }}
      >
        {props.label}
      </AntLink>
    );
  },

  DropdownMenu: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"DropdownMenu">>) => {
    const items = props.items ?? [];
    const [, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );

    return (
      <Dropdown
        menu={{
          items: items.map((item) => ({
            key: item.value,
            label: item.label,
            onClick: () => {
              setBoundValue(item.value);
              emit("select");
            },
          })),
        }}
      >
        <AntButton>{props.label}</AntButton>
      </Dropdown>
    );
  },

  Toggle: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Toggle">>) => {
    const [pressed, setPressed] = useBoundField<boolean>(
      props.pressed as boolean | undefined,
      bindings?.pressed,
      props.pressed ?? false,
    );

    return (
      <AntButton
        type={pressed ? "primary" : "default"}
        onClick={() => {
          setPressed(!pressed);
          emit("change");
        }}
      >
        {props.label}
      </AntButton>
    );
  },

  ToggleGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"ToggleGroup">>) => {
    const items = props.items ?? [];
    const [value, setValue] = useBoundField<string>(
      props.value as string | undefined,
      bindings?.value,
      items[0]?.value ?? "",
    );
    const isMultiple = props.type === "multiple";

    if (isMultiple) {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <Space.Compact>
          {items.map((item) => (
            <AntButton
              key={item.value}
              type={selected.includes(item.value) ? "primary" : "default"}
              onClick={() => {
                const next = selected.includes(item.value)
                  ? selected.filter((v) => v !== item.value)
                  : [...selected, item.value];
                setValue(next.join(","));
                emit("change");
              }}
            >
              {item.label}
            </AntButton>
          ))}
        </Space.Compact>
      );
    }

    return (
      <Space.Compact>
        {items.map((item) => (
          <AntButton
            key={item.value}
            type={value === item.value ? "primary" : "default"}
            onClick={() => {
              setValue(item.value);
              emit("change");
            }}
          >
            {item.label}
          </AntButton>
        ))}
      </Space.Compact>
    );
  },

  ButtonGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    const [value, setValue] = useBoundField<string>(
      props.selected as string | undefined,
      bindings?.selected,
      buttons[0]?.value ?? "",
    );

    return (
      <Space.Compact>
        {buttons.map((btn) => (
          <AntButton
            key={btn.value}
            type={value === btn.value ? "primary" : "default"}
            onClick={() => {
              setValue(btn.value);
              emit("change");
            }}
          >
            {btn.label}
          </AntButton>
        ))}
      </Space.Compact>
    );
  },

  Pagination: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<AntdProps<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined,
      bindings?.page,
    );
    const currentPage = boundPage ?? 1;

    return (
      <AntPagination
        current={currentPage}
        total={(props.totalPages ?? 1) * 10}
        pageSize={10}
        onChange={(page) => {
          setBoundPage(page);
          emit("change");
        }}
        size="small"
        simple
      />
    );
  },
};
