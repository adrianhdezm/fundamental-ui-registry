import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { ListContent } from '@/ui/list/list';
import {
    UploadCollection,
    UploadCollectionButtonGroup,
    UploadCollectionDescription,
    UploadCollectionFormItem,
    UploadCollectionItem,
    UploadCollectionStatusGroup,
    UploadCollectionStatusItem,
    UploadCollectionTextSeparator,
    UploadCollectionThumbnail,
    UploadCollectionTitle,
    UploadCollectionTitleContainer,
    type UploadCollectionButtonGroupProps
} from './upload-collection';

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const titles = () =>
    [...document.querySelectorAll<HTMLElement>('[data-upload-collection-title]')].map((t) => t.textContent!.trim());
const groupButtons = () => [
    ...document.querySelectorAll<HTMLButtonElement>('[data-slot=upload-collection-button-group] button')
];
const button = (name: string, index = 0) =>
    groupButtons().filter((b) => (b.getAttribute('aria-label') ?? b.textContent!.trim()) === name)[index];
const field = () => document.querySelector<HTMLInputElement>('[data-slot=upload-collection-form-item] input');

interface HostFile {
    id: number;
    name: string;
}

/** Angular's host: files that can be renamed and deleted, in a container of the given width. */
function Host({
    width = 800,
    initial,
    onRenamed
}: {
    width?: number;
    initial?: HostFile[];
    onRenamed?: (name: string) => void;
}) {
    const [files, setFiles] = useState<HostFile[]>(
        initial ?? [
            { id: 1, name: 'Report' },
            { id: 2, name: 'A_very_long_file_name_that_needs_to_be_shortened_in_the_middle' }
        ]
    );
    return (
        <div style={{ width }}>
            <UploadCollection>
                {files.map((file) => (
                    <UploadCollectionItem
                        key={file.id}
                        fileName={file.name}
                        extension="pdf"
                        onFileNameChange={(name) => {
                            setFiles((list) => list.map((f) => (f === file ? { ...f, name } : f)));
                            onRenamed?.(name);
                        }}
                        onDelete={() => setFiles((list) => list.filter((f) => f !== file))}
                    >
                        <ListContent>
                            <UploadCollectionTitleContainer>
                                <UploadCollectionTitle />
                                <UploadCollectionFormItem />
                                <span data-marker="">M</span>
                            </UploadCollectionTitleContainer>
                        </ListContent>
                        <UploadCollectionButtonGroup />
                    </UploadCollectionItem>
                ))}
            </UploadCollection>
            <span id="names">{files.map((f) => f.name).join(',')}</span>
        </div>
    );
}

interface ConfigProps extends UploadCollectionButtonGroupProps {
    small?: boolean;
    selection?: boolean;
    onDraft?: (value: string) => void;
}

/** Angular's ConfigHost: one file with the button and layout options. */
function ConfigHost({ small = false, selection = false, onDraft, ...buttons }: ConfigProps) {
    const [checked, setChecked] = useState(false);
    return (
        <div style={{ width: 500 }}>
            <UploadCollection small={small} selection={selection}>
                <UploadCollectionItem defaultFileName="Report" extension="pdf">
                    {selection && (
                        <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Select Report.pdf" />
                    )}
                    <ListContent>
                        <UploadCollectionTitleContainer>
                            <UploadCollectionTitle />
                            <UploadCollectionFormItem onValueChange={onDraft} />
                        </UploadCollectionTitleContainer>
                    </ListContent>
                    <UploadCollectionButtonGroup {...buttons} />
                </UploadCollectionItem>
            </UploadCollection>
        </div>
    );
}

describe('UploadCollection', () => {
    it('is a list of files with their names and extensions', async () => {
        const screen = await render(<Host />);
        const list = screen.container.querySelector('[data-upload-collection]')!;
        expect(list.tagName).toBe('UL');
        expect(list.getAttribute('role')).toBe('list');
        expect(list.getAttribute('aria-label')).toBe('Uploaded files');
        expect(list.querySelector('li')!.getAttribute('role')).toBe('listitem');
        expect(titles()[0]).toBe('Report.pdf');
        expect(document.querySelector('[data-upload-collection-title]')!.getAttribute('title')).toBe('Report.pdf');
    });

    it('shortens long names in the middle, keeping the extension', async () => {
        await render(<Host width={320} />);
        await wait();
        const title = titles()[1];
        expect(title).toContain('...');
        expect(title.endsWith('.pdf')).toBe(true);
        expect(document.querySelectorAll('[data-upload-collection-title]')[1].getAttribute('title')).toBe(
            'A_very_long_file_name_that_needs_to_be_shortened_in_the_middle.pdf'
        );
    });

    it('fits the name again when the container is resized', async () => {
        const ui = (width: number) => <Host width={width} />;
        const screen = await render(ui(320));
        await wait();
        expect(titles()[1]).toContain('...');
        await screen.rerender(ui(1400));
        await expect.poll(() => titles()[1]).toBe('A_very_long_file_name_that_needs_to_be_shortened_in_the_middle.pdf');
    });

    it('renames a file in place', async () => {
        const onRenamed = vi.fn();
        await render(<Host onRenamed={onRenamed} />);
        await userEvent.click(button('Edit'));
        const input = field()!;
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('Report');
        expect(input.getAttribute('aria-label')).toBe('Filename');
        expect(input.placeholder).toBe('Filename');
        // the title gives way to the field, followed by the extension
        expect(getComputedStyle(document.querySelector('[data-upload-collection-title]')!).display).toBe('none');
        expect(input.nextElementSibling!.textContent).toBe('.pdf');
        // the markers give way to the field too
        const marker = document.querySelector('[data-marker]')!;
        expect(getComputedStyle(marker).display).toBe('none');
        expect(
            [
                ...document.querySelectorAll('[data-slot=upload-collection-button-group]')[0].querySelectorAll('button')
            ].map((b) => b.textContent!.trim())
        ).toEqual(['Ok', 'Cancel']);
        await userEvent.clear(input);
        expect(button('Ok').disabled).toBe(true);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        // an empty name is not applied
        await userEvent.keyboard('{Enter}');
        expect(field()).not.toBeNull();
        await userEvent.type(input, 'Summary{Enter}');
        await expect.poll(() => titles()[0]).toBe('Summary.pdf');
        expect(onRenamed).toHaveBeenCalledWith('Summary');
        expect(document.querySelector('#names')!.textContent!.split(',')[0]).toBe('Summary');
        expect(field()).toBeNull();
        expect(getComputedStyle(document.querySelector('[data-marker]')!).display).not.toBe('none');
        expect(document.activeElement).toBe(button('Edit'));
    });

    it('renames with the Ok button', async () => {
        await render(<Host />);
        await userEvent.click(button('Edit'));
        await userEvent.clear(field()!);
        await userEvent.type(field()!, '  Draft  ');
        await userEvent.click(button('Ok'));
        // the name is trimmed
        await expect.poll(() => titles()[0]).toBe('Draft.pdf');
        expect(document.activeElement).toBe(button('Edit'));
    });

    it('cancels a rename with Escape', async () => {
        await render(<Host />);
        await userEvent.click(button('Edit'));
        await userEvent.type(field()!, 'x{Escape}');
        await wait();
        expect(document.querySelector('#names')!.textContent!.split(',')[0]).toBe('Report');
        expect(titles()[0]).toBe('Report.pdf');
        expect(document.activeElement).toBe(button('Edit'));
    });

    it('deletes a file', async () => {
        await render(<Host />);
        await userEvent.click(button('Delete'));
        await expect.poll(() => titles()).toHaveLength(1);
        expect(document.querySelector('#names')!.textContent).toBe(
            'A_very_long_file_name_that_needs_to_be_shortened_in_the_middle'
        );
    });

    it('renders a file name with markup as text, also after a rename', async () => {
        const screen = await render(
            <Host initial={[{ id: 1, name: '<img src="x" onerror="window.__ucXss = true">' }]} />
        );
        await wait();
        expect(screen.container.querySelector('[data-upload-collection-title] img')).toBeNull();
        expect(titles()[0]).toBe('<img src="x" onerror="window.__ucXss = true">.pdf');

        await userEvent.click(button('Edit'));
        await userEvent.clear(field()!);
        await userEvent.type(field()!, '<b>bold</b>{Enter}');
        await expect.poll(() => titles()[0]).toBe('<b>bold</b>.pdf');
        expect(screen.container.querySelector('[data-upload-collection-title] b')).toBeNull();
        expect((window as { __ucXss?: boolean }).__ucXss).toBeUndefined();
    });

    describe('buttons, layout and selection', () => {
        const labels = () => groupButtons().map((b) => b.getAttribute('aria-label') ?? b.textContent!.trim());

        it('hides the buttons with allowFileNameEdit and allowFileDeletion', async () => {
            const screen = await render(<ConfigHost />);
            expect(labels()).toEqual(['Edit', 'Delete']);
            await screen.rerender(<ConfigHost allowFileDeletion={false} />);
            expect(labels()).toEqual(['Edit']);
            await screen.rerender(<ConfigHost allowFileDeletion={false} allowFileNameEdit={false} />);
            expect(labels()).toEqual([]);
        });

        it('disables the buttons with disableFileNameEdit and disableFileDeletion', async () => {
            await render(<ConfigHost disableFileNameEdit disableFileDeletion />);
            expect(button('Edit').disabled).toBe(true);
            expect(button('Delete').disabled).toBe(true);
            await userEvent.click(button('Edit'), { force: true });
            expect(field()).toBeNull();
        });

        it('takes custom labels and reports the button clicks', async () => {
            const onEditClick = vi.fn();
            const onOkClick = vi.fn();
            const onDeleteClick = vi.fn();
            await render(
                <ConfigHost
                    editLabel="Rename"
                    deleteLabel="Remove"
                    okText="Apply"
                    cancelText="Discard"
                    onEditClick={onEditClick}
                    onOkClick={onOkClick}
                    onDeleteClick={onDeleteClick}
                />
            );
            expect(labels()).toEqual(['Rename', 'Remove']);
            await userEvent.click(button('Remove'));
            expect(onDeleteClick).toHaveBeenCalledTimes(1);
            await userEvent.click(button('Rename'));
            expect(onEditClick).toHaveBeenLastCalledWith(true);
            expect(labels()).toEqual(['Apply', 'Discard']);
            await userEvent.click(button('Discard'));
            expect(onEditClick).toHaveBeenLastCalledWith(false);
            await userEvent.click(button('Rename'));
            await userEvent.click(button('Apply'));
            expect(onOkClick).toHaveBeenCalledTimes(1);
            expect(titles()[0]).toBe('Report.pdf');
        });

        it('discards a rename with Cancel', async () => {
            await render(<Host />);
            await userEvent.click(button('Edit'));
            await userEvent.type(field()!, 'x');
            await userEvent.click(button('Cancel'));
            await wait();
            expect(document.querySelector('#names')!.textContent!.split(',')[0]).toBe('Report');
            expect(titles()[0]).toBe('Report.pdf');
            expect(field()).toBeNull();
            expect(document.activeElement).toBe(button('Edit'));
        });

        it('reports the edited name with onValueChange of the form item', async () => {
            const onDraft = vi.fn();
            await render(<ConfigHost onDraft={onDraft} />);
            await userEvent.click(button('Edit'));
            await userEvent.clear(field()!);
            await userEvent.type(field()!, 'Summary');
            expect(onDraft).toHaveBeenLastCalledWith('Summary');
        });

        it('wraps the buttons below the file in small mode', async () => {
            const screen = await render(<ConfigHost />);
            const group = screen.container.querySelector<HTMLElement>('[data-slot=upload-collection-button-group]')!;
            const content = screen.container.querySelector<HTMLElement>('[data-slot=list-content]')!;
            expect(group.getBoundingClientRect().top).toBeLessThan(content.getBoundingClientRect().bottom);
            await screen.rerender(<ConfigHost small />);
            expect(screen.container.querySelector('[data-upload-collection]')!.hasAttribute('data-small')).toBe(true);
            expect(group.getBoundingClientRect().top).toBeGreaterThanOrEqual(content.getBoundingClientRect().bottom);
            expect(group.getBoundingClientRect().width).toBeGreaterThan(400);
            // the file keeps its line, even without a thumbnail
            expect(content.getBoundingClientRect().width).toBeGreaterThan(400);
        });

        it('marks items as selected with selection', async () => {
            const screen = await render(<ConfigHost selection />);
            const item = screen.container.querySelector<HTMLElement>('[data-upload-collection-item]')!;
            const description = () =>
                document.getElementById(item.getAttribute('aria-describedby')!)!.textContent!.trim();
            expect(item.getAttribute('role')).toBe('listitem');
            expect(screen.container.querySelector('[data-upload-collection]')!.getAttribute('role')).toBe('list');
            expect(item.hasAttribute('data-selected')).toBe(false);
            expect(description()).toBe('Not selected');
            await userEvent.click(screen.container.querySelector<HTMLElement>('[data-slot=checkbox]')!);
            await expect.poll(() => item.hasAttribute('data-selected')).toBe(true);
            expect(description()).toBe('Selected');
            // the buttons do not toggle the selection
            await userEvent.click(button('Edit'));
            await userEvent.click(field()!);
            await userEvent.click(button('Cancel'));
            expect(item.hasAttribute('data-selected')).toBe(true);
            // a click on the item and Space on it toggle it
            await userEvent.click(item, { position: { x: 300, y: 70 } });
            await expect.poll(() => item.hasAttribute('data-selected')).toBe(false);
            item.focus();
            await userEvent.keyboard(' ');
            await expect.poll(() => item.hasAttribute('data-selected')).toBe(true);
        });
    });

    it('lays out descriptions, separators, statuses and the thumbnail', async () => {
        const screen = await render(
            <UploadCollection aria-label="Files">
                <UploadCollectionItem defaultFileName="Report" extension="pdf">
                    <UploadCollectionThumbnail id="thumb">T</UploadCollectionThumbnail>
                    <ListContent>
                        <UploadCollectionTitleContainer>
                            <UploadCollectionTitle />
                        </UploadCollectionTitleContainer>
                        <UploadCollectionDescription id="desc">
                            Uploaded <UploadCollectionTextSeparator id="sep" /> 1 MB
                        </UploadCollectionDescription>
                        <UploadCollectionStatusGroup>
                            <UploadCollectionStatusItem id="status" status="positive" label="Approved" />
                        </UploadCollectionStatusGroup>
                    </ListContent>
                </UploadCollectionItem>
            </UploadCollection>
        );
        const list = screen.container.querySelector('[data-upload-collection]')!;
        expect(list.getAttribute('aria-label')).toBe('Files');
        expect(getComputedStyle(screen.container.querySelector('#thumb')!).alignSelf).toBe('flex-start');
        expect(screen.container.querySelector('#sep')!.getAttribute('aria-hidden')).toBe('true');
        expect(getComputedStyle(screen.container.querySelector('#sep')!, '::before').content).toBe('"•"');
        expect(getComputedStyle(screen.container.querySelector('#desc')!).textOverflow).toBe('ellipsis');
        expect(screen.container.querySelector('#status')!.textContent).toContain('Approved');
    });

    it('passes className, native props and the ref to the list and the items', async () => {
        const listRef = createRef<HTMLUListElement>();
        const itemRef = createRef<HTMLLIElement>();
        const screen = await render(
            <UploadCollection ref={listRef} className="custom" data-testid="uc">
                <UploadCollectionItem ref={itemRef} className="item" data-testid="file" defaultFileName="A" />
            </UploadCollection>
        );
        const list = screen.container.querySelector<HTMLUListElement>('ul')!;
        expect(listRef.current).toBe(list);
        expect(list.classList.contains('custom')).toBe(true);
        expect(list.dataset['testid']).toBe('uc');
        expect(itemRef.current).toBe(list.querySelector('li'));
        expect(itemRef.current!.classList.contains('item')).toBe(true);
        expect(itemRef.current!.dataset['testid']).toBe('file');
    });
});
