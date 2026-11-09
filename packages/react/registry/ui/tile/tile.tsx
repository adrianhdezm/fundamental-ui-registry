/*
 * Port of fundamental-react (Tile) and @fundamental-ngx/core (tile) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    isValidElement,
    useContext,
    useId,
    type ComponentProps,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { iconGlyphChar, iconVariants, type IconFont } from '@/ui/icon/icon';

export type TileType = 'kpi' | 'launch' | 'feed' | 'slide' | 'line';
export type TileSize = 's';

/** What the parts of a tile read from it (Angular injects the parent `Tile`). */
export interface TileContextValue {
    small: boolean;
    line: boolean;
    type: TileType | null;
    action: boolean;
}

const TileContext = createContext<TileContextValue | null>(null);

/** The tile a part is in, or null outside a tile. */
export function useTile(): TileContextValue | null {
    return useContext(TileContext);
}

/** Whether the tiles are in a list container. */
const TileContainerContext = createContext(false);

/** The part (header, header-content, content, footer) a title or section is in. */
type TilePart = 'header' | 'header-content' | 'content' | 'footer';
const TilePartContext = createContext<TilePart | null>(null);

/** Box of a glyph rendered from the data-glyph attribute. */
const GLYPH = iconVariants();

const isTyped = (type: TileType | null | undefined) => type === 'kpi' || type === 'launch' || type === 'feed';

export interface TileContainerProps extends useRender.ComponentProps<'div'> {
    /** Line tiles stack vertically instead of floating in rows. */
    list?: boolean;
}

/** Container of tiles; with `list`, line tiles stack vertically. */
export function TileContainer({ list = false, render, className, children, ...props }: TileContainerProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex w-full flex-wrap rounded-sap-element-border-corner-radius border border-sap-tile-border-color bg-sap-tile-background p-2 font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color [box-shadow:var(--sapContent_Shadow0)]',
                list && 'flex-col bg-sap-group-content-background',
                className
            ),
            children: <TileContainerContext value={list}>{children}</TileContainerContext>
        }
    });
}

export interface TileProps extends useRender.ComponentProps<'div'> {
    /** `s` for the small tile (screens up to 374px). */
    size?: TileSize | null;
    /** Double width (2×1); fundamental-react's `isDouble`. */
    double?: boolean;
    /** Tile type: launch, KPI, feed, slide or line (link). */
    type?: TileType | null;
    /** Action (edit) mode: shows the close and action indicator buttons and hides the footer and badge. */
    action?: boolean;
    /** Focusable with role button; `onTileClick` fires on click, Enter and Space. */
    clickable?: boolean;
    /** Not interactive (`aria-disabled`); line tiles are also dimmed. */
    disabled?: boolean;
    /**
     * Fires when a clickable tile or a link tile is activated: click, Enter and Space (Enter only on links, as their
     * native click). Not when disabled, and not for keys pressed on an element inside the tile.
     */
    onTileClick?: () => void;
}

/**
 * Tile: a fixed-size launch, KPI, feed or slide tile, or a line (link) tile.
 *
 * ```tsx
 * <Tile type="launch" clickable aria-label="Sales" onTileClick={open}>
 *     <TileHeader><TileTitle>Sales</TileTitle></TileHeader>
 *     <TileContent>...</TileContent>
 *     <TileFooter><TileFooterText>Now</TileFooterText></TileFooter>
 * </Tile>
 * ```
 *
 * Pass `render={<a href="..." />}` for a tile that navigates; it keeps the link semantics.
 */
export function Tile({
    size,
    double = false,
    type,
    action = false,
    clickable = false,
    disabled = false,
    onTileClick,
    render,
    className,
    children,
    role,
    tabIndex,
    onClick,
    onKeyDown,
    onKeyUp,
    ...props
}: TileProps) {
    const inList = useContext(TileContainerContext);
    const isLink = isValidElement(render) && render.type === 'a';
    const small = size === 's';
    const line = type === 'line';
    const interactive = (link: boolean) => (link || clickable) && !disabled;

    /** Keys on the tile itself (not on an inner button) activate a clickable tile; links handle Enter natively. */
    const activate = (event: KeyboardEvent<HTMLDivElement>) => {
        if (isLink || !clickable || disabled || event.target !== event.currentTarget) return;
        event.preventDefault();
        onTileClick?.();
    };

    const classes = line
        ? cn(
              'relative m-0 my-1 me-2 box-border flex h-full max-h-(--tile-lh) min-h-(--tile-lh) w-auto max-w-full min-w-8 cursor-pointer items-center justify-between gap-2 px-2 py-0 last:me-0',
              '[--tile-lh:2rem] [--tile-lmh:3.25rem] [--tile-lnh:1.625rem] [--tile-ts:0.625rem] compact:[--tile-lh:1.625rem] compact:[--tile-lmh:2.875rem] compact:[--tile-lnh:1.4375rem] compact:[--tile-ts:0.5rem]',
              'rounded-sap-tile-border-corner-radius border border-sap-tile-border-color bg-sap-tile-background font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color no-underline [box-shadow:var(--sapContent_Shadow0)]',
              'hover:bg-sap-tile-hover-background hover:[box-shadow:var(--sapContent_Shadow2)] hc:hover:[box-shadow:0_0_0_0.125rem_var(--sapTile_BorderColor)] active:bg-sap-tile-active-background',
              'outline-none focus-visible:z-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sap-content-focus-color focus-visible:outline-solid',
              disabled && 'pointer-events-none bg-transparent opacity-50',
              action && 'pe-0',
              inList && 'mx-0 max-h-(--tile-lmh) flex-wrap',
              className
          )
        : cn(
              'group/tile relative m-0 box-border block cursor-pointer p-[0.9375rem] font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color no-underline',
              'rounded-sap-element-border-corner-radius border border-sap-tile-border-color bg-sap-tile-background [box-shadow:var(--sapContent_Shadow0)]',
              'hover:bg-sap-tile-hover-background hover:[box-shadow:var(--sapContent_Shadow2)] hc:hover:[box-shadow:0_0_0_0.125rem_var(--sapTile_BorderColor)]',
              'active:border-sap-tile-interactive-border-color active:bg-sap-tile-active-background active:[box-shadow:none]',
              'outline-none focus-visible:outline-sap focus-visible:-outline-offset-[0.1875rem]',
              small ? 'h-37 max-h-37 min-h-37 p-[0.4375rem]' : 'h-44 max-h-44 min-h-44',
              double
                  ? small
                      ? 'w-76 max-w-76 min-w-76'
                      : 'w-90 max-w-90 min-w-90'
                  : small
                    ? 'w-37 max-w-37 min-w-37'
                    : 'w-44 max-w-44 min-w-44',
              type === 'slide' && 'flex items-end p-0',
              className
          );

    const element = useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            role: isLink ? role : (role ?? (clickable ? 'button' : undefined)),
            tabIndex: tabIndex ?? (isLink ? undefined : clickable && !disabled ? 0 : undefined),
            'aria-disabled': disabled || props['aria-disabled'] || undefined,
            className: classes,
            onClick: (event: MouseEvent<HTMLDivElement>) => {
                onClick?.(event);
                if (interactive(isLink || event.currentTarget.tagName === 'A')) onTileClick?.();
            },
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (event.key === 'Enter') activate(event);
                // Space activates on keyup; keydown only stops the page from scrolling
                else if (event.key === ' ' && event.target === event.currentTarget) event.preventDefault();
            },
            onKeyUp: (event: KeyboardEvent<HTMLDivElement>) => {
                onKeyUp?.(event);
                if (event.key === ' ') activate(event);
            },
            children: (
                <TilePartContext value={null}>
                    {action && !line && (
                        <div className="absolute inset-0 z-4 m-0 size-full rounded-sap-element-border-corner-radius bg-sap-tile-background p-0 opacity-70" />
                    )}
                    {children}
                </TilePartContext>
            )
        }
    });
    return <TileContext value={{ small, line, type: type ?? null, action }}>{element}</TileContext>;
}

export interface TileHeaderProps extends Omit<useRender.ComponentProps<'div'>, 'title'> {
    /** Splits the header into two `TileSection`s spread to both ends. */
    twoColumn?: boolean;
    /** Title, rendered as a `TileTitle` before the children (fundamental-react's children of `Tile.Header`). */
    title?: ReactNode;
    /** Subtitle, rendered as a `TileSubtitle` after the title (fundamental-react's `subtitle`). */
    subtitle?: ReactNode;
    /** Props of the `title`'s `TileTitle` (fundamental-react's `titleProps`). */
    titleProps?: TileTitleProps;
    /** Props of the `subtitle`'s `TileSubtitle` (fundamental-react's `subtitleProps`). */
    subtitleProps?: TileSubtitleProps;
}

/** Header (title and subtitle) area. */
export function TileHeader({
    twoColumn = false,
    title,
    subtitle,
    titleProps,
    subtitleProps,
    render,
    className,
    children,
    ...props
}: TileHeaderProps) {
    const tile = useTile();
    const inList = useContext(TileContainerContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: tile?.line
                ? cn(
                      'm-0 box-border flex h-full max-h-full min-h-full items-center overflow-hidden p-0',
                      inList && 'flex-1 flex-wrap',
                      inList &&
                          tile.action &&
                          '[mask-image:linear-gradient(to_left,transparent,black_7%)] rtl:[mask-image:linear-gradient(to_right,transparent,black_7%)]',
                      className
                  )
                : cn(
                      'm-0 mb-1 box-border overflow-hidden p-0',
                      tile?.small ? 'h-13 max-h-13 min-h-13' : 'h-[3.625rem] max-h-[3.625rem] min-h-[3.625rem]',
                      twoColumn && 'flex justify-between',
                      className
                  ),
            children: (
                <TilePartContext value="header">
                    {title != null && title !== false && <TileTitle {...titleProps}>{title}</TileTitle>}
                    {subtitle != null && subtitle !== false && (
                        <TileSubtitle {...subtitleProps}>{subtitle}</TileSubtitle>
                    )}
                    {children}
                </TilePartContext>
            )
        }
    });
}

export interface TileHeaderContentProps extends useRender.ComponentProps<'div'> {
    twoColumn?: boolean;
}

/** Header and content combined, for a longer title (up to four lines). */
export function TileHeaderContent({
    twoColumn = false,
    render,
    className,
    children,
    ...props
}: TileHeaderContentProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 mb-1 box-border overflow-hidden p-0',
                tile?.small
                    ? 'h-[6.938rem] max-h-[6.938rem] min-h-[6.938rem]'
                    : 'h-[7.75rem] max-h-[7.75rem] min-h-[7.75rem]',
                twoColumn && 'flex justify-between',
                className
            ),
            children: <TilePartContext value="header-content">{children}</TilePartContext>
        }
    });
}

export type TileTitleContainerProps = useRender.ComponentProps<'div'>;

/** Groups a badge and the title of a line tile. */
export function TileTitleContainer({ render, className, ...props }: TileTitleContainerProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 box-border flex max-w-full items-center p-0', className) }
    });
}

export type TileTitleProps = useRender.ComponentProps<'div'>;

/** Title of a tile: two lines (four in a `TileHeaderContent`), one truncated line in line tiles. */
export function TileTitle({ render, className, ...props }: TileTitleProps) {
    const tile = useTile();
    const part = useContext(TilePartContext);
    const type = tile?.type;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border p-0 font-sap-font-family font-bold',
                type === 'line'
                    ? 'me-(--tile-ts) min-w-8 truncate text-sap-font-size leading-(--tile-lnh) text-sap-tile-title-text-color text-shadow-sap-content-text-shadow'
                    : type === 'slide'
                      ? cn(
                            'line-clamp-2 text-sap-tile-overlay-foreground-color',
                            tile?.small
                                ? 'text-sap-font-small-size leading-[normal]'
                                : 'text-sap-font-size leading-[normal]'
                        )
                      : cn(
                            'text-sap-font-header6-size leading-[normal] text-sap-tile-title-text-color',
                            part === 'header-content' ? 'line-clamp-4' : 'line-clamp-2'
                        ),
                className
            )
        }
    });
}

export type TileSubtitleProps = useRender.ComponentProps<'div'>;

/** Subtitle of a tile, one truncated line. */
export function TileSubtitle({ render, className, ...props }: TileSubtitleProps) {
    const tile = useTile();
    const type = tile?.type;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border truncate p-0 font-sap-font-family',
                type === 'line'
                    ? 'min-w-8 text-[0.875rem] leading-(--tile-lnh) text-sap-tile-text-color text-shadow-sap-content-text-shadow'
                    : type === 'slide'
                      ? cn(
                            'text-sap-tile-overlay-foreground-color',
                            tile?.small
                                ? 'text-sap-font-small-size leading-[normal]'
                                : 'text-sap-font-size leading-[normal]'
                        )
                      : 'text-sap-font-size leading-[normal] text-sap-tile-text-color',
                className
            )
        }
    });
}

export interface TileContentProps extends useRender.ComponentProps<'div'> {
    /** Splits the content into two `TileSection`s; fundamental-react's `twoColumns`. */
    twoColumn?: boolean;
}

/** Content area. */
export function TileContent({ twoColumn = false, render, className, children, ...props }: TileContentProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 mb-1 box-border overflow-hidden p-0',
                tile?.small
                    ? 'h-[3.438rem] max-h-[3.438rem] min-h-[3.438rem]'
                    : 'h-[3.875rem] max-h-[3.875rem] min-h-[3.875rem]',
                isTyped(tile?.type) && 'flex items-end',
                twoColumn && 'flex justify-between',
                className
            ),
            children: <TilePartContext value="content">{children}</TilePartContext>
        }
    });
}

export interface TileFooterProps extends useRender.ComponentProps<'div'> {
    /** Splits the footer into two `TileSection`s, the second aligned to the end. */
    twoColumn?: boolean;
}

/** Footer area; hidden in action mode. */
export function TileFooter({ twoColumn = false, render, className, children, ...props }: TileFooterProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex overflow-hidden p-0',
                tile?.small ? 'h-[1.063rem] max-h-[1.063rem] min-h-[1.063rem]' : 'h-4 max-h-4 min-h-4',
                isTyped(tile?.type) && 'items-center',
                twoColumn && 'justify-between',
                tile?.action && 'hidden',
                className
            ),
            children: <TilePartContext value="footer">{children}</TilePartContext>
        }
    });
}

export type TileSectionProps = useRender.ComponentProps<'div'>;

/** Half of a two-column header, content or footer. */
export function TileSection({ render, className, ...props }: TileSectionProps) {
    const tile = useTile();
    const part = useContext(TilePartContext);
    const type = tile?.type;
    const typed = isTyped(type);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border h-full w-[calc(50%_-_0.125rem)] overflow-hidden p-0',
                part === 'content' && typed && 'flex items-end',
                part === 'footer' && typed && 'flex items-center last:justify-end',
                part === 'content' &&
                    type === 'feed' &&
                    cn(
                        'w-auto first:me-1 first:max-w-full first:flex-1 first:flex-col first:items-start first:justify-end nth-2:ps-2',
                        tile?.small ? 'nth-2:max-w-33' : 'nth-2:max-w-[10.25rem]'
                    ),
                className
            )
        }
    });
}

export type TileContentTextProps = useRender.ComponentProps<'div'>;

/** Text of a feed tile, up to two lines. */
export function TileContentText({ render, className, ...props }: TileContentTextProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 line-clamp-2 max-h-[2.125rem] max-w-full p-0 text-sap-font-small-size leading-[1.063rem] text-sap-tile-title-text-color',
                className
            )
        }
    });
}

export type TileContentBylineProps = useRender.ComponentProps<'div'>;

/** Byline (e.g. a time stamp) of a feed tile. */
export function TileContentByline({ render, className, ...props }: TileContentBylineProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 max-w-full truncate p-0 text-sap-font-small-size leading-[1.063rem] text-sap-tile-text-color',
                className
            )
        }
    });
}

export type TileFooterTextProps = useRender.ComponentProps<'span'>;

/** Text of a tile footer. */
export function TileFooterText({ render, className, ...props }: TileFooterTextProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'm-0 box-border truncate p-0 font-sap-font-family',
                tile?.small ? 'text-sap-font-small-size leading-[normal]' : 'text-sap-font-size leading-[normal]',
                tile?.type === 'slide' ? 'text-sap-tile-overlay-foreground-color' : 'text-sap-tile-text-color',
                className
            )
        }
    });
}

export interface TileRefreshProps extends Omit<useRender.ComponentProps<'button'>, 'children'> {
    /** Glyph of the icon; default `refresh`. */
    glyph?: string;
    glyphFont?: IconFont;
}

/** Refresh button of a tile footer (a `<button>`, named "Refresh" by default). */
export function TileRefresh({
    glyph = 'refresh',
    glyphFont = 'SAP-icons',
    render,
    className,
    type = 'button',
    ...props
}: TileRefreshProps) {
    return useRender({
        render,
        defaultTagName: 'button',
        props: {
            ...props,
            'aria-label': props['aria-label'] ?? 'Refresh',
            type: render ? undefined : type,
            'data-glyph': iconGlyphChar(glyph, glyphFont) || undefined,
            className: cn(
                iconVariants({ font: glyphFont }),
                'me-2 min-w-[0.875rem] cursor-pointer border-0 bg-transparent p-0 text-center text-sap-font-size leading-[normal] text-sap-button-icon-color',
                'outline-none focus-visible:outline-sap',
                className
            )
        }
    });
}

export interface TileProfileImgProps extends useRender.ComponentProps<'span'> {
    /** URL of the image. */
    backgroundImage?: string | null;
}

/** Round profile image of a launch tile (`role="img"`; give it an `aria-label`). */
export function TileProfileImg({ backgroundImage, id, render, className, style, ...props }: TileProfileImgProps) {
    const tile = useTile();
    const autoId = `fd-tile-profile-img-${useId()}`;
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            role: 'img',
            ...props,
            id: id ?? autoId,
            style: backgroundImage ? { backgroundImage: `url("${backgroundImage}")`, ...style } : style,
            className: cn(
                'm-0 box-border block rounded-[50%] bg-cover bg-center p-0',
                tile?.small ? 'size-12 min-h-12 min-w-12' : 'size-14 min-h-14 min-w-14',
                className
            )
        }
    });
}

export type TileLogoProps = useRender.ComponentProps<'img'>;

/** Company logo of a launch tile (an `<img>`). */
export function TileLogo({ render, className, ...props }: TileLogoProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'img',
        props: {
            ...props,
            className: cn(
                tile?.small
                    ? 'h-[1.438rem] max-h-[1.438rem] min-h-[1.438rem] w-12 max-w-12 min-w-12'
                    : 'h-7 max-h-7 min-h-7 w-[3.625rem] max-w-[3.625rem] min-w-[3.625rem]',
                className
            )
        }
    });
}

export type TileBadgeProps = useRender.ComponentProps<'div'>;

/** Badge at the top end corner of a tile (inline in line tiles); hidden in action mode, except in line tiles. */
export function TileBadge({ render, className, ...props }: TileBadgeProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'z-10 m-0 box-border h-4 max-w-[calc(100%_-_1rem)] truncate rounded-lg border border-(--fdBadge_Border_Color) bg-sap-highlight-color px-2 py-0 font-sap-font-family text-sap-font-small-size leading-[normal] font-bold text-sap-content-contrast-text-color',
                tile?.line ? 'relative me-1.5 shrink-0' : 'absolute end-2 -top-[0.55rem]',
                tile?.action && !tile.line && 'hidden',
                className
            )
        }
    });
}

export interface TileBackgroundImgProps extends useRender.ComponentProps<'div'> {
    /** URL of the image. */
    backgroundImage?: string | null;
}

/** Background image of a slide tile. */
export function TileBackgroundImg({ backgroundImage, render, className, style, ...props }: TileBackgroundImgProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            style: backgroundImage ? { backgroundImage: `url("${backgroundImage}")`, ...style } : style,
            className: cn(
                'absolute inset-0 m-0 box-border size-full rounded-sap-element-border-corner-radius bg-cover bg-center p-0 hover:opacity-90 active:opacity-80',
                className
            )
        }
    });
}

export interface TileToggleProps extends Omit<ComponentProps<'button'>, 'children'> {
    /** Shows the pause glyph (the slides are playing); the name is "Pause" instead of "Play". */
    playing?: boolean;
}

/** Play/pause button of a slide tile; shown on hover, focus and touch devices. */
export function TileToggle({ playing = false, type = 'button', className, ...props }: TileToggleProps) {
    return (
        <button
            {...props}
            aria-label={props['aria-label'] ?? (playing ? 'Pause' : 'Play')}
            type={type}
            data-glyph={iconGlyphChar(playing ? 'media-pause' : 'media-play')}
            className={cn(
                'absolute -end-px -top-px z-5 m-0 box-border flex size-12 cursor-pointer border-0 bg-transparent p-2 opacity-0 outline-none group-hover/tile:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100',
                'before:flex before:size-8 before:items-center before:justify-center before:rounded-full before:bg-sap-block-layer-background before:font-sap-content-icon-font-family before:text-[1rem] before:text-sap-button-emphasized-text-color before:opacity-60 before:text-shadow-sap-button-emphasized-text-shadow before:content-[attr(data-glyph)]',
                'hover:before:opacity-80 active:before:opacity-100 focus-visible:before:outline-sap',
                className
            )}
        />
    );
}

export type TileSlideContainerProps = useRender.ComponentProps<'div'>;

/** Bottom band of a slide tile holding the header, footer and page indicator. */
export function TileSlideContainer({ render, className, ...props }: TileSlideContainerProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'relative z-2 m-0 box-border flex w-full max-w-full flex-col justify-between rounded-b-sap-element-border-corner-radius bg-sap-tile-overlay-background',
                tile?.small
                    ? 'h-21 max-h-21 min-h-21 px-[0.4375rem] pt-[0.1875rem]'
                    : 'h-[6.125rem] max-h-[6.125rem] min-h-[6.125rem] px-[0.9375rem] pt-1',
                className
            )
        }
    });
}

export type TilePageIndicatorProps = useRender.ComponentProps<'div'>;

/** Page dots of a slide tile. */
export function TilePageIndicator({ render, className, ...props }: TilePageIndicatorProps) {
    const tile = useTile();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex h-2 max-h-2 min-h-2 items-center justify-center p-0',
                tile?.small ? 'my-0' : 'mt-1.5 mb-0.5',
                className
            )
        }
    });
}

export interface TileDotProps extends useRender.ComponentProps<'span'> {
    /** The current page: a filled dot. */
    active?: boolean;
}

/** A page dot of a slide tile. */
export function TileDot({ active = false, render, className, ...props }: TileDotProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'm-0 me-[0.188rem] box-border block size-1.5 min-h-1.5 min-w-1.5 rounded-[50%] p-0 opacity-60 [box-shadow:0_0_0.125rem_var(--sapContent_ShadowColor)] last:m-0',
                active
                    ? 'bg-sap-tile-overlay-foreground-color'
                    : 'border border-sap-tile-overlay-foreground-color bg-transparent',
                className
            )
        }
    });
}

export type TileActionCloseProps = Omit<ComponentProps<'button'>, 'children'>;

/** Close (remove) button of a tile in action mode, named "Remove" by default. */
export function TileActionClose({ type = 'button', className, ...props }: TileActionCloseProps) {
    const tile = useTile();
    return (
        <button
            {...props}
            aria-label={props['aria-label'] ?? 'Remove'}
            type={type}
            className={cn(
                'm-0 box-border cursor-pointer border-0 bg-transparent p-0 font-sap-font-family outline-none',
                tile?.line
                    ? 'relative -top-2.5 flex size-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full focus-visible:outline-sap'
                    : 'absolute -end-1.5 -top-1.5 z-5 flex items-start justify-end rounded-sap-button-border-corner-radius border border-sap-button-lite-border-color hover:border-transparent active:border-transparent focus-visible:outline-sap',
                className
            )}
        >
            <span
                aria-hidden="true"
                data-glyph={iconGlyphChar('decline')}
                className={cn(
                    GLYPH,
                    'box-border size-[1.375rem] min-h-[1.375rem] min-w-[1.375rem] rounded-[50%] border border-sap-button-border-color bg-sap-button-background text-[0.75rem] leading-none text-sap-button-icon-color'
                )}
            />
        </button>
    );
}

export type TileActionIndicatorProps = Omit<ComponentProps<'button'>, 'children'>;

/** Actions (overflow) indicator of a tile in action mode, named "More" by default. */
export function TileActionIndicator({ type = 'button', className, ...props }: TileActionIndicatorProps) {
    const tile = useTile();
    return (
        <button
            {...props}
            aria-label={props['aria-label'] ?? 'More'}
            type={type}
            className={cn(
                'm-0 box-border inline-flex cursor-pointer items-center justify-center rounded-sap-button-border-corner-radius border-0 bg-transparent p-0 font-sap-font-family outline-none focus-visible:outline-sap',
                tile?.line
                    ? 'relative size-[1.625rem] border border-sap-button-lite-border-color hover:border-transparent active:border-transparent after:absolute after:start-[60%] after:top-1/2 after:size-8 after:-translate-1/2 after:content-[""] rtl:after:translate-x-1/2'
                    : 'absolute end-0 bottom-0 z-5 me-1 mb-1 h-[1.625rem] min-w-8 border border-sap-button-lite-border-color px-[calc(0.5rem_-_1px)] hover:border-transparent active:border-transparent',
                className
            )}
        >
            <span
                aria-hidden="true"
                data-glyph={iconGlyphChar('overflow')}
                className={cn(
                    GLYPH,
                    'text-[1rem]',
                    tile?.line
                        ? 'text-sap-button-lite-text-color'
                        : tile?.type === 'slide'
                          ? 'text-sap-shell-active-text-color'
                          : 'text-sap-button-icon-color'
                )}
            />
        </button>
    );
}

export type TileActionContainerProps = useRender.ComponentProps<'div'>;

/** Holds the action buttons of a line tile in action mode. */
export function TileActionContainer({ render, className, ...props }: TileActionContainerProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 ms-1 box-border flex items-center p-0', className) }
    });
}
