/*
 * Port of @fundamental-ngx/core (avatar-group) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import type { AvatarSize } from '@/ui/avatar/avatar';
import { Bar, BarElement, BarLeft, ButtonBar } from '@/ui/bar/bar';
import {
    Popover,
    PopoverBody,
    PopoverBodyHeader,
    PopoverTrigger,
    createPopoverHandle,
    type Placement,
    type PopoverHandle
} from '@/ui/popover/popover';

export type AvatarGroupType = 'group' | 'individual';
export type AvatarGroupOrientation = 'horizontal' | 'vertical';

/** Gap between avatars of individual groups and overlap of group-type avatars, per size. */
const GAP: Record<AvatarSize, string> = {
    xs: '[--ag-gap:0.0625rem] [--ag-overlap:-0.5rem]',
    s: '[--ag-gap:0.125rem] [--ag-overlap:-1.25rem]',
    sm: '[--ag-gap:0.125rem] [--ag-overlap:-1.25rem]',
    m: '[--ag-gap:0.125rem] [--ag-overlap:-1.625rem]',
    md: '[--ag-gap:0.125rem] [--ag-overlap:-1.625rem]',
    l: '[--ag-gap:0.125rem] [--ag-overlap:-2rem]',
    lg: '[--ag-gap:0.125rem] [--ag-overlap:-2rem]',
    xl: '[--ag-gap:0.25rem] [--ag-overlap:-2.75rem]'
};

/**
 * The overflow button is an avatar with button colours, as fundamental-styles' `fd-avatar--overflow`: the height and
 * font size of the avatars, and as wide as its count in a row (`--ag-ob` is the avatar size).
 */
const OVERFLOW_SIZE: Record<AvatarSize, string> = {
    xs: '[--ag-ob:2rem] text-[1rem] leading-[normal]',
    s: '[--ag-ob:3rem] text-[1.125rem] leading-[normal]',
    sm: '[--ag-ob:3rem] text-[1.125rem] leading-[normal]',
    m: '[--ag-ob:4rem] text-[1.5rem] leading-[normal]',
    md: '[--ag-ob:4rem] text-[1.5rem] leading-[normal]',
    l: '[--ag-ob:5rem] text-[2.25rem] leading-[normal]',
    lg: '[--ag-ob:5rem] text-[2.25rem] leading-[normal]',
    xl: '[--ag-ob:7rem] text-[3rem] leading-[normal]'
};
/** Radius of a circle overflow button (half its height: a pill when wider) and of its focus frame. */
const OVERFLOW_CIRCLE: Record<AvatarSize, string> = {
    xs: 'rounded-[1rem] focus:after:rounded-[1.25rem]',
    s: 'rounded-[1.5rem] focus:after:rounded-[1.75rem]',
    sm: 'rounded-[1.5rem] focus:after:rounded-[1.75rem]',
    m: 'rounded-[2rem] focus:after:rounded-[2.25rem]',
    md: 'rounded-[2rem] focus:after:rounded-[2.25rem]',
    l: 'rounded-[2.5rem] focus:after:rounded-[2.75rem]',
    lg: 'rounded-[2.5rem] focus:after:rounded-[2.75rem]',
    xl: 'rounded-[3.5rem] focus:after:rounded-[3.75rem]'
};

/** Inner focus frame of round avatar triggers. */
const FOCUS_RING =
    "relative rounded-full outline-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:-inset-1 focus-visible:after:rounded-full focus-visible:after:content-[''] focus-visible:after:border-(length:--sapContent_FocusWidth) focus-visible:after:[border-style:var(--sapContent_FocusStyle)] focus-visible:after:border-sap-content-focus-color";

/**
 * The button around an avatar with details. The avatar inside takes the hover and press colours of an interactive
 * avatar and the focus frame sits where the avatar's own would be, as fundamental-styles' avatar buttons. (The
 * avatar itself is not the button: its initials would not match its name.)
 */
const AVATAR_TRIGGER = [
    "relative flex cursor-pointer rounded-full outline-none [&>*]:cursor-pointer focus-visible:z-[5] focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:-inset-[0.3125rem] focus-visible:after:rounded-full focus-visible:after:content-[''] focus-visible:after:border-(length:--sapContent_FocusWidth) focus-visible:after:[border-style:var(--sapContent_FocusStyle)] focus-visible:after:border-sap-content-focus-color",
    'enabled-hover:[&>*]:[--av-bg:var(--av-hover-bg)] enabled-hover:[&>*]:[--av-border:var(--av-hover-border)]',
    'active:[&>*]:[--av-bg:var(--av-active-bg)] active:[&>*]:[--av-border:var(--av-active-border)] active:[&>*]:[--av-color:var(--av-active-color)]',
    'active:hover:[&>*]:[--av-bg:var(--av-active-hover-bg)] active:hover:[&>*]:[--av-border:var(--av-active-hover-border)] active:hover:[&>*]:[--av-color:var(--av-active-hover-color)]'
].join(' ');

export interface AvatarGroupItemProps {
    /** Title of the details popover (its accessible name) and of the details view in the overflow popover. */
    title?: string | null;
    /** Details shown in a popover (individual groups) or in the overflow popover; none when empty. */
    details?: ReactNode;
    /** Always visible, never moved to the overflow popover. */
    forceVisibility?: boolean;
    /** The avatar. */
    children?: ReactNode;
}

/**
 * An avatar of an `AvatarGroup` (Angular's `*fdAvatarGroupItem`), with its details and title. Use it as a direct
 * child of the group, with a `key`.
 *
 * ```tsx
 * <AvatarGroupItem key={p.id} title={p.name} details={<PersonDetails person={p} />}>
 *     <Avatar circle border size="s" label={p.name} />
 * </AvatarGroupItem>
 * ```
 */
export function AvatarGroupItem({ children }: AvatarGroupItemProps): ReactNode {
    return children;
}

/** An avatar of the group as the overflow popover, `renderOverflowButton` and `renderOverflowBody` see it. */
export interface AvatarGroupItemRef {
    /** The React key of the item. */
    key: string;
    /** The avatar (the children of the `AvatarGroupItem`). */
    avatar: ReactNode;
    title: string | null | undefined;
    /** The details, or `null` when the item has none. */
    details: ReactNode;
    forceVisibility: boolean;
}

interface GroupContextValue {
    /** Closes the open popover of the group (details, overflow or group popover). */
    closePopovers(): void;
    /** Adds a popover of the group; returns the cleanup. */
    register(handle: PopoverHandle): () => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

const hasDetails = (details: ReactNode) => details != null && typeof details !== 'boolean' && details !== '';

/** Ref callback: Escape inside `element` closes the popovers, even when its content stops the propagation. */
function useEscapeCapture(): RefCallback<HTMLElement> {
    const group = useContext(GroupContext);
    return useCallback(
        (element: HTMLElement | null) => {
            if (!element || !group) return;
            const onKeydown = (event: globalThis.KeyboardEvent) => {
                if (event.key === 'Escape') group.closePopovers();
            };
            element.addEventListener('keydown', onKeydown, true);
            return () => element.removeEventListener('keydown', onKeydown, true);
        },
        [group]
    );
}

/** A popover of the group: registered for `closePopovers`, Escape closes it from anywhere in its body. */
function GroupPopover({
    placement,
    label,
    trigger,
    children
}: {
    placement: Placement;
    label: string | null | undefined;
    trigger: ReactElement;
    children: ReactNode;
}) {
    const group = useContext(GroupContext);
    const [handle] = useState(() => createPopoverHandle());
    useEffect(() => group?.register(handle), [group, handle]);
    const escape = useEscapeCapture();
    return (
        <Popover handle={handle} placement={placement} noArrow={false}>
            <PopoverTrigger nativeButton={false} render={trigger} />
            {/* the dialog is named by the avatar's title or the overflow popover title */}
            <PopoverBody ref={escape} aria-label={label ?? undefined}>
                {children}
            </PopoverBody>
        </Popover>
    );
}

export interface AvatarGroupOverflowListProps extends Omit<ComponentProps<'div'>, 'children' | 'title'> {
    /** The avatars to list. */
    items: AvatarGroupItemRef[];
    /** Heading of the list view; the details view shows the title of the chosen avatar. */
    title?: string | null;
    /** `aria-level` of the heading. */
    headingLevel?: number;
    /** Label of the back button of the details view. */
    backLabel?: string;
}

/**
 * The content of the overflow popover: a header bar and the avatars; choosing an avatar with details (click, Enter
 * or Space) shows them, with a back button. Use it in `renderOverflowBody` to keep the default list.
 */
export function AvatarGroupOverflowList({
    items,
    title,
    headingLevel = 5,
    backLabel = 'Back',
    className,
    ref,
    ...props
}: AvatarGroupOverflowListProps) {
    const element = useRef<HTMLDivElement | null>(null);
    const escape = useEscapeCapture();
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const selected = items.find((item) => item.key === selectedKey) ?? null;
    /** Where the focus goes after a change of view: into the details, or back to the avatar. */
    const focusNext = useRef<'details' | string | null>(null);
    const heading = selected?.title ?? title ?? '';

    useEffect(() => {
        const target = focusNext.current;
        const root = element.current;
        if (!target || !root) return;
        focusNext.current = null;
        if (target === 'details') root.querySelector<HTMLElement>('button, a, input, [tabindex="0"]')?.focus();
        else root.querySelector<HTMLElement>(`[role=listitem][data-key="${CSS.escape(target)}"]`)?.focus();
    }, [selectedKey]);

    const open = (item: AvatarGroupItemRef) => {
        if (!hasDetails(item.details)) return;
        focusNext.current = 'details';
        setSelectedKey(item.key);
    };
    const back = () => {
        focusNext.current = selectedKey;
        setSelectedKey(null);
    };

    return (
        <div
            {...props}
            ref={(node) => {
                element.current = node;
                const cleanup = escape(node);
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
                return () => {
                    cleanup?.();
                    element.current = null;
                    if (typeof ref === 'function') ref(null);
                    else if (ref) ref.current = null;
                };
            }}
            className={cn('block max-w-80', className)}
        >
            <PopoverBodyHeader>
                <Bar barDesign="header" aria-label={heading}>
                    <BarLeft>
                        {selected && (
                            <ButtonBar
                                glyph="navigation-left-arrow"
                                aria-label={backLabel}
                                title={backLabel}
                                onClick={back}
                            />
                        )}
                        <BarElement>
                            <span
                                role="heading"
                                aria-level={headingLevel}
                                className="font-sap-font-header-family text-sap-font-header5-size font-bold text-sap-title-color"
                            >
                                {heading}
                            </span>
                        </BarElement>
                    </BarLeft>
                </Bar>
            </PopoverBodyHeader>
            {selected ? (
                selected.details
            ) : (
                <div role="list" className="flex flex-wrap gap-2 p-4 whitespace-normal">
                    {items.map((item) => {
                        const details = hasDetails(item.details);
                        return (
                            <div
                                key={item.key}
                                role="listitem"
                                data-key={item.key}
                                tabIndex={details ? 0 : undefined}
                                aria-haspopup={details ? 'dialog' : undefined}
                                className={details ? cn(FOCUS_RING, 'cursor-pointer') : undefined}
                                onClick={() => open(item)}
                                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                                    // no default action: it would press the back button, focused right away
                                    if (event.key !== 'Enter' && event.key !== ' ') return;
                                    event.preventDefault();
                                    open(item);
                                }}
                            >
                                {item.avatar}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export interface AvatarGroupProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** `AvatarGroupItem` elements, each with a `key`. */
    children?: ReactNode;
    /** Individual groups give each avatar its own details popover; group-type groups overlap the avatars. */
    type?: AvatarGroupType;
    /** Size of the avatars (also sizes the overflow button and spacing). */
    size?: AvatarSize;
    orientation?: AvatarGroupOrientation;
    /** Upper limit of visible avatars, the overflow button included; the rest go to the overflow popover. */
    maxVisibleItems?: number | null;
    /** Shape of the default overflow button; use circle next to circle avatars. */
    overflowButtonShape?: 'circle' | 'square';
    /** Title of the overflow (and group) popover: its heading and accessible name. */
    overflowPopoverTitle?: string | null;
    /** `aria-level` of the overflow popover heading. */
    overflowHeadingLevel?: number;
    /** Placement of the popovers; by default below the group, or to the right of a vertical group. */
    placement?: Placement;
    /** Name of the list of avatars (individual), or of the group button (group type). */
    ariaLabel?: string | null;
    /** A custom overflow button (Angular's `fdAvatarGroupOverflowButton`), given the hidden avatars. */
    renderOverflowButton?: (hiddenItems: AvatarGroupItemRef[]) => ReactNode;
    /** Custom content of the overflow popover (Angular's `fdAvatarGroupOverflowBody`), given the listed avatars. */
    renderOverflowBody?: (items: AvatarGroupItemRef[]) => ReactNode;
    /** Called with the number of visible avatars when it changes. */
    onVisibleCountChange?: (count: number) => void;
}

interface Measurement {
    /** Widths (with spacing) of the avatars that rendered, by key. */
    widths: ReadonlyMap<string, number>;
    overflow: number | null;
    available: number;
    measured: boolean;
}

function sameMeasurement(a: Measurement, b: Measurement): boolean {
    if (a.available !== b.available || a.overflow !== b.overflow || a.measured !== b.measured) return false;
    if (a.widths.size !== b.widths.size) return false;
    for (const [key, width] of a.widths) if (b.widths.get(key) !== width) return false;
    return true;
}

/** Splits the avatars into the visible and the hidden ones, forced ones first, as Angular. */
function computeVisibility(
    items: AvatarGroupItemRef[],
    { widths, overflow, available }: Measurement,
    max: number | null | undefined
): { visible: AvatarGroupItemRef[]; hidden: AvatarGroupItemRef[] } {
    const known = [...widths.values()];
    const average = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
    const width = (item: AvatarGroupItemRef) => widths.get(item.key) ?? average;
    const forced = items.filter((item) => item.forceVisibility);
    const regular = items.filter((item) => !item.forceVisibility);
    let used = forced.reduce((sum, item) => sum + width(item), 0);
    const slots = max != null ? Math.max(0, max - forced.length) : Number.POSITIVE_INFINITY;
    const visible: AvatarGroupItemRef[] = [];
    for (const item of regular) {
        if (visible.length >= slots || used + width(item) > available) break;
        used += width(item);
        visible.push(item);
    }
    let hidden = regular.slice(visible.length);
    // make room for the overflow button: in the slots of maxVisibleItems and in the width
    if (hidden.length && visible.length) {
        const button = overflow ?? average;
        while (
            visible.length &&
            ((max != null && visible.length + forced.length >= max) || used + button > available)
        ) {
            const moved = visible.pop()!;
            used -= width(moved);
            hidden = [moved, ...hidden];
        }
    }
    return { visible: [...forced, ...visible], hidden };
}

/**
 * Avatar group: avatars of a team or set of people. Individual groups show each avatar with its own details
 * popover; group-type groups overlap the avatars and open one popover with all of them. Avatars that do not fit (or
 * exceed `maxVisibleItems`) go into an overflow popover, on the registry's `Popover` (Base UI's Popover).
 *
 * ```tsx
 * <AvatarGroup size="s" overflowPopoverTitle="Team">
 *     {people.map((p) => (
 *         <AvatarGroupItem key={p.id} title={p.name} details={<PersonDetails person={p} />}>
 *             <Avatar circle border size="s" label={p.name} />
 *         </AvatarGroupItem>
 *     ))}
 * </AvatarGroup>
 * ```
 */
export function AvatarGroup({
    children,
    type = 'individual',
    size = 'l',
    orientation = 'horizontal',
    maxVisibleItems,
    overflowButtonShape = 'square',
    overflowPopoverTitle,
    overflowHeadingLevel = 5,
    placement,
    ariaLabel,
    renderOverflowButton,
    renderOverflowBody,
    onVisibleCountChange,
    className,
    ref,
    ...props
}: AvatarGroupProps) {
    const root = useRef<HTMLDivElement | null>(null);
    const row = useRef<HTMLDivElement | null>(null);
    const vertical = orientation === 'vertical';
    const group = type === 'group';
    const effectivePlacement: Placement = placement ?? (vertical ? 'right' : 'bottom');
    const [announcement, setAnnouncement] = useState('');
    const [measurement, setMeasurement] = useState<Measurement>(() => ({
        widths: new Map(),
        overflow: null,
        available: Number.POSITIVE_INFINITY,
        measured: false
    }));

    const items = useMemo<AvatarGroupItemRef[]>(
        () =>
            Children.toArray(children)
                .filter(isValidElement)
                .map((node, index) => {
                    const item = node.type === AvatarGroupItem ? (node.props as AvatarGroupItemProps) : null;
                    return {
                        key: node.key != null ? String(node.key) : String(index),
                        avatar: item ? item.children : node,
                        title: item?.title,
                        details: item && hasDetails(item.details) ? item.details : null,
                        forceVisibility: !!item?.forceVisibility
                    };
                }),
        [children]
    );
    const { visible, hidden } = computeVisibility(
        items,
        vertical ? { ...measurement, available: Number.POSITIVE_INFINITY } : measurement,
        maxVisibleItems
    );

    // popovers of the group, for closePopovers
    const handles = useRef(new Set<PopoverHandle>());
    const context = useMemo<GroupContextValue>(
        () => ({
            closePopovers: () => handles.current.forEach((handle) => handle.isOpen && handle.close()),
            register: (handle) => {
                handles.current.add(handle);
                return () => handles.current.delete(handle);
            }
        }),
        []
    );

    /** Remembers the widths of the rendered avatars and the room of the group. */
    const measure = useCallback(() => {
        const host = root.current;
        const list = row.current;
        if (!host || !list) return;
        const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
        setMeasurement((previous) => {
            const widths = new Map(previous.widths);
            list.querySelectorAll<HTMLElement>(':scope > [data-avatar-group-item]').forEach((el) => {
                const margin = parseFloat(getComputedStyle(el).marginInlineStart) || 0;
                widths.set(el.dataset['avatarGroupItem']!, el.getBoundingClientRect().width + gap + margin);
            });
            const button = list.querySelector<HTMLElement>(':scope > [data-avatar-group-overflow]');
            const next: Measurement = {
                widths,
                overflow: button ? button.getBoundingClientRect().width + gap : previous.overflow,
                // each width counts a gap, but the last one has none (and half a pixel for sub-pixel widths):
                // a group that hugs its avatars (e.g. in a flex row) keeps them, and does not lose one per measure
                available: host.clientWidth + gap + 0.5,
                measured: true
            };
            return sameMeasurement(previous, next) ? previous : next;
        });
    }, []);

    useLayoutEffect(() => {
        const host = root.current;
        if (!host) return;
        const observer = new ResizeObserver(() => measure());
        observer.observe(host);
        return () => observer.disconnect();
    }, [measure]);
    // before paint, after every render: the avatars that rendered may have new widths
    useLayoutEffect(() => measure());

    const visibleCount = visible.length;
    const emitted = useRef<number | null>(null);
    useEffect(() => {
        if (!measurement.measured || emitted.current === visibleCount) return;
        emitted.current = visibleCount;
        onVisibleCountChange?.(visibleCount);
    });

    /** Announces "2 of 6" when an avatar (or the overflow button) of an individual group gets the focus. */
    const announcePosition = (event: FocusEvent<HTMLDivElement>) => {
        const list = [...event.currentTarget.querySelectorAll<HTMLElement>(':scope > [role=listitem]')];
        const index = list.findIndex((item) => item.contains(event.target as Node));
        if (index >= 0) setAnnouncement(`${index + 1} of ${list.length}`);
    };

    const rowClass = cn(
        'm-0 flex min-w-0 p-0',
        GAP[size],
        vertical && 'flex-col',
        group
            ? [
                  FOCUS_RING,
                  'cursor-pointer rounded-none [&>*>*]:pointer-events-none',
                  vertical
                      ? '[&>[data-avatar-group-item]~*>*]:mt-(--ag-overlap)'
                      : '[&>[data-avatar-group-item]~*>*]:ms-(--ag-overlap)',
                  // the avatars and the overflow button take their hover and press colours from the whole group
                  'enabled-hover:[&>*>*]:[--av-bg:var(--av-hover-bg)] enabled-hover:[&>*>*]:[--av-border:var(--av-hover-border)]',
                  'active:[&>*>*]:[--av-bg:var(--av-active-bg)] active:[&>*>*]:[--av-border:var(--av-active-border)] active:[&>*>*]:[--av-color:var(--av-active-color)]',
                  'active:hover:[&>*>*]:[--av-bg:var(--av-active-hover-bg)] active:hover:[&>*>*]:[--av-border:var(--av-active-hover-border)] active:hover:[&>*>*]:[--av-color:var(--av-active-hover-color)]'
              ]
            : 'gap-(--ag-gap)'
    );

    /** The default overflow button; `focusable` when it is the trigger itself (individual groups). */
    const defaultOverflowButton = (focusable: boolean) => (
        <span
            className={cn(
                'relative m-0 box-border inline-flex shrink-0 cursor-pointer items-center justify-center p-0 align-middle',
                'font-sap-font-family font-normal [forced-color-adjust:none]',
                'h-(--ag-ob) min-h-(--ag-ob) max-h-(--ag-ob) min-w-(--ag-ob)',
                vertical ? 'w-(--ag-ob) max-w-(--ag-ob)' : 'w-fit max-w-fit px-2',
                // button colours; the hover border is the avatars' one, as fundamental-styles computes it
                '[--av-bg:var(--sapButton_Background)] [--av-border:var(--sapButton_BorderColor)] [--av-color:var(--sapButton_TextColor)]',
                '[--av-hover-bg:var(--sapButton_Hover_Background)] [--av-hover-border:var(--sapAvatar_Hover_BorderColor)]',
                '[--av-active-bg:var(--sapButton_Active_Background)] [--av-active-border:var(--sapButton_Active_BorderColor)] [--av-active-color:var(--sapButton_Active_TextColor)]',
                '[--av-active-hover-bg:var(--sapButton_Active_Background)] [--av-active-hover-border:var(--sapButton_Active_BorderColor)] [--av-active-hover-color:var(--sapButton_Active_TextColor)]',
                'border-(length:--av-ob-w) border-solid border-(--av-border) bg-(--av-bg) text-(--av-color) [--av-ob-w:0.0625rem] hc:[--av-ob-w:0.125rem]',
                'enabled-hover:border-(--av-hover-border) enabled-hover:bg-(--av-hover-bg)',
                'active:border-(--av-active-border) active:bg-(--av-active-bg) active:text-(--av-active-color)',
                'active:hover:border-(--av-active-hover-border) active:hover:bg-(--av-active-hover-bg) active:hover:text-(--av-active-hover-color)',
                OVERFLOW_SIZE[size],
                overflowButtonShape === 'circle'
                    ? OVERFLOW_CIRCLE[size]
                    : 'rounded-sap-element-border-corner-radius focus:after:rounded-[0.9rem] hc:focus:after:rounded-none',
                // SAP focus: a frame outside the button, as the avatars'
                focusable &&
                    "focus:z-[5] focus:py-0.5 focus:outline-none focus:after:pointer-events-none focus:after:absolute focus:after:-inset-[0.3125rem] focus:after:content-[''] focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color"
            )}
        >
            <bdi dir="ltr">{`+${hidden.length}`}</bdi>
        </span>
    );
    const overflowBody = (list: AvatarGroupItemRef[]) =>
        renderOverflowBody ? (
            renderOverflowBody(list)
        ) : (
            <AvatarGroupOverflowList items={list} title={overflowPopoverTitle} headingLevel={overflowHeadingLevel} />
        );

    return (
        <GroupContext.Provider value={context}>
            <div
                {...props}
                ref={(node) => {
                    root.current = node;
                    if (typeof ref === 'function') return ref(node);
                    if (ref) ref.current = node;
                }}
                className={cn(
                    'm-0 box-border flex max-w-full p-0',
                    // the column hugs its avatars, so a popover opening to the right sits next to them
                    vertical && 'h-full flex-col items-start',
                    className
                )}
            >
                {group ? (
                    <GroupPopover
                        placement={effectivePlacement}
                        label={overflowPopoverTitle}
                        trigger={
                            <div ref={row} role="button" tabIndex={0} className={rowClass}>
                                <span className="sr-only-sap">
                                    {ariaLabel || `Avatar group, ${items.length} avatars`}
                                </span>
                                {visible.map((item) => (
                                    <div
                                        key={item.key}
                                        data-avatar-group-item={item.key}
                                        className="flex"
                                        aria-hidden="true"
                                    >
                                        {item.avatar}
                                    </div>
                                ))}
                                {hidden.length > 0 && (
                                    <div data-avatar-group-overflow="" className="flex" aria-hidden="true">
                                        {renderOverflowButton
                                            ? renderOverflowButton(hidden)
                                            : defaultOverflowButton(false)}
                                    </div>
                                )}
                            </div>
                        }
                    >
                        {overflowBody(items)}
                    </GroupPopover>
                ) : (
                    <>
                        <div
                            ref={row}
                            role="list"
                            aria-label={ariaLabel || 'Individual avatar group'}
                            className={rowClass}
                            onFocus={announcePosition}
                        >
                            {visible.map((item) => (
                                <div key={item.key} role="listitem" data-avatar-group-item={item.key} className="flex">
                                    {item.details ? (
                                        <GroupPopover
                                            placement={effectivePlacement}
                                            label={item.title}
                                            trigger={
                                                <div tabIndex={0} className={AVATAR_TRIGGER}>
                                                    {item.avatar}
                                                </div>
                                            }
                                        >
                                            {item.details}
                                        </GroupPopover>
                                    ) : (
                                        item.avatar
                                    )}
                                </div>
                            ))}
                            {hidden.length > 0 && (
                                <div role="listitem" data-avatar-group-overflow="" className="flex">
                                    <GroupPopover
                                        placement={effectivePlacement}
                                        label={overflowPopoverTitle}
                                        trigger={
                                            renderOverflowButton ? (
                                                // named by its content, which the "+N more" name could contradict
                                                <div tabIndex={0} className={cn(FOCUS_RING, 'flex cursor-pointer')}>
                                                    {renderOverflowButton(hidden)}
                                                </div>
                                            ) : (
                                                cloneElement(defaultOverflowButton(true), {
                                                    tabIndex: 0,
                                                    'aria-label': `+${hidden.length} more`
                                                })
                                            )
                                        }
                                    >
                                        {overflowBody(hidden)}
                                    </GroupPopover>
                                </div>
                            )}
                        </div>
                        <span className="sr-only-sap" role="status" aria-live="polite">
                            {announcement}
                        </span>
                    </>
                )}
            </div>
        </GroupContext.Provider>
    );
}
