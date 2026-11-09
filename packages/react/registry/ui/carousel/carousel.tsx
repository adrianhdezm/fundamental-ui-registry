/*
 * Port of @fundamental-ngx/core (carousel) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    use,
    useCallback,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { Button } from '@/ui/button/button';

export interface CarouselConfig {
    vertical?: boolean;
    /** Number of items shown at once. */
    elementsAtOnce?: number;
    /** Dragging with the mouse or a finger moves the items. */
    gestureSupport?: boolean;
    /** The items wrap around: the active item is kept in the middle. */
    infinite?: boolean;
    /** CSS duration of a slide, e.g. `150ms`. */
    transition?: string;
}

/** An item the carousel engine moves. */
export interface CarouselItemRef {
    readonly element: HTMLElement;
    getWidth(): number;
    getHeight(): number;
}

export interface PanEndOutput<T extends CarouselItemRef = CarouselItemRef> {
    item: T;
    /** The drag went towards the following items. */
    after: boolean;
}

export const DEFAULT_TRANSITION_DURATION = '150ms';

/**
 * Moves a row (or column) of items with CSS transforms: to an item, to the next or previous one, and by dragging,
 * snapping to the closest item. In infinite mode the items are reordered (with the CSS `order` of the items, so the
 * element must be a flex container) so the active one stays in the middle. Angular's `fdCarousel` directive.
 *
 * ```ts
 * const engine = new CarouselEngine(track);
 * engine.config = { vertical: true, infinite: true };
 * engine.setItems(items); // { element, getWidth(), getHeight() }
 * engine.pickNext();
 * ```
 */
export class CarouselEngine<T extends CarouselItemRef = CarouselItemRef> {
    config: CarouselConfig = {};
    items: T[] = [];
    active: T | null = null;
    onActiveChange: (event: PanEndOutput<T>) => void = () => {};
    onDragStateChange: (dragging: boolean) => void = () => {};

    private transitionPx = 0;
    private lastDistance = 0;
    private initialDragPosition = 0;
    private lastDragPosition = 0;
    private listening = false;
    private dragStarted = false;
    private removeGestures: (() => void) | null = null;

    readonly element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    get currentTransitionPx(): number {
        return this.transitionPx;
    }

    private get elementsAtOnce(): number {
        return Math.max(1, this.config.elementsAtOnce ?? 1);
    }

    private get rtl(): boolean {
        return getComputedStyle(this.element).direction === 'rtl';
    }

    /** Sets the items, in their order in the DOM. */
    setItems(items: readonly T[]): void {
        this.items = [...items];
        if (!this.active || !this.items.includes(this.active)) this.active = this.items[0] ?? null;
    }

    /** Shows the items in their DOM order again (undoes the reordering of infinite mode). */
    resetOrder(): void {
        for (const item of this.items) item.element.style.removeProperty('order');
    }

    setGestures(enabled: boolean): void {
        if (enabled && !this.removeGestures) this.removeGestures = this.listen();
        if (!enabled && this.removeGestures) {
            this.removeGestures();
            this.removeGestures = null;
        }
    }

    destroy(): void {
        this.setGestures(false);
    }

    goToItem(item: T, smooth = false): void {
        let index = this.items.indexOf(item);
        if (index < 0) return;
        if (this.config.infinite) {
            this.centerActive(index);
            index = this.items.indexOf(item);
        }
        this.transitionToIndex(index, smooth);
    }

    pickNext(): void {
        const index = this.active ? this.items.indexOf(this.active) : -1;
        const item = this.items[index + 1] ?? this.items[0];
        if (!item) return;
        this.goToItem(item, true);
        this.active = item;
    }

    pickPrevious(): void {
        const index = this.active ? this.items.indexOf(this.active) : 1;
        const item = this.items[index - 1] ?? this.items.at(-1);
        if (!item) return;
        this.goToItem(item, true);
        this.active = item;
    }

    /** Moves back to the start without a transition. */
    reset(): void {
        this.active = this.items[0] ?? null;
        this.element.style.transitionDuration = '0s';
        this.translate(0);
    }

    private centerActive(index: number): void {
        const size = this.size(this.items[0]);
        if (!size) return;
        const middle = Math.ceil(this.items.length / 2);
        const missing = index + Math.ceil(this.elementsAtOnce / 2) - middle;
        for (let i = 0; i < Math.abs(missing); i++) {
            if (missing > 0) this.items.push(this.items.shift()!);
            else this.items.unshift(this.items.pop()!);
        }
        // Angular moves the elements in the DOM; the CSS order leaves the DOM to React
        this.items.forEach((item, i) => (item.element.style.order = String(i)));
        this.element.style.transitionDuration = '0s';
        this.translate(this.transitionPx + size * missing);
    }

    private transitionToIndex(index: number, smooth: boolean): void {
        const px = this.size(this.items[0]) * index;
        this.element.style.transitionDuration = smooth ? (this.config.transition ?? DEFAULT_TRANSITION_DURATION) : '0s';
        this.translate(!this.rtl || this.config.vertical ? -px : px);
    }

    private translate(px: number): void {
        this.transitionPx = px;
        this.element.style.transform = `translate${this.config.vertical ? 'Y' : 'X'}(${px}px)`;
    }

    private size(item: T | undefined): number {
        if (!item) return 0;
        return this.config.vertical ? item.getHeight() : item.getWidth();
    }

    private closest(): T {
        const first = this.items[0];
        const px = this.transitionPx;
        if (
            !this.config.infinite &&
            ((!this.config.vertical && ((!this.rtl && px > 0) || (this.rtl && px < 0))) ||
                (this.config.vertical && px > 0))
        ) {
            return first;
        }
        const size = this.size(first);
        const halfApproached = Math.abs(px % size) > size / 2;
        let index = Math.ceil(Math.abs(px / size));
        const atOnce = this.elementsAtOnce;
        if (!this.config.infinite && atOnce > 1) {
            if (this.items.length < atOnce) return first;
            if (index + atOnce >= this.items.length) return this.items[this.items.length - atOnce] ?? first;
        }
        index += halfApproached ? 0 : -1;
        return this.items[index] ?? this.items.at(-1)!;
    }

    private pan(delta: number): void {
        const distance = delta - this.lastDistance;
        this.lastDistance = delta;
        this.translate(this.transitionPx + distance);
    }

    private panEnd(delta: number): void {
        this.pan(delta);
        const closest = this.closest();
        this.goToItem(closest, true);
        if (this.active !== closest) {
            this.active = closest;
            this.onActiveChange({ item: closest, after: delta < 0 });
        }
        this.onDragStateChange(false);
        this.lastDistance = 0;
    }

    private coordinate(event: PointerEvent): number {
        return this.config.vertical ? event.pageY : event.pageX;
    }

    private listen(): () => void {
        const doc = this.element.ownerDocument;
        const down = (event: PointerEvent): void => {
            if (event.button !== 0 || !this.items.length) return;
            this.listening = true;
            this.lastDragPosition = this.initialDragPosition = this.coordinate(event);
            this.element.style.transitionDuration = '0s';
            this.onDragStateChange(true);
        };
        const move = (event: PointerEvent): void => {
            const coordinate = this.coordinate(event);
            if (!this.listening || coordinate === this.lastDragPosition) return;
            this.dragStarted = true;
            this.lastDragPosition = coordinate;
            this.pan(coordinate - this.initialDragPosition);
        };
        const up = (event: PointerEvent): void => {
            if (!this.listening) return;
            if (this.dragStarted) this.panEnd(this.coordinate(event) - this.initialDragPosition);
            else this.onDragStateChange(false);
            this.listening = false;
            this.dragStarted = false;
        };
        this.element.addEventListener('pointerdown', down, { passive: true });
        doc.addEventListener('pointermove', move, { passive: true });
        doc.addEventListener('pointerup', up, { passive: true });
        doc.addEventListener('pointercancel', up, { passive: true });
        return () => {
            this.element.removeEventListener('pointerdown', down);
            doc.removeEventListener('pointermove', move);
            doc.removeEventListener('pointerup', up);
            doc.removeEventListener('pointercancel', up);
        };
    }
}

export type PageIndicatorsOrientation = 'bottom' | 'top';
export type CarouselBackgroundOptions = 'translucent' | 'transparent' | 'solid';
export type CarouselSlideDirection = 'Next' | 'Previous' | 'None';

/** A slide as `onSlideChange` reports it. */
export interface CarouselSlide<T = unknown> {
    readonly id: string;
    /** Position among the slides, from 0. */
    readonly index: number;
    /** The `value` of the `CarouselItem`. */
    readonly value: T | undefined;
    readonly element: HTMLElement;
}

export interface CarouselActiveSlides {
    readonly activeItems: CarouselSlide[];
    readonly slideDirection: CarouselSlideDirection;
}

/** What a carousel can be asked to do from code (Angular's public methods), see `actionsRef`. */
export interface CarouselActions {
    previous(): void;
    next(): void;
    /** Focuses the carousel. */
    focus(): void;
}

/** More slides than this show a numeric indicator instead of dots. */
const ICON_PAGE_INDICATOR_LIMIT = 8;

/** A slide registered by a `CarouselItem`: the same object for the item's lifetime. */
class SlideRecord implements CarouselItemRef {
    element!: HTMLElement;
    id = '';
    value: unknown;
    initialWidth = 0;
    initialHeight = 0;

    getWidth(): number {
        return this.element.getBoundingClientRect().width || this.initialWidth;
    }

    getHeight(): number {
        return this.element.getBoundingClientRect().height || this.initialHeight;
    }
}

interface CarouselContextValue {
    register(slide: SlideRecord): void;
    unregister(slide: SlideRecord): void;
    /** An item's id changed: the carousel renders again for `aria-activedescendant`. */
    refresh(): void;
    slides: readonly SlideRecord[];
    vertical: boolean;
    /** A fixed number of slides share the width (not `auto`). */
    fixedCount: boolean;
    active: ReadonlySet<SlideRecord>;
    shown: ReadonlySet<SlideRecord>;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

const EMPTY: ReadonlySet<SlideRecord> = new Set();

/** The slides shown from `start`. */
function activeOf(slides: readonly SlideRecord[], start: number, count: number, loop: boolean): SlideRecord[] {
    const length = Math.min(count, slides.length);
    return Array.from({ length }, (_, i) => (loop ? slides[(start + i) % slides.length] : slides[start + i])).filter(
        (slide): slide is SlideRecord => !!slide
    );
}

const byDomOrder = (a: SlideRecord, b: SlideRecord) =>
    a === b ? 0 : a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

const sameSlides = (a: readonly SlideRecord[], b: readonly SlideRecord[]) =>
    a.length === b.length && a.every((slide, i) => slide === b[i]);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(callback: () => void): () => void {
    if (typeof matchMedia !== 'function') return () => {};
    const query = matchMedia(REDUCED_MOTION);
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
}

/** The user asked for reduced motion: the slides move without a transition. */
function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION).matches,
        () => false
    );
}

export interface CarouselItemProps<T = unknown> extends useRender.ComponentProps<'div'> {
    /** Shows a busy indicator over the slide. */
    loading?: boolean;
    /** Height used while the slide is not rendered yet. */
    initialHeight?: number;
    /** Width used while the slide is not rendered yet. */
    initialWidth?: number;
    /** Value reported with the slide in `onSlideChange`. */
    value?: T;
}

/**
 * A slide of a carousel (`role="option"`); `loading` shows a busy indicator over it. Native props (`aria-label`,
 * `title`, ...) and the ref go to the option.
 *
 * ```tsx
 * <CarouselItem><img src="a.png" alt="A" /></CarouselItem>
 * ```
 */
export function CarouselItem<T = unknown>({
    loading = false,
    initialHeight = 0,
    initialWidth = 0,
    value,
    id: idProp,
    render,
    ref,
    className,
    children,
    ...props
}: CarouselItemProps<T>) {
    const autoId = useId();
    const id = idProp ?? `fd-carousel-item-${autoId}`;
    const carousel = use(CarouselContext);
    const [slide] = useState(() => new SlideRecord());
    const element = useRef<HTMLDivElement>(null);
    slide.id = id;
    slide.value = value;
    slide.initialWidth = initialWidth;
    slide.initialHeight = initialHeight;

    const register = carousel?.register;
    const unregister = carousel?.unregister;
    const refresh = carousel?.refresh;
    useLayoutEffect(() => {
        if (!register || !unregister || !element.current) return;
        slide.element = element.current;
        register(slide);
        return () => unregister(slide);
    }, [register, unregister, slide]);
    const registeredId = useRef(id);
    useLayoutEffect(() => {
        if (registeredId.current === id) return;
        registeredId.current = id;
        refresh?.();
    }, [id, refresh]);

    const position = carousel ? carousel.slides.indexOf(slide) + 1 || undefined : undefined;
    const active = carousel ? carousel.active.has(slide) : true;
    const shown = carousel ? carousel.shown.has(slide) : true;
    const vertical = carousel?.vertical ?? false;

    return useRender({
        render,
        ref: ref ? [ref, element] : element,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            role: 'option',
            'aria-setsize': carousel ? carousel.slides.length : undefined,
            'aria-posinset': position,
            'aria-selected': active,
            'aria-hidden': !active,
            'aria-busy': loading || undefined,
            className: cn(
                'm-0 box-border flex h-full max-w-full shrink-0 items-center justify-center p-0 leading-0',
                '[&_img]:pointer-events-none',
                vertical ? '[&_img]:h-auto [&_img]:min-w-full' : '[&_img]:min-h-full [&_img]:w-auto',
                // a fixed number of slides share the width
                carousel?.fixedCount && !vertical && 'w-[calc(100%/var(--carousel-count,1))]',
                !shown && 'invisible',
                className
            ),
            children: (
                <BusyIndicator
                    loading={loading}
                    block
                    // no tabindex at all (Angular's `[tabindex]="null"`): a focusable progressbar in an option is a
                    // nested interactive control
                    tabIndex={null as unknown as number}
                    className="h-full max-w-full"
                >
                    {children}
                </BusyIndicator>
            )
        }
    });
}

/** Background of the slides per option. */
const CONTENT_BACKGROUND: Record<CarouselBackgroundOptions, string> = {
    translucent: 'bg-sap-background-color',
    solid: 'bg-sap-group-content-background',
    transparent: 'bg-transparent'
};

/** Background of the page indicator bar per option. */
const INDICATOR_BACKGROUND: Record<CarouselBackgroundOptions, string> = {
    solid: 'bg-sap-page-footer-background',
    translucent: 'bg-sap-background-color',
    transparent: 'bg-transparent'
};

const INDICATORS = 'm-0 box-border flex min-w-36 flex-wrap items-center justify-center p-2';

const DOT =
    'm-0 mx-1.5 box-border size-1 min-h-1 shrink-0 rounded-[50%] border border-solid border-sap-content-foreground-border-color bg-sap-content-foreground-border-color p-0 hc:mx-1 hc:size-2 hc:min-h-2 hc:bg-transparent';
const ACTIVE_DOT =
    'm-0 mx-1 box-border size-2 min-h-2 shrink-0 rounded-[50%] border border-solid border-sap-content-selected-foreground-color bg-sap-content-selected-foreground-color p-0';

export interface CarouselProps extends Omit<useRender.ComponentProps<'div'>, 'children'> {
    /** `CarouselItem`s; other content (e.g. a message page) shows in the slides area. */
    children?: ReactNode;
    /** Where the page indicators go. */
    pageIndicatorsOrientation?: PageIndicatorsOrientation;
    /** CSS height of the carousel. */
    height?: string;
    /** CSS width of the carousel. */
    width?: string;
    /** Wraps from the last slide to the first and back. */
    loop?: boolean;
    /** Shows the navigation buttons. */
    navigation?: boolean;
    /** Puts the navigation buttons next to the page indicators instead of over the slides. */
    navigatorInPageIndicator?: boolean;
    /** Shows "2 of 9" instead of dots; always on for more than 8 slides. */
    numericIndicator?: boolean;
    /** Shows the bar of the page indicators. */
    pageIndicatorContainer?: boolean;
    /** Shows the page indicators (dots or numbers). */
    pageIndicator?: boolean;
    /** Duration of a slide in milliseconds (none with `prefers-reduced-motion`). */
    slideTransitionDuration?: number;
    /** Dragging with the mouse or a finger moves the slides. */
    swipeEnabled?: boolean;
    vertical?: boolean;
    noPaginationContainerBorder?: boolean;
    contentBackground?: CarouselBackgroundOptions;
    pageIndicatorBackground?: CarouselBackgroundOptions;
    /** Slides shown at once; `auto` fits as many as the width allows. */
    visibleSlidesCount?: number | 'auto';
    previousLabel?: string;
    nextLabel?: string;
    ofLabel?: string;
    /** Start of the announcement of the shown slide: "Displaying item 2 of 5". */
    readerLabel?: string;
    /** Label of a page dot; `{itemNum}` and `{totalNum}` are replaced. */
    pageIndicatorLabel?: string;
    /** The shown slides changed: with the buttons, keys, by swiping or with a new `visibleSlidesCount`. */
    onSlideChange?: (event: CarouselActiveSlides) => void;
    /** `previous()`, `next()` and `focus()`. */
    actionsRef?: Ref<CarouselActions>;
}

const toSlide = (slides: readonly SlideRecord[]) => (slide: SlideRecord) => ({
    id: slide.id,
    index: slides.indexOf(slide),
    value: slide.value,
    element: slide.element
});

/**
 * Carousel: shows one or more slides at a time with navigation buttons, page indicators (dots, or "2 of 9" for many
 * slides) and swiping. The slides are a `listbox` (one tab stop, named by `aria-label` or `aria-labelledby`); Left
 * and Right (or Up and Down when vertical) move between them, mirrored in RTL, and the shown slide is announced.
 * `loop` wraps around. Native props and the ref go to the root; `aria-label`, `aria-labelledby` and
 * `aria-describedby` go to the listbox.
 *
 * ```tsx
 * <Carousel width="31.25rem" aria-label="Products">
 *     <CarouselItem><img src="a.png" alt="A" /></CarouselItem>
 *     <CarouselItem><img src="b.png" alt="B" /></CarouselItem>
 * </Carousel>
 * ```
 */
export function Carousel({
    pageIndicatorsOrientation = 'bottom',
    height,
    width = '100%',
    loop = false,
    navigation = true,
    navigatorInPageIndicator = true,
    numericIndicator = false,
    pageIndicatorContainer = true,
    pageIndicator = true,
    slideTransitionDuration = 150,
    swipeEnabled = true,
    vertical = false,
    noPaginationContainerBorder = false,
    contentBackground = 'translucent',
    pageIndicatorBackground = 'solid',
    visibleSlidesCount = 1,
    previousLabel = 'Go to previous item',
    nextLabel = 'Go to next item',
    ofLabel = 'of',
    readerLabel = 'Displaying item',
    pageIndicatorLabel = 'Item {itemNum} of {totalNum} displayed',
    onSlideChange,
    actionsRef,
    id: idProp,
    render,
    ref,
    className,
    style,
    children,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
}: CarouselProps) {
    const autoId = useId();
    const id = idProp ?? `fd-carousel-${autoId}`;
    const host = useRef<HTMLDivElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const engineRef = useRef<CarouselEngine<SlideRecord> | null>(null);
    const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [slides, setSlides] = useState<readonly SlideRecord[]>([]);
    /** Index of the first slide shown. */
    const [start, setStart] = useState(0);
    const [fitting, setFitting] = useState({ width: 0, slides: 1 });
    /** Slides kept visible while they slide out. */
    const [leaving, setLeaving] = useState<ReadonlySet<SlideRecord>>(EMPTY);
    const [dragging, setDragging] = useState(false);
    const [, setVersion] = useState(0);
    const reducedMotion = usePrefersReducedMotion();
    const duration = reducedMotion ? 0 : slideTransitionDuration;

    /** Number of slides shown at once. */
    const count = Math.max(1, visibleSlidesCount === 'auto' ? fitting.slides : visibleSlidesCount);
    const total = slides.length;
    const pages = !total ? 0 : loop && count > 1 ? total : Math.max(1, total - count + 1);
    const numeric = numericIndicator || total > ICON_PAGE_INDICATOR_LIMIT;
    const showIndicatorContainer = pageIndicatorContainer && (pages > 0 || numeric);
    const activeSlides = activeOf(slides, start, count, loop);
    const shownSlides = dragging ? slides : [...activeSlides, ...leaving];
    /** The slides by position, so the context only changes with them. */
    const positions = (of: readonly SlideRecord[]) =>
        of
            .map((slide) => slides.indexOf(slide))
            .filter((index) => index >= 0)
            .join();
    const activeKey = positions(activeSlides);
    const shownKey = positions(shownSlides);
    const previousDisabled = total <= 1 || (!loop && start <= 0);
    const nextDisabled = total <= 1 || (!loop && start >= pages - 1);
    const contentWidth = visibleSlidesCount === 'auto' && fitting.width ? `${fitting.width}px` : undefined;

    /** The state the handlers read; `start` also moves at once, before the next render. */
    const latest = useRef({ slides, start, count, loop, pages, vertical, visibleSlidesCount, duration, onSlideChange });
    latest.current = { slides, start, count, loop, pages, vertical, visibleSlidesCount, duration, onSlideChange };

    const keepLeaving = (previous: readonly SlideRecord[]) => {
        clearTimeout(leaveTimer.current);
        setLeaving(new Set(previous));
        leaveTimer.current = setTimeout(() => setLeaving(EMPTY), latest.current.duration);
    };

    const notify = (at: number, slideDirection: CarouselSlideDirection) => {
        const s = latest.current;
        s.onSlideChange?.({
            activeItems: activeOf(s.slides, at, s.count, s.loop).map(toSlide(s.slides)),
            slideDirection
        });
    };

    const moveTo = (next: number) => {
        const s = latest.current;
        const previous = activeOf(s.slides, s.start, s.count, s.loop);
        s.start = next;
        setStart(next);
        const slide = s.slides[next];
        const engine = engineRef.current;
        if (slide && engine) {
            engine.goToItem(slide, true);
            engine.active = slide;
        }
        keepLeaving(previous);
    };

    const previous = () => {
        const s = latest.current;
        const length = s.slides.length;
        if (length <= 1 || (!s.loop && s.start <= 0)) return;
        moveTo(s.loop ? (s.start - 1 + length) % length : s.start - 1);
        notify(s.start, 'Previous');
    };

    const next = () => {
        const s = latest.current;
        const length = s.slides.length;
        if (length <= 1 || (!s.loop && s.start >= s.pages - 1)) return;
        moveTo(s.loop ? (s.start + 1) % length : s.start + 1);
        notify(s.start, 'Next');
    };

    /** Focuses the carousel, e.g. after a click on a slide. */
    const focus = () => {
        const el = list.current;
        if (el && el.tabIndex >= 0 && el !== document.activeElement) el.focus({ preventScroll: true });
    };

    useImperativeHandle(actionsRef, () => ({ previous, next, focus }));

    /** The slides (from the first shown) that fit into the width, and their width. */
    const fit = () => {
        const s = latest.current;
        const available = container.current?.getBoundingClientRect().width ?? 0;
        const ordered = [...s.slides.slice(s.start), ...s.slides.slice(0, s.start)];
        const limit = s.visibleSlidesCount === 'auto' ? s.slides.length : s.count;
        let fitWidth = 0;
        let fitCount = 0;
        for (const slide of ordered.slice(0, limit)) {
            const slideWidth = slide.getWidth();
            if (!slideWidth || fitWidth + slideWidth > available) break;
            fitWidth += slideWidth;
            fitCount++;
        }
        return { width: fitWidth, slides: Math.max(1, fitCount) };
    };

    const onResize = () => {
        const s = latest.current;
        const fitted = fit();
        setFitting((prev) => (prev.width === fitted.width && prev.slides === fitted.slides ? prev : fitted));
        const engine = engineRef.current;
        if (!engine || !s.slides.length) return;
        if (s.visibleSlidesCount === 'auto') {
            // keep the shown slides filling the width
            const at = Math.max(0, Math.min(s.start, s.slides.length - fitted.slides));
            s.start = at;
            setStart(at);
        }
        // also a fixed number of slides: their width changed with the carousel's (Angular keeps the old offset)
        const slide = s.slides[s.start];
        if (slide) {
            engine.goToItem(slide);
            engine.active = slide;
        }
    };

    const onSwipe = (event: PanEndOutput<SlideRecord>) => {
        const s = latest.current;
        const index = s.slides.indexOf(event.item);
        if (index < 0 || index === s.start) return;
        const rtl = !!host.current && getComputedStyle(host.current).direction === 'rtl';
        const after = rtl && !s.vertical ? !event.after : event.after;
        keepLeaving(s.slides);
        s.start = index;
        setStart(index);
        notify(index, after ? 'Next' : 'Previous');
    };

    const handlers = useRef({ onResize, onSwipe });
    handlers.current = { onResize, onSwipe };

    useLayoutEffect(() => {
        const engine = new CarouselEngine<SlideRecord>(track.current!);
        engine.onActiveChange = (event) => handlers.current.onSwipe(event);
        engine.onDragStateChange = setDragging;
        engineRef.current = engine;
        const observer = new ResizeObserver(() => handlers.current.onResize());
        observer.observe(track.current!);
        observer.observe(container.current!);
        return () => {
            observer.disconnect();
            engine.destroy();
            clearTimeout(leaveTimer.current);
            engineRef.current = null;
        };
    }, []);

    useLayoutEffect(() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.config = {
            vertical,
            elementsAtOnce: count,
            gestureSupport: swipeEnabled,
            infinite: loop,
            transition: `${duration}ms`
        };
        engine.setGestures(swipeEnabled && total > 1);
    }, [vertical, count, swipeEnabled, loop, duration, total]);

    // a new visibleSlidesCount: keep the shown slides in range and report them, like upstream
    const previousCount = useRef<number | 'auto' | undefined>(undefined);
    useLayoutEffect(() => {
        const changed = previousCount.current !== undefined && previousCount.current !== visibleSlidesCount;
        previousCount.current = visibleSlidesCount;
        const s = latest.current;
        if (!changed || !s.slides.length) return;
        const last = Math.max(0, s.pages - 1);
        if (!s.loop && s.start > last) moveTo(last);
        else handlers.current.onResize();
        notify(s.start, 'None');
    }, [visibleSlidesCount]);

    // new slides: back to the first
    const engineSlides = useRef<readonly SlideRecord[]>([]);
    useLayoutEffect(() => {
        const engine = engineRef.current;
        if (!engine || sameSlides(engineSlides.current, slides)) return;
        engineSlides.current = slides;
        engine.setItems(slides);
        engine.resetOrder();
        engine.reset();
        latest.current.start = 0;
        setStart(0);
        handlers.current.onResize();
    }, [slides]);

    // children moved: the slides follow their order in the DOM
    useLayoutEffect(() => {
        setSlides((prev) => {
            const sorted = [...prev].sort(byDomOrder);
            return sameSlides(prev, sorted) ? prev : sorted;
        });
    }, [children]);

    const register = useCallback((slide: SlideRecord) => {
        setSlides((prev) => (prev.includes(slide) ? prev : [...prev, slide].sort(byDomOrder)));
    }, []);
    const unregister = useCallback((slide: SlideRecord) => {
        setSlides((prev) => (prev.includes(slide) ? prev.filter((s) => s !== slide) : prev));
    }, []);
    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    const fixedCount = visibleSlidesCount !== 'auto';
    const context = useMemo<CarouselContextValue>(
        () => ({
            register,
            unregister,
            refresh,
            slides,
            vertical,
            fixedCount,
            active: new Set(activeKey ? activeKey.split(',').map((i) => slides[Number(i)]) : []),
            shown: new Set(shownKey ? shownKey.split(',').map((i) => slides[Number(i)]) : [])
        }),
        [register, unregister, refresh, slides, vertical, fixedCount, activeKey, shownKey]
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const rtl = !!host.current && getComputedStyle(host.current).direction === 'rtl';
        let move: 'previous' | 'next' | null = null;
        if (event.key === 'ArrowLeft') move = rtl ? 'next' : 'previous';
        else if (event.key === 'ArrowRight') move = rtl ? 'previous' : 'next';
        else if (vertical && event.key === 'ArrowUp') move = 'previous';
        else if (vertical && event.key === 'ArrowDown') move = 'next';
        if (!move) return;
        event.preventDefault();
        if (move === 'previous') previous();
        else next();
        focus();
    };

    const pageLabel = (index: number) =>
        pageIndicatorLabel.replace('{itemNum}', String(index + 1)).replace('{totalNum}', String(total));

    const navigationButton = (which: 'previous' | 'next', inContent: boolean) => {
        const label = which === 'previous' ? previousLabel : nextLabel;
        return (
            <Button
                glyph={
                    which === 'previous'
                        ? vertical
                            ? 'slim-arrow-up'
                            : 'slim-arrow-left'
                        : vertical
                          ? 'slim-arrow-down'
                          : 'slim-arrow-right'
                }
                aria-label={label}
                title={label}
                disabled={which === 'previous' ? previousDisabled : nextDisabled}
                className={cn(
                    'm-1 size-[2.125rem] min-h-[2.125rem] min-w-0 shrink-0 rounded-[50%] p-0 compact:p-0 focus:after:rounded-[50%] [&+button]:ms-2',
                    inContent && [
                        'absolute z-1 m-0 hidden shadow-sap-content-shadow0 group-hover/carousel:flex',
                        vertical
                            ? [
                                  'start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
                                  which === 'previous' ? 'top-2' : 'bottom-2'
                              ]
                            : ['top-1/2 -translate-y-1/2', which === 'previous' ? 'start-2' : 'end-2']
                    ]
                )}
                onClick={(event) => {
                    if (which === 'previous') previous();
                    else next();
                    event.stopPropagation();
                }}
            />
        );
    };

    const showNavigation = navigation && pages > 1;

    const indicatorContainer = showIndicatorContainer && (
        <div
            className={cn(
                'm-0 box-border flex max-h-14 min-h-11 items-center justify-center border-0 border-t border-solid border-sap-list-border-color px-2 py-1.5',
                'first:border-t-0 first:border-b',
                noPaginationContainerBorder && 'border-transparent',
                INDICATOR_BACKGROUND[pageIndicatorBackground]
            )}
        >
            {showNavigation && navigatorInPageIndicator && navigationButton('previous', false)}
            {numeric ? (
                pageIndicator && (
                    <div className={INDICATORS}>
                        <div className="truncate text-center text-sap-page-footer-text-color" dir="ltr">
                            {start + 1} {ofLabel} {pages}
                        </div>
                    </div>
                )
            ) : pages > 1 ? (
                <div className={INDICATORS}>
                    {pageIndicator &&
                        Array.from({ length: pages }, (_, index) => (
                            <span
                                key={index}
                                role="img"
                                aria-label={pageLabel(index)}
                                className={index === start ? ACTIVE_DOT : DOT}
                            />
                        ))}
                </div>
            ) : null}
            {showNavigation && navigatorInPageIndicator && navigationButton('next', false)}
        </div>
    );

    return useRender({
        render,
        ref: ref ? [ref, host] : host,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            style: { width, ...style },
            className: cn('block max-w-full', className),
            onKeyDown: handleKeyDown,
            children: (
                <div
                    ref={container}
                    className={cn(
                        'group/carousel m-0 box-border flex h-full w-full max-w-full min-w-[15.5rem] flex-col p-0 font-sap-font-family text-sap-font-size',
                        // the focus frame goes around the whole carousel
                        'has-[[data-carousel-list]:focus-visible]:outline-sap has-[[data-carousel-list]:focus-visible]:outline-offset-0'
                    )}
                    style={{ height }}
                    onClick={focus}
                >
                    {pageIndicatorsOrientation === 'top' && indicatorContainer}
                    <div
                        className={cn(
                            'relative m-0 box-border max-w-full basis-full overflow-hidden p-0',
                            CONTENT_BACKGROUND[contentBackground]
                        )}
                        style={{ width: contentWidth }}
                    >
                        {showNavigation && !navigatorInPageIndicator && navigationButton('previous', true)}
                        {/* only the slides are in the listbox: buttons and indicators are not options */}
                        <div
                            ref={list}
                            data-carousel-list=""
                            role={total ? 'listbox' : undefined}
                            tabIndex={total ? 0 : undefined}
                            aria-roledescription={total ? 'Carousel' : undefined}
                            aria-label={ariaLabel}
                            aria-labelledby={ariaLabelledBy}
                            aria-describedby={ariaDescribedBy}
                            aria-activedescendant={activeSlides[0]?.id}
                            className="size-full overflow-hidden outline-none"
                        >
                            <div
                                ref={track}
                                data-carousel-track=""
                                className={cn(
                                    'm-0 box-border flex h-full min-h-fit p-0 transition-transform ease-in-out select-none motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] [-webkit-user-drag:none]',
                                    vertical ? 'flex-col touch-pan-x' : 'w-full touch-pan-y',
                                    visibleSlidesCount === 'auto' && !vertical && 'min-w-fit'
                                )}
                                style={{ '--carousel-count': count } as CSSProperties}
                            >
                                <CarouselContext value={context}>{children}</CarouselContext>
                            </div>
                        </div>
                        {showNavigation && !navigatorInPageIndicator && navigationButton('next', true)}
                    </div>
                    {pageIndicatorsOrientation === 'bottom' && indicatorContainer}
                    <div className="sr-only-sap" aria-live="polite">
                        {pages > 0 && `${readerLabel} ${start + 1} ${ofLabel} ${pages}`}
                    </div>
                </div>
            )
        }
    });
}
