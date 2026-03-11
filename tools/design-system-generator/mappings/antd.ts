import type { DesignSystemMapping } from "../src/types";

/**
 * Ant Design mapping for json-render.
 *
 * This was extracted from the hand-written @json-render/antd package
 * and serves as the reference example for creating new mappings.
 */
export const antdMapping: DesignSystemMapping = {
  name: "antd",
  displayName: "Ant Design",
  packageName: "@json-render/antd",

  library: {
    packageName: "antd",
    version: "^5.0.0",
    peerDeps: {
      "@ant-design/icons": "^5.0.0",
    },
    imports: [
      {
        from: "antd",
        named: [
          { name: "Alert", alias: "AntAlert" },
          { name: "Avatar", alias: "AntAvatar" },
          { name: "Badge", alias: "AntBadge" },
          { name: "Button", alias: "AntButton" },
          { name: "Card", alias: "AntCard" },
          { name: "Carousel", alias: "AntCarousel" },
          { name: "Checkbox", alias: "AntCheckbox" },
          { name: "Collapse", alias: "AntCollapse" },
          "Divider",
          { name: "Drawer", alias: "AntDrawer" },
          "Dropdown",
          "Flex",
          { name: "Image", alias: "AntImage" },
          { name: "Input", alias: "AntInput" },
          { name: "Modal", alias: "AntModal" },
          { name: "Pagination", alias: "AntPagination" },
          { name: "Popover", alias: "AntPopover" },
          { name: "Progress", alias: "AntProgress" },
          { name: "Radio", alias: "AntRadio" },
          { name: "Select", alias: "AntSelect" },
          { name: "Skeleton", alias: "AntSkeleton" },
          { name: "Slider", alias: "AntSlider" },
          "Space",
          "Spin",
          { name: "Switch", alias: "AntSwitch" },
          { name: "Table", alias: "AntTable" },
          { name: "Tabs", alias: "AntTabs" },
          "Tag",
          { name: "Tooltip", alias: "AntTooltip" },
          "Typography",
        ],
        destructure: [
          {
            source: "Typography",
            members: {
              Title: "Title",
              Paragraph: "Paragraph",
              Text: "AntText",
              Link: "AntLink",
            },
          },
          {
            source: "AntInput",
            members: { TextArea: "AntTextArea" },
          },
        ],
      },
      {
        from: "@ant-design/icons",
        named: ["LeftOutlined", "RightOutlined"],
      },
    ],
  },

  patterns: {
    label: {
      component: "AntText",
      position: "above",
      wrapper: "<div style={{ marginBottom: 4 }}>",
    },
    error: {
      component: "AntText",
      props: { type: '"danger"', style: "{{ fontSize: 12 }}" },
      inputErrorProp: { name: "status", value: '"error"' },
    },
    formFieldWrapper: "<div>",
  },

  components: {
    // =========================================================================
    // Layout
    // =========================================================================

    Card: {
      type: "render-override",
      hook: "none",
      render: `({ props, children }: BaseComponentProps<Props<"Card">>) => {
    const maxWidthMap: Record<string, number | string> = {
      sm: 280, md: 320, lg: 360, full: "100%",
    };
    const maxWidth = maxWidthMap[props.maxWidth ?? "full"] ?? "100%";
    return (
      <AntCard
        title={props.title}
        style={{ maxWidth, ...(props.centered ? { margin: "0 auto" } : {}) }}
      >
        {props.description && !props.title && (
          <Paragraph type="secondary">{props.description}</Paragraph>
        )}
        <Flex vertical gap={12}>{children}</Flex>
      </AntCard>
    );
  }`,
      notes:
        "Ant Card accepts title as a prop directly. Children wrapped in Flex for vertical spacing.",
    },

    Stack: {
      type: "render-override",
      hook: "none",
      render: `({ props, children }: BaseComponentProps<Props<"Stack">>) => {
    const gapMap: Record<string, number> = { none: 0, sm: 8, md: 12, lg: 16 };
    const alignMap: Record<string, "flex-start" | "center" | "flex-end" | "stretch"> = {
      start: "flex-start", center: "center", end: "flex-end", stretch: "stretch",
    };
    const justifyMap: Record<string, string> = {
      start: "flex-start", center: "center", end: "flex-end",
      between: "space-between", around: "space-around",
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
  }`,
      notes: "Ant uses Flex component with vertical prop instead of direction.",
    },

    Grid: {
      type: "render-override",
      hook: "none",
      render: `({ props, children }: BaseComponentProps<Props<"Grid">>) => {
    const columns = Math.max(1, Math.min(6, props.columns ?? 1));
    const gapMap: Record<string, number> = { sm: 8, md: 12, lg: 16 };
    const gap = gapMap[props.gap ?? "md"] ?? 12;
    return (
      <div style={{ display: "grid", gridTemplateColumns: \`repeat(\${columns}, 1fr)\`, gap }}>
        {children}
      </div>
    );
  }`,
      notes:
        "Ant does not have a simple Grid for this use case; raw CSS grid is cleaner.",
    },

    Separator: {
      type: "data-driven",
      hook: "none",
      libraryComponent: "Divider",
      propMap: { orientation: "type" },
      valueMap: {
        orientation: { horizontal: "horizontal", vertical: "vertical" },
      },
      notes:
        "Vertical divider needs inline style { height: '100%', margin: '0 8px' }.",
    },

    Tabs: {
      type: "render-override",
      hook: "useBoundField<string>",
      render: `({ props, children, bindings, emit }: BaseComponentProps<Props<"Tabs">>) => {
    const tabs = props.tabs ?? [];
    const [value, setValue] = useBoundField<string>(
      props.value as string | undefined, bindings?.value,
      props.defaultValue ?? tabs[0]?.value ?? "",
    );
    return (
      <AntTabs
        activeKey={value}
        onChange={(key) => { setValue(key); emit("change"); }}
        items={tabs.map((tab) => ({
          key: tab.value, label: tab.label,
          children: tab.value === value ? children : null,
        }))}
      />
    );
  }`,
      notes: "Ant Tabs uses items array config, not sub-components.",
    },

    Accordion: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Accordion">>) => {
    const items = props.items ?? [];
    const collapseItems = items.map((item, i) => ({
      key: String(i), label: item.title,
      children: <Paragraph>{item.content}</Paragraph>,
    }));
    if (props.type === "multiple") return <AntCollapse items={collapseItems} />;
    return <AntCollapse accordion items={collapseItems} />;
  }`,
      notes:
        "Ant Collapse: accordion prop for single mode, omit for multiple. Uses items config.",
    },

    Collapsible: {
      type: "render-override",
      hook: "none",
      render: `({ props, children }: BaseComponentProps<Props<"Collapsible">>) => {
    return (
      <AntCollapse
        defaultActiveKey={props.defaultOpen ? ["0"] : []}
        items={[{ key: "0", label: props.title, children }]}
      />
    );
  }`,
      notes: "Reuses Collapse with a single item.",
    },

    Dialog: {
      type: "render-override",
      hook: "useStateBinding<boolean>",
      render: `({ props, children }: BaseComponentProps<Props<"Dialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <AntModal open={open ?? false} onCancel={() => setOpen(false)} title={props.title} footer={null}>
        {props.description && <Paragraph type="secondary">{props.description}</Paragraph>}
        {children}
      </AntModal>
    );
  }`,
      notes: "Ant Modal. footer={null} to hide default OK/Cancel buttons.",
    },

    Drawer: {
      type: "render-override",
      hook: "useStateBinding<boolean>",
      render: `({ props, children }: BaseComponentProps<Props<"Drawer">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <AntDrawer open={open ?? false} onClose={() => setOpen(false)} title={props.title} placement="bottom">
        {props.description && <Paragraph type="secondary">{props.description}</Paragraph>}
        {children}
      </AntDrawer>
    );
  }`,
      notes: 'Ant Drawer with placement="bottom" to match standard behavior.',
    },

    Carousel: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Carousel">>) => {
    const items = props.items ?? [];
    const carouselRef = useRef<any>(null);
    return (
      <div style={{ width: "100%" }}>
        <AntCarousel ref={carouselRef} dots>
          {items.map((item, i) => (
            <div key={i}>
              <AntCard size="small">
                {item.title && <AntText strong style={{ display: "block", marginBottom: 4 }}>{item.title}</AntText>}
                {item.description && <AntText type="secondary">{item.description}</AntText>}
              </AntCard>
            </div>
          ))}
        </AntCarousel>
      </div>
    );
  }`,
      notes: "Uses Ant Carousel with Card items. Ref needed for prev/next API.",
    },

    // =========================================================================
    // Data Display
    // =========================================================================

    Table: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Table">>) => {
    const columns = (props.columns ?? []).map((col, idx) => ({
      title: col, dataIndex: String(idx), key: String(idx),
    }));
    const dataSource = (props.rows ?? []).map((row, i) => {
      const record: Record<string, string> = { key: String(i) };
      row.forEach((cell, j) => { record[String(j)] = String(cell); });
      return record;
    });
    return (
      <AntTable columns={columns} dataSource={dataSource} pagination={false} size="small"
        title={props.caption ? () => props.caption : undefined}
      />
    );
  }`,
      notes:
        "Ant Table uses columnar config with dataIndex. Rows must be transformed to keyed records.",
    },

    Heading: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Heading">>) => {
    const levelMap: Record<string, 1 | 2 | 3 | 4 | 5> = { h1: 2, h2: 3, h3: 4, h4: 5 };
    return <Title level={levelMap[props.level ?? "h2"] ?? 3}>{props.text}</Title>;
  }`,
      notes:
        "Ant Title levels are offset: our h1 maps to their level 2 (level 1 is huge).",
    },

    Text: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Text">>) => {
    if (props.variant === "code") return <AntText code>{props.text}</AntText>;
    if (props.variant === "caption") return <AntText style={{ fontSize: 12 }} type="secondary">{props.text}</AntText>;
    if (props.variant === "muted") return <AntText type="secondary">{props.text}</AntText>;
    if (props.variant === "lead") return <Paragraph style={{ fontSize: 18 }} type="secondary">{props.text}</Paragraph>;
    return <Paragraph>{props.text}</Paragraph>;
  }`,
      notes:
        "Ant Typography has Text (inline) and Paragraph (block). Variant maps to type/style.",
    },

    Image: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Image">>) => {
    if (props.src) {
      return (
        <AntImage src={props.src} alt={props.alt ?? ""} width={props.width ?? undefined}
          height={props.height ?? undefined} style={{ maxWidth: "100%", borderRadius: 4 }} preview={false}
        />
      );
    }
    return (
      <div style={{ width: props.width ?? 80, height: props.height ?? 60,
        background: "#f5f5f5", border: "1px solid #d9d9d9", borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AntText type="secondary" style={{ fontSize: 12 }}>{props.alt || "img"}</AntText>
      </div>
    );
  }`,
      notes:
        "preview={false} disables Ant Image's built-in lightbox. Placeholder when no src.",
    },

    Avatar: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Avatar">>) => {
    const name = props.name || "?";
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const sizeMap: Record<string, number> = { sm: 32, md: 40, lg: 48 };
    return <AntAvatar src={props.src ?? undefined} size={sizeMap[props.size ?? "md"] ?? 40}>{initials}</AntAvatar>;
  }`,
      notes: "Ant Avatar shows children as fallback text when no src.",
    },

    Badge: {
      type: "data-driven",
      hook: "none",
      libraryComponent: "Tag",
      propMap: { text: "children" },
      valueMap: {
        variant: {
          default: "blue",
          secondary: "default",
          destructive: "red",
          outline: "default",
        },
      },
      notes:
        "Ant uses Tag for badges. variant maps to color prop. outline variant uses bordered={true}.",
    },

    Alert: {
      type: "data-driven",
      hook: "none",
      libraryComponent: "AntAlert",
      propMap: { title: "message", message: "description" },
      valueMap: {
        type: {
          info: "info",
          success: "success",
          warning: "warning",
          error: "error",
        },
      },
      staticProps: { showIcon: true },
      notes:
        "Ant Alert swaps our 'title' -> 'message' and our 'message' -> 'description'.",
    },

    Progress: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <div style={{ width: "100%" }}>
        {props.label && <AntText type="secondary" style={{ fontSize: 12 }}>{props.label}</AntText>}
        <AntProgress percent={value} showInfo={false} />
      </div>
    );
  }`,
      notes:
        "Ant Progress uses percent prop. showInfo={false} hides the % text.",
    },

    Skeleton: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Skeleton">>) => {
    if (props.rounded) {
      return <AntSkeleton.Avatar active shape="circle" size={typeof props.width === "number" ? props.width : 40} />;
    }
    return (
      <AntSkeleton.Button active block
        style={{ width: props.width ?? "100%", height: props.height ?? 20, borderRadius: 4 }}
      />
    );
  }`,
      notes:
        "Ant Skeleton has sub-components Avatar/Button for different shapes.",
    },

    Spinner: {
      type: "render-override",
      hook: "none",
      render: `({ props }: BaseComponentProps<Props<"Spinner">>) => {
    const sizeMap: Record<string, "small" | "default" | "large"> = { sm: "small", md: "default", lg: "large" };
    return (
      <Space>
        <Spin size={sizeMap[props.size ?? "md"] ?? "default"} />
        {props.label && <AntText type="secondary">{props.label}</AntText>}
      </Space>
    );
  }`,
      notes: "Ant Spin component with Space wrapper for optional label.",
    },

    Tooltip: {
      type: "data-driven",
      hook: "none",
      libraryComponent: "AntTooltip",
      propMap: { content: "title" },
      notes:
        'Ant Tooltip uses "title" prop for content. Wraps an underlined text trigger.',
    },

    Popover: {
      type: "data-driven",
      hook: "none",
      libraryComponent: "AntPopover",
      propMap: { content: "content" },
      notes:
        "Ant Popover wraps content in <Paragraph>. Trigger is an AntButton.",
    },

    // =========================================================================
    // Form Inputs
    // =========================================================================

    Input: {
      type: "data-driven",
      hook: "useFormField<string>",
      libraryComponent: "AntInput",
      propMap: {
        name: "name",
        placeholder: "placeholder",
      },
      valueMap: {
        type: {
          text: "text",
          email: "email",
          password: "password",
          number: "number",
        },
      },
      hasLabel: true,
      hasError: true,
      notes:
        "Standard form field pattern. Supports status prop for error state.",
    },

    Textarea: {
      type: "data-driven",
      hook: "useFormField<string>",
      libraryComponent: "AntTextArea",
      propMap: {
        name: "name",
        placeholder: "placeholder",
        rows: "rows",
      },
      hasLabel: true,
      hasError: true,
      notes: "Uses AntInput.TextArea (destructured as AntTextArea).",
    },

    Select: {
      type: "render-override",
      hook: "useFormField<string>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Select">>) => {
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(props.value as string | undefined, bindings?.value, "", {
        checks: props.checks ?? undefined, validateOn: props.validateOn ?? "change",
      });
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) => typeof opt === "string" ? opt : String(opt ?? ""));
    return (
      <div>
        {props.label && <div style={{ marginBottom: 4 }}><AntText>{props.label}</AntText></div>}
        <AntSelect value={value || undefined} placeholder={props.placeholder ?? "Select..."}
          style={{ width: "100%" }} status={errors.length > 0 ? "error" : undefined}
          onChange={(v: string) => {
            setValue(v);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
          options={options.map((opt, idx) => ({ label: opt, value: opt || \`option-\${idx}\` }))}
        />
        {errors.length > 0 && <AntText type="danger" style={{ fontSize: 12 }}>{errors[0]}</AntText>}
      </div>
    );
  }`,
      notes:
        "Ant Select uses options array config, not sub-components. Options need label/value objects.",
    },

    Checkbox: {
      type: "data-driven",
      hook: "useFormField<boolean>",
      libraryComponent: "AntCheckbox",
      propMap: { label: "children" },
      hasLabel: false,
      hasError: true,
      notes:
        "Ant Checkbox puts label as children, not a separate label element. onChange gives e.target.checked.",
    },

    Radio: {
      type: "render-override",
      hook: "useFormField<string>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Radio">>) => {
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) => typeof opt === "string" ? opt : String(opt ?? ""));
    const { value, setValue, errors, validate, hasValidation, validateOn } =
      useFormField<string>(props.value as string | undefined, bindings?.value, options[0] ?? "", {
        checks: props.checks ?? undefined, validateOn: props.validateOn ?? "change",
      });
    return (
      <div>
        {props.label && <div style={{ marginBottom: 4 }}><AntText>{props.label}</AntText></div>}
        <AntRadio.Group value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}>
          <Space direction="vertical">
            {options.map((opt, idx) => (
              <AntRadio key={\`\${idx}-\${opt}\`} value={opt || \`option-\${idx}\`}>{opt}</AntRadio>
            ))}
          </Space>
        </AntRadio.Group>
        {errors.length > 0 && <AntText type="danger" style={{ fontSize: 12 }}>{errors[0]}</AntText>}
      </div>
    );
  }`,
      notes:
        "Ant Radio uses Radio.Group with Radio children. onChange gives e.target.value.",
    },

    Switch: {
      type: "render-override",
      hook: "useFormField<boolean>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Switch">>) => {
    const { value: checked, setValue: setChecked, errors, validate, hasValidation, validateOn } =
      useFormField<boolean>(props.checked as boolean | undefined, bindings?.checked, !!props.checked, {
        checks: props.checks ?? undefined, validateOn: props.validateOn ?? "change",
      });
    return (
      <div>
        <Flex justify="space-between" align="center">
          <AntText>{props.label}</AntText>
          <AntSwitch checked={checked} size="small"
            onChange={(c) => {
              setChecked(c);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
          />
        </Flex>
        {errors.length > 0 && <AntText type="danger" style={{ fontSize: 12 }}>{errors[0]}</AntText>}
      </div>
    );
  }`,
      notes:
        "Ant Switch onChange gives the boolean directly (not an event). Label placed inline via Flex.",
    },

    Slider: {
      type: "render-override",
      hook: "useBoundField<number>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Slider">>) => {
    const [value, setValue] = useBoundField<number>(
      props.value as number | undefined, bindings?.value, props.min ?? 0,
    );
    return (
      <div style={{ width: "100%" }}>
        {props.label && (
          <Flex justify="space-between">
            <AntText>{props.label}</AntText>
            <AntText type="secondary">{value}</AntText>
          </Flex>
        )}
        <AntSlider value={value} min={props.min ?? 0} max={props.max ?? 100} step={props.step ?? 1}
          onChange={(v) => { setValue(v); emit("change"); }}
        />
      </div>
    );
  }`,
      notes:
        "Ant Slider onChange gives the value directly. Label shows current value inline.",
    },

    // =========================================================================
    // Actions
    // =========================================================================

    Button: {
      type: "render-override",
      hook: "none",
      render: `({ props, emit }: BaseComponentProps<Props<"Button">>) => {
    const typeMap: Record<string, "primary" | "default"> = {
      primary: "primary", secondary: "default", danger: "primary",
    };
    return (
      <AntButton type={typeMap[props.variant ?? "primary"] ?? "primary"}
        danger={props.variant === "danger"} disabled={props.disabled ?? false}
        onClick={() => emit("press")}>
        {props.label}
      </AntButton>
    );
  }`,
      notes:
        "Ant Button: variant maps to type + danger flag. danger variant uses type=primary + danger=true.",
    },

    Link: {
      type: "render-override",
      hook: "none",
      render: `({ props, on }: BaseComponentProps<Props<"Link">>) => {
    return (
      <AntLink href={props.href ?? "#"}
        onClick={(e: React.MouseEvent) => {
          const press = on("press");
          if (press.shouldPreventDefault) e.preventDefault();
          press.emit();
        }}>
        {props.label}
      </AntLink>
    );
  }`,
      notes:
        "Uses on() pattern for event handling to support shouldPreventDefault.",
    },

    DropdownMenu: {
      type: "render-override",
      hook: "useBoundProp<string>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"DropdownMenu">>) => {
    const items = props.items ?? [];
    const [, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined, bindings?.value,
    );
    return (
      <Dropdown menu={{
        items: items.map((item) => ({
          key: item.value, label: item.label,
          onClick: () => { setBoundValue(item.value); emit("select"); },
        })),
      }}>
        <AntButton>{props.label}</AntButton>
      </Dropdown>
    );
  }`,
      notes: "Ant Dropdown uses menu config object with items array.",
    },

    Toggle: {
      type: "render-override",
      hook: "useBoundField<boolean>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Toggle">>) => {
    const [pressed, setPressed] = useBoundField<boolean>(
      props.pressed as boolean | undefined, bindings?.pressed, props.pressed ?? false,
    );
    return (
      <AntButton type={pressed ? "primary" : "default"}
        onClick={() => { setPressed(!pressed); emit("change"); }}>
        {props.label}
      </AntButton>
    );
  }`,
      notes:
        "Simulated with a Button that toggles between primary/default type.",
    },

    ToggleGroup: {
      type: "render-override",
      hook: "useBoundField<string>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"ToggleGroup">>) => {
    const items = props.items ?? [];
    const [value, setValue] = useBoundField<string>(
      props.value as string | undefined, bindings?.value, items[0]?.value ?? "",
    );
    const isMultiple = props.type === "multiple";
    if (isMultiple) {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <Space.Compact>
          {items.map((item) => (
            <AntButton key={item.value}
              type={selected.includes(item.value) ? "primary" : "default"}
              onClick={() => {
                const next = selected.includes(item.value)
                  ? selected.filter((v) => v !== item.value)
                  : [...selected, item.value];
                setValue(next.join(","));
                emit("change");
              }}>
              {item.label}
            </AntButton>
          ))}
        </Space.Compact>
      );
    }
    return (
      <Space.Compact>
        {items.map((item) => (
          <AntButton key={item.value}
            type={value === item.value ? "primary" : "default"}
            onClick={() => { setValue(item.value); emit("change"); }}>
            {item.label}
          </AntButton>
        ))}
      </Space.Compact>
    );
  }`,
      notes:
        "Uses Space.Compact with Button group. Multiple mode uses comma-separated string.",
    },

    ButtonGroup: {
      type: "render-override",
      hook: "useBoundField<string>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    const [value, setValue] = useBoundField<string>(
      props.selected as string | undefined, bindings?.selected, buttons[0]?.value ?? "",
    );
    return (
      <Space.Compact>
        {buttons.map((btn) => (
          <AntButton key={btn.value}
            type={value === btn.value ? "primary" : "default"}
            onClick={() => { setValue(btn.value); emit("change"); }}>
            {btn.label}
          </AntButton>
        ))}
      </Space.Compact>
    );
  }`,
      notes: "Same pattern as ToggleGroup single mode. Uses Space.Compact.",
    },

    Pagination: {
      type: "render-override",
      hook: "useBoundProp<number>",
      render: `({ props, bindings, emit }: BaseComponentProps<Props<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined, bindings?.page,
    );
    const currentPage = boundPage ?? 1;
    return (
      <AntPagination current={currentPage} total={(props.totalPages ?? 1) * 10}
        pageSize={10} onChange={(page) => { setBoundPage(page); emit("change"); }}
        size="small" simple
      />
    );
  }`,
      notes:
        "Ant Pagination uses total items / pageSize. Multiply totalPages by 10 to convert.",
    },
  },
};
