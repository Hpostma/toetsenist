-- [AUTH MIGRATION]
-- Kopieer en run deze SQL in de Supabase SQL Editor om authenticatie te activeren.

-- 1. Voeg user_id kolom toe aan sessions
alter table sessions 
add column if not exists user_id uuid references auth.users(id);

-- 2. Zet RLS aan (Row Level Security)
alter table sessions enable row level security;
alter table messages enable row level security;

-- 3. Maak policies voor Sessions (Alleen eigen data zien/maken)
-- Eerst oude policies verwijderen voor de zekerheid
drop policy if exists "Users can view their own sessions" on sessions;
drop policy if exists "Users can insert their own sessions" on sessions;
drop policy if exists "Users can update their own sessions" on sessions;

create policy "Users can view their own sessions"
on sessions for select
using ( auth.uid() = user_id );

create policy "Users can insert their own sessions"
on sessions for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own sessions"
on sessions for update
using ( auth.uid() = user_id );

-- 4. Maak policies voor Messages (Gekoppeld aan sessie van user)
drop policy if exists "Users can view messages of their sessions" on messages;
drop policy if exists "Users can insert messages to their sessions" on messages;

create policy "Users can view messages of their sessions"
on messages for select
using (
  exists (
    select 1 from sessions
    where sessions.id = messages.session_id
    and sessions.user_id = auth.uid()
  )
);

create policy "Users can insert messages to their sessions"
on messages for insert
with check (
  exists (
    select 1 from sessions
    where sessions.id = messages.session_id
    and sessions.user_id = auth.uid()
  )
);
