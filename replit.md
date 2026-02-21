# Eterna - Digital Museum of Human Memory

## Overview

Eterna is a living digital museum web application where human skills, traditions, recipes, and rituals are preserved as digital artifacts. Users submit cultural artifacts (recipes, skills, rituals, professions) with images and descriptions, and the system generates AI-powered extinction risk assessments and poetic narratives. Artifacts visually "fade" over time (desaturation, blur, transparency) unless community members actively support them through voting, staking, and interacting. The app includes an NFT-style gallery, artifact detail pages with comments, a preservation submission form, and a curator dashboard with analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router) with four main pages: Gallery (`/`), Preserve (`/preserve`), Artifact Detail (`/artifact/:id`), Dashboard (`/dashboard`)
- **State Management**: TanStack React Query for server state, with custom hooks in `client/src/hooks/use-artifacts.ts`
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Animations**: Framer Motion for fade effects, card hover animations, and page transitions
- **Charts**: Recharts for dashboard analytics and visualizations
- **Styling**: Tailwind CSS with CSS variables for theming. Museum-like aesthetic with serif headers (Playfair Display), earthy warm tones, and minimal UI. Supports dark mode.
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (Express)
- **Framework**: Express 5 on Node.js with TypeScript (run via `tsx`)
- **API Structure**: RESTful JSON API under `/api/` prefix. Routes defined in `server/routes.ts` with shared route contracts in `shared/routes.ts`
- **AI Integration**: OpenAI API (configurable base URL via `AI_INTEGRATIONS_OPENAI_BASE_URL`) for generating poetic narratives about artifacts and extinction risk reasoning
- **Background Processing**: `setInterval`-based fading simulation that gradually increases artifact fade levels over time based on extinction risk and time since last community support
- **Dev Server**: Vite dev server integrated as Express middleware (HMR via `server/vite.ts`)
- **Production**: Client built to `dist/public`, server bundled to `dist/index.cjs` via esbuild

### Database (PostgreSQL + Drizzle ORM)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` — shared between frontend and backend
- **Tables**:
  - `artifacts` — id, title, type, description, imageUrl, tags (text array), extinctionRisk (0-100), fadeLevel (0-100), aiNarrative, supportCount, createdAt, lastSupportedAt, tokenId, rarity
  - `comments` — id, artifactId, content, supportCount, createdAt, reactions (JSONB with emoji counts)
- **Additional Schema**: `shared/models/chat.ts` defines `conversations` and `messages` tables (appears unused currently but may be for future chat features)
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions for input validation
- **Migrations**: Use `drizzle-kit push` (`npm run db:push`) to sync schema to database
- **Connection**: `pg` Pool using `DATABASE_URL` environment variable
- **Seed Data**: `server/seed.ts` provides sample artifacts and comments for initial setup

### Shared Code (`shared/`)
- `schema.ts` — Database table definitions and Zod insert schemas, shared between client and server
- `routes.ts` — API route contracts (paths, methods, input/output schemas) used by both frontend hooks and backend handlers

### Key Design Patterns
- **Fade Mechanics**: Artifacts have a `fadeLevel` (0-100) that increases over time. Visual effects (opacity, blur, desaturation) are computed from this value on the frontend. Community support actions reset/reduce the fade level.
- **Support System**: Three support actions (vote, stake, interact) that reduce fade level and increment support count
- **Image Handling**: Images are converted to base64 data URLs on the client before being sent to the API
- **Type Safety**: End-to-end TypeScript with shared schemas ensuring frontend and backend agree on data shapes

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Required for the app to function.
- **OpenAI API**: Used for generating AI narratives about artifacts. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables. Falls back gracefully to default text if unavailable.
- **Google Fonts**: Playfair Display (serif headers), Inter (body text), DM Sans, Fira Code, Geist Mono loaded via CDN
- **Unsplash**: Seed data references Unsplash image URLs for sample artifacts
- **npm packages of note**: `express` v5, `drizzle-orm`, `openai`, `framer-motion`, `recharts`, `wouter`, `react-hook-form`, `zod`, `date-fns`, `connect-pg-simple` (session store)