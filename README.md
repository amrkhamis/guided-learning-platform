# Guided Learning

**[Live Demo](https://guided-learning.netlify.app/)**

An AI-powered learning platform where users can learn any topic through an interactive, step-by-step experience guided by an AI tutor.

## How it works

1. **Type any topic** — "Python programming", "Italian cooking", "music theory", anything
2. **AI generates a learning path** — a structured 5-10 step curriculum tailored to the topic
3. **AI tutor guides you** — teaches concepts, gives exercises, checks understanding
4. **Code editor** — Monaco Editor (VS Code engine) appears automatically for coding topics
5. **Personal library** — all sessions are saved so you can resume where you left off

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Vercel AI SDK** for streaming chat
- **OpenRouter** for AI (free tier with Llama 4 Maverick)
- **Monaco Editor** for in-browser code editing

## Getting started

### Prerequisites

- Node.js 22+
- An OpenRouter API key (free at [openrouter.ai](https://openrouter.ai))

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your OpenRouter API key to .env.local
# OPENROUTER_API_KEY=sk-or-v1-...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project structure

```
src/
  app/                        # Next.js app router pages
    api/
      chat/                   # AI tutor streaming API
      generate-path/          # Learning path generation API
    learn/
      new/                    # New learning path creation page
      [sessionId]/            # Active learning session page
  components/                 # React components
    LearningView              # Main learning interface
    ChatMessage               # Chat message bubble
    CodeEditor                # Monaco-based code editor
    StepProgress              # Step progress bar
  lib/                        # Utilities
    ai.ts                     # OpenRouter client config
    sessions.ts               # Session CRUD (localStorage)
    types.ts                  # TypeScript types
```

## How sessions work

When a user enters a topic:

1. The AI generates a structured learning path (5-10 steps with titles and objectives)
2. The user previews the path and clicks "Start Learning"
3. A session is created in localStorage
4. The AI tutor teaches each step conversationally — explaining, exercising, checking understanding
5. Progress is saved automatically and visible in the learning library on the homepage

## Deployment

The app is deployed on **Netlify**: [guided-learning.netlify.app](https://guided-learning.netlify.app/)

To deploy your own instance:

1. Push the repo to GitHub
2. Import in [Netlify](https://app.netlify.com) (auto-detects Next.js)
3. Add `OPENROUTER_API_KEY` as an environment variable
4. Deploy — Netlify handles SSR, API routes, and caching automatically
