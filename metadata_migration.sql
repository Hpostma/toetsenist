-- [METADATA MIGRATION]
-- Kopieer en run deze SQL in de Supabase SQL Editor om metadata kolom toe te voegen.
-- Dit maakt nauwkeurige niveau-historie in rapporten mogelijk.

-- Voeg metadata kolom toe aan messages tabel
alter table messages
add column if not exists metadata jsonb default null;

-- Commentaar toevoegen voor documentatie
comment on column messages.metadata is 'Assessment metadata (niveau, concepten, etc.) voor nauwkeurige rapportage';
