"use client";

import { useState, useRef } from "react";
import {
  useBoundProp,
  useStateBinding,
  useFieldValidation,
  type BaseComponentProps,
} from "@json-render/react";

import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import MuiStack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import MuiTabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Collapse from "@mui/material/Collapse";
import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import MuiDrawer from "@mui/material/Drawer";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiAvatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LinearProgress from "@mui/material/LinearProgress";
import MuiSkeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import MuiTooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiCheckbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import MuiSwitch from "@mui/material/Switch";
import MuiSlider from "@mui/material/Slider";
import MuiButton from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MuiPagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import FormHelperText from "@mui/material/FormHelperText";

import { type MuiProps } from "./catalog";

// =============================================================================
// Standard MUI Component Implementations
// =============================================================================

/**
 * Material UI component implementations for json-render.
 *
 * Pass to `defineRegistry()` from `@json-render/react` to create a
 * component registry for rendering JSON specs with MUI components.
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/react";
 * import { muiComponents } from "@json-render/mui";
 *
 * const { registry } = defineRegistry(catalog, {
 *   components: {
 *     Card: muiComponents.Card,
 *     Button: muiComponents.Button,
 *   },
 * });
 * ```
 */
export const muiComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Card: ({ props, children }: BaseComponentProps<MuiProps<"Card">>) => {
    const maxWidthMap: Record<string, number | string> = {
      sm: 280,
      md: 320,
      lg: 360,
      full: "100%",
    };
    const maxWidth = maxWidthMap[props.maxWidth ?? "full"] ?? "100%";

    return (
      <MuiCard
        sx={{
          maxWidth,
          ...(props.centered ? { mx: "auto" } : {}),
        }}
      >
        {(props.title || props.description) && (
          <CardHeader
            title={props.title}
            subheader={props.description}
            titleTypographyProps={{ variant: "h6" }}
            subheaderTypographyProps={{ variant: "body2" }}
          />
        )}
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          {children}
        </CardContent>
      </MuiCard>
    );
  },

  Stack: ({ props, children }: BaseComponentProps<MuiProps<"Stack">>) => {
    const gapMap: Record<string, number> = {
      none: 0,
      sm: 1,
      md: 1.5,
      lg: 2,
    };
    const alignMap: Record<string, string> = {
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
      <MuiStack
        direction={props.direction === "horizontal" ? "row" : "column"}
        spacing={gapMap[props.gap ?? "md"] ?? 1.5}
        sx={{
          alignItems: alignMap[props.align ?? "start"] ?? "flex-start",
          justifyContent: justifyMap[props.justify ?? ""] ?? undefined,
          flexWrap: props.direction === "horizontal" ? "wrap" : undefined,
        }}
      >
        {children}
      </MuiStack>
    );
  },

  Grid: ({ props, children }: BaseComponentProps<MuiProps<"Grid">>) => {
    const columns = Math.max(1, Math.min(6, props.columns ?? 1));
    const gapMap: Record<string, number> = { sm: 1, md: 1.5, lg: 2 };
    const gap = gapMap[props.gap ?? "md"] ?? 1.5;

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {children}
      </Box>
    );
  },

  Separator: ({ props }: BaseComponentProps<MuiProps<"Separator">>) => {
    return (
      <Divider
        orientation={props.orientation ?? "horizontal"}
        sx={
          props.orientation === "vertical"
            ? { height: "100%", mx: 1 }
            : { my: 1.5 }
        }
      />
    );
  },

  Tabs: ({
    props,
    children,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Tabs">>) => {
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

    return (
      <Box>
        <MuiTabs
          value={value}
          onChange={(_, v) => {
            setValue(v);
            emit("change");
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </MuiTabs>
        <Box sx={{ pt: 2 }}>{children}</Box>
      </Box>
    );
  },

  Accordion: ({ props }: BaseComponentProps<MuiProps<"Accordion">>) => {
    const items = props.items ?? [];
    const [expanded, setExpanded] = useState<string | false>(false);
    const isMultiple = props.type === "multiple";
    const [expandedMultiple, setExpandedMultiple] = useState<string[]>([]);

    if (isMultiple) {
      return (
        <div>
          {items.map((item, i) => {
            const panel = `panel-${i}`;
            return (
              <MuiAccordion
                key={i}
                expanded={expandedMultiple.includes(panel)}
                onChange={() =>
                  setExpandedMultiple((prev) =>
                    prev.includes(panel)
                      ? prev.filter((p) => p !== panel)
                      : [...prev, panel],
                  )
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">{item.content}</Typography>
                </AccordionDetails>
              </MuiAccordion>
            );
          })}
        </div>
      );
    }

    return (
      <div>
        {items.map((item, i) => {
          const panel = `panel-${i}`;
          return (
            <MuiAccordion
              key={i}
              expanded={expanded === panel}
              onChange={() =>
                setExpanded((prev) => (prev === panel ? false : panel))
              }
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{item.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{item.content}</Typography>
              </AccordionDetails>
            </MuiAccordion>
          );
        })}
      </div>
    );
  },

  Collapsible: ({
    props,
    children,
  }: BaseComponentProps<MuiProps<"Collapsible">>) => {
    const [open, setOpen] = useState(props.defaultOpen ?? false);
    return (
      <Box sx={{ width: "100%" }}>
        <MuiButton
          variant="outlined"
          fullWidth
          onClick={() => setOpen(!open)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          }
          sx={{ justifyContent: "space-between", textTransform: "none" }}
        >
          {props.title}
        </MuiButton>
        <Collapse in={open}>
          <Box sx={{ pt: 1 }}>{children}</Box>
        </Collapse>
      </Box>
    );
  },

  Dialog: ({ props, children }: BaseComponentProps<MuiProps<"Dialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <MuiDialog open={open ?? false} onClose={() => setOpen(false)}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
          {props.description && (
            <DialogContentText>{props.description}</DialogContentText>
          )}
          {children}
        </DialogContent>
      </MuiDialog>
    );
  },

  Drawer: ({ props, children }: BaseComponentProps<MuiProps<"Drawer">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <MuiDrawer
        anchor="bottom"
        open={open ?? false}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">{props.title}</Typography>
          {props.description && (
            <Typography variant="body2" color="text.secondary">
              {props.description}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>{children}</Box>
        </Box>
      </MuiDrawer>
    );
  },

  Carousel: ({ props }: BaseComponentProps<MuiProps<"Carousel">>) => {
    const items = props.items ?? [];
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = items.length;

    return (
      <Box sx={{ width: "100%" }}>
        {items[activeStep] && (
          <Paper sx={{ p: 2 }} variant="outlined">
            {items[activeStep]!.title && (
              <Typography variant="subtitle2" gutterBottom>
                {items[activeStep]!.title}
              </Typography>
            )}
            {items[activeStep]!.description && (
              <Typography variant="body2" color="text.secondary">
                {items[activeStep]!.description}
              </Typography>
            )}
          </Paper>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1, gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant="caption" sx={{ alignSelf: "center" }}>
            {activeStep + 1} / {maxSteps}
          </Typography>
          <IconButton
            size="small"
            onClick={() =>
              setActiveStep((prev) => Math.min(maxSteps - 1, prev + 1))
            }
            disabled={activeStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      </Box>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: BaseComponentProps<MuiProps<"Table">>) => {
    const columns = props.columns ?? [];
    const rows = (props.rows ?? []).map((row) => row.map(String));

    return (
      <TableContainer component={Paper} variant="outlined">
        <MuiTable size="small">
          {props.caption && <caption>{props.caption}</caption>}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    );
  },

  Heading: ({ props }: BaseComponentProps<MuiProps<"Heading">>) => {
    const variantMap: Record<string, "h3" | "h4" | "h5" | "h6"> = {
      h1: "h4",
      h2: "h5",
      h3: "h6",
      h4: "h6",
    };
    return (
      <Typography
        variant={variantMap[props.level ?? "h2"] ?? "h5"}
        gutterBottom
      >
        {props.text}
      </Typography>
    );
  },

  Text: ({ props }: BaseComponentProps<MuiProps<"Text">>) => {
    if (props.variant === "code") {
      return (
        <Typography
          component="code"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.875rem",
            bgcolor: "action.hover",
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
          }}
        >
          {props.text}
        </Typography>
      );
    }

    const variantMap: Record<
      string,
      "body1" | "body2" | "caption" | "subtitle1"
    > = {
      body: "body2",
      caption: "caption",
      muted: "body2",
      lead: "subtitle1",
    };

    return (
      <Typography
        variant={variantMap[props.variant ?? "body"] ?? "body2"}
        color={props.variant === "muted" ? "text.secondary" : undefined}
      >
        {props.text}
      </Typography>
    );
  },

  Image: ({ props }: BaseComponentProps<MuiProps<"Image">>) => {
    if (props.src) {
      return (
        <Box
          component="img"
          src={props.src}
          alt={props.alt ?? ""}
          sx={{
            maxWidth: "100%",
            borderRadius: 1,
            width: props.width ?? undefined,
            height: props.height ?? undefined,
          }}
        />
      );
    }
    return (
      <Box
        sx={{
          width: props.width ?? 80,
          height: props.height ?? 60,
          bgcolor: "action.hover",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {props.alt || "img"}
        </Typography>
      </Box>
    );
  },

  Avatar: ({ props }: BaseComponentProps<MuiProps<"Avatar">>) => {
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
      <MuiAvatar
        src={props.src ?? undefined}
        sx={{ width: size, height: size }}
      >
        {initials}
      </MuiAvatar>
    );
  },

  Badge: ({ props }: BaseComponentProps<MuiProps<"Badge">>) => {
    const colorMap: Record<
      string,
      "default" | "primary" | "secondary" | "error"
    > = {
      default: "primary",
      secondary: "secondary",
      destructive: "error",
      outline: "default",
    };
    return (
      <Chip
        label={props.text}
        color={colorMap[props.variant ?? "default"] ?? "primary"}
        variant={props.variant === "outline" ? "outlined" : "filled"}
        size="small"
      />
    );
  },

  Alert: ({ props }: BaseComponentProps<MuiProps<"Alert">>) => {
    return (
      <MuiAlert severity={props.type ?? "info"}>
        <AlertTitle>{props.title}</AlertTitle>
        {props.message}
      </MuiAlert>
    );
  },

  Progress: ({ props }: BaseComponentProps<MuiProps<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <Box sx={{ width: "100%" }}>
        {props.label && (
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {props.label}
          </Typography>
        )}
        <LinearProgress variant="determinate" value={value} />
      </Box>
    );
  },

  Skeleton: ({ props }: BaseComponentProps<MuiProps<"Skeleton">>) => {
    return (
      <MuiSkeleton
        variant={props.rounded ? "circular" : "rectangular"}
        width={props.width ?? "100%"}
        height={props.height ?? 20}
        sx={{ borderRadius: props.rounded ? undefined : 0.5 }}
      />
    );
  },

  Spinner: ({ props }: BaseComponentProps<MuiProps<"Spinner">>) => {
    const sizeMap: Record<string, number> = { sm: 16, md: 24, lg: 32 };
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={sizeMap[props.size ?? "md"] ?? 24} />
        {props.label && (
          <Typography variant="body2" color="text.secondary">
            {props.label}
          </Typography>
        )}
      </Box>
    );
  },

  Tooltip: ({ props }: BaseComponentProps<MuiProps<"Tooltip">>) => {
    return (
      <MuiTooltip title={props.content}>
        <Typography
          component="span"
          variant="body2"
          sx={{ textDecoration: "underline dotted", cursor: "help" }}
        >
          {props.text}
        </Typography>
      </MuiTooltip>
    );
  },

  Popover: ({ props }: BaseComponentProps<MuiProps<"Popover">>) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    return (
      <>
        <MuiButton
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {props.trigger}
        </MuiButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 2, maxWidth: 256 }}>
            <Typography variant="body2">{props.content}</Typography>
          </Box>
        </Popover>
      </>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Input: ({ props, bindings, emit }: BaseComponentProps<MuiProps<"Input">>) => {
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
      <TextField
        label={props.label}
        name={props.name ?? undefined}
        type={props.type ?? "text"}
        placeholder={props.placeholder ?? ""}
        value={value}
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
        error={errors.length > 0}
        helperText={errors[0] ?? undefined}
        size="small"
        fullWidth
      />
    );
  },

  Textarea: ({ props, bindings }: BaseComponentProps<MuiProps<"Textarea">>) => {
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
      <TextField
        label={props.label}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        multiline
        rows={props.rows ?? 3}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (hasValidation && validateOn === "change") validate();
        }}
        onBlur={() => {
          if (hasValidation && validateOn === "blur") validate();
        }}
        error={errors.length > 0}
        helperText={errors[0] ?? undefined}
        size="small"
        fullWidth
      />
    );
  },

  Select: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Select">>) => {
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
      <FormControl size="small" fullWidth error={errors.length > 0}>
        <InputLabel>{props.label}</InputLabel>
        <MuiSelect
          label={props.label}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {options.map((opt, idx) => (
            <MenuItem key={`${idx}-${opt}`} value={opt || `option-${idx}`}>
              {opt}
            </MenuItem>
          ))}
        </MuiSelect>
        {errors.length > 0 && <FormHelperText>{errors[0]}</FormHelperText>}
      </FormControl>
    );
  },

  Checkbox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Checkbox">>) => {
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
      <Box>
        <FormControlLabel
          control={
            <MuiCheckbox
              checked={checked}
              onChange={(_, c) => {
                setChecked(c);
                if (hasValidation && validateOn === "change") validate();
                emit("change");
              }}
              size="small"
            />
          }
          label={props.label}
        />
        {errors.length > 0 && (
          <FormHelperText error>{errors[0]}</FormHelperText>
        )}
      </Box>
    );
  },

  Radio: ({ props, bindings, emit }: BaseComponentProps<MuiProps<"Radio">>) => {
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
      <FormControl error={errors.length > 0}>
        {props.label && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {props.label}
          </Typography>
        )}
        <RadioGroup
          value={value}
          onChange={(_, v) => {
            setValue(v);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {options.map((opt, idx) => (
            <FormControlLabel
              key={`${idx}-${opt}`}
              value={opt || `option-${idx}`}
              control={<Radio size="small" />}
              label={opt}
            />
          ))}
        </RadioGroup>
        {errors.length > 0 && <FormHelperText>{errors[0]}</FormHelperText>}
      </FormControl>
    );
  },

  Switch: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Switch">>) => {
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
      <Box>
        <FormControlLabel
          control={
            <MuiSwitch
              checked={checked}
              onChange={(_, c) => {
                setChecked(c);
                if (hasValidation && validateOn === "change") validate();
                emit("change");
              }}
              size="small"
            />
          }
          label={props.label}
          labelPlacement="start"
          sx={{ ml: 0, justifyContent: "space-between", width: "100%" }}
        />
        {errors.length > 0 && (
          <FormHelperText error>{errors[0]}</FormHelperText>
        )}
      </Box>
    );
  },

  Slider: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Slider">>) => {
    const [boundValue, setBoundValue] = useBoundProp<number>(
      props.value as number | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.min ?? 0);
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? props.min ?? 0) : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <Box sx={{ width: "100%" }}>
        {props.label && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">{props.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {value}
            </Typography>
          </Box>
        )}
        <MuiSlider
          value={value}
          min={props.min ?? 0}
          max={props.max ?? 100}
          step={props.step ?? 1}
          onChange={(_, v) => {
            setValue(v as number);
            emit("change");
          }}
          size="small"
        />
      </Box>
    );
  },

  // ── Actions ───────────────────────────────────────────────────────────

  Button: ({ props, emit }: BaseComponentProps<MuiProps<"Button">>) => {
    const variantMap: Record<string, "contained" | "outlined" | "contained"> = {
      primary: "contained",
      secondary: "outlined",
      danger: "contained",
    };
    const colorMap: Record<string, "primary" | "secondary" | "error"> = {
      primary: "primary",
      secondary: "secondary",
      danger: "error",
    };

    return (
      <MuiButton
        variant={variantMap[props.variant ?? "primary"] ?? "contained"}
        color={colorMap[props.variant ?? "primary"] ?? "primary"}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
      >
        {props.label}
      </MuiButton>
    );
  },

  Link: ({ props, on }: BaseComponentProps<MuiProps<"Link">>) => {
    return (
      <MuiLink
        href={props.href ?? "#"}
        underline="hover"
        variant="body2"
        onClick={(e: React.MouseEvent) => {
          const press = on("press");
          if (press.shouldPreventDefault) e.preventDefault();
          press.emit();
        }}
      >
        {props.label}
      </MuiLink>
    );
  },

  DropdownMenu: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"DropdownMenu">>) => {
    const items = props.items ?? [];
    const [, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    return (
      <>
        <MuiButton
          ref={anchorRef}
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          {props.label}
        </MuiButton>
        <Menu
          anchorEl={anchorRef.current}
          open={open}
          onClose={() => setOpen(false)}
        >
          {items.map((item) => (
            <MenuItem
              key={item.value}
              onClick={() => {
                setBoundValue(item.value);
                emit("select");
                setOpen(false);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },

  Toggle: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Toggle">>) => {
    const [boundPressed, setBoundPressed] = useBoundProp<boolean>(
      props.pressed as boolean | undefined,
      bindings?.pressed,
    );
    const [localPressed, setLocalPressed] = useState(props.pressed ?? false);
    const isBound = !!bindings?.pressed;
    const pressed = isBound ? (boundPressed ?? false) : localPressed;
    const setPressed = isBound ? setBoundPressed : setLocalPressed;

    return (
      <ToggleButton
        value="toggle"
        selected={pressed}
        onChange={() => {
          setPressed(!pressed);
          emit("change");
        }}
        size="small"
      >
        {props.label}
      </ToggleButton>
    );
  },

  ToggleGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"ToggleGroup">>) => {
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
        <ToggleButtonGroup
          value={selected}
          onChange={(_, v) => {
            setValue((v as string[]).join(","));
            emit("change");
          }}
          size="small"
        >
          {items.map((item) => (
            <ToggleButton key={item.value} value={item.value}>
              {item.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      );
    }

    return (
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, v) => {
          if (v !== null) {
            setValue(v as string);
            emit("change");
          }
        }}
        size="small"
      >
        {items.map((item) => (
          <ToggleButton key={item.value} value={item.value}>
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  },

  ButtonGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"ButtonGroup">>) => {
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
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, v) => {
          if (v !== null) {
            setValue(v as string);
            emit("change");
          }
        }}
        size="small"
      >
        {buttons.map((btn) => (
          <ToggleButton key={btn.value} value={btn.value}>
            {btn.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  },

  Pagination: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<MuiProps<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined,
      bindings?.page,
    );
    const currentPage = boundPage ?? 1;

    return (
      <MuiPagination
        count={props.totalPages ?? 1}
        page={currentPage}
        onChange={(_, page) => {
          setBoundPage(page);
          emit("change");
        }}
        size="small"
      />
    );
  },
};
