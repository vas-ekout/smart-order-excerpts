# Reprocessing Devices

A slide-in drawer panel for managing dental reprocessing devices and their hygiene workflows, built as part of the [smart.Order](https://www.henryschein.de/de-de/dental/smartorder.aspx) platform by Henry Schein.

## Screenshot

<img src="assets/screenshot-reprocessing-device-list.png" alt="Reprocessing Device List" width="360" />

## Components

### `ReprocessingDeviceList.tsx`
The main drawer panel component. Key features:
- Animated tab filter built from scratch using a CSS `translateX` sliding highlight — no extra library, just a styled `span` that moves based on the selected tab index
- Filters devices by hygiene flow type (All / Pre-cleaning / Disinfection / Sealing / Sterilisation)
- Sorts filtered devices alphabetically
- Renders a `SmartConnectRequired` fallback when the SmartConnect integration is inactive

### `ReprocessingDeviceCard.tsx`
Card component for a single device. Key features:
- Status-driven CTA: shows "Open reprocessing" for active processes, "Start new process" for completed or absent ones — based on `ReprocessingStatus` enum
- Navigates directly into the reprocessing edit flow on action
- Displays last reprocessing timestamps with start → finish arrow
- Highlights the card with an outline when the corresponding device settings are currently open in the main view (cross-panel awareness via `useMatch`)

### `SmartConnectRequired.tsx`
Fallback state component shown when the SmartConnect hardware integration is not active. Prompts the user to start SmartConnect and provides a reload button.

## Tech Stack

- **React** + **TypeScript**
- **MUI (Material UI)** – layout, styled components, toggle button group
- **@connectrpc/connect-query** – data fetching and mutations
- **react-router** – navigation and route matching
- **react-i18next** – internationalisation
- **notistack** – toast notifications

## Notes

This is an excerpt from a larger application. Internal imports (`@cubular/*`, proto-generated API types, custom hooks) are part of the host application's monorepo and are not included here.
