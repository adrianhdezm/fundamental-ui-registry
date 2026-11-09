/**
 * Visual cases for scripts/visual.mjs, one file per component in scripts/visual/<name>.mjs whose default export
 * is an array of cases. A case pairs an element of one of our stories (`ours`) with the matching element of a
 * fundamental-styles story (`ref`), compared in all 16 combinations of theme, density and direction. Start the
 * file with `const FS = 'sap-design-components-';` for the reference story ids.
 *
 *   label     name in the report
 *   ours      { story: Storybook story id, selector: Playwright selector of the element }
 *             (`overlay: true` looks for it in the whole page: popovers and dialogs render in an overlay outside
 *             the story root; use it with an "Open: …" story, whose `play` opens the overlay: the capture waits up to
 *             15s for the element to be visible)
 *             (`within`: a selector of an ancestor of the element, set on both sides; the element's distances from
 *             the ancestor's inline start and end and its top are compared too, as `offset-start`, `offset-end` and
 *             `offset-top`: where it sits in it, e.g. an action floated to the end of its item)
 *   ref       the same for https://sap.github.io/fundamental-styles/
 *   viewport  { width, height } of both pages (default 1280 x 800), for layouts that change with the window width
 *   hover     hover the element before capturing
 *   active    press the mouse button on the element (hovered, :active) while capturing
 *   focus     focus our element with the keyboard (:focus-visible); fundamental-styles' stories usually show focus
 *             with an `is-focus` class, so pick that element as `ref`, or set `refFocus` to focus it too
 *   pixels    false: compare computed styles only (e.g. when the texts differ)
 *   props     extra computed style properties to compare (e.g. margins)
 *   ignore    computed style properties (or "width") not to compare, with the reason in a comment
 */
import { readdirSync } from 'node:fs';

const dir = new URL('./visual/', import.meta.url);

export const CASES = Object.fromEntries(
    await Promise.all(
        readdirSync(dir)
            .filter((file) => file.endsWith('.mjs'))
            .sort()
            .map(async (file) => [file.slice(0, -'.mjs'.length), (await import(new URL(file, dir))).default])
    )
);
