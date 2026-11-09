import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    FileUploader,
    FileUploaderDragndrop,
    parseFileSize,
    validateFiles,
    type FileUploaderActions,
    type FileUploaderProps
} from './file-uploader';

const file = (name: string, size = 10) => new File(['x'.repeat(size)], name);
const transfer = (files: File[]) => {
    const data = new DataTransfer();
    files.forEach((f) => data.items.add(f));
    return data;
};
const namesOf = (files?: File[]) => (files ?? []).map((f) => f.name);

function parts(container: HTMLElement) {
    return {
        root: container.querySelector<HTMLElement>('[data-slot=file-uploader]')!,
        field: container.querySelector<HTMLInputElement>('input[type=text]')!,
        button: container.querySelector<HTMLButtonElement>('button')!,
        fileInput: container.querySelector<HTMLInputElement>('input[type=file]')!,
        dropZone: container.querySelector<HTMLElement>('[data-slot=file-uploader-dragndrop]')!
    };
}

/** Chooses files in the file input, as the file dialog does. */
function choose(fileInput: HTMLInputElement, files: File[]) {
    fileInput.files = transfer(files).files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}

function drop(target: HTMLElement, files: File[]) {
    const event = new DragEvent('drop', { dataTransfer: transfer(files), bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

/** Angular's host: a labelled uploader with a model and the invalid files. */
function Host(props: FileUploaderProps & { onFiles?: (files: File[]) => void; onInvalid?: (files: File[]) => void }) {
    const { onFiles, onInvalid, ...rest } = props;
    const [files, setFiles] = useState<File[]>([]);
    return (
        <>
            <FileUploader
                aria-label="Document"
                placeholder="Select a file"
                accept=".png,.pdf"
                maxFileSize="1 KB"
                value={files}
                onValueChange={(next) => {
                    setFiles(next);
                    onFiles?.(next);
                }}
                onInvalidFilesChange={onInvalid}
                {...rest}
            />
            <span id="model">{namesOf(files).join(',')}</span>
        </>
    );
}

describe('parseFileSize', () => {
    it('reads sizes with units', () => {
        expect(parseFileSize('')).toBe(0);
        expect(parseFileSize('500')).toBe(500);
        expect(parseFileSize('2 KB')).toBe(2048);
        expect(parseFileSize('1.5MB')).toBe(1.5 * 1024 * 1024);
        expect(() => parseFileSize('big')).toThrow();
    });
});

describe('validateFiles', () => {
    it('splits files by size and extension', () => {
        const result = validateFiles([file('a.png'), file('b.txt'), file('c.PDF', 2000)], '', '1 KB', '.png, .pdf');
        expect(namesOf(result.validFiles)).toEqual(['a.png']);
        expect(namesOf(result.invalidFiles)).toEqual(['b.txt', 'c.PDF']);
    });

    it('rejects files below minFileSize, alone and between min and max with an extension filter', () => {
        const files = [file('tiny.png', 100), file('mid.png', 1500), file('mid.txt', 1500), file('big.png', 3000)];

        const minOnly = validateFiles(files, '1 KB', '', null);
        expect(namesOf(minOnly.validFiles)).toEqual(['mid.png', 'mid.txt', 'big.png']);
        expect(namesOf(minOnly.invalidFiles)).toEqual(['tiny.png']);

        const range = validateFiles(files, '1 KB', '2 KB', '.png');
        expect(namesOf(range.validFiles)).toEqual(['mid.png']);
        expect(namesOf(range.invalidFiles)).toEqual(['tiny.png', 'mid.txt', 'big.png']);
    });
});

describe('FileUploader', () => {
    it('shows chosen files and reports the valid ones', async () => {
        const onInvalid = vi.fn();
        const screen = await render(<Host onInvalid={onInvalid} />);
        const { field, fileInput } = parts(screen.container);
        expect(field.getAttribute('placeholder')).toBe('Select a file');
        expect(fileInput.multiple).toBe(true);
        expect(fileInput.getAttribute('accept')).toBe('.png,.pdf');
        choose(fileInput, [file('one.png'), file('two.txt')]);
        await expect.poll(() => field.value).toBe('one.png');
        expect(screen.container.querySelector('#model')!.textContent).toBe('one.png');
        expect(namesOf(onInvalid.mock.lastCall![0])).toEqual(['two.txt']);
        expect(field.title).toBe('one.png');
        expect(document.activeElement).toBe(field);
    });

    it('accepts dropped files', async () => {
        const screen = await render(<Host />);
        const { dropZone, field } = parts(screen.container);
        const event = drop(dropZone, [file('drop.pdf')]);
        expect(event.defaultPrevented).toBe(true);
        await expect.poll(() => screen.container.querySelector('#model')!.textContent).toBe('drop.pdf');
        expect(field.value).toBe('drop.pdf');
    });

    it('opens the file dialog from the field with click, Enter and Space, and ignores typing', async () => {
        const screen = await render(<Host />);
        const { field, fileInput } = parts(screen.container);
        const click = vi.spyOn(fileInput, 'click').mockImplementation(() => undefined);
        field.focus();
        await userEvent.keyboard('abc');
        expect(field.value).toBe('');
        expect(click).not.toHaveBeenCalled();
        await userEvent.keyboard('{Enter}');
        expect(click).toHaveBeenCalledTimes(1);
        await userEvent.keyboard(' ');
        expect(click).toHaveBeenCalledTimes(2);
        await userEvent.click(field);
        expect(click).toHaveBeenCalledTimes(3);
        // Tab still leaves the field, to the button
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(parts(screen.container).button);
    });

    it('clears the files from the app and with clear()', async () => {
        const actions = createRef<FileUploaderActions>();
        const onFiles = vi.fn();
        const screen = await render(<Host actionsRef={actions} onFiles={onFiles} />);
        const { field, fileInput } = parts(screen.container);
        choose(fileInput, [file('one.png')]);
        await expect.poll(() => field.value).toBe('one.png');
        actions.current!.clear();
        await expect.poll(() => field.value).toBe('');
        expect(onFiles).toHaveBeenLastCalledWith([]);
        expect(screen.container.querySelector('#model')!.textContent).toBe('');
        expect(fileInput.value).toBe('');
        // nothing to clear: no callback
        onFiles.mockClear();
        actions.current!.clear();
        expect(onFiles).not.toHaveBeenCalled();
    });

    it('follows a controlled value, and an empty value empties the file input', async () => {
        const ui = (value: File[]) => <FileUploader aria-label="Attachment" value={value} />;
        const screen = await render(ui([file('a.png'), file('b.png')]));
        const { field, fileInput } = parts(screen.container);
        expect(field.value).toBe('a.png b.png');
        // the names are shown in full, not as a placeholder
        expect(field.className).toContain('placeholder:not-italic');
        choose(fileInput, [file('c.png')]);
        // controlled: the field keeps the app's value until it changes
        await expect.poll(() => field.value).toBe('a.png b.png');
        expect(fileInput.files!.length).toBe(1);
        await screen.rerender(ui([]));
        expect(field.value).toBe('');
        expect(fileInput.value).toBe('');
    });

    it('works uncontrolled with defaultValue', async () => {
        const screen = await render(<FileUploader aria-label="Attachment" defaultValue={[file('start.pdf')]} />);
        const { field, fileInput } = parts(screen.container);
        expect(field.value).toBe('start.pdf');
        choose(fileInput, [file('next.pdf')]);
        await expect.poll(() => field.value).toBe('next.pdf');
    });

    it('disables the field and the button', async () => {
        const ui = (disabled: boolean) => <FileUploader aria-label="Attachment" disabled={disabled} />;
        const screen = await render(ui(true));
        const { field, button, fileInput, dropZone } = parts(screen.container);
        const click = vi.spyOn(fileInput, 'click').mockImplementation(() => undefined);
        expect(field.disabled).toBe(true);
        expect(button.disabled).toBe(true);
        expect(fileInput.disabled).toBe(true);
        await userEvent.click(button, { force: true });
        expect(click).not.toHaveBeenCalled();
        // no drop target while disabled
        const over = new DragEvent('dragover', { bubbles: true, cancelable: true });
        dropZone.dispatchEvent(over);
        expect(over.defaultPrevented).toBe(false);
        drop(dropZone, [file('a.png')]);
        expect(field.value).toBe('');
        await screen.rerender(ui(false));
        expect(field.disabled).toBe(false);
        await userEvent.click(button);
        expect(click).toHaveBeenCalledTimes(1);
    });

    it('fixes the field to the given width and truncates long names', async () => {
        const ui = (width: string | null) => (
            <div style={{ width: 600 }}>
                <FileUploader aria-label="Attachment" placeholder="Select a file" width={width} />
            </div>
        );
        const screen = await render(ui(null));
        const { field, fileInput } = parts(screen.container);
        expect(field.getBoundingClientRect().width).toBeGreaterThan(300);
        await screen.rerender(ui('150px'));
        expect(field.getBoundingClientRect().width).toBe(150);
        choose(fileInput, [file('a_very_long_file_name_that_does_not_fit_in_the_field.pdf')]);
        await expect.poll(() => field.value).toBe('a_very_long_file_name_that_does_not_fit_in_the_field.pdf');
        expect(field.getBoundingClientRect().width).toBe(150);
        expect(getComputedStyle(field).textOverflow).toBe('ellipsis');
        expect(field.scrollWidth).toBeGreaterThan(field.clientWidth);
        expect(field.title).toBe('a_very_long_file_name_that_does_not_fit_in_the_field.pdf');
    });

    it('rejects all chosen files when there are more than fileLimit', async () => {
        const onInvalid = vi.fn();
        const screen = await render(<Host accept={null} maxFileSize={null} fileLimit={2} onInvalid={onInvalid} />);
        const { fileInput } = parts(screen.container);
        const model = screen.container.querySelector('#model')!;
        choose(fileInput, [file('a.png'), file('b.png'), file('c.png')]);
        await expect.poll(() => onInvalid.mock.calls.length).toBe(1);
        expect(model.textContent).toBe('');
        expect(namesOf(onInvalid.mock.lastCall![0])).toEqual(['a.png', 'b.png', 'c.png']);
        choose(fileInput, [file('a.png'), file('b.png')]);
        await expect.poll(() => model.textContent).toBe('a.png,b.png');
        expect(onInvalid).toHaveBeenLastCalledWith([]);
    });

    it('rejects a drop of several files without multiple, and ignores drops without dragndrop', async () => {
        const onInvalid = vi.fn();
        const screen = await render(<Host accept={null} multiple={false} onInvalid={onInvalid} />);
        const { dropZone, fileInput } = parts(screen.container);
        expect(fileInput.multiple).toBe(false);
        drop(dropZone, [file('a.png'), file('b.png')]);
        await expect.poll(() => onInvalid.mock.calls.length).toBe(1);
        expect(namesOf(onInvalid.mock.lastCall![0])).toEqual(['a.png', 'b.png']);
        drop(dropZone, [file('c.png')]);
        await expect.poll(() => screen.container.querySelector('#model')!.textContent).toBe('c.png');

        await screen.rerender(<Host accept={null} dragndrop={false} onInvalid={onInvalid} />);
        const event = drop(dropZone, [file('d.png')]);
        expect(event.defaultPrevented).toBe(false);
        expect(screen.container.querySelector('#model')!.textContent).toBe('c.png');
    });

    it('calls onFileDragEnter and onFileDragLeave once while dragging over, also across children', async () => {
        const drags: string[] = [];
        const screen = await render(
            <FileUploader
                aria-label="Attachment"
                onFileDragEnter={() => drags.push('enter')}
                onFileDragLeave={() => drags.push('leave')}
            />
        );
        const { dropZone, field } = parts(screen.container);
        dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        field.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        field.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
        expect(drags).toEqual(['enter']);
        dropZone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
        expect(drags).toEqual(['enter', 'leave']);
    });

    it('labels the field and shows the value state, required and the button label', async () => {
        const ui = (props: FileUploaderProps) => (
            <>
                <label id="lbl" htmlFor="doc">
                    Upload Document
                </label>
                <FileUploader id="doc" aria-labelledby="lbl" buttonAriaLabel="Select a file for uploading" {...props} />
            </>
        );
        const screen = await render(ui({ required: true, state: 'error' }));
        const { field, button } = parts(screen.container);
        expect(field.id).toBe('doc');
        expect(field.getAttribute('aria-labelledby')).toBe('lbl');
        expect(field.getAttribute('aria-required')).toBe('true');
        expect(field.getAttribute('aria-invalid')).toBe('true');
        expect(field.getAttribute('aria-live')).toBe('polite');
        expect(field.getAttribute('autocomplete')).toBe('off');
        expect(button.textContent).toBe('Browse...');
        expect(button.getAttribute('aria-label')).toBe('Select a file for uploading');
        await screen.rerender(ui({ state: 'success', buttonLabel: 'Upload' }));
        expect(field.hasAttribute('aria-invalid')).toBe(false);
        expect(field.hasAttribute('aria-required')).toBe(false);
        expect(button.textContent).toBe('Upload');
    });

    it('hides the field with inputHidden, leaving the button', async () => {
        const screen = await render(<FileUploader aria-label="Upload" inputHidden buttonLabel="Upload" />);
        const { field, button } = parts(screen.container);
        expect(field.hidden).toBe(true);
        expect(getComputedStyle(field).display).toBe('none');
        expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('opens the file dialog with open() and keeps the hidden file input out of reach', async () => {
        const actions = createRef<FileUploaderActions>();
        const screen = await render(<FileUploader aria-label="Attachment" actionsRef={actions} />);
        const { fileInput } = parts(screen.container);
        const click = vi.spyOn(fileInput, 'click').mockImplementation(() => undefined);
        actions.current!.open();
        expect(click).toHaveBeenCalledTimes(1);
        expect(fileInput.tabIndex).toBe(-1);
        expect(fileInput.getAttribute('aria-hidden')).toBe('true');
        expect(getComputedStyle(fileInput).display).toBe('none');
    });

    it('keeps the valid files in the named file input for form submission', async () => {
        const screen = await render(
            <form>
                <FileUploader aria-label="Attachment" name="attachment" accept=".png" />
            </form>
        );
        const { fileInput, dropZone } = parts(screen.container);
        choose(fileInput, [file('a.png'), file('b.txt')]);
        await expect.poll(() => fileInput.files!.length).toBe(1);
        expect(
            new FormData(screen.container.querySelector('form')!).getAll('attachment').map((f) => (f as File).name)
        ).toEqual(['a.png']);
        drop(dropZone, [file('c.png'), file('d.png')]);
        await expect.poll(() => fileInput.files!.length).toBe(2);
        expect(namesOf([...fileInput.files!])).toEqual(['c.png', 'd.png']);
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <FileUploader ref={ref} aria-label="Attachment" className="custom" data-testid="uploader" title="Files">
                <span id="extra">Extra</span>
            </FileUploader>
        );
        const { root, dropZone } = parts(screen.container);
        expect(ref.current).toBe(root);
        expect(root.classList.contains('custom')).toBe(true);
        expect(root.classList.contains('flex')).toBe(true);
        expect(root.dataset['testid']).toBe('uploader');
        expect(root.title).toBe('Files');
        // children follow the button, inside the drop target
        expect(dropZone.contains(screen.container.querySelector('#extra'))).toBe(true);
    });
});

describe('FileUploaderDragndrop', () => {
    it('validates dropped files on its own and passes native props', async () => {
        const onFileChanged = vi.fn();
        const onDragEntered = vi.fn();
        const onDragLeft = vi.fn();
        const screen = await render(
            <FileUploaderDragndrop
                id="zone"
                className="zone"
                accept=".pdf"
                maxFileSize="1 KB"
                onFileChanged={onFileChanged}
                onDragEntered={onDragEntered}
                onDragLeft={onDragLeft}
            >
                <span id="child">Drop here</span>
            </FileUploaderDragndrop>
        );
        const zone = screen.container.querySelector<HTMLElement>('#zone')!;
        const child = screen.container.querySelector<HTMLElement>('#child')!;
        expect(zone.classList.contains('zone')).toBe(true);
        zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        child.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        child.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
        expect(onDragEntered).toHaveBeenCalledTimes(1);
        expect(onDragLeft).not.toHaveBeenCalled();
        const over = new DragEvent('dragover', { bubbles: true, cancelable: true });
        child.dispatchEvent(over);
        expect(over.defaultPrevented).toBe(true);
        drop(child, [file('a.pdf'), file('b.png'), file('c.pdf', 2000)]);
        expect(namesOf(onFileChanged.mock.lastCall![0].validFiles)).toEqual(['a.pdf']);
        expect(namesOf(onFileChanged.mock.lastCall![0].invalidFiles)).toEqual(['b.png', 'c.pdf']);
        // the drop ends the drag
        zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        expect(onDragEntered).toHaveBeenCalledTimes(2);
    });
});
