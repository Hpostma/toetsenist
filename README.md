# Toetsenist

**Adaptive AI-powered Assessment Platform** - Conduct knowledge tests through Socratic dialogue with automatic difficulty adjustment.

## Overview

Toetsenist is an educational assessment application that uses AI to conduct adaptive knowledge tests. Students engage in natural conversation with an AI that adjusts question difficulty based on their answers, following a 5-level Bloom's taxonomy system.

### Key Features

- 📄 **Document Upload** - Support for PDF, DOCX, TXT, and Markdown files
- 🤖 **AI-Powered Concept Extraction** - Automatic identification of key concepts and relationships
- 💬 **Socratic Dialogue** - Natural conversation-based assessment
- 📊 **Adaptive Level System** - Questions adjust from Recognition (1) to Synthesis (5) based on performance
- 📈 **Detailed Reports** - Level progression visualization and personalized feedback
- 🔐 **User Authentication** - Secure login with Supabase Auth
- 👥 **Multi-user Support** - Individual dashboards with session history

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Providers**:
  - Anthropic Claude (primary - conversations and analysis)
  - Google Gemini (alternative/complementary features)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key (or Gemini API key)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Hpostma/toetsenist.git
cd toetsenist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Anthropic API (primary AI provider)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Google Gemini API (alternative)
GEMINI_API_KEY=your-gemini-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Set up Supabase database:

Run the SQL migrations in your Supabase SQL editor:
- `database_schema.sql` - Creates tables for sessions and messages
- `auth_migration.sql` - Sets up authentication and RLS policies

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Students

1. **Login** - Create an account or sign in
2. **Upload Document** - Upload your study material (PDF, DOCX, etc.)
3. **Review Concepts** - Check the AI-extracted concepts
4. **Start Conversation** - Begin the adaptive assessment
5. **Answer Questions** - Engage in dialogue as difficulty adjusts
6. **View Report** - See your results, strengths, and areas for improvement

### For Developers

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation including:
- Architecture overview
- API endpoints
- Database schema
- AI integration patterns
- Code conventions

## Project Structure

```
toetsenist/
├── src/
│   ├── app/              # Next.js app router (pages + API routes)
│   ├── components/       # React components
│   ├── lib/              # Core logic (AI, sessions, storage)
│   └── utils/            # Utilities (Supabase clients)
├── instructions/         # Technical specifications
├── datapunten/          # Sample data/rubrics
├── CLAUDE.md            # Technical documentation for AI assistants
└── README.md            # This file
```

## Key Concepts

### Adaptive Level System

Questions are categorized into 5 levels based on Bloom's Taxonomy:

1. **Herkenning** (Recognition) - Basic recall and identification
2. **Reproductie** (Reproduction) - Explain concepts in own words
3. **Toepassing** (Application) - Apply to new situations
4. **Analyse** (Analysis) - Critical evaluation and comparison
5. **Synthese** (Synthesis) - Creative combination of concepts

The system automatically adjusts difficulty based on:
- 3+ correct answers → increase level
- 2+ incorrect answers → decrease level
- Engagement signals → provide support

## API Keys

### Anthropic Claude

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

### Google Gemini

1. Get API key from [AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local` as `GEMINI_API_KEY`

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get URL and keys from Project Settings → API
3. Run database migrations from the SQL editor

## Development Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm run lint         # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

```bash
npm run netlify-build
```

Configure environment variables in Netlify dashboard.

## Contributing

This is an educational project for HAN University of Applied Sciences. Contributions are welcome!

## License

This project is developed for educational purposes at HAN University of Applied Sciences.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Based on technical specifications in `instructions/technische-specificatie-ai-toetsapplicatie.md`
- Template originally by Tom Naberink

## Support

For technical documentation, see [CLAUDE.md](./CLAUDE.md)

For questions or issues, please open an issue on GitHub.
