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

## Constraints

- Output MUST be a valid `.excalidraw` file that opens in https://excalidraw.com or the VS Code extension.
- Use simple shapes: rectangles for services/modules, diamonds for decisions, ellipses for data stores, arrows for relationships.
- Every shape MUST have a bound text label.
- Keep diagrams readable: max ~15 elements, font size >= 16, adequate spacing (>= 40px gap).
- Use the hand-drawn style defaults (roughness: 1, fontFamily: 5).
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

## Updating the Format Spec

The format spec in `excalidraw_format.md` is a local snapshot. If diagrams fail to load, fetch the latest types from these URLs:
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/element/src/types.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/common/src/constants.ts`
- `https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/data/types.ts`
