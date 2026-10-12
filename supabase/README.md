# Supabase (Konten & Sync, ab Fahrplan-Phase 2)

Hier liegt die Datenbank-Einrichtung. Die App funktioniert weiterhin ohne
Konto und rein lokal; dieser Teil bereitet nur den späteren Sync vor.

## schema.sql ausführen (einmalig, Sitzung 4)

1. **(Du)** Lege ein kostenloses Konto bei [supabase.com](https://supabase.com)
   an und erstelle ein Projekt in der **Region Frankfurt (eu-central)**.
2. Im Projekt: **SQL Editor** öffnen → Inhalt von `schema.sql` einfügen → **Run**.
   Das Skript ist gefahrlos mehrfach ausführbar.
3. **(Du)** Für die nächste Sitzung bereithalten (nicht in den Chat posten):
   - die **Projekt-Adresse** (Project URL),
   - den **öffentlichen Schlüssel** (im Dashboard „anon“ bzw. „publishable“).
   - Den **geheimen** Schlüssel (service_role / secret) niemals weitergeben.

## Was angelegt wird

- Tabellen: `profiles` (Einstellungen), `routines`, `tasks`, `goals`,
  `appointments`, `history` (Score-Verlauf), `day_log` (Tageslog).
- **Row Level Security** auf allen Tabellen: jede Person sieht und ändert
  ausschließlich ihre eigenen Zeilen (geprüft über `auth.uid()`).
- `updated_at` wird serverseitig per Trigger gesetzt (Serverzeit) — Grundlage
  für den Sync in Sitzung 6 (bei gleichzeitiger Änderung gewinnt pro Eintrag
  die neueste). Eine `deleted`-Markierung erlaubt sauberes Lösch-Sync.

## Fertig, wenn

Testdaten landen in der Datenbank und ein zweites Konto kann sie nicht lesen.
Dieses Verhalten (inkl. Schutz vor dem Einschleusen fremder Zeilen) wurde vor
dem Commit gegen ein echtes PostgreSQL 16 mit nachgebautem `auth.uid()` geprüft.
