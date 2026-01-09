-- Sessies tabel
create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Document info
  document_title text,
  concepts jsonb not null, -- Slaat de array van geëxtraheerde concepten op
  
  -- Toets status
  status text not null default 'active', -- 'active', 'completed', 'abandoned'
  current_level integer default 2,
  engagement_status text default 'high',
  
  -- Voortgangsdata
  concept_scores jsonb default '[]'::jsonb, -- Array van scores en confidence
  recent_answers jsonb default '[]'::jsonb -- Laatste antwoordkwaliteiten
);

-- Berichten tabel
create table messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  session_id uuid references sessions(id) on delete cascade not null,
  
  role text not null, -- 'user' of 'assistant'
  content text not null
);

-- Index voor sneller ophalen van berichten per sessie
create index idx_messages_session_id on messages(session_id);

-- Beveiligingsbeleid (RLS) - Optioneel, voor nu alles toestaan voor anon
alter table sessions enable row level security;
alter table messages enable row level security;

create policy "Anon access policies" on sessions for all using (true);
create policy "Anon access policies" on messages for all using (true);
