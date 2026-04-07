# Revenue AI Frontend: Technical Information Guide

This document serves as a comprehensive technical guide for any AI orchestrator or coding agent looking to understand the structure, architecture, and tech stack of the `revenue-ai` project. 

## 1. Project Overview & Role
**Name:** `revenue-ai`
**Type:** React Frontend Single Page Application (SPA), mocked as a Minimum Viable Product (MVP) dashboard for revenue collection and AI triage operations.
**Goal:** Provide an interactive dashboard for managing "Defaulters" (customers with outstanding debts), deploying AI-generated reminders, managing operational tasks via Kanban, and tracking notifications. All data is currently managed in-memory via React functionality and mock data without a live backend connection.

## 2. Tech Stack Ecosystem
- **Core:** React 18 (Strict Mode), TypeScript (~5.9.3), Vite 8
- **Routing:** `react-router-dom` v6
- **Styling:** Tailwind CSS v3.4, `tailwindcss-animate`, PostCSS, Autoprefixer
- **UI Components:** `shadcn/ui` (accessible, customizable generic headless components powered by `@base-ui/react`, Radix, and standard React primitives)
- **Table Management:** `@tanstack/react-table` (used for the robust Defaulters Queue table)
- **Drag-and-Drop:** `@hello-pangea/dnd` (used for tasks Kanban Board)
- **Icons:** `lucide-react`
- **Themes:** `next-themes` (light/dark mode toggle)
- **Toast Notifications:** `sonner`

## 3. Directory Architecture (`/src`)

The source directly heavily models a feature-level and domain-level organization structure. 

### `/src/components`
Contains visually decoupled presentation components.
- **/layout**: Core application shells. `AppShell.tsx` wraps child route rendering with `Sidebar.tsx` and a `NotificationSheet.tsx`. 
- **/queue**: Components relating to the defaulter data view. Uses `@tanstack/react-table` heavily in `DefaulterQueueTable.tsx` accompanied by `BulkActionBar.tsx` and `StatCards.tsx`.
- **/reminders**: AI Composer feature. Displays `CustomerList.tsx` for selection, leading to a `ComposerPanel.tsx` that mimics generating AI drafts and recording actions to a `TrackFeed.tsx`. Uses `TriagePanel.tsx` for responding to incoming replies.
- **/tasks**: Task management feature containing `KanbanBoard.tsx` (utilizing `@hello-pangea/dnd`) and individual `TaskCard.tsx`.
- **/ui**: Base `shadcn` components (buttons, input, sheet, dialog, etc.).

### `/src/features`
Page wrappers encapsulating individual routes. These directly consume `/src/components`.
- **/queue**: `queue-page.tsx`
- **/reminders**: `reminders-page.tsx`
- **/tasks**: `tasks-page.tsx`
- **/insights**: `insights-page.tsx` (Stubbed out dashboard graph view).

### `/src/data`
Mock application data establishing the entity relationship structure.
- `defaulters.ts`: Sets up `CustomerAccount` data including financial metadata, risk level, and communication history blocks (`trackFeed`).
- `tasks.ts`: Seed data for the Task Management feature.
- `triageReplies.ts`: Incoming customer messages for triage.
- `notifications.ts`: Seed data for the global notification tray.

### `/src/lib`
Logic, type definition, and shared utilities.
- `dashboard-store.tsx`: **Crucial state component**. Implements a React Context (`useDashboardStore`) functioning as a pseudo-backend. It initializes the arrays from `/src/data/` and exposes "mutation" methods such as `sendReminder`, `regenerateDraft`, `createTask`, `updateTaskStatus`, and `closeTask`.
- `types.ts`: Application-wide TypeScript interfaces (`CustomerAccount`, `TaskItem`, `TriageItem`).
- `utils.ts`: Standard class-merging helper functions (`cn`).

### `/src/App.tsx`
Orchestrator for Routes and context wrapping. Sets up `<DashboardStoreProvider>` at the root and delegates standard URIs (`/queue`, `/reminders`, `/tasks`, `/insights`) inside the `<AppShell>`.

## 4. Current State Management Paradigm
As there isn't a live backend, all state transitions rely on React state wrapped in `DashboardStoreContext`.
- **Reading Data:** Any component requiring state hooks into `useDashboardStore()` and reads arrays (`queueStats`, `customers`, `triageItems`, `tasks`).
- **Mutating Data:** For any pseudo-API request (e.g., sending an AI-drafted message to a customer), the component invokes a function from the store (e.g. `sendReminder(customerId)`), which then mutates the `customers` state array locally, fires a `sonner` toast for visual feedback, and triggers a re-render. All data changes are lost upon a browser refresh.

## 5. Implementation Notes for Agents modifying code
1. **Adding API functionality**: If a real backend integration is requested, the ideal integration point is to replace the synchronous mock array mutations in `/src/lib/dashboard-store.tsx` with async `fetch`/`axios` calls (potentially using React Query if the stack is expanded). 
2. **Adding a Feature**:
   - Create route components inside `/src/features/{featureName}/`.
   - Add discrete components under `/src/components/{featureName}/`.
   - Wire route into `/src/App.tsx`.
   - Create mock definitions in `/src/lib/types.ts` and initialize mock structures in `/src/data/`.
   - Wire state into `/src/lib/dashboard-store.tsx`.
3. **Styling Standard**: Utilize Tailwind utility classes. For complex components, import/initialize `shadcn` components to `/src/components/ui/` using standard Radix primitives instead of building from scratch. Use `lucide-react` for all visual iconography.
