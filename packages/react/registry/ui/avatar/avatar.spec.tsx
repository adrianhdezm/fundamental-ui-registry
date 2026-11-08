import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    Avatar,
    avatarInitials,
    labelColorAccent,
    type AvatarProps,
    type AvatarSize,
    type AvatarValueState
} from './avatar';

const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="red"/></svg>')}`;
const BACKUP = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="blue"/></svg>')}`;
const BROKEN = 'data:image/png;base64,AAAA';

interface HostProps extends Partial<AvatarProps> {
    clicks?: () => void;
    zooms?: () => void;
}

function Host({ clicks, zooms, ...props }: HostProps) {
    return (
        <div>
            <button id="before">Before</button>
            <Avatar id="main" label="John Doe" onAvatarClick={clicks} onZoomGlyphClick={zooms} {...props} />
            <span id="probe" />
        </div>
    );
}

async function until(condition: () => boolean) {
    for (let i = 0; i < 50 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 20));
}

async function setup(initial: HostProps = {}) {
    let current: HostProps = { clicks: vi.fn(), zooms: vi.fn(), ...initial };
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const avatar = root.querySelector<HTMLElement>('#main')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    // the pointer of an earlier test must not hover the avatar
    await userEvent.hover(root.querySelector<HTMLElement>('#before')!);
    return {
        avatar,
        clicks: current.clicks as ReturnType<typeof vi.fn>,
        zooms: current.zooms as ReturnType<typeof vi.fn>,
        /** The glyph of the avatar's own icon (not the badge). */
        glyph: () => avatar.querySelector<HTMLElement>('[data-glyph]:not(.absolute)')?.dataset['glyph'],
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

function resolveBackground(variable: string): string {
    const probe = document.createElement('span');
    probe.style.backgroundColor = `var(${variable})`;
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
}

/** Text shown in the avatar (the initials), without the hidden content. */
const shown = (avatar: HTMLElement) => avatar.querySelector(':scope > .contents')?.textContent?.trim() ?? '';

const char = (code: number) => String.fromCodePoint(code);
const PERSON_PLACEHOLDER = char(0xe0ca);

describe('Avatar', () => {
    it('renders initials from label, a glyph, or the image as background', async () => {
        const { avatar, glyph, resolve, update } = await setup();
        expect(avatar.textContent!.trim()).toBe('JD');
        expect(avatar.querySelector('[data-glyph]')).toBeNull();

        await update({ label: 'Ana María López' });
        expect(avatar.textContent!.trim()).toBe('AML');
        // more than three words, or no letters: the placeholder icon
        await update({ label: 'One Two Three Four' });
        expect(avatar.textContent!.trim()).toBe('');
        expect(glyph()).toBe(PERSON_PLACEHOLDER);
        expect(avatarInitials('1st Floor')).toBeNull();
        expect(avatarInitials('Ölaf Ünal')).toBe('ÖÜ');

        await update({ label: null, glyph: 'employee', 'aria-label': 'Employee' });
        expect(glyph()).toBe(char(0xe036));

        await update({ glyph: null, label: 'John Doe', image: IMAGE });
        await until(() => avatar.style.backgroundImage !== '');
        expect(getComputedStyle(avatar).backgroundImage).toContain('data:image/svg+xml');
        // the image replaces the initials
        expect(avatar.textContent!.trim()).toBe('');
        expect(avatar.querySelector('[data-glyph]')).toBeNull();
        expect(getComputedStyle(avatar).backgroundSize).toBe('cover');
        // a loaded image takes the lite background and border instead of the accent colour
        expect(getComputedStyle(avatar).backgroundColor).toBe(resolveBackground('--sapAvatar_Lite_Background'));
        expect(getComputedStyle(avatar).borderColor).toBe(resolve('--sapAvatar_Lite_BorderColor'));
    });

    it('falls back through alterIcon order (content, alt, backup image, default icon) when the image fails to load', async () => {
        const screen = await render(
            <div>
                <Avatar id="content" image={BROKEN} alterIcon="content|alt">
                    Jane Roe
                </Avatar>
                <Avatar id="alt" image={BROKEN} alterIcon="content|alt" alt="Max Mustermann" />
                <Avatar id="backup" image={BROKEN} alterIcon="backup" backupImage={BACKUP} aria-label="Backup" />
                <Avatar id="backup-broken" image={BROKEN} alterIcon="backup|alt" backupImage={BROKEN} alt="Ann Lee" />
                <Avatar id="default" image={BROKEN} alterIcon="default-icon|content" aria-label="Default">
                    Kim Ho
                </Avatar>
                <Avatar id="none" image={BROKEN} aria-label="None">
                    Kim Ho
                </Avatar>
            </div>
        );
        const root = screen.container;
        const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
        const glyph = (id: string) => get(id).querySelector<HTMLElement>('[data-glyph]')?.dataset['glyph'];
        const text = (id: string) => shown(get(id));
        await until(() => text('content') !== '' && get('backup').style.backgroundImage !== '');
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(text('content')).toBe('JR');
        expect(get('content').getAttribute('aria-label')).toBe('Jane Roe');
        // no content: the next option, alt
        expect(text('alt')).toBe('MM');
        expect(get('alt').getAttribute('aria-label')).toBe('Max Mustermann');
        expect(get('backup').style.backgroundImage).toContain('blue');
        expect(glyph('backup')).toBeUndefined();
        // a failing backup image ends at the placeholder icon
        expect(glyph('backup-broken')).toBe(PERSON_PLACEHOLDER);
        expect(text('backup-broken')).toBe('');
        expect(glyph('default')).toBe(PERSON_PLACEHOLDER);
        expect(text('default')).toBe('');
        expect(glyph('none')).toBe(PERSON_PLACEHOLDER);
        // the content itself stays hidden
        expect(get('none').querySelector<HTMLElement>('.hidden')!.getBoundingClientRect().width).toBe(0);
    });

    it('has role img with the aria-label, or is presentational without one', async () => {
        const { avatar, update } = await setup();
        expect(avatar.getAttribute('role')).toBe('img');
        // the label names the initials
        expect(avatar.getAttribute('aria-label')).toBe('John Doe');

        await update({ 'aria-label': 'Account of John' });
        expect(avatar.getAttribute('aria-label')).toBe('Account of John');

        await update({ 'aria-label': undefined, label: null, glyph: 'employee' });
        expect(avatar.getAttribute('role')).toBe('presentation');
        expect(avatar.hasAttribute('aria-label')).toBe(false);
        // the inner icon is decorative
        expect(avatar.querySelector('[data-glyph]')!.getAttribute('aria-hidden')).toBe('true');

        // aria-labelledby names it too; an explicit role wins (e.g. a button opening a popover)
        await update({ 'aria-labelledby': 'before' });
        expect(avatar.getAttribute('role')).toBe('img');
        await update({ role: 'link' });
        expect(avatar.getAttribute('role')).toBe('link');
    });

    it('clickable avatar is a button: focusable, Enter and Space call onAvatarClick', async () => {
        const { avatar, clicks, zooms, update } = await setup();
        expect(avatar.hasAttribute('tabindex')).toBe(false);
        await userEvent.click(avatar);
        expect(clicks).toHaveBeenCalledTimes(0);

        await update({ clickable: true });
        expect(avatar.getAttribute('role')).toBe('button');
        expect(avatar.getAttribute('tabindex')).toBe('0');
        expect(getComputedStyle(avatar).cursor).toBe('pointer');
        document.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(avatar);
        await userEvent.keyboard('{Enter}');
        expect(clicks).toHaveBeenCalledTimes(1);
        await userEvent.keyboard(' ');
        expect(clicks).toHaveBeenCalledTimes(2);
        await userEvent.click(avatar);
        expect(clicks).toHaveBeenCalledTimes(3);
        expect(zooms).toHaveBeenCalledTimes(0);
    });

    it('zoom glyph shows a badge that calls onZoomGlyphClick', async () => {
        const { avatar, clicks, zooms, update } = await setup();
        await update({ zoomGlyph: 'edit' });
        expect(avatar.getAttribute('role')).toBe('button');
        const badge = avatar.querySelector<HTMLElement>('[data-glyph]')!;
        const a = avatar.getBoundingClientRect();
        const b = badge.getBoundingClientRect();
        // at the bottom-end corner
        expect(b.right).toBeGreaterThan(a.right - b.width);
        expect(b.bottom).toBeGreaterThan(a.bottom - b.height);
        await userEvent.click(badge);
        expect(zooms).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(avatar);
        expect(avatar.getAttribute('tabindex')).toBe('0');
        // the whole avatar is the zoom button, also from the keyboard
        await userEvent.keyboard('{Enter}');
        expect(zooms).toHaveBeenCalledTimes(2);
        await userEvent.click(avatar, { position: { x: 5, y: 5 } });
        expect(zooms).toHaveBeenCalledTimes(3);
        expect(clicks).toHaveBeenCalledTimes(0);

        // clickable and zoom: one call of each per click
        await update({ clickable: true });
        await userEvent.click(badge);
        expect(zooms).toHaveBeenCalledTimes(4);
        expect(clicks).toHaveBeenCalledTimes(1);
    });

    it('size, circle, border, tile, transparent and colorAccent apply the expected token classes', async () => {
        const { avatar, resolve, update } = await setup();
        const sizes: [AvatarSize, number][] = [
            ['xs', 32],
            ['s', 48],
            ['m', 64],
            ['l', 80],
            ['xl', 112]
        ];
        for (const [size, px] of sizes) {
            await update({ size });
            const rect = avatar.getBoundingClientRect();
            expect([rect.width, rect.height]).toEqual([px, px]);
        }
        const style = () => getComputedStyle(avatar);
        // default accent 6
        expect(style().backgroundColor).toBe(resolve('--sapAvatar_6_Background'));
        expect(style().color).toBe(resolve('--sapAvatar_6_TextColor'));
        const radius = () => parseFloat(style().borderRadius);
        expect(radius()).toBeLessThan(56);

        await update({ circle: true });
        expect(radius()).toBeGreaterThanOrEqual(56);
        await update({ colorAccent: 3 });
        expect(style().backgroundColor).toBe(resolve('--sapAvatar_3_Background'));
        expect(style().color).toBe(resolve('--sapAvatar_3_TextColor'));
        await update({ border: true });
        expect(style().borderColor).toBe(resolve('--sapGroup_ContentBorderColor'));
        await update({ border: false, transparent: true });
        expect(style().backgroundColor).toBe(resolve('--sapAvatar_Lite_Background'));
        expect(style().color).toBe(resolve('--sapContent_IconColor'));
        // a border also on a transparent avatar
        await update({ border: true });
        expect(style().borderColor).toBe(resolve('--sapGroup_ContentBorderColor'));
        await update({ border: false });
        await update({ transparent: false, tile: true });
        expect(style().backgroundColor).toBe(resolve('--sapTile_Background'));
        expect(style().color).toBe(resolve('--sapTile_IconColor'));
    });

    it('contain scales the image to fit instead of covering', async () => {
        const { avatar, update } = await setup();
        await update({ image: IMAGE });
        await until(() => avatar.style.backgroundImage !== '');
        expect(getComputedStyle(avatar).backgroundSize).toBe('cover');
        await update({ contain: true });
        expect(getComputedStyle(avatar).backgroundSize).toBe('contain');
    });

    it('border wins over the loaded-image border, as fundamental-styles bordered thumbnails', async () => {
        const { avatar, resolve, update } = await setup({ circle: true, border: true });
        // the two tokens differ in Horizon (transparent against grey), so the test tells them apart
        expect(resolve('--sapGroup_ContentBorderColor')).not.toBe(resolve('--sapAvatar_Lite_BorderColor'));
        expect(getComputedStyle(avatar).borderColor).toBe(resolve('--sapGroup_ContentBorderColor'));
        await update({ image: IMAGE });
        await until(() => avatar.style.backgroundImage !== '');
        // the image still takes the lite background, but keeps the bordered colour
        expect(getComputedStyle(avatar).backgroundColor).toBe(resolveBackground('--sapAvatar_Lite_Background'));
        expect(getComputedStyle(avatar).borderColor).toBe(resolve('--sapGroup_ContentBorderColor'));
        // without border, the loaded image has the lite border again
        await update({ border: false });
        expect(getComputedStyle(avatar).borderColor).toBe(resolve('--sapAvatar_Lite_BorderColor'));
    });

    it('placeholder uses the image placeholder background and foreground tokens', async () => {
        const { avatar, resolve, update } = await setup();
        await update({ placeholder: true });
        const style = getComputedStyle(avatar);
        expect(style.backgroundColor).toBe(resolve('--sapContent_ImagePlaceholderBackground'));
        expect(style.color).toBe(resolve('--sapContent_ImagePlaceholderForegroundColor'));
    });

    it('colorIndication applies the indication background and text tokens; an accent wins over it', async () => {
        const { avatar, resolve, update } = await setup();
        const style = () => getComputedStyle(avatar);
        await update({ colorIndication: 5 });
        expect(style().backgroundColor).toBe(resolve('--sapIndicationColor_5_Background'));
        expect(style().color).toBe(resolve('--sapIndicationColor_5_TextColor'));
        expect(style().borderColor).toBe(resolve('--sapIndicationColor_5_BorderColor'));
        await update({ colorAccent: 2 });
        expect(style().backgroundColor).toBe(resolve('--sapAvatar_2_Background'));
    });

    it('valueState shows the state badge with its icon and colour instead of the zoom glyph', async () => {
        const { avatar, resolve, update } = await setup();
        const badge = () => avatar.querySelector<HTMLElement>('[data-glyph].absolute');
        expect(badge()).toBeNull();
        const states: [AvatarValueState, string, string, string][] = [
            ['positive', 'sys-enter-2', '--sapSuccessBackground', '--sapPositiveTextColor'],
            ['caution', 'warning', '--sapWarningBackground', '--sapCriticalTextColor'],
            ['negative', 'error', '--sapErrorBackground', '--sapNegativeTextColor'],
            ['information', 'information', '--sapInformationBackground', '--sapInformativeTextColor']
        ];
        for (const [valueState, glyph, background, color] of states) {
            await update({ valueState });
            expect(badge()!.dataset['glyph']).toBe(iconGlyphChar(glyph));
            expect(getComputedStyle(badge()!).backgroundColor).toBe(resolveBackground(background));
            expect(getComputedStyle(badge()!).color).toBe(resolve(color));
        }
        // at the bottom-end corner, and it replaces the zoom glyph
        await update({ zoomGlyph: 'edit' });
        expect(avatar.querySelectorAll('[data-glyph].absolute').length).toBe(1);
        expect(badge()!.dataset['glyph']).toBe(iconGlyphChar('information'));
        const a = avatar.getBoundingClientRect();
        const b = badge()!.getBoundingClientRect();
        expect(b.right).toBeGreaterThan(a.right - b.width);
        expect(b.bottom).toBeGreaterThan(a.bottom - b.height);
    });

    it('random color accent is stable for the same label', async () => {
        const colors = async () => {
            const screen = await render(
                <div>
                    <Avatar random label="Jane Doe" />
                    <Avatar random label="Jane Doe" />
                    <Avatar random label="Grace Hopper" />
                </div>
            );
            const result = [...screen.container.querySelectorAll('[role=img]')].map(
                (el) => getComputedStyle(el).backgroundColor
            );
            await screen.unmount();
            return result;
        };
        const first = await colors();
        expect(first[0]).toBe(first[1]);
        expect(await colors()).toEqual(first);
        expect(labelColorAccent('Jane Doe')).toBe(labelColorAccent('Jane Doe'));
        // names spread over the palette
        const accents = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(labelColorAccent));
        expect(accents.size).toBeGreaterThan(5);
        for (const accent of accents) expect(accent >= 1 && accent <= 10).toBe(true);
    });

    it('returns to a previously loaded URL at once, from the browser image cache, without the initials', async () => {
        const { avatar, update } = await setup({ image: IMAGE });
        await until(() => avatar.style.backgroundImage.includes('red'));
        await update({ image: BACKUP });
        await until(() => avatar.style.backgroundImage.includes('blue'));

        await update({ image: IMAGE });
        expect(avatar.style.backgroundImage).toContain('red');
        expect(shown(avatar)).toBe('');
    });

    it('reports the image loading status', async () => {
        const statuses: string[] = [];
        const { avatar, update } = await setup({ onImageLoadingStatusChange: (status) => statuses.push(status) });
        // an image no earlier test loaded, so it is not in the browser's cache
        const green = IMAGE.replace('red', 'green');
        await update({ image: green });
        await until(() => avatar.style.backgroundImage !== '');
        expect(statuses).toEqual(['loading', 'loaded']);
        await update({ image: BROKEN });
        await until(() => statuses.length === 4);
        expect(statuses.slice(2)).toEqual(['loading', 'error']);
    });

    // fundamental-react
    it('passes className, native props and the ref through; role presentation without a name', async () => {
        const ref = createRef<HTMLSpanElement>();
        const screen = await render(<Avatar ref={ref} className="m-1" data-sample="Sample" title="Hint" />);
        const avatar = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(avatar.getAttribute('data-sample')).toBe('Sample');
        expect(avatar.getAttribute('title')).toBe('Hint');
        expect(avatar.classList).toContain('m-1');
        expect(ref.current).toBe(avatar);
        expect(avatar.tagName).toBe('SPAN');
        expect(avatar.getAttribute('role')).toBe('presentation');
        // an id by default, as Angular's
        expect(avatar.id).toMatch(/^fd-avatar-/);
    });
});

/** Stands in for `Image`: records each request and lets the test decide when it loads or fails. */
class FakeImage {
    static requests: FakeImage[] = [];
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private url = '';
    set src(url: string) {
        this.url = url;
        FakeImage.requests.push(this);
    }
    get src(): string {
        return this.url;
    }
    load(): void {
        this.onload?.();
    }
    fail(): void {
        this.onerror?.();
    }
}

interface ImageHostProps {
    ids?: number[];
    image?: string | null;
    label?: string;
    size?: AvatarSize;
    alterIcon?: string | null;
    backup?: string | null;
}

function ImageHost({ ids = [1], image = null, label = 'John Doe', size = 'l', alterIcon, backup }: ImageHostProps) {
    return (
        <div>
            {ids.map((id) => (
                <Avatar
                    key={id}
                    id={`avatar-${id}`}
                    image={image}
                    label={label}
                    size={size}
                    alterIcon={alterIcon}
                    backupImage={backup}
                    aria-label="Photo"
                />
            ))}
        </div>
    );
}

describe('Avatar image loading', () => {
    beforeEach(() => {
        FakeImage.requests = [];
        vi.stubGlobal('Image', FakeImage);
    });
    afterEach(() => vi.unstubAllGlobals());

    async function setupImages() {
        let current: ImageHostProps = {};
        const screen = await render(<ImageHost />);
        const root = screen.container;
        return {
            avatar: (id = 1) => root.querySelector<HTMLElement>(`#avatar-${id}`)!,
            urls: () => FakeImage.requests.map((r) => r.src),
            update: async (change: ImageHostProps = {}) => {
                current = { ...current, ...change };
                await screen.rerender(<ImageHost {...current} />);
            }
        };
    }

    it('loads an image once and does not reload when the same URL is set again or the avatar re-renders', async () => {
        const { avatar, urls, update } = await setupImages();
        expect(urls()).toEqual([]);
        await update({ image: '/photo.png' });
        expect(urls()).toEqual(['/photo.png']);
        // initials until the image arrives
        expect(avatar().textContent!.trim()).toBe('JD');
        FakeImage.requests[0].load();
        await update();
        expect(avatar().style.backgroundImage).toContain('/photo.png');

        await update({ image: '/photo.png' });
        await update({ label: 'Jane Roe' });
        await update({ size: 's' });
        // the same URL built from parts is still the same URL
        await update({ image: ['', 'photo.png'].join('/') });
        expect(urls()).toEqual(['/photo.png']);

        // each avatar requests its image once
        FakeImage.requests = [];
        await update({ image: '/team.png', ids: [1, 2, 3] });
        expect(urls()).toEqual(['/team.png', '/team.png', '/team.png']);
    });

    it('ignores a slower earlier image when the URL changes quickly', async () => {
        const { avatar, update } = await setupImages();
        await update({ image: '/slow.png' });
        await update({ image: '/fast.png' });
        const [slow, fast] = FakeImage.requests;
        fast.load();
        await update();
        expect(avatar().style.backgroundImage).toContain('/fast.png');
        // the earlier request finishing late does not replace the current image
        slow.load();
        await update();
        expect(avatar().style.backgroundImage).toContain('/fast.png');

        // nor does a late failure of an earlier request trigger the fallback
        await update({ image: '/broken.png' });
        await update({ image: '/third.png' });
        const [broken, third] = FakeImage.requests.slice(2);
        third.load();
        broken.fail();
        await update();
        expect(avatar().style.backgroundImage).toContain('/third.png');
        expect(avatar().querySelector('[data-glyph]')).toBeNull();
    });

    it('a failing image is requested only once before falling back', async () => {
        const { avatar, urls, update } = await setupImages();
        await update({ alterIcon: 'backup', backup: '/backup.png', image: '/missing.png' });
        FakeImage.requests[0].fail();
        await update();
        expect(urls()).toEqual(['/missing.png', '/backup.png']);
        FakeImage.requests[1].fail();
        await update();
        // the default icon, and no new attempt on re-render or for the same URL
        expect(avatar().querySelector('[data-glyph]')).not.toBeNull();
        await update({ size: 'm' });
        await update({ image: '/missing.png' });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(urls()).toEqual(['/missing.png', '/backup.png']);
    });
});
