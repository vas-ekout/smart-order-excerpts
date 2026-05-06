# Device Checklists

A feature for creating and managing configurable checklists for dental reprocessing devices, built as part of the [smart.Order](https://www.henryschein.de/de-de/dental/smartorder.aspx) platform by Henry Schein.

## Screenshot

<img src="assets/screenshot-device-checklist.png" alt="Device Checklist Feature" width="100%" />

## Components

### `DeviceChecklist.tsx`
The main orchestrator component. Key features:
- Fetches or initializes a checklist per device via `@connectrpc/connect-query`
- Template system: if no checklist exists yet, the user can pick from pre-defined system templates (loaded lazily via a conditional query)
- Drag & drop reordering using `@dnd-kit/core` with both pointer and keyboard sensor support
- Optimistic reordering: list order updates immediately in local state, then persists to the backend via mutation
- Inline name editing with `onBlur` save — only fires a mutation if the name actually changed

### `DeviceChecklistItem.tsx`
Individual sortable checklist item. Features:
- Integrates with `@dnd-kit/sortable` for drag handle, transform, and drag opacity
- Inline label editing via a `ChecklistLabel` component
- Toggle for `isMandatory` status with visual feedback (green/neutral icon button)
- Delete action with immediate refetch

### `DeviceChecklistItemForm.tsx`
Collapsible form for adding new checklist items. Features:
- Controlled expand/collapse via MUI `Collapse` with `unmountOnExit` for clean state
- `react-hook-form` with a `Controller`-driven `isMandatory` toggle button
- Submit only enabled when form is dirty
- On abort, resets form state with a small timeout to avoid visual flicker during collapse animation

## Tech Stack

- **React** + **TypeScript**
- **@dnd-kit** – drag & drop with keyboard accessibility
- **react-hook-form** – form state and validation
- **@connectrpc/connect-query** – type-safe API queries and mutations
- **MUI (Material UI)** – layout and components
- **react-i18next** – internationalisation
- **notistack** – toast notifications

## Notes

This is an excerpt from a larger application. Internal imports (`@cubular/*`, proto-generated API types) are part of the host application's monorepo and are not included here.
