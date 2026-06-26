# AI App Builder

AI App Builder is a modern web application that transforms a natural-language prompt into a working app experience. Users can sign in, describe the product they want to build, and iterate on the generated workspace through a chat-based interface with live code output.

## What it does

- Turns simple prompts into app concepts and generated code
- Provides a dedicated workspace for chat-driven refinement
- Offers a polished preview and code view for rapid iteration
- Stores user workspaces and generation history with Prisma
- Includes authentication, credits, and protection layers for production-ready use

## Tech stack

- Next.js 16 with React 19 and TypeScript
- Tailwind CSS and shadcn/ui components
- Prisma with PostgreSQL
- Clerk for authentication
- Google Gemini API for AI generation
- Arcjet for request protection and abuse prevention

## Getting started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/ai_app_builder
GEMINI_API_KEY=your_gemini_api_key
ARCJET_KEY=your_arcjet_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GEMINI_MODEL=gemini-2.5-flash
```

3. Generate Prisma client and sync the database:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project structure

- app/ - application routes, pages, and API handlers
- components/ - reusable UI and workspace components
- actions/ - server-side workspace actions
- lib/ - shared utilities, auth, and AI integrations
- prisma/ - schema and migrations

## Notes

The app is designed for fast prototyping and AI-assisted product creation, with a clean workspace experience centered around prompt-driven generation and iteration.
