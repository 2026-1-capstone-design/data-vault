<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI Component Rule
Use shadcn components from `src/components/ui` as the default for all basic UI components.

# Responsive Scope Rule
This web app does not need responsive design and is intended for desktop use only.

# Data Fetching Rule
Use tRPC and TanStack Query for all data communication between the server and the client.

# Query Construction Rule
When creating any TanStack Query query or mutation, always use `react-query-kit`.

# Folder Structure Rule
- `src/app`: Next.js App Router. Place one-off components in the appropriate scoped `_components` folder under this directory. If a component here starts being reused, move it to `src/components`.
- `src/components`: Reusable components. Keep a single depth (do not split by domain; express domain context in the component name).
- `src/lib`: Business logic lives here.
- `src/shared`: Reusable code outside business logic.
- `src/providers`: Providers for specific libraries (for example, TanStack).

# Planning Reference Rule
When creating an implementation plan, always review the PRD and proposal documents under `docs/` first.

# Docs Update Rule
When updating `README.md` or files under `docs/` after resolving an issue, do not mention issue numbers unless explicitly instructed to reference a specific issue.

# Lint Verification Rule
When running lint for code verification, use `--fix` so any auto-fixable issues are resolved automatically.

# Code Verification Rule
After finishing code modifications, always run the verification script `pnpm code-check` to ensure there are no lint, type, or test regressions.

# GitHub PR Creation Rule
When creating a GitHub pull request, always use the `gh` CLI command instead of the GitHub MCP tools.

# API Management Rule
Use tRPC for API management and TanStack Query for server-client state synchronization.

# React Import Rule
When using React module APIs (e.g., `useState`, `useEffect`, `useRef`), import them as named imports and do not use the `React.` prefix.

# Context Creation Rule
Use the `createContext` function from `@/shared/react` instead of React's built-in `createContext`.
