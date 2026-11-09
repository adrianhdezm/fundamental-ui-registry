import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogPopup, DialogTitle } from '@/ui/dialog/dialog';
import { FileUploader } from '@/ui/file-uploader/file-uploader';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { ListContent, ListItem, ListTitle } from '@/ui/list/list';
import { MessagePage, MessagePageSubtitle, MessagePageTitle } from '@/ui/message-page/message-page';
import { ObjectMarker } from '@/ui/object-marker/object-marker';
import { Title } from '@/ui/title/title';
import { Toolbar, ToolbarLabel, ToolbarSpacer } from '@/ui/toolbar/toolbar';
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
    type UploadCollectionProps
} from './upload-collection';

interface StoryFile {
    id: number;
    name: string;
    extension: string;
    icon: string;
    favorite?: boolean;
}

const FILES: StoryFile[] = [
    { id: 1, name: 'Quarterly_Report', extension: 'pdf', icon: 'pdf-attachment', favorite: true },
    { id: 2, name: 'Team_Photo', extension: 'jpg', icon: 'card' },
    {
        id: 3,
        name: 'A_Very_Long_File_Name_That_Does_Not_Fit_Into_The_Available_Space_Of_The_Collection_Item',
        extension: 'xlsx',
        icon: 'excel-attachment'
    }
];

/** The title of a file: a link with the (shortened) name, the rename field and the markers. */
function FileTitle({ markers }: { markers?: React.ReactNode }) {
    return (
        <UploadCollectionTitleContainer>
            <UploadCollectionTitle render={<Link href="#" onClick={(event) => event.preventDefault()} />} />
            <UploadCollectionFormItem />
            {markers}
        </UploadCollectionTitleContainer>
    );
}

/** Angular's story host: files that can be renamed and deleted. */
function StoryUploadCollection({ empty = false, ...props }: UploadCollectionProps & { empty?: boolean }) {
    const [files, setFiles] = useState<StoryFile[]>(empty ? [] : FILES);
    const rename = (file: StoryFile, name: string) =>
        setFiles((list) => list.map((f) => (f === file ? { ...f, name } : f)));
    return (
        <div className={props.small ? 'max-w-[29.5rem]' : 'max-w-[60rem]'}>
            <UploadCollection {...props}>
                {files.map((file) => (
                    <UploadCollectionItem
                        key={file.id}
                        fileName={file.name}
                        onFileNameChange={(name) => rename(file, name)}
                        extension={file.extension}
                        onDelete={() => setFiles((list) => list.filter((f) => f !== file))}
                    >
                        <UploadCollectionThumbnail>
                            <Icon glyph={file.icon} />
                        </UploadCollectionThumbnail>
                        <ListContent>
                            <FileTitle markers={file.favorite && <ObjectMarker glyph="favorite" title="Favorite" />} />
                            <UploadCollectionDescription>
                                Uploaded by Lisa Miller <UploadCollectionTextSeparator /> 1.2 MB
                            </UploadCollectionDescription>
                            <UploadCollectionStatusGroup>
                                <UploadCollectionStatusItem status="positive" label="Approved" />
                                <UploadCollectionTextSeparator />
                                <UploadCollectionStatusItem status="informative" label="Version 2" />
                            </UploadCollectionStatusGroup>
                        </ListContent>
                        <UploadCollectionButtonGroup />
                    </UploadCollectionItem>
                ))}
                {files.length === 0 && (
                    <ListItem noData>
                        <ListTitle>No files uploaded</ListTitle>
                    </ListItem>
                )}
            </UploadCollection>
        </div>
    );
}

interface CustomFile extends StoryFile {
    note: string;
    allowEdit: boolean;
    allowDelete: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
}

/** Upstream's customization example: buttons hidden or disabled per file. */
function StoryUploadCollectionCustom() {
    const [files, setFiles] = useState<CustomFile[]>([
        {
            id: 1,
            name: 'Default_Buttons',
            extension: 'txt',
            icon: 'attachment-text-file',
            allowEdit: true,
            allowDelete: true,
            note: 'Rename and delete'
        },
        {
            id: 2,
            name: 'Disabled_Buttons',
            extension: 'jpg',
            icon: 'attachment-photo',
            allowEdit: true,
            allowDelete: true,
            disableEdit: true,
            disableDelete: true,
            note: 'Rename and delete are disabled'
        },
        {
            id: 3,
            name: 'Rename_Only',
            extension: 'pdf',
            icon: 'pdf-attachment',
            allowEdit: true,
            allowDelete: false,
            note: 'No delete button'
        },
        {
            id: 4,
            name: 'No_Buttons',
            extension: 'xlsx',
            icon: 'excel-attachment',
            allowEdit: false,
            allowDelete: false,
            note: 'No buttons'
        }
    ]);
    return (
        <div className="max-w-[60rem]">
            <UploadCollection>
                {files.map((file) => (
                    <UploadCollectionItem
                        key={file.id}
                        defaultFileName={file.name}
                        extension={file.extension}
                        onDelete={() => setFiles((list) => list.filter((f) => f !== file))}
                    >
                        <UploadCollectionThumbnail>
                            <Icon glyph={file.icon} />
                        </UploadCollectionThumbnail>
                        <ListContent>
                            <FileTitle />
                            <UploadCollectionDescription>{file.note}</UploadCollectionDescription>
                        </ListContent>
                        <UploadCollectionButtonGroup
                            allowFileNameEdit={file.allowEdit}
                            allowFileDeletion={file.allowDelete}
                            disableFileNameEdit={!!file.disableEdit}
                            disableFileDeletion={!!file.disableDelete}
                        />
                    </UploadCollectionItem>
                ))}
            </UploadCollection>
        </div>
    );
}

interface ComplexFile extends StoryFile {
    selected: boolean;
    flagged?: boolean;
}

let nextId = 100;

/**
 * Upstream's complex example: a toolbar with the count, a file uploader and actions for the selected files,
 * checkboxes for the selection and a confirmation dialog before deleting.
 */
function StoryUploadCollectionComplex() {
    const [files, setFiles] = useState<ComplexFile[]>([
        { id: 1, name: 'File_Name_1', extension: 'txt', icon: 'attachment-text-file', selected: false },
        { id: 2, name: 'File_Name_2', extension: 'jpg', icon: 'attachment-photo', selected: false, flagged: true },
        { id: 3, name: 'File_Name_3', extension: 'pdf', icon: 'pdf-attachment', selected: false }
    ]);
    const [status, setStatus] = useState('');
    const [confirm, setConfirm] = useState<ComplexFile | null>(null);
    const selectedCount = files.filter((f) => f.selected).length;
    const update = (file: ComplexFile, change: Partial<ComplexFile>) =>
        setFiles((list) => list.map((f) => (f.id === file.id ? { ...f, ...change } : f)));

    const add = (chosen: File[]) =>
        setFiles((list) => [
            ...list,
            ...chosen.map((file) => {
                const dot = file.name.lastIndexOf('.');
                return {
                    id: nextId++,
                    name: dot > 0 ? file.name.slice(0, dot) : file.name,
                    extension: dot > 0 ? file.name.slice(dot + 1) : '',
                    icon: 'attachment',
                    selected: false
                };
            })
        ]);

    return (
        <div className="max-w-[60rem]">
            <Toolbar aria-label="Uploads">
                <ToolbarLabel render={<Title level={2} headerSize={5} />}>Uploads ({files.length})</ToolbarLabel>
                <ToolbarSpacer />
                <FileUploader
                    data-density="compact"
                    inputHidden
                    multiple
                    buttonLabel="Upload"
                    aria-label="Choose files to upload"
                    onValueChange={add}
                />
                <Button
                    data-density="compact"
                    label="Download"
                    disabled={selectedCount === 0}
                    onClick={() => setStatus(`Downloading ${selectedCount} files`)}
                />
                <Button
                    data-density="compact"
                    label="Delete Multiple"
                    disabled={selectedCount < 2}
                    onClick={() => setFiles((list) => list.filter((f) => !f.selected))}
                />
            </Toolbar>
            {files.length ? (
                <UploadCollection selection>
                    {files.map((file) => (
                        <UploadCollectionItem
                            key={file.id}
                            fileName={file.name}
                            extension={file.extension}
                            onFileNameChange={(name) => {
                                update(file, { name });
                                setStatus(`Renamed to ${name}.${file.extension}`);
                            }}
                            onDelete={() => setConfirm(file)}
                        >
                            <Checkbox
                                checked={file.selected}
                                onCheckedChange={(selected) => update(file, { selected })}
                                aria-label={`Select ${file.name}.${file.extension}`}
                            />
                            <UploadCollectionThumbnail>
                                <Icon glyph={file.icon} />
                            </UploadCollectionThumbnail>
                            <ListContent>
                                <FileTitle
                                    markers={
                                        file.flagged && (
                                            <>
                                                <ObjectMarker glyph="flag" title="Flagged" />
                                                <ObjectMarker glyph="favorite" title="Favorite" />
                                            </>
                                        )
                                    }
                                />
                                <UploadCollectionDescription>
                                    This is the file description <UploadCollectionTextSeparator /> This is an additional
                                    description
                                </UploadCollectionDescription>
                                <UploadCollectionStatusGroup>
                                    <UploadCollectionStatusItem status="negative" label="Negative object status" />
                                    <UploadCollectionTextSeparator />
                                    <UploadCollectionStatusItem status="positive" label="Positive object status" />
                                </UploadCollectionStatusGroup>
                            </ListContent>
                            <UploadCollectionButtonGroup />
                        </UploadCollectionItem>
                    ))}
                </UploadCollection>
            ) : (
                <MessagePage glyph="attachment" className="mt-8">
                    <MessagePageTitle>No files found.</MessagePageTitle>
                    <MessagePageSubtitle>Use the &quot;Upload&quot; button to upload files.</MessagePageSubtitle>
                </MessagePage>
            )}
            <p className="font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
                {status}
            </p>
            <Dialog open={confirm != null} onOpenChange={(open) => !open && setConfirm(null)}>
                <DialogPopup width="25rem" aria-describedby="story-uc-confirm-text">
                    <DialogHeader>
                        <DialogTitle>Delete Confirmation</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <p className="m-0" id="story-uc-confirm-text">
                            Are you sure you want to delete {confirm ? `${confirm.name}.${confirm.extension}` : ''}?
                        </p>
                    </DialogBody>
                    <DialogFooter>
                        <ButtonBar
                            variant="emphasized"
                            label="Yes"
                            onClick={() => {
                                const file = confirm!;
                                setFiles((list) => list.filter((f) => f.id !== file.id));
                                setStatus(`Deleted ${file.name}.${file.extension}`);
                                setConfirm(null);
                            }}
                        />
                        <ButtonBar label="Cancel" onClick={() => setConfirm(null)} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
        </div>
    );
}

const meta = {
    title: 'Components/Upload Collection',
    component: UploadCollection,
    parameters: {
        docs: {
            description: {
                component:
                    'The upload collection lists uploaded files with a thumbnail, the file name, descriptions and statuses. The edit button renames a file in place (Enter or Ok confirms, Escape or Cancel discards) and the delete button removes it. ' +
                    'Long names are shortened in the middle, keeping the extension. In the small layout the buttons wrap below the file.'
            }
        }
    },
    args: { small: false, selection: false }
} satisfies Meta<typeof UploadCollection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => <StoryUploadCollection {...args} />
};

export const Default: Story = {
    render: () => <StoryUploadCollection />
};

export const Small: Story = {
    parameters: { docs: { description: { story: '`small`: the buttons wrap below the file.' } } },
    render: () => <StoryUploadCollection small />
};

/** Starts renaming every file, as fundamental-styles' Edit story shows them. */
async function editAll(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button', { name: 'Edit' })) await userEvent.click(button);
    await waitFor(() => expect(canvas.getAllByRole('textbox', { name: 'Filename' })).toHaveLength(3));
}

export const Edit: Story = {
    name: 'Edit mode',
    parameters: {
        docs: {
            description: {
                story: 'Renaming: the name in a field with the extension after it, and Ok and Cancel. An empty name is an error.'
            }
        }
    },
    render: () => <StoryUploadCollection />,
    play: ({ canvasElement }) => editAll(canvasElement)
};

export const EditSmall: Story = {
    name: 'Edit mode, small',
    tags: ['!autodocs'],
    render: () => <StoryUploadCollection small />,
    play: ({ canvasElement }) => editAll(canvasElement)
};

export const Empty: Story = {
    parameters: { docs: { description: { story: 'A "No data" item when there are no files.' } } },
    render: () => <StoryUploadCollection empty />
};

export const NoData: Story = {
    name: 'No data',
    parameters: { docs: { description: { story: 'A message page in place of the empty collection.' } } },
    render: () => (
        <MessagePage glyph="attachment">
            <MessagePageTitle>No files found.</MessagePageTitle>
            <MessagePageSubtitle>Drop files to upload, or use the &quot;+&quot; button.</MessagePageSubtitle>
        </MessagePage>
    )
};

export const Customization: Story = {
    parameters: {
        docs: {
            description: {
                story: '`allowFileNameEdit`, `allowFileDeletion`, `disableFileNameEdit` and `disableFileDeletion` per file.'
            }
        }
    },
    render: () => <StoryUploadCollectionCustom />
};

export const Complex: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A toolbar with the count, a file uploader and actions for the selected files, checkboxes for the selection and a confirmation dialog before deleting.'
            }
        }
    },
    render: () => <StoryUploadCollectionComplex />
};

export const OpenDeleteConfirmation: Story = {
    name: 'Open: delete confirmation',
    tags: ['!autodocs'],
    render: () => <StoryUploadCollectionComplex />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getAllByRole('button', { name: 'Delete' })[0]);
        await waitFor(() => expect(document.querySelectorAll('[role=dialog][data-open]')).toHaveLength(1));
        const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
        await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
    }
};
