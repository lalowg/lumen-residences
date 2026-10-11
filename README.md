# LUMEN RESIDENCES — Modern Living, Elevated

A property site that sells homes by their light. The first viewport is a working **light study**: an architectural floor plan with the day's sunlight drawn into each room, paired with a CSS 3D model of the selected room. Drag the hour and the sun sweeps across the plan and climbs the walls of the model.

Production URL: `https://lumen-residences-three.vercel.app`

> Fictional concept brand, built as a portfolio project. LUMEN RESIDENCES, Lantern Quay, every listing, price and light study are illustrative.

---

## Concept

Most property sites lead with a photo carousel and a price. LUMEN leads with the one thing a photo cannot show: **where the sun falls, and when**. Every residence is described by its plan, its orientation and the hours its rooms receive direct sun. The same geometry drives the plan, the 3D room, the listing facts ("living-room sun 06:45–15:45") and the viewing form, which suggests visiting at the hour each living room is brightest.

## Brand & positioning

- **Name:** lumen is the unit of light. The building, Lantern Quay, is a fictional twelve-storey residential block on a harbour.
- **Promise:** "Modern living, elevated" means homes designed around daylight, quiet materials and generous ceilings rather than amenity lists.
- **Tone:** calm, exact, architectural. Short declaratives, real dimensions, no superlatives.
- **Conversion:** a private-viewing request, timed to "the brightest hour". It is a demo form, and nothing is sent.

## Audience

Design-literate buyers (35–65) moving from period homes or houses into a first apartment, who care about orientation, ceiling height and materials, and who are tired of listings that hide the floor plan.

## Art direction

- **Palette:** concrete `#D9D6D0`, glass `#A9BCC4`, light `#F2C879`, black `#141414`. Derived tones: paper `#EFEDE9` for drawing sheets, glass-ink `#4F6872` for accent text, and a warm patch tone `#FBE3A8` for sunlight on plans.
- **Composition:** large plates on a concrete ground. The plan sits on a paper sheet with a 0.5 m grid, dimension lines, door swings and glazing. The room model sits on a black plate beside it. Sections alternate light and dark: concrete hero, concrete index, a deeper concrete gallery, a light material spread, a black building section and a black footer.
- **Imagery:** no photography. The gallery plates are one-point perspective interiors generated as SVG. Sunlight is projected pane by pane onto floors and walls, with light beams, mullion shadows and furniture shadows from the same sun direction, plus film grain and vignette. Material swatches are CSS and SVG-noise textures.
- **Logo:** an original mark (a square plan with an opening in its top wall and a parallelogram of light falling through it) with a geometric LUMEN wordmark built from strokes. `favicon.svg` is the mark on a black tile.

## Typography

- **Marcellus** (400) for display: headlines, section titles and the footer line.
- **Hind** (300/400/500/600) for everything functional: room names, plan labels, areas, times, prices, listing numbers, form fields and controls. Numbers use tabular figures. Following QA guidance, no functional label is set in the display face.
- Headlines use `text-wrap: balance` and `overflow-wrap: normal`, so words never break mid-word.

## Motion language

Light moves; nothing else needs to.

- **The opening sweep:** on load the hour runs from early morning to 09:30, so the first thing you see is sunlight crossing the plan.
- **Room transitions:** changing room sends a band of warm light across the model while the room is rebuilt underneath it.
- **Light-sweep reveals:** headings are revealed by a mask that travels left to right like a patch of sun, while their letter-spacing settles.
- **Rays:** dashed sun rays drift across the paper outside the building, always parallel to the current light.
- **Gallery plates:** each plate's sun turns into place as it enters the viewport and follows the pointer by a few degrees.
- Easing is a symmetrical in-out (`cubic-bezier(.65,0,.35,1)`), like a slow pan.

## Signature interaction: how to use it

1. **Choose a residence** with The Atelier / The Courtyard / The Meridian, or press **Study the light** on any listing in the index. Each listing has its own orientation, so the same plan type behaves differently.
2. **Drag the hour** on the time slider (06:00–20:00), or press **Play the day**. Sun patches are computed from each window's position and the sun's bearing and height, clipped to the room. The compass dial shows north and the sun's position relative to the plan.
3. **Choose a room** by clicking it on the plan, by tabbing to its label, or with the ← → buttons. The CSS 3D model rebuilds that room at true proportions with its windows, furniture and the same sunlight on the floor. Light that overshoots the floor glows on the wall it reaches.
4. **Turn the model** by dragging, with the ↺ ↻ buttons, or with the left and right arrow keys when it has focus (Page Up and Page Down change room).
5. The panel lists the room's area, ceiling height, glazing orientation, the share of floor in sun now, and a daylight curve for the whole day.

The light study is illustrative: a clear equinox day with sunrise due east at 06:00, solar noon due south at 13:00 and sunset due west at 20:00. It is not a daylight analysis.

## Sections

1. **Light study** (signature)
2. **Released residences**: an index of eight fictional listings with plan thumbnails turned to true north, filters (bedrooms, facade direction, level, show reserved), sorting, and sun hours computed from the light study.
3. **A day in five rooms**: a horizontal track of generated interior plates from 07:40 to 18:50, with a "Turn the sun" slider.
4. **Materials**: six materials as tactile swatches, with a light sweep on selection.
5. **The building, in section**: a sticky section drawing whose levels light up as you read, with a winter / summer sun toggle.
6. **Private viewing**: an inquiry form with inline validation that suggests the brightest hour for the chosen residence.

## Tech

- Static HTML, CSS and ES modules. No build step, no frameworks, no external images.
- `plan.js`: plan data, listings, sun model, polygon clipping and plan SVG drawing.
- `roomview.js`: the CSS 3D "dollhouse" model (preserve-3d faces with hidden backfaces, so the wall nearest you disappears as you turn).
- `interiors.js`: perspective interior generator with per-pane sun projection, beams and shadows.
- `main.js`: page orchestration, listings, gallery, materials, building section, form and reveals.
- Fonts: Google Fonts (Marcellus, Hind) with `display=swap`.

## Local development

```bash
npx serve .
```

Then open the printed local URL. Modules need to be served over HTTP, not opened from the file system.

## Accessibility

- One `<h1>`, landmarks, skip link and visible `:focus-visible` styles throughout.
- Every pointer interaction has a keyboard equivalent: plan rooms are focusable buttons, the model turns with the arrow keys or buttons, and the time slider is a native range input with a spoken `aria-valuetext` ("15:30. Sun in the south-west, 44° high.").
- Room details are announced through a polite live region. Filters are native radio groups and checkboxes.
- Form errors are inline, linked with `aria-describedby`, and focus moves to the first invalid field.
- `prefers-reduced-motion: reduce` skips the opening sweep, room transitions, reveals and drifting rays. Every interaction still works.

## Performance

- No WebGL and no images: the whole site is SVG, CSS and around 70 KB of hand-written JavaScript.
- Plan light is recomputed only when the hour, room or residence changes; play mode runs on `requestAnimationFrame` and stops when the tab is hidden.
- Gallery plates render once; only their light layer is redrawn when the sun turns.

## Known limitations

- The sun model is a simplified equinox day and ignores neighbouring buildings, balconies and reflections.
- Light through interior doors and between rooms is not modelled.
- Very old browsers without `preserve-3d` show the room model flat; the plan and all data remain usable.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
