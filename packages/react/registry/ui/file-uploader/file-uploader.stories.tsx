import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useRef, useState } from 'react';
import { Button } from '@/ui/button/button';
import { FormLabel } from '@/ui/form/form';
import { FileUploader, FileUploaderDragndrop, type FileUploaderActions, type FileUploaderProps } from './file-uploader';

const names = (files: File[]) => files.map((f) => f.name).join(', ');

interface StoryProps extends FileUploaderProps {
    label?: string;
}

/** A labelled uploader with the chosen and rejected files below it, as Angular's story host. */
function StoryFileUploader({ label = 'Upload Document', placeholder = 'Select a file', ...props }: StoryProps) {
    const id = useId();
    const actions = useRef<FileUploaderActions>(null);
    const [files, setFiles] = useState<File[]>(props.defaultValue ?? []);
    const [invalid, setInvalid] = useState<File[]>([]);
    return (
        <div className="flex w-[18.75rem] max-w-full flex-col gap-1 font-sap-font-family text-sap-font-size text-sap-text-color">
            <FormLabel htmlFor={id} required={props.required}>
                {label}
            </FormLabel>
            <FileUploader
                {...props}
                id={id}
                placeholder={placeholder}
                actionsRef={actions}
                onValueChange={setFiles}
                onInvalidFilesChange={setInvalid}
            />
            <p className="m-0 mt-2" aria-live="polite">
                {files.length ? `Selected: ${names(files)}` : 'No file selected'}
                {invalid.length > 0 && (
                    <>
                        <br />
                        Rejected: {names(invalid)}
                    </>
                )}
            </p>
            {files.length > 0 && (
                <Button
                    variant="transparent"
                    label="Clear"
                    className="self-start"
                    onClick={() => actions.current?.clear()}
                />
            )}
        </div>
    );
}

const meta = {
    title: 'Components/File Uploader',
    component: FileUploader,
    parameters: {
        docs: {
            description: {
                component:
                    'The file uploader shows the chosen file names in a field next to a Browse button; the field opens the file dialog on click, Enter and Space, and files can be dropped on it. ' +
                    'Files outside `minFileSize`/`maxFileSize` or the `accept` extensions, and all files of a choice of more than `fileLimit`, are reported with `onInvalidFilesChange`; the value is the list of valid files. ' +
                    'The drop target (`FileUploaderDragndrop`) and the validation (`validateFiles`) can also be used on their own.'
            }
        }
    },
    args: {
        placeholder: 'Select a file',
        buttonLabel: 'Browse...',
        accept: '',
        maxFileSize: '',
        minFileSize: '',
        disabled: false,
        dragndrop: true,
        multiple: true,
        required: false,
        inputHidden: false,
        state: 'default'
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] }
    }
} satisfies Meta<typeof FileUploader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => <StoryFileUploader {...args} />
};

export const Default: Story = {
    parameters: {
        docs: { description: { story: 'Accepts `.png`, `.jpg` and `.pdf` files; other files are rejected.' } }
    },
    render: () => <StoryFileUploader accept=".png,.jpg,.pdf" required />
};

export const Selected: Story = {
    name: 'After selecting',
    parameters: { docs: { description: { story: 'The field shows the names of the chosen files.' } } },
    render: () => <StoryFileUploader defaultValue={[new File(['%PDF'], 'document.pdf')]} />
};

export const States: Story = {
    parameters: { docs: { description: { story: 'Value states of the field (`state`).' } } },
    render: () => (
        <div className="flex flex-col gap-4">
            <StoryFileUploader label="Upload Document (Success)" state="success" />
            <StoryFileUploader label="Upload Document (Error)" state="error" />
            <StoryFileUploader label="Upload Document (Warning)" state="warning" />
            <StoryFileUploader label="Upload Document (Information)" state="information" />
        </div>
    )
};

export const SizeLimits: Story = {
    name: 'Size limits',
    parameters: {
        docs: {
            description: { story: '`minFileSize` and `maxFileSize`: files below 1 KB or above 20 KB are rejected.' }
        }
    },
    render: () => <StoryFileUploader label="Up to 20 KB" maxFileSize="20 KB" minFileSize="1 KB" />
};

export const SingleFile: Story = {
    name: 'Single file',
    parameters: {
        docs: { description: { story: 'Without `multiple`, one file at a time; a drop of several files is rejected.' } }
    },
    render: () => <StoryFileUploader multiple={false} />
};

export const FileLimit: Story = {
    name: 'File limit',
    parameters: { docs: { description: { story: '`fileLimit`: a choice of more than two files is rejected.' } } },
    render: () => <StoryFileUploader label="Up to two files" fileLimit={2} />
};

export const DragDisabled: Story = {
    name: 'Drop disabled',
    parameters: { docs: { description: { story: 'Without `dragndrop`, dropped files are ignored.' } } },
    render: () => <StoryFileUploader dragndrop={false} />
};

export const Disabled: Story = {
    render: () => <StoryFileUploader disabled />
};

export const Truncation: Story = {
    parameters: {
        docs: { description: { story: '`width` fixes the field; long names and placeholders are truncated.' } }
    },
    render: () => <StoryFileUploader width="8rem" placeholder="A long placeholder that truncates" />
};

export const ButtonOnly: Story = {
    name: 'Button only',
    parameters: { docs: { description: { story: '`inputHidden` leaves the button, e.g. in a toolbar.' } } },
    render: () => <StoryFileUploader inputHidden buttonLabel="Upload" aria-label="Choose files to upload" />
};

function DropTargetDemo() {
    const [over, setOver] = useState(false);
    const [text, setText] = useState('No files dropped');
    return (
        <FileUploaderDragndrop
            accept=".pdf"
            maxFileSize="5 MB"
            onDragEntered={() => setOver(true)}
            onDragLeft={() => setOver(false)}
            onFileChanged={({ validFiles, invalidFiles }) => {
                setOver(false);
                setText(`Accepted: ${names(validFiles) || 'none'}; rejected: ${names(invalidFiles) || 'none'}`);
            }}
            className={
                over
                    ? 'flex h-32 w-[25rem] max-w-full items-center justify-center rounded-sap-element-border-corner-radius border-2 border-dashed border-sap-content-drag-and-drop-active-color p-4 font-sap-font-family text-sap-font-size text-sap-text-color'
                    : 'flex h-32 w-[25rem] max-w-full items-center justify-center rounded-sap-element-border-corner-radius border-2 border-dashed border-sap-field-border-color p-4 font-sap-font-family text-sap-font-size text-sap-text-color'
            }
        >
            <p className="m-0 text-center" aria-live="polite">
                Drop PDF files up to 5 MB here
                <br />
                {text}
            </p>
        </FileUploaderDragndrop>
    );
}

export const DropTarget: Story = {
    name: 'Drop target',
    parameters: {
        docs: {
            description: {
                story: '`FileUploaderDragndrop` on its own: any element as a drop target, with the same validation.'
            }
        }
    },
    render: () => <DropTargetDemo />
};
