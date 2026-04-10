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
5. **Render & verify** -- Render the diagram to PNG and visually verify it. See the Rendering section below.
6. **Report** -- Print the file path and a one-line summary of what was diagrammed.

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

### Simulated padding for left-aligned text

Excalidraw has only 5px built-in padding (`BOUND_TEXT_PADDING`). To give left-aligned text comfortable breathing room, apply these sizing rules:

- **Shape width** = text width + 60px (30px padding each side)
- **Shape height** = text height + 40px (20px padding top/bottom)
- For multi-line text, calculate height from `lines * fontSize * lineHeight + 40`

This oversizes the container relative to the text, creating visual padding since Excalidraw centres text within the available space after its 5px inset.

## Constraints

- Output MUST be a valid `.excalidraw` file that opens in https://excalidraw.com or the VS Code extension.
- Use simple shapes: rectangles for services/modules, diamonds for decisions, ellipses for data stores, arrows for relationships.
- Every shape MUST have a bound text label.
- Keep diagrams readable: max ~15 elements, font size >= 16, adequate spacing (>= 40px gap).
- Use colour sparingly to group related elements (pick from the default palette below).
- Arrow labels should describe the relationship (e.g. "calls", "reads from", "publishes to").

## Default Colour Palette

Use these for `backgroundColor` when grouping:
- `#a5d8ff` -- blue (primary / entry points)
- `#b2f2bb` -- green (success / data stores)
- `#ffec99` -- yellow (warnings / decision points)
- `#ffc9c9` -- red (errors / external services)
- `#d0bfff` -- purple (shared / libraries)
- `"transparent"` -- default / unimportant

## Rendering

Render the diagram to PNG for visual verification via a two-step pipeline:

1. Kroki (localhost:8000) converts `.excalidraw` -> SVG (exact, uses excalidraw's own renderer)
2. `resvg` converts SVG -> PNG (fast, no font issues)

```bash
curl -sf -X POST http://localhost:8000/excalidraw/svg \
  -H "Content-Type: text/plain" \
  --data-binary @diagram.excalidraw \
  -o diagram.svg \
  && resvg diagram.svg diagram.png
```

**Important**: Use `Content-Type: text/plain` with `--data-binary`. Kroki's excalidraw plugin supports **only SVG output**, not PNG (that's why we need `resvg`).

After rendering:
1. Read the PNG with the Read tool to inspect the result.
2. Check: Are shapes visible? Is text readable and not overlapping? Is spacing adequate? Do containers fit their text?
3. If something is off, fix the `.excalidraw` JSON, re-render, and re-check.
4. Repeat until the diagram looks correct.

### Prerequisites

- `resvg` must be installed (`brew install resvg`).
- Kroki must be running on localhost:8000. If `curl` fails, warn the user and skip rendering. To start Kroki:

  ```bash
  docker network create kroki-net 2>/dev/null
  docker run -d --name kroki-excalidraw --network kroki-net yuzutech/kroki-excalidraw
  docker run -d --name kroki --network kroki-net -p 8000:8000 -e KROKI_EXCALIDRAW_HOST=kroki-excalidraw yuzutech/kroki
  ```

  If the containers already exist but are stopped, just `docker start kroki kroki-excalidraw`.

## Updating the Format Spec

The format spec in `excalidraw_format.md` is a local snapshot. If diagrams fail to load, fetch the latest types from these URLs:
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/element/src/types.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/common/src/constants.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/data/types.ts`
