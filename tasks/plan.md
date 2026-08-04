# Implementation Plan: Connect Jess Mode to the Chat API

## Overview

Replace the current seeded/localStorage coaching simulation with the authenticated V2alarry chat API while retaining the existing CoachingWorkspace interface. The first release streams assistant replies, persists conversations in the backend, and supports conversation history, loading a transcript, and deletion. File attachment is excluded because the chat API accepts only text.

## Current-State Findings

- The frontend at `src/features/coaching/` currently stores seeded conversations in `localStorage` and creates an artificial reply after 550 ms.
- The backend exposes authenticated endpoints at `/api/v1/chat/`: send a message, list conversations, get a conversation's messages, and delete a conversation.
- The frontend's centralized Axios client already attaches the NextAuth access token. Streaming needs `fetch` with that token because `EventSource` cannot set an Authorization header and Axios does not provide a browser streaming abstraction suitable for this UI.
- The streamed `done` event currently contains the conversation ID before the conversation is saved. A new conversation therefore reports an empty ID. This must be fixed before streaming is enabled in the UI.

## API Contract to Adopt

| Operation            | Request                                                                           | Success response                                                                      | Frontend use                                    |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Send (non-streaming) | `POST /chat/` with `{ message, conversation_id?, stream: false }`                 | `{ response, conversation_id, message_id, metadata }`                                 | Fallback/retry path                             |
| Send (streaming)     | `POST /chat/` with `{ message, conversation_id?, stream: true }` and Bearer token | SSE JSON token events, then one done event containing the persisted `conversation_id` | Primary send path                               |
| List history         | `GET /chat/conversations`                                                         | Conversation summaries                                                                | Sidebar data                                    |
| Load transcript      | `GET /chat/conversations/:id/messages`                                            | Ordered user/assistant messages                                                       | Selected conversation                           |
| Delete               | `DELETE /chat/conversations/:id`                                                  | Success response                                                                      | Remove a sidebar item and clear the active view |

All routes require the current NextAuth access token. The deployed backend must allow the website origin through CORS.

## Architecture Decisions

- Keep the existing feature boundary: `features/coaching/{api,components,hooks,types}`. Add a typed `chat.api.ts` adapter and React Query hooks; do not put HTTP or SSE parsing in components.
- Use backend UUIDs as session/message IDs after a successful response. Use client-only temporary IDs solely for optimistic rendering.
- Use the backend as the source of truth. Do not migrate or merge anonymous localStorage history, which has no matching user identity or backend IDs.
- Keep the UI text-only for this release. Disable/remove the attachment control and revise the privacy copy because conversations will no longer be stored only in the browser.
- Preserve exact backend error bodies in the adapter, map them to concise user-facing states in the hook, and retain a draft on failure. Retry must not silently duplicate a user message.

## Task List

### Phase 1: Stabilize the API contract

## Task 1: Make streaming persistence observable

**Description:** Change the stream sequence so it saves the full turn before emitting exactly one `done` event that contains the persisted conversation ID and stable metadata. Ensure stream errors use the documented error event and do not masquerade as success.

**Acceptance criteria:**

- [ ] A first streamed turn finishes with a non-empty UUID conversation ID.
- [ ] A follow-up sent with that ID is saved in the same conversation.
- [ ] Token, done, error, and terminal `[DONE]` event shapes are documented and covered by tests.

**Verification:**

- [ ] Backend automated stream-contract test passes.
- [ ] Authenticated manual test confirms a new and follow-up streamed turn persist together.

**Dependencies:** None

**Files likely touched:**

- `../V2alarry-backend/app/api/v1/user/chat.py`
- `../V2alarry-backend/app/workflows/chat_workflow.py`
- `../V2alarry-backend/tests/` or the project test location

**Estimated scope:** Medium

## Task 2: Define and test the browser-consumable chat contract

**Description:** Document validated request/response schemas and error statuses for all five chat operations. Add message limits/empty-message validation and correct error propagation so a missing conversation remains a 404 rather than becoming a 500.

**Acceptance criteria:**

- [ ] Invalid or blank chat input receives a predictable 4xx response.
- [ ] Invalid IDs, unauthorized access, not found, and server failures have stable status/body behavior.
- [ ] History and transcript ordering are explicitly asserted by API tests.

**Verification:**

- [ ] Backend contract tests pass without requiring a browser.
- [ ] The generated OpenAPI document matches the documented request and response types.

**Dependencies:** Task 1

**Files likely touched:**

- `../V2alarry-backend/app/api/v1/user/chat.py`
- `../V2alarry-backend/app/services/chat_history_service.py`
- `../V2alarry-backend/app/schemas/conversation.py`
- `../V2alarry-backend/tests/` or the project test location

**Estimated scope:** Medium

### Checkpoint: Backend contract

- [ ] A fresh streamed conversation returns its saved ID.
- [ ] The non-streaming fallback, history, transcript, and delete APIs pass contract tests.
- [ ] The deployed frontend origin is present in `ALLOWED_ORIGINS` before browser testing.

### Phase 2: Add a typed frontend data layer

## Task 3: Add chat API schemas and React Query hooks

**Description:** Create Zod-validated frontend mappings for conversation summaries, messages, and non-streaming sends. Add query keys and hooks for history/transcript loading and a delete mutation using the existing `api` client.

**Acceptance criteria:**

- [ ] Unexpected API payloads fail at the adapter boundary rather than reaching UI state.
- [ ] Sidebar history is cached and refreshed after a completed turn or deletion.
- [ ] Transcript data is only fetched for the selected conversation and renders messages in server order.

**Verification:**

- [ ] Adapter and hook tests cover valid payloads, malformed payloads, loading, and error states.
- [ ] Type check and lint pass.

**Dependencies:** Checkpoint: Backend contract

**Files likely touched:**

- `src/features/coaching/api/chat.api.ts`
- `src/features/coaching/hooks/useChat*.ts`
- `src/features/coaching/types.ts`

**Estimated scope:** Medium

## Task 4: Implement authenticated SSE consumption

**Description:** Add an abortable `fetch`-based stream helper that obtains the active NextAuth access token, sends the Bearer header, incrementally parses SSE frames across arbitrary network chunks, and exposes token/done/error callbacks to the workspace hook.

**Acceptance criteria:**

- [ ] Incremental tokens update one optimistic assistant message.
- [ ] The done event replaces the temporary session ID with the persisted UUID and refreshes history.
- [ ] Abort/unmount, malformed frames, 401, server error events, and interrupted streams leave the composer usable and show a retryable error.

**Verification:**

- [ ] Unit tests cover split SSE frames and all event types.
- [ ] An authenticated browser test confirms token-by-token rendering.

**Dependencies:** Task 3

**Files likely touched:**

- `src/features/coaching/api/chat.api.ts`
- `src/features/coaching/hooks/useCoachingWorkspace.ts`
- `src/features/coaching/types.ts`

**Estimated scope:** Medium

### Checkpoint: Data flow

- [ ] Login, send, refresh, navigate away/back, load transcript, and delete work against the backend.
- [ ] A failed request retains the unsent draft and does not create duplicate persisted messages.

### Phase 3: Connect and complete the UI

## Task 5: Replace local simulation with server-backed workspace state

**Description:** Refactor `useCoachingWorkspace` to compose the chat hooks, retain only ephemeral UI state locally, and remove seeded sessions/localStorage persistence. Maintain optimistic user/assistant messages while a streamed answer is in progress.

**Acceptance criteria:**

- [ ] The sidebar lists backend conversations and selecting one loads its transcript.
- [ ] New session, send, pending, error/retry, and delete states are keyboard-accessible and clear.
- [ ] Existing fake reply and timeout behavior are removed.

**Verification:**

- [ ] Component tests assert the backend-driven states rather than the 550 ms mock response.
- [ ] Manual browser checks pass at mobile and desktop sizes.

**Dependencies:** Task 4

**Files likely touched:**

- `src/features/coaching/hooks/useCoachingWorkspace.ts`
- `src/features/coaching/components/CoachingWorkspace.tsx`
- `src/features/coaching/components/CoachingWorkspace.test.tsx`
- `src/features/coaching/coaching-data.ts`

**Estimated scope:** Medium

## Task 6: Render backend-backed conversation states

**Description:** Update the conversation and sidebar components to render server-loaded history and transcripts, stream-progress, delete, retry, and empty states from the workspace hook without changing the established layout.

**Acceptance criteria:**

- [ ] Conversation selection, pending response, retry, and deletion states are visually and semantically clear.
- [ ] Keyboard navigation and automatic scrolling remain intact.
- [ ] Component tests cover the server-driven UI states.

**Verification:**

- [ ] Relevant frontend component tests pass.
- [ ] Manual browser checks pass at mobile and desktop sizes.

**Dependencies:** Task 5

**Files likely touched:**

- `src/features/coaching/components/CoachingConversation.tsx`
- `src/features/coaching/components/CoachingSidebar.tsx`
- `src/features/coaching/components/CoachingWorkspace.test.tsx`

**Estimated scope:** Medium

## Task 7: Align product copy and unsupported controls

**Description:** Remove or disable the current attachment flow until a deliberate upload-and-chat contract exists, and replace the inaccurate browser-only privacy/storage statements with approved product copy.

**Acceptance criteria:**

- [ ] The UI does not imply files are sent when they are not part of the API.
- [ ] The storage/privacy statement accurately reflects authenticated server persistence.
- [ ] Empty, loading, offline, and authorization-expired states are understandable.

**Verification:**

- [ ] Keyboard and screen-reader checks cover the changed controls and status text.
- [ ] Product owner approves revised privacy wording.

**Dependencies:** Task 6

**Files likely touched:**

- `src/features/coaching/components/CoachingConversation.tsx`
- `src/features/coaching/components/CoachingSidebar.tsx`
- `src/app/globals.css`

**Estimated scope:** Small

### Checkpoint: Release readiness

- [ ] `npm run lint`, `npm run type-check`, `npm test`, and `npm run build` pass in `v2alarry-website`.
- [ ] Backend chat contract tests pass.
- [ ] Browser checks cover unauthenticated access, an expired session, new/continued streams, server error/retry, history, transcript, deletion, and responsive layouts.

## Risks and Mitigations

| Risk                                             | Impact | Mitigation                                                                                                                                   |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Stream done event has no persisted ID            | High   | Complete Task 1 before frontend streaming work.                                                                                              |
| CORS or deployed API URL is stale                | High   | Verify the production `NEXT_PUBLIC_API_URL` and backend `ALLOWED_ORIGINS` together before integration testing.                               |
| Retrying after a broken stream duplicates a turn | High   | Use a visible retry decision and only reconcile with IDs returned by the server; consider an idempotency key as a follow-up API enhancement. |
| Existing attachments imply unsupported delivery  | Medium | Remove/disable the control now; scope upload separately.                                                                                     |
| Sidebar says it searches message text            | Medium | Initially search loaded conversation titles only, or add a paginated server-side message-search endpoint as a separately designed feature.   |

## Open Questions

- Should chat be available to every authenticated user, or should the Next.js proxy enforce login before rendering the workspace?
- Is text-only chat acceptable for this release, or should file attachment be a separately scoped upload/RAG feature?
- What approved wording should describe server-side conversation storage, retention, and deletion?
- Is full-text search across all message histories required now? The current API supports only conversation listing and per-conversation transcripts.
