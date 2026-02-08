# Guided Learning Platform

An AI-powered learning platform where users learn technical skills through interactive, step-by-step courses guided by an AI tutor.

## How it works

1. **Structured courses** — Each course is a JSON file with steps, exercises, and understanding checks
2. **AI tutor** — Claude guides the student through each step, adapting pace and depth
3. **Code editor** — Monaco Editor (VS Code engine) embedded in the browser for hands-on exercises
4. **Progress tracking** — Students can resume where they left off

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Vercel AI SDK** for streaming chat with Claude
- **Monaco Editor** for in-browser code editing
- **Anthropic Claude** as the AI tutor

## Getting started

### Prerequisites

- Node.js 22+
- An Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your Anthropic API key to .env.local
# ANTHROPIC_API_KEY=your-key-here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project structure

```
src/
  app/                    # Next.js app router pages
    api/chat/             # AI tutor streaming API
    course/[courseId]/     # Course learning page
  components/             # React components
    CourseLearningView    # Main learning interface
    ChatMessage           # Chat message bubble
    CodeEditor            # Monaco-based code editor
    StepProgress          # Step progress bar
  content/courses/        # Course JSON files
  lib/                    # Utilities
    courses.ts            # Course engine
    types.ts              # TypeScript types
```

## Creating a course

Courses are JSON files in `src/content/courses/`. See `python-basics.json` for the format.

Each step has:
- **teach** — what the tutor should explain
- **exercise** — hands-on task for the student
- **checkUnderstanding** — question to verify the student gets it

The AI tutor follows the curriculum but improvises how it explains concepts.
