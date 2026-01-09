# Technische Specificatie: Adaptieve AI-Toetsapplicatie

## Socratische Dialoog op Basis van Eigen Bronmateriaal

---

> **BOUWINSTRUCTIE VOOR AGENTIC AI**
> 
> Dit document bevat alle specificaties om de applicatie volledig te bouwen, inclusief database, authenticatie, hosting en alle functionaliteit.

---

## Instructies voor de Bouwende AI

Dit document is specifiek geschreven als context voor een agentic AI (zoals Manus, Devin, of vergelijkbaar) die deze applicatie autonoom moet bouwen en deployen. **Lees dit document volledig door voordat je begint met bouwen.**

### Wat je moet bouwen

Een webapplicatie waarmee docenten en studenten kennistoetsen kunnen afnemen in de vorm van een AI-gestuurd gesprek. De gebruiker uploadt een document (reader, syllabus, artikel), de AI analyseert dit en voert vervolgens een Socratische dialoog met de student om diens begrip te toetsen. Het niveau van de vragen past zich dynamisch aan op basis van de antwoorden.

### Kernvereisten

1. **Document upload en verwerking:** PDF, DOCX, TXT, Markdown kunnen uploaden en omzetten naar een kennisstructuur.
2. **AI-conversatie:** Integratie met Claude API (Anthropic) voor het voeren van de toetsdialoog.
3. **Adaptief niveausysteem:** Vraagniveau past zich aan op basis van antwoordkwaliteit.
4. **Gebruikersbeheer:** Aparte rollen voor docenten en studenten met authenticatie.
5. **Rapportage:** Gedetailleerde feedback met niveau-verloop na afloop van het gesprek.
6. **Hosting:** Volledig gedeployde applicatie met database en authenticatie.

### Technische Stack (aanbevolen)

Je mag afwijken van deze stack als je een betere oplossing ziet, maar dit is de aanbevolen configuratie:

- **Frontend:** Next.js 14+ met TypeScript, Tailwind CSS
- **Backend:** Next.js API routes of aparte Node.js/Express server
- **Database:** PostgreSQL (via Supabase, Neon, of Vercel Postgres)
- **Authenticatie:** NextAuth.js of Supabase Auth
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514 of claude-opus-4-20250514)
- **File processing:** pdf-parse, mammoth (docx), marked (markdown)
- **Hosting:** Vercel (frontend + API) + managed database
- **File storage:** Vercel Blob, Cloudflare R2, of Supabase Storage

---

## Inhoudsopgave

1. [Productoverzicht](#1-productoverzicht)
2. [Gebruikersrollen en Authenticatie](#2-gebruikersrollen-en-authenticatie)
3. [Documentverwerking](#3-documentverwerking)
4. [Adaptief Niveausysteem](#4-adaptief-niveausysteem)
5. [Conversatie-engine](#5-conversatie-engine)
6. [Beoordelingslogica](#6-beoordelingslogica)
7. [Rapportage](#7-rapportage)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [User Interface Specificaties](#10-user-interface-specificaties)
11. [System Prompts](#11-system-prompts)
12. [Deployment Checklist](#12-deployment-checklist)
13. [Toekomstige Uitbreidingen en Suggesties](#13-toekomstige-uitbreidingen-en-suggesties)

---

## 1. Productoverzicht

### Kernfunctionaliteit

De applicatie is een AI-gestuurde toetsomgeving die kennisbegrip toetst via Socratische dialoog. In plaats van meerkeuzevragen of open vragen met modelantwoorden, voert een AI een natuurlijk gesprek met de student waarin het begrip van studiemateriaal wordt geëvalueerd.

### Gebruikersflow

#### Docentflow

1. Docent logt in en uploadt een document (reader, syllabus, artikel).
2. Systeem analyseert document en extraheert concepten en relaties.
3. Docent reviewt geëxtraheerde concepten (optioneel: aanpassen/toevoegen).
4. Docent configureert toets (naam, minimum/maximum niveau, tijdslimiet).
5. Systeem genereert deelcode of link voor studenten.
6. Docent bekijkt resultaten van studenten in dashboard.

#### Studentflow

1. Student opent link of voert deelcode in.
2. Student logt in (of gebruikt als gast bij zelftest).
3. AI start gesprek met welkom en kalibratievragen.
4. Student en AI voeren dialoog (15-30 minuten).
5. Na afloop: student ziet resultaatrapport met niveau-verloop en verbeterpunten.
6. Resultaat wordt opgeslagen en gedeeld met docent.

#### Zelftest-flow (zonder docent)

1. Gebruiker uploadt eigen document (tentamenstof, artikel).
2. Systeem verwerkt document.
3. Gebruiker start gesprek direct.
4. Na afloop: feedback en verbeterpunten (geen opslag tenzij ingelogd).

---

## 2. Gebruikersrollen en Authenticatie

### Rollen

| Rol | Rechten |
|-----|---------|
| **Docent** | Documenten uploaden, toetsen configureren, concepten bewerken, alle studentresultaten inzien, toetsen archiveren/verwijderen. |
| **Student** | Toetsen maken via code/link, eigen resultaten inzien, zelftest met eigen document. |
| **Gast** | Alleen zelftest met eigen document, geen opslag van resultaten. |

### Authenticatie-implementatie

Implementeer authenticatie met de volgende opties:

- **Email/wachtwoord:** Standaard registratie met email verificatie.
- **OAuth:** Google en Microsoft login (belangrijk voor onderwijsinstellingen).
- **Magic link:** Passwordless login via email.

### Rolbepaling

- Nieuwe gebruikers zijn standaard 'student'.
- Docentrol wordt toegekend via uitnodigingslink of door admin.
- Eerste geregistreerde gebruiker wordt automatisch admin (voor initiële setup).

---

## 3. Documentverwerking

### Ondersteunde Formaten

| Formaat | Library | Aandachtspunten |
|---------|---------|-----------------|
| PDF | pdf-parse of pdf.js | OCR niet vereist voor eerste versie; alleen text-based PDFs |
| DOCX | mammoth | Behoud heading-structuur voor sectie-indeling |
| TXT | Native fs/fetch | Gebruik lege regels als sectie-scheiding |
| Markdown | marked of remark | Headers worden secties, behoud hiërarchie |

### Verwerkingspipeline

#### Stap 1: Tekstextractie

Converteer het geüploade bestand naar platte tekst met behoud van structuurmarkeringen (headings, paragrafen). Sla de ruwe tekst op in de database voor referentie.

#### Stap 2: Structuuranalyse

Identificeer automatisch:

- **Secties:** Op basis van headings of nummering.
- **Definities:** Patronen als "X is...", "Definitie:", "betekent dat...".
- **Voorbeelden:** Patronen als "Bijvoorbeeld", "Een voorbeeld hiervan", casussen.
- **Leerdoelen:** Secties met "Na dit hoofdstuk kun je...", "Leerdoelen:".

#### Stap 3: Conceptextractie via Claude

Stuur de gestructureerde tekst naar Claude met de instructie uit Hoofdstuk 11. Claude retourneert JSON met:

- **concepts:** Array van geïdentificeerde kernconcepten met naam, definitie, en complexiteitsscore (1-5).
- **relations:** Array van relaties tussen concepten ("is een voorbeeld van", "leidt tot", "contrasteert met").
- **examples:** Array van voorbeelden gekoppeld aan concepten.

#### Stap 4: Opslag

Sla de geëxtraheerde kennisstructuur op in de database (zie Hoofdstuk 8 voor schema). De originele tekst kan na verwerking worden verwijderd om storage te besparen, maar bewaar de kennisgraaf.

---

## 4. Adaptief Niveausysteem

Het adaptieve niveausysteem is de kernfunctionaliteit die deze applicatie onderscheidt. Het zorgt ervoor dat elke gebruiker vragen krijgt op een passend niveau, waardoor zowel uitdaging als succeservaring behouden blijven.

### De Vijf Niveaus

| Niveau | Naam | Vraagtype | Voorbeeld |
|--------|------|-----------|-----------|
| 1 | Herkenning | Ja/nee, herkennen van termen | "Is [term] een van de factoren die in de tekst genoemd worden?" |
| 2 | Reproductie | Uitleggen in eigen woorden | "Kun je uitleggen wat [concept] betekent?" |
| 3 | Toepassing | Toepassen op nieuwe situatie | "Hoe zou je [concept] toepassen in [scenario]?" |
| 4 | Analyse | Kritisch evalueren, vergelijken | "Wat zijn de voor- en nadelen van [aanpak]?" |
| 5 | Synthese | Creëren, combineren van concepten | "Ontwerp een oplossing die [A] en [B] integreert." |

### Niveau-algoritme

#### Initiële Kalibratie

Start het gesprek met vragen op niveau 2-3. Analyseer de eerste 2-3 antwoorden om het startniveau te bepalen:

- Alle antwoorden correct en volledig → Start op niveau 3-4.
- Wisselende kwaliteit → Start op niveau 2-3.
- Moeite met basisbegrippen → Start op niveau 1-2.

#### Dynamische Aanpassing

Houd een sliding window bij van de laatste 3-5 antwoorden. Pas het niveau aan volgens deze regels:

| Conditie | Actie |
|----------|-------|
| 3+ correcte antwoorden op rij op huidig niveau | Verhoog niveau met 1 (max 5) |
| 2+ incorrecte of vage antwoorden in window | Verlaag niveau met 1 (min 1) |
| Student geeft expliciet aan het niet te weten | Verlaag niveau met 1, geef ondersteunende context |
| Antwoorden worden korter/vlakker (engagement daalt) | Engagement-interventie, mogelijk niveau verlagen |

#### Engagement-detectie

Monitor de volgende signalen die kunnen wijzen op afnemende betrokkenheid:

- Antwoordlengte neemt significant af (gemiddelde < 20 woorden terwijl eerder > 50).
- Herhaald gebruik van "weet ik niet", "geen idee", "moeilijk".
- Antwoorden wijken af van de vraag (ontwijkend gedrag).

Bij engagement-signalen: de AI stelt een ondersteunende vraag of biedt context aan in plaats van direct door te gaan met toetsen.

---

## 5. Conversatie-engine

### Architectuur

Elke conversatie is een reeks API-calls naar Claude. De system prompt wordt bij elke call meegestuurd en bevat de volledige context. De conversatiegeschiedenis wordt opgebouwd in de user/assistant message array.

### Message Flow

1. **Initialisatie:** System prompt wordt samengesteld met: basisinstructie + kennisgraaf uit document + huidig niveau.
2. **Eerste bericht:** Claude stuurt welkomstbericht en eerste vraag.
3. **Antwoord student:** Frontend stuurt student-antwoord naar backend.
4. **Backend processing:** Backend analyseert antwoord, update niveau-state, voegt metadata toe aan system prompt.
5. **Claude response:** Backend stuurt volledige history + updated system prompt naar Claude.
6. **Response parsing:** Backend parst Claude's response voor zowel UI-tekst als assessment-metadata.
7. **Herhaal:** Stappen 3-6 herhalen tot gesprek eindigt.

### Gespreksstructuur

| Fase | Duur | Doel |
|------|------|------|
| Welkom & Kalibratie | 3-4 min | Verwelkomen, onderwerp introduceren, startniveau bepalen via 2-3 openingsvragen. |
| Verkenning | 15-20 min | Systematisch concepten doorlopen, niveau aanpassen, diepgang zoeken. |
| Integratie | 5-8 min | Vragen die meerdere concepten combineren (alleen bij niveau 3+). |
| Afsluiting | 2-3 min | Samenvatten, positieve elementen benoemen, aankondigen van rapport. |

### Claude API Configuratie

- **Model:** claude-sonnet-4-20250514 (of claude-opus-4-20250514 voor hogere kwaliteit)
- **Temperature:** 0.6 (balans tussen consistentie en natuurlijkheid)
- **Max tokens:** 1024 per response (voldoende voor een vraag + context)
- **Streaming:** Aan (voor betere UX met real-time respons)

---

## 6. Beoordelingslogica

### Assessment per Antwoord

Claude beoordeelt elk antwoord en retourneert gestructureerde metadata. Instrueer Claude om naast de conversatie-respons ook een JSON-blok te genereren met:

- **question_level:** Het niveau waarop de vraag was gesteld (1-5).
- **answer_quality:** "correct", "partial", "incorrect", of "unclear".
- **concepts_demonstrated:** Array van concept-IDs die de student correct heeft toegepast.
- **concepts_struggling:** Array van concept-IDs waar moeite mee is.
- **engagement_signal:** "high", "medium", "low", of "declining".
- **suggested_next_level:** Aanbevolen niveau voor volgende vraag.

### Eindassessment

Na afloop van het gesprek wordt een eindassessment berekend:

- **Stabiel niveau:** Het hoogste niveau waarop de student 3+ keer correct antwoordde.
- **Breedte:** Percentage van de concepten dat is behandeld.
- **Zelfstandigheid:** Gemiddeld aantal hints/herformuleringen per vraag.
- **Conceptscores:** Per concept: behaald niveau en confidence.

### Transparantie

Het rapport toont expliciet op welk niveau vragen gesteld zijn. Dit is cruciaal: een student die niveau 3-vragen goed beantwoordt presteert anders dan een student die niveau 5-vragen goed beantwoordt. Beide kunnen waardevolle prestaties zijn, maar de context moet duidelijk zijn.

---

## 7. Rapportage

### Studentrapport

Het rapport dat de student ziet na afloop bevat:

#### Samenvatting

- Behaald stabiel niveau met korte uitleg wat dit betekent.
- Sterkste concepten (waar niveau het hoogst was).
- Aandachtspunten (waar niveau-aanpassing nodig was).

#### Niveau-verloop Grafiek

Een lijngrafiek die laat zien hoe het vraagniveau verliep tijdens het gesprek. X-as: vraagnummer of tijd. Y-as: niveau 1-5. Dit geeft visueel inzicht in progressie of moeilijke momenten.

#### Conceptdetails

Per kernconcept een uitklapbaar blok met: behaald niveau, samenvatting van de gestelde vraag, kwaliteitsindicatie van het antwoord, en suggestie voor verbetering indien relevant.

#### Verbeteradvies

Concrete acties om niveau te verhogen, met referenties naar specifieke secties in het bronmateriaal. Voorbeeld: "Voor [concept] kun je sectie 3.2 van de reader nog eens doorlezen, met name het voorbeeld over [X]."

### Docentdashboard

Docenten zien een overzicht van alle studenten die de toets hebben gemaakt:

- **Tabel:** Student, datum, stabiel niveau, tijd besteed, status.
- **Filters:** Op niveau, datum, concept.
- **Aggregatie:** Welke concepten zijn lastig voor de groep (gemiddeld laagste niveau).
- **Export:** CSV met alle resultaten.
- **Detail:** Klik op student om volledig rapport te zien.

---

## 8. Database Schema

Onderstaand schema is voor PostgreSQL. Pas aan voor andere databases indien nodig.

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  raw_text TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Concepts

```sql
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  definition TEXT,
  complexity INT CHECK (complexity BETWEEN 1 AND 5),
  source_section VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Concept Relations

```sql
CREATE TABLE concept_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_a UUID REFERENCES concepts(id) ON DELETE CASCADE,
  concept_b UUID REFERENCES concepts(id) ON DELETE CASCADE,
  relation_type VARCHAR(50)
);
```

### Assessments (toetsconfiguraties)

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  access_code VARCHAR(20) UNIQUE,
  min_level INT DEFAULT 1,
  max_level INT DEFAULT 5,
  time_limit_minutes INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions (gesprekken)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  final_level INT,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active'
);
```

### Messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  question_level INT,
  answer_quality VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Concept Scores

```sql
CREATE TABLE concept_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  achieved_level INT,
  confidence DECIMAL(3,2)
);
```

---

## 9. API Endpoints

### Authenticatie

#### `POST /api/auth/register`
Registreer nieuwe gebruiker.  
**Body:** `{ email, password, name }`  
**Returns:** user object + session token.

#### `POST /api/auth/login`
Login.  
**Body:** `{ email, password }`  
**Returns:** user object + session token.

#### `GET /api/auth/me`
Huidige gebruiker ophalen.  
**Returns:** user object of 401.

### Documenten

#### `POST /api/documents/upload`
Upload document.  
**Body:** Multipart form met file.  
**Returns:** document object met status 'processing'.

#### `GET /api/documents/:id`
Document details ophalen.  
**Returns:** document met concepts array.

#### `PUT /api/documents/:id/concepts`
Concepten bewerken.  
**Body:** `{ concepts: [...] }`  
**Auth:** Alleen voor document owner.

### Assessments

#### `POST /api/assessments`
Nieuwe toets aanmaken.  
**Body:** `{ document_id, title, min_level, max_level, time_limit }`  
**Returns:** assessment met access_code.

#### `GET /api/assessments/:code`
Assessment ophalen via access code (voor studenten).  
**Returns:** assessment info (zonder antwoorden).

#### `GET /api/assessments/:id/results`
Alle resultaten voor een assessment (docent).  
**Returns:** array van sessions met scores.

### Conversatie

#### `POST /api/sessions/start`
Start nieuwe sessie.  
**Body:** `{ assessment_id }` of `{ document_id }` voor zelftest.  
**Returns:** session_id + eerste AI-bericht.

#### `POST /api/sessions/:id/message`
Verstuur bericht in sessie.  
**Body:** `{ content }`  
**Returns:** AI-respons (streaming).

#### `POST /api/sessions/:id/end`
Beëindig sessie. Triggert eindassessment berekening.  
**Returns:** session met final scores.

#### `GET /api/sessions/:id/report`
Volledig rapport ophalen.  
**Returns:** rapport object met alle data voor UI.

---

## 10. User Interface Specificaties

### Pagina's

#### Landing Page (`/`)

Uitleg van de applicatie, login/register knoppen, mogelijkheid om direct een zelftest te starten (upload document zonder account).

#### Dashboard - Docent (`/dashboard`)

- Lijst van eigen documenten met verwerkingsstatus.
- Lijst van actieve assessments met aantal voltooide sessies.
- Quick actions: upload document, nieuwe assessment aanmaken.
- Recente resultaten samenvatting.

#### Document Detail (`/documents/:id`)

- Documentinfo en verwerkingsstatus.
- Visuele weergave van geëxtraheerde concepten (cards of list).
- Edit-modus voor concepten (naam, definitie, complexiteit).
- Knop: "Assessment aanmaken met dit document".

#### Assessment Configuratie (`/assessments/new`)

- Document selecteren (dropdown van eigen docs).
- Titel invoeren.
- Niveau-range slider (min 1-5, max 1-5).
- Optionele tijdslimiet.
- Na opslaan: toon access code en deelbare link.

#### Assessment Resultaten (`/assessments/:id/results`)

- Tabel met alle studenten: naam, datum, niveau, tijd, status.
- Sorteerbaar en filterbaar.
- Concept-analyse: welke concepten zijn lastig (aggregatie).
- Export knop (CSV).

#### Toets Starten (`/join` of `/assess/:code`)

- Code invoerveld OF automatisch via URL.
- Toon assessment titel en instructies.
- "Start" knop die naar conversatie-interface leidt.

#### Conversatie Interface (`/session/:id`)

- **Chat interface:** Berichten van AI (links) en student (rechts) in bubbles.
- **Input veld:** Textarea voor antwoorden, submit met Enter of knop.
- **Typing indicator:** Tonen wanneer AI aan het typen is (streaming).
- **Helper knoppen:** "Ik weet het niet" (expliciet signaal), "Vraag anders" (herformulering).
- **Voortgang:** Subtiele indicator van gespreksfase (NIET niveau).
- **Timer:** Indien tijdslimiet, toon verstreken/resterende tijd.
- **Afsluiten:** "Gesprek beëindigen" knop met bevestigingsdialoog.

#### Rapport Pagina (`/session/:id/report`)

- Samenvatting met behaald niveau en interpretatie.
- Niveau-verloop grafiek (line chart, bijv. met Recharts of Chart.js).
- Concept-cards: klikbaar voor details.
- Verbeteradvies sectie.
- "Download PDF" en "Opnieuw proberen" knoppen.

---

## 11. System Prompts

### Document Analyse Prompt

Gebruik deze prompt om concepten uit een document te extraheren:

```
Je bent een expert in kennisstructurering. Analyseer de volgende tekst en extraheer de kernconcepten.

Retourneer JSON in dit formaat:
{
  "concepts": [
    {
      "name": "Conceptnaam",
      "definition": "Korte definitie in 1-2 zinnen",
      "complexity": 1-5,
      "source_section": "Sectie waar dit concept voorkomt"
    }
  ],
  "relations": [
    {
      "from": "Concept A",
      "to": "Concept B",
      "type": "is_example_of|leads_to|contrasts_with|is_part_of"
    }
  ],
  "examples": [
    {
      "concept": "Conceptnaam",
      "example": "Beschrijving van het voorbeeld"
    }
  ]
}

Complexiteit guidelines:
1 = Basisterminologie, eenvoudige feiten
2 = Concepten met meerdere aspecten
3 = Concepten die relaties met andere concepten vereisen
4 = Abstracte concepten die analyse vereisen
5 = Complexe theorieën of modellen

TEKST:
[document tekst hier]
```

### Conversatie System Prompt

Basis system prompt voor de toetsdialoog (wordt dynamisch aangevuld):

```
Je bent een vriendelijke, nieuwsgierige docent die een Socratisch toetsgesprek voert.

JE DOEL:
- Toets het begrip van de student over de gegeven leerstof
- Pas je vraagniveau aan op basis van de antwoorden
- Houd het gesprek constructief en motiverend
- Verzamel evidence over het begrip per concept

NIVEAUS:
1. Herkenning: Ja/nee vragen, termen herkennen
2. Reproductie: Uitleggen in eigen woorden
3. Toepassing: Toepassen op nieuwe situatie
4. Analyse: Kritisch evalueren, vergelijken
5. Synthese: Creatief combineren van concepten

HUIDIG NIVEAU: {current_level}
STATUS: {engagement_status}

KENNISBANK:
{concepts_json}

REGELS:
- Stel één vraag per keer
- Bij 3+ goede antwoorden op rij: verhoog niveau
- Bij 2+ slechte antwoorden: verlaag niveau
- Bij engagement-daling: geef ondersteuning
- Nooit het antwoord voorzeggen
- Wel hints geven als student vastloopt

OUTPUT FORMAT:
Elke response bevat twee delen:
1. Je gesproken reactie naar de student
2. Een JSON blok met metadata (in ```json``` code block):
{
  "question_level": 1-5,
  "answer_quality": "correct|partial|incorrect|unclear",
  "concepts_demonstrated": ["concept_ids"],
  "concepts_struggling": ["concept_ids"],
  "engagement_signal": "high|medium|low|declining",
  "suggested_next_level": 1-5,
  "phase": "calibration|exploration|integration|closing"
}
```

---

## 12. Deployment Checklist

### Environment Variables

```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=random-string
NEXTAUTH_URL=https://your-domain.com
BLOB_READ_WRITE_TOKEN=... (voor file storage)
```

### Deployment Stappen

1. **Database setup:** Maak PostgreSQL database aan (Supabase, Neon, of Vercel Postgres). Run migrations.
2. **Anthropic API:** Verkrijg API key van console.anthropic.com. Stel spending limit in.
3. **File storage:** Configureer blob storage voor document uploads.
4. **Deploy frontend:** Push naar Vercel. Configureer environment variables.
5. **Test flows:** Test document upload, concept extractie, conversatie, rapport generatie.
6. **Monitoring:** Stel error tracking in (Sentry) en API usage monitoring.

### Post-deployment Verificatie

1. Registreer testaccount als docent.
2. Upload testdocument en verifieer concept-extractie.
3. Maak assessment aan en kopieer access code.
4. Open assessment als student (incognito window).
5. Voer volledig gesprek en verifieer niveau-aanpassing.
6. Controleer rapport op correcte data en visualisaties.
7. Verifieer dat resultaat zichtbaar is in docentdashboard.

### Bekende Aandachtspunten

- **Rate limiting:** Claude API heeft rate limits. Implementeer retry logic met exponential backoff.
- **Token limits:** Lange documenten kunnen context window overschrijden. Implementeer chunking.
- **Streaming:** Server-sent events voor streaming responses. Test op productie.
- **Cold starts:** Serverless functions kunnen cold start delays hebben. Overweeg warm-up.

---

## Samenvatting voor AI Builder

Dit document bevat alle specificaties om een volledig werkende adaptieve AI-toetsapplicatie te bouwen. De kernfunctionaliteiten zijn:

1. **Document upload en verwerking** met automatische concept-extractie via Claude.
2. **Adaptief niveausysteem** dat vraagniveau aanpast op basis van studentprestaties.
3. **Socratische dialoog** via Claude API met streaming responses.
4. **Transparante rapportage** met niveau-verloop en verbeterpunten.
5. **Rollen voor docent en student** met aparte dashboards.

Bouw de applicatie iteratief: begin met de document upload en concept-extractie, dan de basis conversatie, dan het niveau-systeem, en als laatste de rapportage. Test elke component voor je verdergaat.

---

## 13. Toekomstige Uitbreidingen en Suggesties

Na de realisatie van de MVP en de basis-authenticatie zijn de volgende richtingen geïdentificeerd voor verdere optimalisatie en waardevergroting:

### 13.1 Functionele Uitbreidingen (Studentwaarde)
- **PDF-Export van het Rapport**: Mogelijkheid om het behaalde resultaat en de feedback te downloaden als officieel PDF-document voor in het portfolio.
- **Interactieve Studieplanning**: Het systeem genereert automatisch een gepersonaliseerd studieplan of oefenvragen op basis van de geïdentificeerde "zwakke concepten".
- **Audio-ondersteuning (TTS/STT)**: Integratie van Text-to-Speech en Speech-to-Text om de toegankelijkheid te vergroten (bijv. voor studenten met dyslexie).
- **Multi-Document Analyse**: Ondersteuning voor het tegelijkertijd uploaden en analyseren van meerdere bronnen (bijv. een hele map met readers en slides).

### 13.2 Educatieve Verdieping
- **Leerdoel-mapping**: Koppeling met officiële HAN-leerdoelen of rubrics om te verifiëren of de student voldoet aan de formele eisen van een blok of cursus.
- **Groei-visualisatie**: Een dashboard-weergave die de ontwikkeling van het begrip over tijd (meerdere sessies) laat zien.

### 13.3 Docent- & Beheerderstools
- **Hogere Orde Dashboarding**: Geaggregeerde (geanonimiseerde) data voor docenten om te zien waar de "gap" in kennis zit bij de hele klas, zodat hier in het college op ingespeeld kan worden.
- **A/B Testing voor Prompts**: Mogelijkheid om verschillende Socratische instructies te testen op effectiviteit.

### 13.4 Technische Optimalisaties
- **Geavanceerde Parsing**: Overstap naar krachtigere AI-parsers (zoals Unstructured of LlamaIndex) voor het foutloos verwerken van complexe PDF-lay-outs en tabellen.
- **Model-Optimale Routering**: Dynamisch schakelen tussen verschillende LLM's (Claude 3.5 Sonnet, GPT-4o, Gemini Flash) op basis van de benodigde diepgang versus kosten/snelheid.

