# AI App Builder

AI App Builder is a full-stack AI-powered web application that transforms natural language prompts into working applications. Describe the product you want to build, and the AI generates an interactive workspace where you can chat, iterate, preview, and refine your application in real time.

The project is built with Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Google Gemini, and Clerk to provide a modern, production-ready development experience.

---

## Features

- Generate applications from natural language prompts
- Chat-based AI workspace for iterative development
- Live code generation with streaming responses
- Interactive preview and code editor
- Persistent workspaces and generation history
- Secure authentication with Clerk
- Request protection and rate limiting with Arcjet
- Responsive interface built with Tailwind CSS and shadcn/ui

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Next.js Server Actions
- Prisma ORM
- PostgreSQL

### AI

- Google Gemini API
- Gemini 2.5 Flash

### Authentication & Security

- Clerk
- Arcjet

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL

### Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/ai-app-builder.git
cd ai-app-builder
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_app_builder

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

ARCJET_KEY=your_arcjet_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Generate the Prisma client and synchronize the database:

```bash
npx prisma generate
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```text
.
├── app/              # App Router pages and API routes
├── actions/          # Server Actions
├── components/       # Reusable UI components
├── lib/              # Shared utilities, AI, authentication
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets
└── types/            # Shared TypeScript types
```

---

## How It Works

1. Sign in to the application.
2. Enter a prompt describing the application you want to build.
3. The AI generates an initial version of your project.
4. Continue refining the application through the chat interface.
5. Preview the generated application and inspect the generated code.

---

## Built With

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Google Gemini API
- Clerk
- Arcjet

---
