/*
 * Port of @fundamental-ngx/core (upload-collection) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    use,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type MouseEvent,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Input, type InputProps } from '@/ui/input/input';
import {
    List,
    ListItem,
    ListThumbnail,
    ListTitle,
    type ListItemProps,
    type ListProps,
    type ListThumbnailProps,
    type ListTitleProps
} from '@/ui/list/list';
import { ObjectStatus, type ObjectStatusProps } from '@/ui/object-status/object-status';

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (value) => {
        const cleanups = refs.map((ref) => {
            if (typeof ref === 'function') return ref(value);
            if (ref) ref.current = value;
            return undefined;
        });
        return () =>
            cleanups.forEach((cleanup, i) => {
                const ref = refs[i];
                if (typeof cleanup === 'function') cleanup();
                else if (typeof ref === 'function') ref(null);
                else if (ref) ref.current = null;
            });
    };
}

interface UploadCollectionItemContextValue {
    fileName: string;
    extension: string;
    /** The name and the extension. */
    fullName: string;
    /** Whether the file name is being edited. */
    editMode: boolean;
    /** The name in the edit field. */
    draftName: string;
    setDraftName(name: string): void;
    startEdit(): void;
    cancelEdit(): void;
    /** Applies the edited name unless it is empty. */
    confirmEdit(): void;
    remove(): void;
}

const UploadCollectionItemContext = createContext<UploadCollectionItemContextValue | null>(null);

/** The item of an upload collection part, if any. */
export function useUploadCollectionItem(): UploadCollectionItemContextValue | null {
    return use(UploadCollectionItemContext);
}

export interface UploadCollectionProps extends ListProps {
    /** Narrow layout: the buttons wrap below the file. */
    small?: boolean;
}

/**
 * Upload collection: a list of uploaded files with their names, descriptions, statuses and buttons to rename and
 * delete them. Long file names are shortened in the middle, keeping the extension. A byline `List` (its props,
 * keyboard navigation and `selection` apply), named "Uploaded files" by default.
 *
 * ```tsx
 * <UploadCollection>
 *     <UploadCollectionItem defaultFileName="Report" extension="pdf" onDelete={remove}>
 *         <UploadCollectionThumbnail><Icon glyph="pdf-attachment" /></UploadCollectionThumbnail>
 *         <ListContent>
 *             <UploadCollectionTitleContainer>
 *                 <UploadCollectionTitle render={<Link href="#" />} />
 *                 <UploadCollectionFormItem />
 *             </UploadCollectionTitleContainer>
 *             <UploadCollectionDescription>Uploaded today</UploadCollectionDescription>
 *         </ListContent>
 *         <UploadCollectionButtonGroup />
 *     </UploadCollectionItem>
 * </UploadCollection>
 * ```
 */
export function UploadCollection({
    small = false,
    role = 'list',
    'aria-label': ariaLabel = 'Uploaded files',
    className,
    ...props
}: UploadCollectionProps) {
    return (
        <List
            byline
            {...props}
            role={role}
            aria-label={ariaLabel}
            data-small={small ? '' : undefined}
            data-upload-collection=""
            className={cn('block', className)}
        />
    );
}

export interface UploadCollectionItemProps extends ListItemProps {
    /** File name without the extension (controlled, with `onFileNameChange`). */
    fileName?: string;
    /** Initial file name without the extension (uncontrolled). */
    defaultFileName?: string;
    /** Called with the new name after a rename (Angular's `fileNameChanged`). */
    onFileNameChange?: (fileName: string) => void;
    /** Extension without the dot, e.g. "pdf". */
    extension?: string;
    /** Called when the delete button is pressed (Angular's `deleteClicked`). */
    onDelete?: () => void;
}

/** A file of an upload collection: a `ListItem` (`role="listitem"`) with the rename state of its parts. */
export function UploadCollectionItem({
    fileName: fileNameProp,
    defaultFileName = '',
    onFileNameChange,
    extension = '',
    onDelete,
    role = 'listitem',
    ref,
    className,
    ...props
}: UploadCollectionItemProps) {
    const itemRef = useRef<HTMLLIElement>(null);
    const [ownName, setOwnName] = useState(defaultFileName);
    const [editMode, setEditMode] = useState(false);
    const [draftName, setDraftName] = useState('');
    /** Set when editing ends, so the edit button gets the focus back once it is rendered. */
    const refocus = useRef(false);
    const fileName = fileNameProp ?? ownName;
    const mergedRef = useMemo(() => mergeRefs(itemRef, ref), [ref]);

    useEffect(() => {
        if (editMode || !refocus.current) return;
        refocus.current = false;
        itemRef.current?.querySelector<HTMLElement>('[data-slot=upload-collection-button-group] button')?.focus();
    }, [editMode]);

    const context = useMemo<UploadCollectionItemContextValue>(() => {
        const endEdit = () => {
            refocus.current = true;
            setEditMode(false);
        };
        return {
            fileName,
            extension,
            fullName: extension ? `${fileName}.${extension}` : fileName,
            editMode,
            draftName,
            setDraftName,
            startEdit: () => {
                setDraftName(fileName);
                setEditMode(true);
            },
            cancelEdit: endEdit,
            confirmEdit: () => {
                const name = draftName.trim();
                if (!name) return;
                if (fileNameProp === undefined) setOwnName(name);
                endEdit();
                onFileNameChange?.(name);
            },
            remove: () => onDelete?.()
        };
    }, [fileName, extension, editMode, draftName, fileNameProp, onFileNameChange, onDelete]);

    return (
        <UploadCollectionItemContext value={context}>
            <ListItem
                {...props}
                role={role}
                ref={mergedRef}
                data-upload-collection-item=""
                className={cn(
                    // the content keeps its place next to the thumbnail when the buttons wrap; in the small layout
                    // its basis is its own width, so the buttons wrap below it even without a thumbnail
                    'flex-nowrap [[data-small]_&]:flex-wrap [&>[data-slot=list-content]]:min-w-0 [&>[data-slot=list-content]]:basis-0 [[data-small]_&]:[&>[data-slot=list-content]]:basis-auto [&>[data-slot=list-content]]:grow',
                    className
                )}
            />
        </UploadCollectionItemContext>
    );
}

/** The file icon or preview: a `ListThumbnail` at the top of the item. */
export function UploadCollectionThumbnail({ className, ...props }: ListThumbnailProps) {
    return <ListThumbnail {...props} className={cn('self-start', className)} />;
}

/** The title and markers of a file; the title gives way to the edit field while renaming. */
export function UploadCollectionTitleContainer({ className, ...props }: ComponentProps<'div'>) {
    const item = use(UploadCollectionItemContext);
    return (
        <div
            {...props}
            data-slot="upload-collection-title-container"
            className={cn(
                // the markers: everything but the title and the edit field
                item?.editMode
                    ? 'flex items-baseline [&>:not([data-upload-collection-title],[data-slot=upload-collection-form-item])]:hidden'
                    : 'flex min-w-0 items-center gap-0 [&>:not([data-upload-collection-title],[data-slot=upload-collection-form-item])]:shrink-0',
                className
            )}
        />
    );
}

export interface UploadCollectionTitleProps extends Omit<ListTitleProps, 'children'> {
    /** The text when the title is outside an item; inside one it is the item's name and extension. */
    children?: string;
}

/**
 * The file name, usually a link (`render={<Link href="…" />}`): a `ListTitle` whose text is the name and extension,
 * shortened in the middle when it does not fit, with the full name as its tooltip. Hidden while renaming.
 */
export function UploadCollectionTitle({ className, style, children, ...props }: UploadCollectionTitleProps) {
    const item = use(UploadCollectionItemContext);
    const titleRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const name = item?.fullName ?? children ?? '';
    const editMode = !!item?.editMode;

    // the text is set here, not rendered: it is shortened by measuring
    useLayoutEffect(() => {
        const title = titleRef.current;
        const target = textRef.current;
        if (!title || !target || editMode) return;
        /** Cuts the middle of the name until the title fits its container. */
        const fit = () => {
            const container = title.parentElement;
            target.textContent = name;
            if (!container || !container.clientWidth) return;
            let text = name;
            let guard = 50;
            // as wide as its container (Angular), or shrunk next to markers and cut by its ellipsis
            const tooLong = () =>
                title.getBoundingClientRect().width * 1.05 >= container.getBoundingClientRect().width ||
                title.scrollWidth > title.clientWidth;
            while (tooLong() && guard-- > 0) {
                const keep = Math.floor(text.length * 0.8);
                if (keep < 4) break;
                const left = Math.floor(keep / 2);
                text = `${text.substring(0, left)}...${text.substring(text.length - left + 3)}`;
                target.textContent = text;
            }
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(title.parentElement ?? title);
        return () => observer.disconnect();
    }, [name, editMode]);

    return (
        <ListTitle
            {...props}
            ref={titleRef}
            data-upload-collection-title=""
            title={item ? item.fullName : props.title}
            style={editMode ? { ...style, display: 'none' } : style}
            className={cn(
                // a link title keeps the link colour and line height over the list title's
                'pointer-events-auto me-2 min-w-0 flex-none shrink [a&]:text-sap-link-color [a&]:leading-4',
                className
            )}
        >
            <span ref={textRef} />
        </ListTitle>
    );
}

/** A line of description below the title. */
export function UploadCollectionDescription({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'upload-collection-description',
            className: cn(
                'm-0 box-border block truncate p-0 pt-2.5 text-sap-font-size leading-4 text-sap-content-label-color',
                className
            )
        }
    });
}

/** A bullet between texts or statuses; hidden from assistive technology. */
export function UploadCollectionTextSeparator({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            aria-hidden="true"
            {...props}
            data-slot="upload-collection-text-separator"
            className={cn("m-0 p-0 text-sap-content-label-color before:leading-none before:content-['•']", className)}
        />
    );
}

/** Statuses of a file, e.g. upload state and approval. */
export function UploadCollectionStatusGroup({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'upload-collection-status-group',
            className: cn(
                'm-0 mt-1.5 box-border flex min-w-0 items-center truncate p-0 text-sap-font-size leading-4 text-sap-content-label-color',
                className
            )
        }
    });
}

/** A status in the status group: an `ObjectStatus` that shrinks and truncates. */
export function UploadCollectionStatusItem({ className, ...props }: ObjectStatusProps) {
    return (
        <ObjectStatus
            {...props}
            data-slot="upload-collection-status-item"
            className={cn('mx-1 min-w-0 shrink first:ms-0 [&_span]:truncate', className)}
        />
    );
}

export interface UploadCollectionFormItemProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onValueChange'> {
    /** Called with the name while it is edited (Angular's `fileNameChanged`). */
    onValueChange?: (value: string) => void;
}

/**
 * The edit field of the file name, shown while renaming, with the extension after it. Enter confirms the new name,
 * Escape discards it; an empty name is an error. The field takes the focus when editing starts.
 */
export function UploadCollectionFormItem({
    placeholder = 'Filename',
    'aria-label': ariaLabel = 'Filename',
    onValueChange,
    onKeyDown,
    onClick,
    className,
    ...props
}: UploadCollectionFormItemProps) {
    const item = use(UploadCollectionItemContext);
    const editMode = !!item?.editMode;
    return (
        <div
            data-slot="upload-collection-form-item"
            className={editMode ? 'm-0 box-border flex min-w-0 flex-1 items-baseline p-0' : 'hidden'}
        >
            {item && editMode && (
                <>
                    <Input
                        {...props}
                        type="text"
                        required
                        autoFocus
                        aria-label={ariaLabel}
                        placeholder={placeholder}
                        value={item.draftName}
                        state={item.draftName ? null : 'error'}
                        onValueChange={(value) => {
                            item.setDraftName(value);
                            onValueChange?.(value);
                        }}
                        onKeyDown={(event) => {
                            onKeyDown?.(event);
                            if (event.key === 'Enter') {
                                // the key does not go on to the edit button, which takes the focus back
                                event.preventDefault();
                                item.confirmEdit();
                            }
                            if (event.key === 'Escape') {
                                // the rename ends, not a dialog around the collection
                                event.stopPropagation();
                                item.cancelEdit();
                            }
                        }}
                        onClick={(event) => {
                            onClick?.(event);
                            event.stopPropagation();
                        }}
                        className={cn('pointer-events-auto w-3/5 [[data-small]_&]:w-3/4', className)}
                    />
                    <span className="ms-1.5 inline-block truncate text-sap-font-size leading-4 text-sap-content-label-color">
                        .{item.extension}
                    </span>
                </>
            )}
        </div>
    );
}

export interface UploadCollectionButtonGroupProps extends ComponentProps<'div'> {
    /** Shows the edit button (default true). */
    allowFileNameEdit?: boolean;
    /** Shows the delete button (default true). */
    allowFileDeletion?: boolean;
    disableFileNameEdit?: boolean;
    disableFileDeletion?: boolean;
    /** Accessible name of the edit button. */
    editLabel?: string;
    /** Accessible name of the delete button. */
    deleteLabel?: string;
    okText?: string;
    cancelText?: string;
    /** Called with true when editing starts and false when it is cancelled. */
    onEditClick?: (editing: boolean) => void;
    onOkClick?: () => void;
    onDeleteClick?: () => void;
}

/** Edit and delete buttons of a file; Ok and Cancel while renaming. Their clicks do not reach the item. */
export function UploadCollectionButtonGroup({
    allowFileNameEdit = true,
    allowFileDeletion = true,
    disableFileNameEdit = false,
    disableFileDeletion = false,
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    okText = 'Ok',
    cancelText = 'Cancel',
    onEditClick,
    onOkClick,
    onDeleteClick,
    className,
    ...props
}: UploadCollectionButtonGroupProps) {
    const item = use(UploadCollectionItemContext);
    /** Runs the action without the click reaching the item (no selection toggling). */
    const action = (run: () => void) => (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        run();
    };
    return (
        <div
            {...props}
            data-slot="upload-collection-button-group"
            className={cn(
                // as fundamental-styles: inline buttons, each with a 0.125rem start margin and a space between them
                'm-0 ms-4 box-border block shrink-0 p-0 font-sap-font-family text-sap-font-size leading-[normal] whitespace-nowrap [&>button]:ms-0.5',
                '[[data-small]_&]:ms-0 [[data-small]_&]:mt-3 [[data-small]_&]:basis-full [[data-small]_&]:[&>button:not(:first-child)]:ms-2',
                className
            )}
        >
            {!item?.editMode ? (
                <>
                    {allowFileNameEdit && (
                        <Button
                            variant="transparent"
                            glyph="edit"
                            aria-label={editLabel}
                            disabled={disableFileNameEdit}
                            onClick={action(() => {
                                item?.startEdit();
                                onEditClick?.(true);
                            })}
                        />
                    )}
                    {allowFileNameEdit && allowFileDeletion && ' '}
                    {allowFileDeletion && (
                        <Button
                            variant="transparent"
                            glyph="decline"
                            aria-label={deleteLabel}
                            disabled={disableFileDeletion}
                            onClick={action(() => {
                                item?.remove();
                                onDeleteClick?.();
                            })}
                        />
                    )}
                </>
            ) : (
                <>
                    <Button
                        variant="transparent"
                        label={okText}
                        disabled={!item.draftName.trim()}
                        onClick={action(() => {
                            item.confirmEdit();
                            onOkClick?.();
                        })}
                    />{' '}
                    <Button
                        variant="transparent"
                        label={cancelText}
                        onClick={action(() => {
                            item.cancelEdit();
                            onEditClick?.(false);
                        })}
                    />
                </>
            )}
        </div>
    );
}
