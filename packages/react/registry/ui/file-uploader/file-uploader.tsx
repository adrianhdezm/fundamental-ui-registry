/*
 * Port of @fundamental-ngx/core (file-uploader) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    useEffect,
    useId,
    useImperativeHandle,
    useRef,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type DragEvent,
    type KeyboardEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { fieldBase, fieldStates, type FormState } from '@/ui/input/input';

/** Files split by the size and type limits. */
export interface FileUploadOutput {
    validFiles: File[];
    invalidFiles: File[];
}

const FILE_SIZE_UNITS: Record<string, number> = {
    B: 1,
    BYTE: 1,
    BYTES: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4
};

/** Bytes of a size such as "500", "1.5 MB" or "20KB"; 0 for an empty size. Throws for an unreadable size. */
export function parseFileSize(size: string | null | undefined): number {
    if (!size) return 0;
    const match = size.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/);
    const value = match ? Number(match[1]) : NaN;
    const unit = FILE_SIZE_UNITS[(match?.[2] || 'B').toUpperCase()];
    if (isNaN(value) || !unit) throw new Error(`FileSizeError - Invalid file size "${size}"`);
    return value * unit;
}

/**
 * Splits files by size limits and accepted extensions (Angular's `FileUploaderService.validateFiles`). `accept` is a
 * list of extensions, e.g. ".png,.jpg"; sizes are as `parseFileSize` reads them, empty for no limit.
 */
export function validateFiles(
    files: File[],
    minFileSize: string | null | undefined,
    maxFileSize: string | null | undefined,
    accept: string | null | undefined
): FileUploadOutput {
    const max = parseFileSize(maxFileSize);
    const min = parseFileSize(minFileSize);
    const extensions = accept ? accept.toLocaleLowerCase().replace(/[\s.]/g, '').split(',') : null;
    const valid = (file: File) =>
        (!max || file.size <= max) &&
        (!min || file.size >= min) &&
        (!extensions || extensions.includes(file.name.split('.').pop()!.toLocaleLowerCase()));
    return { validFiles: files.filter(valid), invalidFiles: files.filter((f) => !valid(f)) };
}

function mute(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
}

export interface FileUploaderDragndropProps extends useRender.ComponentProps<'div'> {
    /** Accepts more than one file per drop; a drop of several files is otherwise all invalid. */
    multiple?: boolean;
    /** Accepted extensions, e.g. ".png,.jpg". */
    accept?: string | null;
    /** Size limits, e.g. "20 KB" or "5 MB". */
    maxFileSize?: string | null;
    minFileSize?: string | null;
    /** Ignores dropped files. */
    disabled?: boolean;
    /** Accepts dropped files (false: the element is no drop target). */
    dragndrop?: boolean;
    /** Called with the dropped files, split by the limits. */
    onFileChanged?: (output: FileUploadOutput) => void;
    /** Called once when a drag enters the element (also across its children). */
    onDragEntered?: () => void;
    /** Called once when the drag leaves the element again. */
    onDragLeft?: () => void;
}

/**
 * Drop target for files (Angular's `fdFileDragnDrop`): validates the files dropped on it and reports them with
 * `onFileChanged`. Renders a `<div>`; `render` renders another element.
 *
 * ```tsx
 * <FileUploaderDragndrop accept=".pdf" maxFileSize="5 MB" onFileChanged={({ validFiles }) => add(validFiles)}>
 *     Drop files here
 * </FileUploaderDragndrop>
 * ```
 */
export function FileUploaderDragndrop({
    multiple = true,
    accept,
    maxFileSize,
    minFileSize,
    disabled = false,
    dragndrop = true,
    onFileChanged,
    onDragEntered,
    onDragLeft,
    render,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    ...props
}: FileUploaderDragndropProps) {
    /** Enter and leave events of children: the drag leaves when the count is back to zero. */
    const depth = useRef(0);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'file-uploader-dragndrop',
            onDragOver: (event: DragEvent<HTMLDivElement>) => {
                onDragOver?.(event);
                // a disabled target is no drop target, so the browser does not open the file either
                if (dragndrop && !disabled) mute(event);
            },
            onDragEnter: (event: DragEvent<HTMLDivElement>) => {
                onDragEnter?.(event);
                if (++depth.current === 1 && dragndrop) onDragEntered?.();
            },
            onDragLeave: (event: DragEvent<HTMLDivElement>) => {
                onDragLeave?.(event);
                if (--depth.current <= 0) {
                    depth.current = 0;
                    if (!dragndrop) return;
                    mute(event);
                    onDragLeft?.();
                }
            },
            onDrop: (event: DragEvent<HTMLDivElement>) => {
                onDrop?.(event);
                depth.current = 0;
                if (!dragndrop || disabled) return;
                mute(event);
                const files = Array.from(event.dataTransfer?.files ?? []);
                if (!multiple && files.length > 1) {
                    onFileChanged?.({ validFiles: [], invalidFiles: files });
                    return;
                }
                onFileChanged?.(validateFiles(files, minFileSize, maxFileSize, accept));
            }
        }
    });
}

export interface FileUploaderSelectProps extends Omit<ComponentProps<'input'>, 'type'> {
    /** Called with the chosen files (not when the dialog is cancelled). */
    onFileSelected?: (files: File[]) => void;
}

/** A file input that reports the chosen files (Angular's `fdFileSelect`). `multiple` is on by default. */
export function FileUploaderSelect({ multiple = true, onFileSelected, onChange, ...props }: FileUploaderSelectProps) {
    return (
        <input
            {...props}
            type="file"
            multiple={multiple}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onChange?.(event);
                const files = Array.from(event.currentTarget.files ?? []);
                if (files.length) onFileSelected?.(files);
            }}
        />
    );
}

/** Imperative actions of a file uploader, through `actionsRef`. */
export interface FileUploaderActions {
    /** Opens the file dialog (unless disabled). */
    open(): void;
    /** Removes the chosen files, valid and invalid; calls the callbacks when there were any. */
    clear(): void;
}

export interface FileUploaderProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'placeholder'> {
    /** The valid chosen files (controlled, with `onValueChange`). */
    value?: File[];
    /** The initially chosen files (uncontrolled). */
    defaultValue?: File[];
    /** Called with the valid files after every choice, drop or `clear()` (Angular's `selectedFilesChanged`). */
    onValueChange?: (files: File[]) => void;
    /** Called with the files outside the limits after every choice, drop or `clear()` (`selectedInvalidFiles`). */
    onInvalidFilesChange?: (files: File[]) => void;
    /** Called once when files are dragged over the uploader (Angular's `onDragEnter`). */
    onFileDragEnter?: () => void;
    /** Called once when the drag leaves the uploader (Angular's `onDragLeave`). */
    onFileDragLeave?: () => void;
    disabled?: boolean;
    /** `aria-required` on the field. */
    required?: boolean;
    /** More than one file at a time (default true). */
    multiple?: boolean;
    /** Accepted extensions, e.g. ".png,.jpg". */
    accept?: string | null;
    /** Accepts dropped files (default true). */
    dragndrop?: boolean;
    /** Size limits, e.g. "20 KB" or "5 MB". */
    maxFileSize?: string | null;
    minFileSize?: string | null;
    /** Maximum number of files chosen at once; with more, all are reported as invalid. */
    fileLimit?: number | null;
    /** `id` of the field, for a `FormLabel`'s `htmlFor`; generated by default. */
    id?: string;
    /** Name of the hidden file input, for native form submission (it holds the valid files). */
    name?: string;
    placeholder?: string | null;
    /** Text of the button (default "Browse..."). */
    buttonLabel?: ReactNode;
    /** Accessible name of the button. */
    buttonAriaLabel?: string;
    /** Value state of the field. */
    state?: FormState | null;
    /** Hides the field, leaving the button. */
    inputHidden?: boolean;
    /** Fixed width of the field, e.g. "8rem" (it grows by default). */
    width?: string | null;
    /** Imperative actions: `open()` and `clear()`. */
    actionsRef?: Ref<FileUploaderActions>;
    /** Content after the button, inside the drop target. */
    children?: ReactNode;
}

/**
 * File uploader: a field showing the chosen file names and a Browse button. The field opens the file dialog on
 * click, Enter and Space (typing is ignored), and files can be dropped on it. Files outside the size limits or
 * accepted extensions are reported with `onInvalidFilesChange`; the value is the list of valid files. Native props,
 * `className` and `ref` go to the root; `id`, `aria-label`, `aria-labelledby` and `aria-describedby` to the field.
 *
 * ```tsx
 * <FormLabel htmlFor="doc">Upload Document</FormLabel>
 * <FileUploader id="doc" placeholder="Select a file" accept=".png,.jpg" value={files} onValueChange={setFiles} />
 * ```
 */
export function FileUploader({
    value: valueProp,
    defaultValue,
    onValueChange,
    onInvalidFilesChange,
    onFileDragEnter,
    onFileDragLeave,
    disabled = false,
    required = false,
    multiple = true,
    accept,
    dragndrop = true,
    maxFileSize,
    minFileSize,
    fileLimit,
    id: idProp,
    name,
    placeholder,
    buttonLabel = 'Browse...',
    buttonAriaLabel,
    state = 'default',
    inputHidden = false,
    width,
    actionsRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    children,
    ...props
}: FileUploaderProps) {
    const autoId = useId();
    const id = idProp ?? `fd-file-uploader-input-${autoId}`;
    const fileInput = useRef<HTMLInputElement>(null);
    const textInput = useRef<HTMLInputElement>(null);
    const [ownValue, setOwnValue] = useState<File[]>(defaultValue ?? []);
    const [invalidFiles, setInvalidFiles] = useState<File[]>([]);
    const validFiles = valueProp ?? ownValue;
    const fileNames = validFiles.map((f) => f.name).join(' ');

    /** The hidden file input holds the valid files, for native form submission. */
    const syncInput = (files: File[]) => {
        const input = fileInput.current;
        if (!input) return;
        if (!files.length) {
            input.value = '';
            return;
        }
        try {
            const data = new DataTransfer();
            files.forEach((f) => data.items.add(f));
            input.files = data.files;
        } catch {
            // no DataTransfer constructor: the input keeps what was chosen
        }
    };

    const update = (valid: File[], invalid: File[]) => {
        if (valueProp === undefined) setOwnValue(valid);
        setInvalidFiles(invalid);
        syncInput(valid);
        onValueChange?.(valid);
        onInvalidFilesChange?.(invalid);
    };

    // files removed by the app (an empty value) leave the file input too, as Angular's writeValue
    useEffect(() => {
        if (valueProp && !valueProp.length && fileInput.current) fileInput.current.value = '';
    }, [valueProp]);

    const open = () => {
        if (!disabled) fileInput.current?.click();
    };

    const clear = () => {
        const had = validFiles.length > 0 || invalidFiles.length > 0;
        if (valueProp === undefined) setOwnValue([]);
        setInvalidFiles([]);
        if (fileInput.current) fileInput.current.value = '';
        if (had) {
            onValueChange?.([]);
            onInvalidFilesChange?.([]);
        }
    };

    useImperativeHandle(actionsRef, () => ({ open, clear }));

    const handleSelect = (files: File[]) => {
        if (fileLimit && files.length > fileLimit) update([], files);
        else {
            const output = validateFiles(files, minFileSize, maxFileSize, accept);
            update(output.validFiles, output.invalidFiles);
        }
        textInput.current?.focus();
    };

    /** Enter and Space open the file dialog; typing is ignored. */
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ' ') open();
        if (event.key !== 'Tab') event.preventDefault();
    };

    const shown = fileNames || placeholder || undefined;

    return (
        <div {...props} data-slot="file-uploader" className={cn('flex', className)}>
            <FileUploaderDragndrop
                className="m-0 box-border flex w-full items-center gap-1 p-0"
                accept={accept}
                maxFileSize={maxFileSize}
                minFileSize={minFileSize}
                dragndrop={dragndrop}
                disabled={disabled}
                multiple={multiple}
                onFileChanged={(output) => update(output.validFiles, output.invalidFiles)}
                onDragEntered={onFileDragEnter}
                onDragLeft={onFileDragLeave}
            >
                <input
                    ref={textInput}
                    id={id}
                    type="text"
                    autoComplete="off"
                    aria-live="polite"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-required={required || undefined}
                    aria-invalid={state === 'error' || undefined}
                    title={shown}
                    placeholder={shown}
                    value={fileNames}
                    // the names are shown, not typed
                    onChange={() => undefined}
                    style={width ? { width } : undefined}
                    hidden={inputHidden}
                    disabled={disabled}
                    onClick={open}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        fieldBase,
                        fieldStates[state ?? 'default'],
                        // the field shows the file names: a caret-less, non-editable text
                        'min-w-0 flex-1 cursor-pointer text-transparent [text-shadow:0_0_0_var(--sapTextColor)] select-none placeholder:text-sap-text-color',
                        validFiles.length > 0 && 'placeholder:not-italic',
                        // a fixed width replaces the growing field
                        width && 'flex-none'
                    )}
                />
                <Button label={buttonLabel} aria-label={buttonAriaLabel} disabled={disabled} onClick={open} />
                {children}
            </FileUploaderDragndrop>
            <FileUploaderSelect
                ref={fileInput}
                name={name}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                accept={accept || undefined}
                multiple={multiple}
                disabled={disabled}
                onFileSelected={handleSelect}
            />
        </div>
    );
}
