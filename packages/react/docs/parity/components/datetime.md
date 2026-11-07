## datetime

Sources: Angular [`registry/lib/datetime.ts`](../../../../angular/registry/lib/datetime.ts) (itself from
`@fundamental-ngx/core`'s datetime) · no fundamental-react source (it used Moment) · no fundamental-styles story.
Registry: `registry/lib/datetime.ts`, a `registry:lib` with no visuals. The calendar, time, date picker, time picker
and datetime picker build on it, so its API stays as close to Angular's as React allows.

API, as Angular's: `FdDate`, `toIso8601`, `isValidByParams`, `INVALID_DATE_ERROR`, the abstract `DatetimeAdapter<D>`
(every abstract method, `setTime`, `getAmountOfWeeks`, `compareDate`, the optional `fromNow`, `locale()` and
`setLocale()`), `FdDatetimeAdapter` (dates of type `FdDate`, names and formats from `Intl`, `dayPeriodLabels`),
`FdDateTimeFormatOptions`, `DayPeriodLabels`, `DateTimeFormats<F>` and `FD_DATETIME_FORMATS`. The date code is the
same line for line.

| Angular                                            | React                                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `DatetimeAdapter` token, root instance             | `useDatetimeAdapter<D>()`; without a provider, the app-wide `getDefaultDatetimeAdapter()`                 |
| `{ provide: DatetimeAdapter, useClass/useValue }`  | `<DatetimeAdapterProvider adapter={…}>`                                                                   |
| `provideDateTimeFormats()` (an adapter of its own) | `<DatetimeAdapterProvider>` without `adapter` (a new `FdDatetimeAdapter`), with `DateTimeFormatsProvider` |
| `LOCALE_ID`                                        | `FdDatetimeAdapter`'s constructor (`'en-US'` by default) and the provider's `locale` prop                 |
| `DATE_TIME_FORMATS` token                          | `useDateTimeFormats<F>()` and `<DateTimeFormatsProvider formats={…}>` (default `FD_DATETIME_FORMATS`)     |
| `locale: Signal<string>`                           | `locale()` plus `subscribe(listener)`: `useDatetimeAdapter` re-renders its component on `setLocale`       |
| `dateFormat` pipe                                  | `dateFormat(adapter, formats, date, noDateMessage?)`                                                      |
| `dateTimeFormat` pipe                              | `dateTimeFormat(adapter, formats, date, noDateMessage?)`                                                  |
| `dateFromNow` pipe                                 | `dateFromNow(adapter, date, noDateMessage?)`                                                              |
| `dayPeriodFormat` pipe                             | `dayPeriodFormat(adapter, date, customFormat?, noDateMessage?)`                                           |

**Differences on purpose:**

- The adapter is a plain class (no `@Injectable`); the locale is a value with listeners instead of a signal, and
  `setLocale` notifies only when the locale changes. The adapter object stays the same across locale changes, so a
  memo that formats lists `adapter.locale()` in its dependencies.
- The provider's `locale` prop is applied in a layout effect: a component inside renders once more, before paint,
  when the locale of a passed adapter differs.
- `FdDatetimeAdapter` resets its caches before it notifies (Angular reset them after setting the signal; there the
  order did not matter, as signals re-run lazily).
- The spec is `datetime.spec.tsx` (it renders components), as every spec of this package.

### Tests vs. sources

| Source  | Behaviour                                                  | React test                                                                                       | Status     |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Angular | FdDate: local date and time, months from 1                 | FdDate holds a local date and time with months from 1                                            | ✅ covered |
| Angular | FdDate: invalid dates and times                            | FdDate is invalid for impossible dates and times                                                 | ✅ covered |
| Angular | FdDate: now and today                                      | FdDate is now without arguments and today at midnight                                            | ✅ covered |
| Angular | Default adapter and formats from the injector              | is the default adapter with the default formats (the hooks without providers)                    | ✅ covered |
| Angular | Names in the locale, first day of the week                 | names months, days, hours and periods in the locale                                              | ✅ covered |
| Angular | Calendar arithmetic                                        | does calendar arithmetic                                                                         | ✅ covered |
| Angular | Formats, day periods                                       | formats dates, times and day periods                                                             | ✅ covered |
| Angular | Parsing in the locale's order                              | parses dates and times in the order of the locale                                                | ✅ covered |
| Angular | fromNow                                                    | tells the time from now                                                                          | ✅ covered |
| Angular | Pipes in templates                                         | format functions format dates in components                                                      | ✅ covered |
| —       | `dateFromNow` without `fromNow` and with no date           | format functions tell the time from now, and nothing without fromNow                             | ✅ new     |
| —       | Own adapter in a locale, re-render on `setLocale`/`locale` | providers give the components inside an adapter of their own in a locale, and follow its changes | ✅ new     |
| —       | App adapter and formats                                    | providers take an adapter and formats of the app                                                 | ✅ new     |
