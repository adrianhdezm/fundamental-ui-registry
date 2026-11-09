## file-uploader

Sources: fundamental-react: none · Angular [`registry/ui/file-uploader`](../../../../angular/registry/ui/file-uploader/) ·
fundamental-styles [File Uploader](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-file-uploader--docs)
Registry: `registry/ui/file-uploader/`, React and the DOM (Base UI has no file input or drop target); the field
styles of `input`, the registry's `Button`.

API: Angular's component, drop-target directive, file-input directive and validation service:

```tsx
<FormLabel htmlFor="doc">Upload Document</FormLabel>
<FileUploader id="doc" placeholder="Select a file" accept=".png,.jpg" maxFileSize="5 MB" value={files} onValueChange={setFiles} />
```

| Angular                                                           | React                                                                                                |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `fd-file-uploader`                                                | `FileUploader` (native props, `className` and `ref` on the root, children after the button)          |
| `[(ngModel)]` / form control (the valid files)                    | `value` / `defaultValue` with `onValueChange(files)`                                                 |
| `(selectedFilesChanged)`                                          | `onValueChange(files)` (Angular emits both with the same files)                                      |
| `(selectedInvalidFiles)`                                          | `onInvalidFilesChange(files)`                                                                        |
| `(onDragEnter)`, `(onDragLeave)`                                  | `onFileDragEnter`, `onFileDragLeave` (the native `onDragEnter`/`onDragLeave` stay native)            |
| `disabled`, `required`, `multiple`, `accept`, `dragndrop`         | the same props                                                                                       |
| `maxFileSize`, `minFileSize`, `fileLimit`, `inputHidden`, `width` | the same props                                                                                       |
| `id`, `ariaLabel`, `ariaLabelledBy`, `placeholder`, `state`       | `id`, `aria-label`, `aria-labelledby` (and `aria-describedby`), `placeholder`, `state`: on the field |
| `buttonLabel` ("Browse..."), `buttonAriaLabel`                    | `buttonLabel` ("Browse..."), `buttonAriaLabel`                                                       |
| `open()`, `clear()`                                               | `actionsRef`: `open()`, `clear()`                                                                    |
| `setDisabledState` (form disabled)                                | `disabled`                                                                                           |
| `fdFileDragnDrop` (`fileChanged`, `dragEntered`, `dragLeave`)     | `FileUploaderDragndrop` (`onFileChanged`, `onDragEntered`, `onDragLeft`; `render`)                   |
| `input[type=file][fdFileSelect]` (`fileSelected`)                 | `FileUploaderSelect` (`onFileSelected`)                                                              |
| `FileUploaderService.validateFiles`, `parseFileSize`              | `validateFiles(files, min, max, accept)`, `parseFileSize`                                            |

Behaviour, as Angular: the field is a text input showing the valid file names (space separated) as its value,
placeholder and tooltip; it opens the file dialog on click, Enter and Space and ignores typing (every key but Tab is
prevented), with Angular's caret-less look (transparent text with a text shadow). The Browse button opens it too.
A choice of files is split by `minFileSize`, `maxFileSize` and the `accept` extensions (case-insensitive, spaces and
dots ignored); with more files than `fileLimit` all are invalid; the field takes the focus after a choice. Files
dropped anywhere on the field and button are validated the same way (a drop of several files without `multiple` is
all invalid; `fileLimit` applies to choices only, as Angular); drag enter and leave are counted across the children,
so `onFileDragEnter` and `onFileDragLeave` fire once per drag. `clear()` empties both lists and the file input and
calls the callbacks when there was something to clear. ARIA as Angular: `aria-live="polite"` and `autocomplete="off"`
on the field, `aria-required` with `required`, `aria-invalid` for the error state; the file input is hidden,
`aria-hidden` and out of the tab order.

**Differences from Angular, on purpose:**

- A disabled uploader (or `FileUploaderDragndrop`) is no drop target: `dragover` is not cancelled, so the browser shows
  the "no drop" cursor and the drop never happens. Angular accepts the drag and then ignores the drop without
  `preventDefault`, so the browser opens the dropped file instead.
- `name` puts the valid files in the hidden file input (also dropped ones, through a `DataTransfer`), so a native form
  submits them; Angular has the forms API instead.
- The field keeps the field margins in cozy density (`my-1`), as fundamental-styles; Angular's `my-0` removes them in
  cozy only (see the visual comparison).

### Stories vs. sources

| Source  | Example       | React story    | Status     | Notes                                                                  |
| ------- | ------------- | -------------- | ---------- | ---------------------------------------------------------------------- |
| Angular | Default       | `Default`      | ✅ covered | `.png,.jpg,.pdf`, required; the chosen and rejected files below it.    |
| Angular | States        | `States`       | ✅ covered | Success, error, warning, information, as fundamental-styles' Status.   |
| Angular | Size limits   | `SizeLimits`   | ✅ covered | 1 KB to 20 KB.                                                         |
| Angular | Single file   | `SingleFile`   | ✅ covered |                                                                        |
| Angular | Drop disabled | `DragDisabled` | ✅ covered |                                                                        |
| Angular | Disabled      | `Disabled`     | ✅ covered |                                                                        |
| Angular | Truncation    | `Truncation`   | ✅ covered | `width="8rem"`.                                                        |
| —       | —             | `Playground`   | ➕ added   | The props as controls.                                                 |
| —       | —             | `Selected`     | ➕ added   | fundamental-styles' After Selecting (`document.pdf`), the visual case. |
| —       | —             | `FileLimit`    | ➕ added   | `fileLimit={2}`.                                                       |
| —       | —             | `ButtonOnly`   | ➕ added   | `inputHidden`, as in the upload collection's toolbar.                  |
| —       | —             | `DropTarget`   | ➕ added   | `FileUploaderDragndrop` on its own, with a dashed drop area.           |

The uploader in the stories is 300px wide, as fundamental-styles' (Angular `max-w-md`), so pixels can be compared.
fundamental-styles' "File Uploader With Files" (a list of chosen files with object statuses and download/delete
buttons below the uploader) has no Angular counterpart and is not ported; the stories list the files as text.

### Tests vs. sources

| Source  | Behaviour                                           | React test                                                                               | Status     |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| Angular | `parseFileSize` units                               | parseFileSize: reads sizes with units                                                    | ✅ covered |
| Angular | Service: size and extension                         | validateFiles: splits files by size and extension                                        | ✅ covered |
| Angular | Service: minFileSize, range with extension          | validateFiles: rejects files below minFileSize, alone and between min and max …          | ✅ covered |
| Angular | Chosen files, valid ones to the form, focus         | shows chosen files and reports the valid ones                                            | ✅ covered |
| Angular | Dropped files                                       | accepts dropped files                                                                    | ✅ covered |
| Angular | Enter opens the dialog, typing ignored              | opens the file dialog from the field with click, Enter and Space, and ignores typing     | ✅ covered |
| Angular | Clear from the form and with `clear()`              | clears the files from the app and with clear(); follows a controlled value …             | ✅ covered |
| Angular | Disabled form control                               | disables the field and the button (`rerender`)                                           | ✅ covered |
| Angular | Fixed width, truncation, tooltip                    | fixes the field to the given width and truncates long names                              | ✅ covered |
| Angular | `fileLimit`                                         | rejects all chosen files when there are more than fileLimit                              | ✅ covered |
| Angular | Drag enter/leave once, across children              | calls onFileDragEnter and onFileDragLeave once while dragging over, also across children | ✅ covered |
| —       | `multiple` on drops, `dragndrop`                    | rejects a drop of several files without multiple, and ignores drops without dragndrop    | ➕ extra   |
| —       | Uncontrolled                                        | works uncontrolled with defaultValue                                                     | ➕ extra   |
| —       | ARIA (label, required, invalid, live), button label | labels the field and shows the value state, required and the button label                | ➕ extra   |
| —       | `inputHidden`                                       | hides the field with inputHidden, leaving the button                                     | ➕ extra   |
| —       | `open()`, hidden file input                         | opens the file dialog with open() and keeps the hidden file input out of reach           | ➕ extra   |
| —       | `name` (native form submission)                     | keeps the valid files in the named file input for form submission                        | ➕ extra   |
| —       | Drop target on its own                              | FileUploaderDragndrop: validates dropped files on its own and passes native props        | ➕ extra   |
| —       | Prop spreading, ref (registry convention)           | passes className, native props and the ref to the root                                   | ➕ extra   |

The file dialog is replaced by setting the file input's `files` and dispatching `change`, and drops by dispatching
`DragEvent`s with a `DataTransfer`, as the Angular spec; the Angular hosts' signals are props changed with `rerender`.

### Visual comparison

`pnpm visual file-uploader`: 15 cases × 16 combinations, **240/240** matching, against fundamental-styles' Default,
After Selecting and Status stories (both 300px wide): the uploader (field and button), the field at rest, hovered and
focused, the Browse button at rest and hovered, the field with a file, and the success, error, warning and
information fields at rest and hovered. fundamental-styles has no disabled uploader; the disabled field and button
are those of `input` and `button`.

| Difference                                 | Cause                                                                                              | Resolution                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Uploader 36px high in cozy instead of 44px | Angular's `my-0` on the field removes the cozy field margins only (`compact:my-[0.1875rem]` stays) | Fixed: the field keeps the field margins, as fundamental-styles |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, After selecting, States and Truncation. In RTL
the button comes first (at the right) and the names start at the right; compact shrinks the field and button to
26px.

Angular issues found: the field's `my-0` removes the cozy field margins but not the compact ones
(`compact:my-[0.1875rem]` stays), so the uploader is 36px high in cozy instead of fundamental-styles' 44px; a disabled
uploader still accepts drags and then ignores the drop without `preventDefault`, so the browser opens the dropped file.
