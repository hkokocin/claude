# Excalidraw JSON Format Specification

> Snapshot taken from the [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) repository.
> Canonical source: TypeScript types in `packages/element/src/types.ts` and `packages/excalidraw/data/types.ts`.

## Top-Level File Structure (`.excalidraw`)

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "gridSize": 20,
    "gridStep": 5,
    "gridModeEnabled": false,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

Only these 4 `appState` properties survive export. Everything else is stripped.

## Base Element Properties

Every element has these properties:

```jsonc
{
  "id": "unique-string",           // random unique ID (use 8+ chars)
  "type": "rectangle",             // element type discriminator
  "x": 0,                          // x position (canvas coords)
  "y": 0,                          // y position
  "width": 200,                    // width in pixels
  "height": 100,                   // height in pixels
  "strokeColor": "#1e1e1e",        // border colour
  "backgroundColor": "transparent",// fill colour
  "fillStyle": "solid",            // "hachure" | "cross-hatch" | "solid" | "zigzag"
  "strokeWidth": 2,                // 1 (thin) | 2 (bold) | 4 (extraBold)
  "strokeStyle": "solid",          // "solid" | "dashed" | "dotted"
  "roughness": 1,                  // 0 (architect) | 1 (artist) | 2 (cartoonist)
  "opacity": 100,                  // 0-100
  "angle": 0,                      // rotation in radians
  "seed": 12345,                   // random int for roughjs rendering
  "version": 1,                    // increment on each change
  "versionNonce": 67890,           // random int for conflict resolution
  "index": "a0",                   // fractional index for z-ordering
  "isDeleted": false,
  "groupIds": [],                  // array of group ID strings
  "frameId": null,                 // ID of containing frame, or null
  "boundElements": null,           // array of { "id": "...", "type": "arrow"|"text" } or null
  "updated": 1700000000000,        // timestamp ms
  "link": null,                    // hyperlink string or null
  "locked": false,
  "roundness": { "type": 3 }       // null | { "type": 1|2|3, "value"?: number }
}
```

### Roundness Types
- `1` -- LEGACY proportional radius
- `2` -- PROPORTIONAL_RADIUS (rectangles, diamonds, ellipses)
- `3` -- ADAPTIVE_RADIUS (lines, arrows)

## Element Types

### `"rectangle"`, `"ellipse"`, `"diamond"`

No additional properties beyond base. Use `roundness: { "type": 2 }` for these.

### `"text"`

```jsonc
{
  // ...base properties...
  "type": "text",
  "fontSize": 20,                   // default 20
  "fontFamily": 5,                  // see Font Family IDs below
  "text": "Hello",                  // rendered text (with line breaks)
  "originalText": "Hello",          // original text before wrapping
  "textAlign": "center",            // "left" | "center" | "right"
  "verticalAlign": "middle",        // "top" | "middle" | "bottom"
  "containerId": null,              // ID of container shape, or null
  "autoResize": true,
  "lineHeight": 1.25               // unitless line height multiplier
}
```

**Bound text**: Set `containerId` to the parent shape's ID. The parent's `boundElements` must include `{ "id": "<text-id>", "type": "text" }`. When bound, set `textAlign: "center"` and `verticalAlign: "middle"`.

### `"arrow"`

```jsonc
{
  // ...base properties...
  "type": "arrow",
  "points": [[0, 0], [200, 0]],    // [x, y] pairs relative to element origin
  "startBinding": null,             // FixedPointBinding or null
  "endBinding": null,               // FixedPointBinding or null
  "startArrowhead": null,           // Arrowhead or null
  "endArrowhead": "arrow",         // Arrowhead or null
  "elbowed": false,                 // true for right-angle routing
  "roundness": { "type": 2 }
}
```

### `"line"`

Same as arrow but `type: "line"`. Has additional `polygon: false` (set `true` to close the shape).

### `"freedraw"`

```jsonc
{
  "type": "freedraw",
  "points": [[0, 0], [10, 5], ...],
  "pressures": [0.5, 0.7, ...],
  "simulatePressure": true
}
```

### `"image"`

```jsonc
{
  "type": "image",
  "fileId": "file-id-string",       // key in top-level "files" object
  "status": "saved",                // "pending" | "saved" | "error"
  "scale": [1, 1],
  "crop": null
}
```

### `"frame"` / `"magicframe"`

```jsonc
{
  "type": "frame",
  "name": "Frame Name"              // string or null
}
```

## Binding System

### Arrow-to-Shape Binding (`FixedPointBinding`)

```jsonc
{
  "elementId": "target-shape-id",
  "fixedPoint": [0.5, 0.5],        // normalised [0-1, 0-1] on target
  "mode": "inside"                  // "inside" | "orbit" | "skip"
}
```

Set this on the arrow's `startBinding` / `endBinding`. The target shape's `boundElements` must include `{ "id": "<arrow-id>", "type": "arrow" }`.

### Fixed Point Reference

The `fixedPoint` is normalised to the target element's bounding box:
- `[0, 0]` = top-left corner
- `[0.5, 0]` = top centre
- `[1, 0.5]` = right centre
- `[0.5, 1]` = bottom centre
- `[0, 0.5]` = left centre
- `[0.5, 0.5]` = centre

## Arrowhead Values

`"arrow"` | `"bar"` | `"circle"` | `"circle_outline"` | `"triangle"` | `"triangle_outline"` | `"diamond"` | `"diamond_outline"`

ER diagram cardinality: `"cardinality_one"` | `"cardinality_many"` | `"cardinality_one_or_many"` | `"cardinality_exactly_one"` | `"cardinality_zero_or_one"` | `"cardinality_zero_or_many"`

## Font Family IDs

| ID | Name |
|----|------|
| 1 | Virgil |
| 2 | Helvetica |
| 3 | Cascadia |
| 5 | Excalifont (default) |
| 6 | Nunito |
| 7 | Lilita One |
| 8 | Comic Shanns |
| 9 | Liberation Sans |

## Colour Defaults

- `strokeColor`: `"#1e1e1e"` (black)
- `backgroundColor`: `"transparent"`

## Generating Valid IDs

Use random alphanumeric strings, 8+ characters. Example: `"abc12def"`. Each element ID must be unique within the file. The `seed` and `versionNonce` fields should be random positive integers.

## Generating Valid `index` Values

The `index` field controls z-ordering. Use fractional indexing strings like `"a0"`, `"a1"`, `"a2"`, etc. for sequential elements. Elements are rendered in `index` order (lexicographic).

## Minimal Working Example

A rectangle with bound text and an arrow pointing to an ellipse:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "rect1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#a5d8ff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 1234,
      "version": 1,
      "versionNonce": 5678,
      "index": "a0",
      "isDeleted": false,
      "groupIds": [],
      "frameId": null,
      "boundElements": [
        { "id": "text1", "type": "text" },
        { "id": "arrow1", "type": "arrow" }
      ],
      "updated": 1700000000000,
      "link": null,
      "locked": false,
      "roundness": { "type": 3 }
    },
    {
      "id": "text1",
      "type": "text",
      "x": 150,
      "y": 130,
      "width": 100,
      "height": 25,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 2345,
      "version": 1,
      "versionNonce": 6789,
      "index": "a1",
      "isDeleted": false,
      "groupIds": [],
      "frameId": null,
      "boundElements": null,
      "updated": 1700000000000,
      "link": null,
      "locked": false,
      "roundness": null,
      "fontSize": 20,
      "fontFamily": 5,
      "text": "Service A",
      "originalText": "Service A",
      "textAlign": "center",
      "verticalAlign": "middle",
      "containerId": "rect1",
      "autoResize": true,
      "lineHeight": 1.25
    },
    {
      "id": "arrow1",
      "type": "arrow",
      "x": 300,
      "y": 150,
      "width": 100,
      "height": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 3456,
      "version": 1,
      "versionNonce": 7890,
      "index": "a2",
      "isDeleted": false,
      "groupIds": [],
      "frameId": null,
      "boundElements": null,
      "updated": 1700000000000,
      "link": null,
      "locked": false,
      "roundness": { "type": 2 },
      "points": [[0, 0], [100, 0]],
      "startBinding": {
        "elementId": "rect1",
        "fixedPoint": [1, 0.5],
        "mode": "inside"
      },
      "endBinding": {
        "elementId": "ellipse1",
        "fixedPoint": [0, 0.5],
        "mode": "inside"
      },
      "startArrowhead": null,
      "endArrowhead": "arrow",
      "elbowed": false
    },
    {
      "id": "ellipse1",
      "type": "ellipse",
      "x": 450,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#b2f2bb",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 4567,
      "version": 1,
      "versionNonce": 8901,
      "index": "a3",
      "isDeleted": false,
      "groupIds": [],
      "frameId": null,
      "boundElements": [
        { "id": "text2", "type": "text" },
        { "id": "arrow1", "type": "arrow" }
      ],
      "updated": 1700000000000,
      "link": null,
      "locked": false,
      "roundness": { "type": 2 }
    },
    {
      "id": "text2",
      "type": "text",
      "x": 500,
      "y": 130,
      "width": 100,
      "height": 25,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 5678,
      "version": 1,
      "versionNonce": 9012,
      "index": "a4",
      "isDeleted": false,
      "groupIds": [],
      "frameId": null,
      "boundElements": null,
      "updated": 1700000000000,
      "link": null,
      "locked": false,
      "roundness": null,
      "fontSize": 20,
      "fontFamily": 5,
      "text": "Database",
      "originalText": "Database",
      "textAlign": "center",
      "verticalAlign": "middle",
      "containerId": "ellipse1",
      "autoResize": true,
      "lineHeight": 1.25
    }
  ],
  "appState": {
    "gridSize": 20,
    "gridStep": 5,
    "gridModeEnabled": false,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```
