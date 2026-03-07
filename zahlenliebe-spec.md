# Zahlenliebe – Produkt- & Umsetzungs-Spec (für Coding Agent)

## 1) Ziel
Baue eine **lokale Webapp** (localhost), mit der Kinder spielerisch **verliebte Zahlen (10er-Freunde)** und **Übertrag bei Addition** lernen.

- Bedienung primär per **Maus** (Drag & Drop + große Klickflächen)
- **Kein Backend**
- Zustand vollständig in **localStorage**
- MVP soll schnell nutzbar sein, visuell klar, kindgerecht

---

## 2) Kernidee
Die App macht Rechenkonzepte sichtbar statt nur abstrakt:

1. **Verliebte Zahlen**: Zahlenpaare finden, die 10 ergeben
2. **Übertrag-Werkstatt**: Einer bündeln zu Zehnern (visuelles Stellenwertmodell)
3. **Tempo-Spiel**: kurze motivierende Trainingsrunden

Belohnung über Punkte, Streaks, kleine Freischaltungen.

---

## 3) Tech-Stack (MVP)
- **Frontend:** React + Vite + TypeScript
- **Styling:** CSS Modules oder Tailwind (freie Wahl, aber konsistent)
- **State:** React State + kleine Store-Utility (kein Backend)
- **Persistenz:** localStorage
- **Optional DnD:** pointer events (bevorzugt) oder leichte DnD-Lib

---

## 4) Seitenstruktur / Routing
- `/` – Startseite (Modusauswahl)
- `/mode/love10` – Verliebte Zahlen
- `/mode/carry` – Übertrag-Werkstatt
- `/mode/sprint` – Tempo-Spiel
- `/progress` – Fortschritt
- `/settings` – Einstellungen
- optional `/profiles` – Profilauswahl (wenn mehrere Kinder)

---

## 5) UX-Anforderungen
- Große Buttons/Karten, klare Farbkontraste
- Maus-first Bedienung
- Keine Textwüsten; kurzes Feedback direkt am Geschehen
- Freundlicher Ton bei Fehlern (kein „falsch“, eher „Versuch’s nochmal“)
- Sofort spielbar in max. 1–2 Klicks

---

## 6) Gameplay-Details

### 6.1 Modus A: Verliebte Zahlen (`love10`)
**Mechanik:**
- Zahlkarten (0–10) werden in eine Zielzone gezogen.
- Zwei Karten werden geprüft.
- Wenn Summe = 10: Erfolg, Punkte, neue Runde.
- Sonst: sanftes Feedback + Karten zurück.

**Scoring (Vorschlag):**
- +10 Punkte korrekt
- +Streak-Bonus ab 3 Treffern in Folge

---

### 6.2 Modus B: Übertrag-Werkstatt (`carry`)
**Mechanik:**
- Aufgaben wie `27 + 8`.
- Visualisierung mit **Einer-Punkten** und **Zehner-Stäben**.
- 10 Einer werden zu 1 Zehner gebündelt (Animation).
- Ergebnis danach anzeigen/prüfen.

**Lernziel:**
- Übertrag als Bündelung verstehen, nicht nur Regel merken.

**Hint-System:**
- 1. Hinweis: „Wie viele fehlen bis 10?“
- 2. Hinweis: visuelle Markierung der passenden Einer

---

### 6.3 Modus C: Tempo-Spiel (`sprint`)
**Mechanik:**
- 60s Runde
- Eine Aufgabe pro Screen
- Große Antwortbuttons
- Combo-/Streak-Anzeige

**Scoring:**
- +Punkte pro richtige Antwort
- Combo-Multiplikator

---

## 7) Datenmodell (localStorage only)
Speicher-Key: `zahlenliebe:v1`

```json
{
  "activeProfileId": "kid_anna",
  "profiles": {
    "kid_anna": {
      "name": "Anna",
      "avatar": "cat",
      "createdAt": "2026-03-07T10:00:00Z",
      "settings": {
        "sound": true,
        "difficulty": "adaptive",
        "uiScale": "normal"
      },
      "stats": {
        "totalSessions": 12,
        "totalPlaySeconds": 5400,
        "totalTasks": 320,
        "totalCorrect": 250,
        "currentStreak": 6,
        "bestStreak": 19
      },
      "modeStats": {
        "love10": { "played": 140, "correct": 120, "avgMs": 3200 },
        "carry":  { "played": 110, "correct": 78,  "avgMs": 6400 },
        "sprint": { "played": 70,  "correct": 52,  "avgMs": 2800 }
      },
      "errorPatterns": {
        "sum_not_10": 18,
        "carry_missed": 22,
        "place_value_confusion": 9
      },
      "daily": {
        "2026-03-05": { "playSeconds": 900, "tasks": 40, "correct": 31 },
        "2026-03-06": { "playSeconds": 1200, "tasks": 58, "correct": 46 }
      },
      "unlocks": {
        "stickers": ["heart_gold", "rocket_blue"],
        "themes": ["classic", "space"]
      }
    }
  }
}
```

---

## 8) TypeScript-Typen (MVP)
```ts
type Mode = "love10" | "carry" | "sprint";

interface RootState {
  activeProfileId: string;
  profiles: Record<string, Profile>;
}

interface Profile {
  name: string;
  avatar: string;
  createdAt: string;
  settings: {
    sound: boolean;
    difficulty: "easy" | "medium" | "adaptive";
    uiScale: "small" | "normal" | "large";
  };
  stats: {
    totalSessions: number;
    totalPlaySeconds: number;
    totalTasks: number;
    totalCorrect: number;
    currentStreak: number;
    bestStreak: number;
  };
  modeStats: Record<Mode, { played: number; correct: number; avgMs: number }>;
  errorPatterns: Record<string, number>;
  daily: Record<string, { playSeconds: number; tasks: number; correct: number }>;
  unlocks: { stickers: string[]; themes: string[] };
}
```

---

## 9) Persistenz-Utilities (Pflicht)
Implementiere zentrale Storage-Funktionen:
- `loadState()`
- `saveState(state)`
- `updateProfile(profileId, patch)`
- `recordTaskResult({ mode, correct, durationMs, errorType? })`

**Robustheit:**
- JSON parse try/catch
- Fallback auf Default-State
- optionale Backup-Strategie über `zahlenliebe:v1:backup`

---

## 10) Adaptive Difficulty (einfach, wirksam)
Auf Basis der letzten 20 Aufgaben:
- >85% korrekt + schnell => Schwierigkeit hoch
- <60% korrekt => Schwierigkeit runter + mehr Hinweise
- viele `carry_missed` => mehr Übertrag-Aufgaben einstreuen

---

## 11) Fortschritt-Seite (`/progress`)
Zeige:
- Spielzeit heute
- Trefferquote gesamt + pro Modus
- letzte 7 Tage (kleines Balkendiagramm)
- häufige Fehlerarten (Top 3)

---

## 12) Settings (`/settings`)
- Sound an/aus
- Schwierigkeit (leicht/mittel/adaptiv)
- Profilname/Avatar lokal
- „Daten zurücksetzen“ mit Sicherheitsabfrage

---

## 13) Nicht-Ziele (MVP)
- Kein Login/Cloud-Sync
- Kein Server/Backend
- Keine komplexe Lehrerplattform
- Keine mobile App (nur responsive Web)

---

## 14) Akzeptanzkriterien (Definition of Done)
1. App startet lokal über `npm install && npm run dev`.
2. Alle 3 Modi sind spielbar.
3. Mausbedienung funktioniert stabil.
4. Fortschritt bleibt nach Browser-Neustart erhalten (localStorage).
5. Keine kritischen Errors in der Konsole im Normalflow.
6. UI bleibt bei 1280x720 und 1920x1080 sauber nutzbar.

---

## 15) Projektstruktur (Vorschlag)
```txt
src/
  app/
    router.tsx
    layout/
  pages/
    HomePage.tsx
    Love10Page.tsx
    CarryPage.tsx
    SprintPage.tsx
    ProgressPage.tsx
    SettingsPage.tsx
  components/
    NumberCard.tsx
    DropZone.tsx
    PlaceValueBoard.tsx
    ScoreBar.tsx
    FeedbackToast.tsx
  game/
    generators/
      love10.ts
      carry.ts
      sprint.ts
    scoring.ts
    hints.ts
  state/
    store.ts
    selectors.ts
    actions.ts
    persistence.ts
  styles/
```

---

## 16) Milestones (für Agent)
**M1:** Projektsetup + Routing + Basiskomponenten
**M2:** Love10 komplett
**M3:** Carry-Werkstatt inkl. Bündelung + Hinweise
**M4:** Sprint-Modus + Combo
**M5:** Progress + Settings + Persistenz-Finalisierung
**M6:** Polishing (UX, Accessibility, Bugfix)

---

## 17) Optionaler Stretch
- Mehrere Profile (`/profiles`)
- Soundeffekte + Theme-System
- Export/Import von localStorage JSON
- Weitere Lernmodi (Subtraktion mit Entbündeln)

---

## 18) Startanweisung an Coding Agent
1. Scaffold mit Vite React TS.
2. Routing + Seiten-Skeleton gemäß Kapitel 4.
3. State + localStorage Utilities gemäß Kapitel 7–9.
4. Implementiere Modi in Reihenfolge: Love10 → Carry → Sprint.
5. Danach Progress/Settings.
6. Kurzes README mit Run-Anleitung + bekannten TODOs.
