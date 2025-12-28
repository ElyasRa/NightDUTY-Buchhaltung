# 🚀 Deployment Guide

## Template-Update Deployment

Dieses Dokument beschreibt die Schritte zum Deployment des Template-Updates, das die bestehende Rechnungsvorlage (ID: 1) in den neuen Editor integriert.

### Vorbereitung

Stelle sicher, dass du Zugriff auf den Server hast:
```bash
ssh root@188.245.198.220
```

### Deployment-Schritte

#### 1. Code aktualisieren

```bash
cd ~/nightduty

# Code vom Repository pullen
git pull origin main
```

#### 2. Backend aktualisieren

```bash
cd backend

# Dependencies installieren (falls neue hinzugefügt wurden)
npm install

# Prisma Client neu generieren
npx prisma generate

# Datenbank-Schema synchronisieren (falls nötig)
npx prisma db push
```

#### 3. Template migrieren

**Wichtig:** Dieser Schritt aktualisiert das bestehende Template mit ID 1:
- Name wird von "Test" zu "NIGHTDUTY Standard" geändert
- Template wird als Standard markiert (`is_default: true`)
- Logo-Format wird von `config.logo` zu `config.logos` Array konvertiert

```bash
# Template-Migration ausführen
npm run migrate:template
```

**Erwartete Ausgabe:**
```
🔍 Searching for template with ID 1...
✅ Template found: Test
✅ Template erfolgreich aktualisiert!
   - Name: NIGHTDUTY Standard
   - Standard: true
   - Logo-Format: Multi-Logo (Array)
```

#### 4. Frontend aktualisieren

```bash
cd ../frontend

# Dependencies installieren (falls neue hinzugefügt wurden)
npm install

# Production Build erstellen
npm run build
```

#### 5. Services neu starten

```bash
# Backend und Frontend neu starten
pm2 restart all

# Status überprüfen
pm2 status
```

#### 6. Deployment verifizieren

Öffne die Anwendung im Browser und teste:

1. **Template-Liste:** http://188.245.198.220/rechnungsvorlage
   - ✅ Template "NIGHTDUTY Standard" wird angezeigt
   - ✅ Template ist als "Standard" markiert

2. **Editor:**
   - ✅ Template wird automatisch im Editor geöffnet
   - ✅ Logo ist sichtbar und kann per Drag & Drop verschoben werden
   - ✅ Logo hat Resize-Handles

3. **Rechnungserstellung:**
   - ✅ Neue Rechnung erstellen
   - ✅ PDF wird korrekt generiert
   - ✅ Logo wird im PDF angezeigt

### Rollback (falls nötig)

Falls Probleme auftreten, kannst du zum vorherigen Stand zurückkehren:

```bash
cd ~/nightduty

# Zum vorherigen Commit zurück
git log --oneline -5
git checkout <previous-commit-hash>

# Services neu starten
pm2 restart all
```

### Troubleshooting

#### Problem: Migration-Script findet Template nicht

**Lösung:** Überprüfe, ob das Template in der Datenbank existiert:

```bash
# PostgreSQL Shell öffnen
psql -U postgres -d nightduty

# Templates anzeigen
SELECT id, name, is_default FROM "InvoiceTemplate";

# Shell verlassen
\q
```

Falls kein Template mit ID 1 existiert, muss es manuell erstellt werden.

#### Problem: Services starten nicht

**Lösung:** Logs überprüfen:

```bash
pm2 logs backend --lines 50
pm2 logs frontend --lines 50
```

#### Problem: Frontend zeigt Fehler

**Lösung:** Browser-Cache leeren und Seite neu laden:
- Strg + Shift + R (Windows/Linux)
- Cmd + Shift + R (Mac)

### Backup

**Wichtig:** Vor dem Deployment sollte ein Backup der Datenbank erstellt werden:

```bash
# Backup erstellen
pg_dump -U postgres nightduty > nightduty_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup auf lokalem Rechner speichern
scp root@188.245.198.220:~/nightduty_backup_*.sql ./backups/
```

### Wartung

Nach erfolgreichem Deployment:

1. **Logs überwachen** (ersten 30 Minuten):
   ```bash
   pm2 logs --lines 100
   ```

2. **Ressourcen-Nutzung prüfen**:
   ```bash
   pm2 monit
   ```

3. **Backup-Status verifizieren** (Hetzner Backup sollte automatisch laufen)

### Kontakt

Bei Problemen:
- GitHub Issues: https://github.com/ElyasRa/NightDUTY-Buchhaltung/issues
- Support: buchhaltung@nightduty.de

---

**Letzte Aktualisierung:** 2025-12-28
**Version:** 1.0.0
