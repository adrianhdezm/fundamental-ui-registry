## skeleton

Sources: fundamental-react: none · Angular [`registry/ui/skeleton`](../../../angular/registry/ui/skeleton/) ·
fundamental-styles [Skeleton](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-skeleton--docs)
Registry: `registry/ui/skeleton/`, on Base UI's `useRender`.

API: the Angular inputs as props: `type` (`rectangle`, `circle`, `text`, or none to draw your own shapes), `animated`
(default `true`), `textLines` (default 3), `width` and `height`. Angular's projected `<svg:rect>`/`<svg:circle>` shapes
are `children`: React creates them in the SVG namespace because they render inside the `<svg>`'s `<mask>`. The root is
a `<div>` (fundamental-styles' element; `render` changes it), native props, `className`, `style` and `ref` pass
through. The SVG is `aria-hidden`, as in Angular; the loading region itself carries `aria-busy`. The mask and gradient
ids come from `useId`, stripped of characters that are not valid in a `url(#…)` reference.

Behaviour as Angular: a `circle` with only a width or a height is square; `text` fills its container without a
width and is as high as its lines (20px per line, 8px for one line); the last of several lines is 60% wide;
`textLines` 0 draws nothing but keeps one line's height. The shimmer is the SMIL offset animation plus the
`animate-sap-shimmer` stop colour, both off with `animated={false}` or `prefers-reduced-motion` (solid
`--sapContent_Placeholderloading_Background` fill).

**Differences from Angular, on purpose:** `width` and `height` also take numbers (px), as React's `style` does.
`textLines` is a number: Angular's string attribute coercion has no React equivalent.

The shapes are not mirrored in RTL (SVG coordinates), as in fundamental-styles and Angular.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                                                                                    | Cause                                                                                                                                                                                                                                                                                                       | Resolution                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every case in HC Black and HC White (56), rectangles in Horizon Dark (6–8): fundamental-styles' skeleton is darker (Dark, HC Black) or lighter (HC White) than the theme's placeholder colour | fundamental-styles' mask shapes inherit the canvas fill (the gradient), so its luminance mask is partly transparent and the skeleton blends with the page background (e.g. `#c0c0c0` instead of `#888` on HC White's white page). With an opaque mask (`fill: white`, as Angular and ours) it draws `#888`. | Kept: fundamental-styles is wrong; ours draws `--sapContent_Placeholderloading_Background` of each theme. Horizon passes only because its page is close to white. |
| Shimmer middle colour `#999` in every theme in fundamental-styles                                                                                                                             | fundamental-styles hard-codes `--fdSkeletonGradientMiddleColor: #999`; we use the middle stop of each theme's `--sapContent_Placeholderloading_Gradient` (`--fdSkeleton_Gradient_Middle_Color`, already in `extensions.css`: `#74879f` Dark, `#585858` HC White)                                            | Kept: the theme gradient is the Fiori value. Not part of the comparison (animations stopped).                                                                     |
