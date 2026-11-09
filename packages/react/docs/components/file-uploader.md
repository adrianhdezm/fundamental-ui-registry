## file-uploader

Sources: fundamental-react: none · Angular [`registry/ui/file-uploader`](../../../angular/registry/ui/file-uploader/) ·
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
