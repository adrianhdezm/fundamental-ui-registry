/**
 * Visual cases for scripts/visual.mjs, one file per component in scripts/visual/<name>.mjs whose default export
 * is an array of cases. A case pairs an element of one of our stories (`ours`) with the matching element of a
 * fundamental-styles story (`ref`), compared in all 16 combinations of theme, density and direction. Start the
 * file with `const FS = 'sap-design-components-';` for the reference story ids.
 *
 *   label     name in the report
 *   ours      { story: Storybook story id, selector: Playwright selector of the element, overlay: true to look
 *             for it in the CDK overlay container (an open popover or dialog) instead of the story }
 *   ref       the same for https://sap.github.io/fundamental-styles/
 *   hover     hover the element before capturing
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
