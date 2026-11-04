# Sprechtrainer Deutsch

Eine KI-Sprechpartnerin für Deutsch (A2–C1) als installierbare Web-App: Du sprichst, sie antwortet per Sprachausgabe, korrigiert deine Fehler, simuliert die mündliche telc-Prüfung und trainiert deine Fehler gezielt.

Läuft komplett im Browser (Edge oder Chrome, Desktop und Android). Die KI dahinter ist Claude über die Claude API; der API-Schlüssel wird nur lokal im Browser gespeichert und **nie** in dieses Repository geschrieben.

## Funktionen

- **Niveaus A2 · B1 · B2 · C1** – Sprache, Tempo, Korrekturtiefe und Prüfungsformat passen sich an.
- **Gespräch** mit Themenwahl und Rollenspielen (Bewerbungsgespräch, Bürgeramt, Arzttermin, Wohnungsbesichtigung …).
- **Prüfung** – Simulation der mündlichen telc-Prüfung des gewählten Niveaus, mit Timer für Präsentation und Vorbereitung sowie Bewertung nach telc-Kriterien.
- **Training** – Übungen aus deinen eigenen gesammelten Fehlern; dreimal getroffen = sitzt.
- **Sag's besser** – dein letzter Satz, wie ein Muttersprachler ihn sagen würde, zum Nachsprechen.
- **Wort antippen** – Bedeutung, Englisch, Beispielsatz; speichern als Vokabel; Vokabel-Warm-up.
- **Statistik** – Sprechminuten, Serie, Redeanteil, Sitzungsberichte, geschätzte API-Kosten.
- **Backup/Restore** – Fortschritt als JSON vom Laptop aufs Handy mitnehmen.

## Einrichtung

1. Repository auf GitHub Pages veröffentlichen (siehe unten) oder lokal über einen kleinen Webserver öffnen.
2. Seite öffnen → ⚙︎ → Claude API-Schlüssel eintragen (Claude Console → API Keys).
3. Mikrofon erlauben. Fertig.

**Android:** Seite in Chrome öffnen → Menü → „Zum Startbildschirm hinzufügen“ bzw. „App installieren“.

## Auf GitHub Pages veröffentlichen

```bash
git init
git add .
git commit -m "Sprechtrainer v2"
git branch -M main
git remote add origin https://github.com/<DEIN-NAME>/sprechtrainer.git
git push -u origin main
```

Dann auf GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save.**
Nach ein bis zwei Minuten ist die App unter `https://<DEIN-NAME>.github.io/sprechtrainer/` erreichbar.

Spätere Updates: Dateien ändern, dann

```bash
git add . && git commit -m "Update" && git push
```

## Hinweise

- Spracherkennung läuft über den Browser (Edge/Chrome) und braucht Internet.
- Kosten: eine halbe Stunde Gespräch kostet mit Sonnet etwa 0,30–0,50 $, mit Haiku ein paar Cent. Die App zeigt eine Schätzung an.
- Die Dateien: `index.html` (die App), `manifest.webmanifest` + `sw.js` + Icons (für die Installation als App).
