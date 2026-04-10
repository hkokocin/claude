---
name: excalidraw
description: Visualise the components involved in the current task as an Excalidraw diagram. Pass a description of what to diagram or omit for auto-detection.
---
# Excalidraw Diagram

Generate an Excalidraw diagram that visualises the architecture or components relevant to the current task.

## Steps

1. **Determine scope** -- Use `$ARGUMENTS` if provided, otherwise infer from recent conversation context (files touched, components discussed).
2. **Explore** -- Read the relevant source files to understand relationships (imports, calls, data flow). Keep exploration focused.
3. **Design the diagram** -- Decide on layout, shapes, labels, and arrows. Prefer left-to-right or top-to-bottom flow. Group related elements.
4. **Generate** -- Write a valid `.excalidraw` JSON file to the project root (or a path specified in `$ARGUMENTS`). Follow the format spec in `@excalidraw_format.md`.
5. **Report** -- Print the file path and a one-line summary of what was diagrammed.

## Default Style

All elements use these defaults unless overridden:

| Property | Value | Notes |
|---|---|---|
| `fontFamily` | `2` (Helvetica) | Clean, readable sans-serif |
| `roughness` | `1` | Hand-drawn feel |
| `fontSize` | `20` | Minimum 16 for readability |
| `strokeWidth` | `2` | |
| `fillStyle` | `"solid"` | |

### Bound text defaults

| Property | Value | Notes |
|---|---|---|
| `verticalAlign` | `"middle"` | Always vertically centred |
| `textAlign` | `"left"` | Default for most shapes |

### Sizing shapes to fit text

Excalidraw has only 5px built-in padding, so the shape must be sized large enough or text visibly clips at the edge. Use these formulas:

**Estimate text width** (Helvetica, `fontSize: 20`):
```
char_width ≈ fontSize * 0.6        # 12px per char at fontSize 20
text_width ≈ longest_line_chars * char_width
```

Use `0.6` as a safe multiplier for mixed case. For ALL CAPS or wide characters, bump to `0.7`. For multi-line text, use the longest line's character count.

**Shape dimensions**:
```
shape_width  = text_width + 60     # 30px padding each side
shape_height = line_count * fontSize * 1.25 + 40   # 20px padding top/bottom
```

**Worked examples** (fontSize 20):
| Text | Chars | Text width | Shape width |
|---|---|---|---|
| `"API Gateway"` | 11 | 132 | 192 |
| `"drop_invalid_header_fields = true"` | 33 | 396 | 456 |
| `"CURRENT — Falcon Dedicated ALB"` | 30 | 360 | 420 |

**Ellipses and diamonds** need extra space because the inscribed text rectangle is smaller than the bounding box. Multiply **both width and height** of the rectangle formulas above by:
- **1.42** (≈ √2) for ellipses
- **2.0** for diamonds

## Layout Discipline

Poor layout is the main failure mode. Stick to these rules:

- **Work on a grid**. Place shapes at column/row intersections with consistent spacing (e.g. columns at x = 80, 340, 600, 860; rows at y = 80, 220, 360, 500).
- **Minimum gap between any two shapes: 60px** (measured edge-to-edge, not centre-to-centre). Less than that and the rendered image looks cramped.
- **Never place two shapes in overlapping bounding boxes**. Compute each shape's rectangle `[x, y, x+width, y+height]` and verify no two rectangles intersect.
- **Arrow labels need space**. A label on an arrow is rendered as a small text block near the arrow's midpoint. If there's a shape near the midpoint, the label will sit on top of it. Either lengthen the arrow or move the label text into the source/target shape instead.
- **Grouped regions**: if using a large transparent rectangle to visually group elements, make sure its bounds fully contain the group and don't clip other unrelated shapes.

## Constraints

- Output MUST be a valid `.excalidraw` file that opens in https://excalidraw.com or the VS Code extension.
- Use simple shapes: rectangles for services/modules, diamonds for decisions, ellipses for data stores, arrows for relationships.
- Every shape MUST have a bound text label.
- Keep diagrams readable: max ~15 elements, font size >= 16.
- Use colour sparingly to group related elements (pick from the default palette below).
- Arrow labels should describe the relationship (e.g. "calls", "reads from", "publishes to"). Keep them short (<= 15 chars) — long labels are a strong signal to restructure instead.

## Default Colour Palette

Use these for `backgroundColor` when grouping:
- `#a5d8ff` -- blue (primary / entry points)
- `#b2f2bb` -- green (success / data stores)
- `#ffec99` -- yellow (warnings / decision points)
- `#ffc9c9` -- red (errors / external services)
- `#d0bfff` -- purple (shared / libraries)
- `"transparent"` -- default / unimportant

## Common Pitfalls

Before finalizing the diagram, walk through this list mentally:

| Pitfall | Fix |
|---|---|
| Text wider than its container | Apply the sizing formula; bump char_width to 0.7 for ALL CAPS |
| Ellipse/diamond text clipped | Apply the 1.42x (ellipse) or 2.0x (diamond) multiplier |
| Shapes overlap | Verify bounding boxes with the 60px gap rule |
| Arrow label lands on another shape | Move the label into a source/target shape, or lengthen the arrow |
| Straight arrow crosses an unrelated shape | Use `elbowed: true` or re-route |
| Hand-drawn font instead of clean | `fontFamily` must be `2` on every text element |

## Updating the Format Spec

The format spec in `excalidraw_format.md` is a local snapshot. If diagrams fail to load, fetch the latest types from these URLs:
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/element/src/types.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/common/src/constants.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/data/types.ts`
