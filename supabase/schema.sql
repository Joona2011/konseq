-- Konseq — Datenbank-Schema und Zugriffsregeln (Fahrplan Sitzung 4)
--
-- Was dieses Skript macht:
--   * legt pro Datenart eine Tabelle an (Routinen, Aufgaben, Wochenziele,
--     Termine, Score-Verlauf, Tageslog, Einstellungen),
--   * schaltet Row Level Security (RLS) ein, sodass jede Person NUR ihre
--     eigenen Zeilen sehen und ändern kann (geprüft über auth.uid()),
--   * setzt updated_at serverseitig per Trigger — gemessen an der Serverzeit,
--     nicht an der Handyuhr. Das braucht der Sync in Sitzung 6 (bei
--     gleichzeitiger Änderung gewinnt pro Eintrag die neueste).
--   * eine deleted-Markierung (Grabstein) statt echtem Löschen, damit sich
--     ein Löschen zwischen Geräten sauber abgleichen lässt.
--
-- Ausführen: Supabase-Dashboard -> SQL Editor -> dieses Skript einfügen -> Run.
-- Das Skript ist gefahrlos mehrfach ausführbar (IF NOT EXISTS / DROP ... IF EXISTS).

-- ---------------------------------------------------------------------------
-- updated_at serverseitig pflegen
-- ---------------------------------------------------------------------------
create or replace function public.konseq_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Einstellungen (eine Zeile pro Nutzer): Layout, Theme, Sprache, Setup-Status …
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  settings   jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Routinen
-- ---------------------------------------------------------------------------
create table if not exists public.routines (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,                 -- die App-eigene ID (uid)
  name       text        not null default '',
  position   integer     not null default 0,
  done       boolean     not null default false,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Tagesaufgaben
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,
  name       text        not null default '',
  due        date,
  done       boolean     not null default false,
  position   integer     not null default 0,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Wochenziele
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,
  name       text        not null default '',
  target     integer     not null default 0,
  count      integer     not null default 0,
  repeat     boolean     not null default false,
  position   integer     not null default 0,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Termine
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,
  title      text        not null default '',
  date       date,
  from_time  text        not null default '',       -- "HH:MM" oder leer (ganztägig)
  to_time    text        not null default '',
  yearly     boolean     not null default false,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Score-Verlauf (ein Eintrag pro Tag)
-- ---------------------------------------------------------------------------
create table if not exists public.history (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  day        date        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Tageslog (ein Eintrag pro Tag; Grundlage der Monatsanalyse, Phase 8)
-- ---------------------------------------------------------------------------
create table if not exists public.day_log (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  day        date        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Trigger für updated_at auf allen Tabellen
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','routines','tasks','goals','appointments','history','day_log']
  loop
    execute format('drop trigger if exists konseq_touch_%1$s on public.%1$s;', t);
    execute format(
      'create trigger konseq_touch_%1$s before update on public.%1$s
         for each row execute function public.konseq_touch_updated_at();', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Indizes für den späteren Abgleich (nur geänderte Zeilen holen)
-- ---------------------------------------------------------------------------
create index if not exists idx_routines_sync     on public.routines     (user_id, updated_at);
create index if not exists idx_tasks_sync         on public.tasks        (user_id, updated_at);
create index if not exists idx_goals_sync         on public.goals        (user_id, updated_at);
create index if not exists idx_appointments_sync  on public.appointments (user_id, updated_at);
create index if not exists idx_history_sync       on public.history      (user_id, updated_at);
create index if not exists idx_day_log_sync       on public.day_log      (user_id, updated_at);

-- ---------------------------------------------------------------------------
-- Row Level Security: jede Person sieht/ändert ausschließlich ihre Zeilen
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','routines','tasks','goals','appointments','history','day_log']
  loop
    execute format('alter table public.%1$s enable row level security;', t);
    execute format('drop policy if exists konseq_rw on public.%1$s;', t);
    execute format(
      'create policy konseq_rw on public.%1$s
         for all to authenticated
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end;
$$;
