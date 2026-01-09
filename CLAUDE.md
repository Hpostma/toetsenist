# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Toetsenist** is an adaptive AI-powered assessment application that conducts knowledge tests through Socratic dialogue. The system uploads educational documents (PDF, DOCX, TXT, Markdown), extracts concepts using AI, and conducts adaptive conversations with students where question difficulty adjusts based on answer quality.

### Core Architecture

This is a **Next.js 15** full-stack application with:
- **Frontend**: React Server Components + Client Components with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes (serverless functions)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **AI Integration**: Dual AI provider setup:
  - **Anthropic Claude** (primary): Document analysis and conversation management (claude-3-5-sonnet-20241022)
  - **Google Gemini**: Alternative provider for certain features (gemini-2.5-flash, gemini-2.5-pro)

### Project Structure

```
toetsenist/
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── api/
│   │   │   ├── concepten/route.ts    # Document concept extraction
│   │   │   ├── sessie/
│   │   │   │   ├── route.ts          # Session creation (POST) and retrieval (GET)
│   │   │   │   └── [id]/
│   │   │   │       ├── bericht/route.ts  # Send message in conversation
│   │   │   │       └── einde/route.ts    # End session and generate report
│   │   │   └── upload-docx/route.ts  # Document upload and text extraction
│   │   ├── dashboard/page.tsx        # User dashboard showing all sessions
│   │   ├── rapport/[id]/page.tsx     # Session report with results
│   │   ├── login/page.tsx            # Authentication page
│   │   └── page.tsx                  # Main page: document upload and session start
│   ├── components/
│   │   ├── ToetsGesprek.tsx          # Main conversation interface (chat UI)
│   │   ├── ConceptenOverzicht.tsx    # Display and review extracted concepts
│   │   ├── Rapport.tsx               # Report visualization component
│   │   ├── DatapuntenHelper.tsx      # Helper for concept data management
│   │   └── FileUpload.tsx            # Document upload component
│   ├── lib/
│   │   ├── anthropic.ts              # Claude API integration and prompts
│   │   ├── gemini.ts                 # Gemini API integration
│   │   ├── sessions.ts               # Session management with Supabase
│   │   ├── storage.ts                # File storage utilities
│   │   └── supabase.ts               # Supabase client initialization
│   ├── utils/supabase/
│   │   ├── server.ts                 # Server-side Supabase client
│   │   ├── client.ts                 # Client-side Supabase client
│   │   └── middleware.ts             # Auth middleware for session updates
│   └── middleware.ts                 # Next.js middleware for auth
├── instructions/
│   └── technische-specificatie-ai-toetsapplicatie.md  # Detailed technical spec
└── datapunten/                       # Sample rubric/data files
```

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Netlify build (alias for npm run build)
npm run netlify-build
```

## Environment Variables

Required in `.env.local`:

```bash
# Anthropic API (primary AI provider for conversations)
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini API (alternative/complementary AI provider)
GEMINI_API_KEY=...

# Supabase (database and auth)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # For admin operations
```

## Core Data Model

### Supabase Tables

**sessions** - Conversation sessions
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `document_title` (text)
- `concepts` (jsonb) - Array of extracted concepts
- `current_level` (int) - Current difficulty level (1-5)
- `engagement_status` (text) - Student engagement tracking
- `status` (text) - 'active', 'completed', 'abandoned'
- `recent_answers` (jsonb) - Sliding window of recent answer qualities
- `concept_scores` (jsonb) - Per-concept achievement data
- `created_at`, `updated_at` (timestamps)

**messages** - Conversation messages
- `id` (uuid, primary key)
- `session_id` (uuid, foreign key to sessions)
- `role` (text) - 'user' or 'assistant'
- `content` (text)
- `created_at` (timestamp)

### Core TypeScript Types

**Concept** (`src/lib/anthropic.ts` and `src/lib/gemini.ts`)
```typescript
interface Concept {
  id: string
  name: string
  definition: string
  complexity: number  // 1-5
  sourceSection?: string
}
```

**AssessmentMetadata** - AI response metadata
```typescript
interface AssessmentMetadata {
  questionLevel: number  // 1-5
  answerQuality: 'correct' | 'partial' | 'incorrect' | 'unclear'
  conceptsDemonstrated: string[]
  conceptsStruggling: string[]
  engagementSignal: 'high' | 'medium' | 'low' | 'declining'
  suggestedNextLevel: number
  phase: 'calibration' | 'exploration' | 'integration' | 'closing'
}
```

## Adaptive Level System

The application implements a 5-level Bloom's taxonomy-based system:

1. **Herkenning** (Recognition) - Yes/no questions, term identification
2. **Reproductie** (Reproduction) - Explain in own words
3. **Toepassing** (Application) - Apply to new situations
4. **Analyse** (Analysis) - Critical evaluation, comparison
5. **Synthese** (Synthesis) - Creative combination of concepts

### Level Adjustment Logic

**In `src/lib/anthropic.ts` (Claude) or `src/lib/gemini.ts`:**
- Start at level 2-3 for calibration
- Increase level by 1 after 3+ correct answers in a row
- Decrease level by 1 after 2+ incorrect/unclear answers
- Track engagement signals (answer length, enthusiasm) to provide support

**Metadata Format:**
Claude/Gemini responses include a JSON code block with assessment metadata that gets parsed to update session state.

## AI Integration Architecture

### Dual Provider Setup

The codebase supports **both Claude and Gemini** with similar interfaces:

**Claude** (`src/lib/anthropic.ts`) - Primary provider
- `analyzeDocument(text)` - Extract concepts from document
- `startConversation(concepts)` - Begin dialogue
- `chat(messages, concepts, level, engagement)` - Continue conversation

**Gemini** (`src/lib/gemini.ts`) - Alternative provider
- Same function signatures as Claude
- Currently used for TTS, transcription features from original template

### System Prompts

Located in `src/lib/anthropic.ts`:
- `DOCUMENT_ANALYSIS_PROMPT` - Extracts concepts, relations, examples as JSON
- `generateConversationPrompt()` - Dynamic prompt with current level, concepts, engagement status

**Key prompt principles:**
- Always ask ONE question per turn
- Always end with a clear question or task
- Include metadata JSON block in every response
- Adjust difficulty based on metadata
- Keep conversation in Dutch

## Authentication & Authorization

**Supabase Auth** with Row Level Security (RLS):
- All sessions are tied to `user_id`
- RLS policies ensure users only see their own sessions
- Middleware (`src/middleware.ts`) updates session on each request
- Protected routes check `supabase.auth.getUser()`

**User Flow:**
1. User visits `/login` and authenticates
2. Middleware validates session on each request
3. Dashboard shows only user's sessions via RLS
4. API routes verify user before operations

## Key API Endpoints

**POST /api/concepten** - Analyze document and extract concepts
- Input: `{ documentText: string }`
- Output: `{ concepts[], relations[], examples[] }`
- Uses Claude/Gemini to parse document structure

**POST /api/sessie** - Create new conversation session
- Input: `{ documentTitle, concepts[] }`
- Creates session in DB, generates welcome message
- Output: `{ sessionId, message, metadata, currentLevel }`

**POST /api/sessie/[id]/bericht** - Send message in conversation
- Input: `{ content: string }`
- Fetches session, appends message to history
- Calls AI with full context + system prompt
- Updates session metadata (level, engagement, scores)
- Output: `{ message, metadata, currentLevel }`

**POST /api/sessie/[id]/einde** - End session and generate report
- Marks session as completed
- Calculates final level, concept coverage, strengths/weaknesses
- Output: Report data for `/rapport/[id]`

## Important Implementation Notes

### When Working with Sessions

**Session state lives in Supabase** - Always fetch latest from DB before AI calls:
```typescript
const session = await getServerSession(sessionId)
const messages = session.messages  // Full conversation history
```

**Update metadata after each turn:**
```typescript
await updateSessionMetadata(sessionId, {
  currentLevel: metadata.suggestedNextLevel,
  engagementStatus: metadata.engagementSignal,
  recentAnswers: [...session.recentAnswers.slice(-4), metadata.answerQuality]
})
```

### Conversation Flow

1. User uploads document → `/api/upload-docx` extracts text
2. Text → `/api/concepten` → AI extracts concepts
3. User reviews concepts (optional edits)
4. Click "Start" → `/api/sessie` POST creates session + welcome message
5. User types answer → `/api/sessie/[id]/bericht` → AI responds with next question
6. Repeat step 5 until user clicks "Beëindigen"
7. `/api/sessie/[id]/einde` → Generate final report
8. Redirect to `/rapport/[id]` to view results

### File Processing Pipeline

**Document Upload** (`/api/upload-docx`):
- Supports PDF (pdf-parse), DOCX (mammoth), TXT, MD
- Extracts plain text while preserving structure (headings)
- Returns text string for concept extraction

**Concept Extraction** (`/api/concepten`):
- Sends full document text to AI
- AI returns structured JSON with concepts, relations, examples
- Frontend displays concepts for review/editing before starting session

## Testing the Application

**Full E2E Test:**
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Login/register
4. Upload a test document (PDF/DOCX with educational content)
5. Review extracted concepts
6. Start conversation
7. Answer 5-10 questions with varying quality
8. Verify level adjusts up/down based on answers
9. End conversation
10. Check report shows level progression, strengths, weaknesses

**Common Issues:**
- Missing API keys → Check `.env.local` has `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`
- Session not found → Ensure RLS policies allow user access
- AI not responding → Check API key validity and quota
- Concepts not extracting → Verify document text extraction worked

## Design System

**Colors:**
- Primary (HAN red): `#D0021B` (defined as `han-red` in Tailwind config)
- Text: Neutral grays
- Level indicators: Blue (1) → Green (2) → Yellow (3) → Orange (4) → Red (5)

**Typography:**
- Body: System font stack
- Headings: Uses `font-heading` class (defined in Tailwind config)

## Important Files to Review

Before making changes, understand:
- `instructions/technische-specificatie-ai-toetsapplicatie.md` - Complete technical specification
- `src/lib/anthropic.ts` - Core AI logic and prompts
- `src/lib/sessions.ts` - Session management and DB operations
- `src/components/ToetsGesprek.tsx` - Main conversation UI
- `src/app/api/sessie/[id]/bericht/route.ts` - Conversation turn handler

## Code Patterns

**Server-side Supabase usage:**
```typescript
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Client-side Supabase usage:**
```typescript
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
```

**AI function calls (Anthropic example):**
```typescript
import { chat } from '@/lib/anthropic'
const { response, metadata } = await chat(messages, concepts, currentLevel, engagement)
```

**Error handling pattern:**
```typescript
try {
  // operation
} catch (error) {
  console.error('Context:', error)
  return NextResponse.json(
    { error: 'User-friendly message', details: error.message },
    { status: 500 }
  )
}
```
