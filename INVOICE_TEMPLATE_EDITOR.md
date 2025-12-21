# 📄 Rechnungsvorlagen-Editor - Vollständige Dokumentation

## Überblick

Der neue Rechnungsvorlagen-Editor ist ein vollständiger Drag & Drop Editor zur Erstellung und Verwaltung von Rechnungsvorlagen mit mehreren Logos, benutzerdefinierten Elementen und Echtzeit-Vorschau.

## 🎯 Hauptfunktionen

### 1. Multi-Logo-System
- ✅ Unbegrenzt viele Logos hochladen
- ✅ Jedes Logo einzeln per Drag & Drop positionieren
- ✅ Jedes Logo einzeln skalieren mit Resize-Handles
- ✅ Logos löschen und verwalten
- ✅ Logo-Bibliothek mit Vorschau aller hochgeladenen Logos
- ✅ Logos zur Vorlage hinzufügen per Klick

### 2. Drag & Drop Editor
- ✅ DIN A4 Vorschau (794px × 1123px bei 96 DPI)
- ✅ Raster/Grid im Hintergrund (10px Abstand)
- ✅ Snap-to-Grid Funktion (magnetisches Ausrichten)
- ✅ Zoom: 50%, 75%, 100%, 125%, 150%
- ✅ Lineale (horizontal & vertikal mit Pixel-Anzeige)

### 3. Drag-fähige Elemente

#### Logos
- Mehrere Logos gleichzeitig auf der Vorlage platzieren
- Resize-Handles an allen 4 Ecken
- Frei positionierbar
- Z-Index (Ebenen-Reihenfolge) anpassbar

#### Textfelder
- Benutzerdefinierter Text
- Schriftart, -größe, -farbe anpassbar
- Fett, Kursiv, Ausrichtung einstellbar
- Mehrzeiliger Text möglich

#### Platzhalter
- `{RECHNUNGSNUMMER}` - Rechnungsnummer
- `{DATUM}` - Rechnungsdatum
- `{FAELLIGKEITSDATUM}` - Fälligkeitsdatum
- `{KUNDE_NAME}` - Kundenname
- `{KUNDE_ADRESSE}` - Kundenadresse
- `{KUNDE_STADT}` - Stadt des Kunden
- `{BETRAG_NETTO}` - Nettobetrag
- `{BETRAG_BRUTTO}` - Bruttobetrag
- `{MWST}` - Mehrwertsteuer
- Werden in Test-Rechnung mit Beispieldaten gefüllt

#### Tabelle
- Position & Größe per Drag ändern
- Spalten konfigurierbar
- Header-Farbe und Zeilen-Farbe anpassbar
- Alternierter Zeilenhintergrund

#### Linien/Trennlinien
- Horizontale/Vertikale Linien
- Dicke & Farbe anpassbar
- Zum visuellen Trennen von Bereichen

### 4. Live-Vorschau Modi

#### Editor-Modus (Standard)
- Zeigt Platzhalter mit ihren Namen an
- Visuelles Feedback für bearbeitbare Bereiche
- Elemente haben Auswahlrahmen und Resize-Handles

#### Test-Rechnung Modus
- Füllt ALLE Platzhalter mit realistischen Beispieldaten
- Rechnungsnummer: RE-2025-001
- Aktuelles Datum und Fälligkeitsdatum
- Beispielkunde: Musterfirma GmbH
- 4 Beispiel-Positionen mit echten Preisen
- Summen berechnet (Netto: 920,00 €, MwSt: 174,80 €, Brutto: 1.094,80 €)

### 5. UI-Struktur (3-Spalten-Layout)

```
┌──────────────┬─────────────────────────┬──────────────┐
│  SIDEBAR L   │   CANVAS (Vorschau)     │  SIDEBAR R   │
│              │                         │              │
│ • Name       │  ┌───────────────────┐  │ Tabs:        │
│ • Farben     │  │                   │  │ • Logos      │
│ • Grid       │  │   DIN A4          │  │ • Firmendaten│
│ • Undo/Redo  │  │   Vorschau        │  │ • Bank       │
│              │  │                   │  │ • Elemente   │
│              │  └───────────────────┘  │ • Eigenschaf.│
│              │  [Zoom] [Test] [PDF]   │              │
└──────────────┴─────────────────────────┴──────────────┘
```

#### Linke Sidebar
- Vorlagenname eingeben
- Farb-Picker (Primär, Sekundär, Text)
- Grid-Optionen (anzeigen, snap)
- Undo/Redo Buttons

#### Rechte Sidebar (Tabs)

**Tab 1: Logos 🖼️**
- Logo-Bibliothek mit allen hochgeladenen Logos
- [+ Upload] Button für neue Logos
- Jedes Logo mit Vorschau und Aktionen (Hinzufügen, Löschen)

**Tab 2: Firmendaten 🏢**
- Firmenname
- Adresse
- Stadt
- Telefon
- E-Mail
- Website

**Tab 3: Bankverbindung 💳**
- IBAN
- BIC
- Bank

**Tab 4: Elemente ➕**
- [+ Textfeld hinzufügen]
- [+ Platzhalter hinzufügen]
- [+ H-Linie hinzufügen]
- [+ V-Linie hinzufügen]
- [+ Tabelle hinzufügen]

**Tab 5: Eigenschaften ⚙️**
(Zeigt Eigenschaften des ausgewählten Elements)
- Position X, Y
- Breite, Höhe
- Z-Index
- Gesperrt / Sichtbar
- Elementspezifische Eigenschaften (Text, Farbe, etc.)

### 6. Tastatur-Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Ctrl + S` | Speichern |
| `Ctrl + Z` | Rückgängig |
| `Ctrl + Y` | Wiederholen |
| `Ctrl + Shift + Z` | Wiederholen (Alternative) |
| `Delete` | Ausgewähltes Element löschen |
| `Ctrl + D` | Element duplizieren |
| `Pfeiltasten` | Element verschieben (1px) |
| `Shift + Pfeiltasten` | Element verschieben (10px) |

### 7. Kontext-Menü (Rechtsklick auf Element)

- ⚙️ **Eigenschaften** - Öffnet Properties-Tab
- 📋 **Duplizieren** - Erstellt eine Kopie des Elements
- ⬆️ **Nach vorne** - Erhöht Z-Index
- ⬇️ **Nach hinten** - Verringert Z-Index
- 🗑️ **Löschen** - Entfernt das Element

### 8. Undo/Redo System
- Bis zu 50 Schritte werden gespeichert
- Automatisches Speichern bei jeder Änderung
- Funktioniert mit Tastatur-Shortcuts und UI-Buttons

## 🔧 Technische Implementierung

### Frontend-Komponenten

```
frontend/src/
├── stores/
│   └── invoiceTemplate.ts          # Haupt-Store für Editor-State
├── components/invoice-template/
│   ├── TemplateCanvas.vue          # Hauptvorschau mit Canvas
│   ├── DraggableElement.vue        # Wrapper für drag-fähige Elemente
│   ├── LogoLibrary.vue             # Logo-Verwaltung
│   ├── PropertyPanel.vue           # Eigenschaften-Panel
│   ├── ElementToolbar.vue          # Element-Hinzufügen
│   ├── CompanyDataForm.vue         # Firmendaten-Formular
│   ├── BankDetailsForm.vue         # Bankdaten-Formular
│   └── elements/
│       ├── LogoElementRender.vue   # Logo-Rendering
│       ├── TextElementRender.vue   # Text-Rendering
│       ├── PlaceholderElementRender.vue # Platzhalter
│       ├── TableElementRender.vue  # Tabellen-Rendering
│       └── LineElementRender.vue   # Linien-Rendering
└── views/
    └── RechnungsvorlageView.vue    # Haupt-View
```

### Backend-Routes

```typescript
// Logo-Management
POST   /api/templates/upload-logo    // Upload mehrere Logos
GET    /api/templates/logos          // Alle Logos abrufen
DELETE /api/templates/logos/:id      // Logo löschen

// Template-Management (bereits vorhanden)
GET    /api/templates                // Alle Templates
POST   /api/templates                // Template erstellen
PUT    /api/templates/:id            // Template aktualisieren
DELETE /api/templates/:id            // Template löschen
PUT    /api/templates/:id/set-default // Als Standard setzen
```

### Datenbank-Schema

```prisma
model Logo {
  id          String   @id @default(uuid())
  name        String
  filename    String   @unique
  url         String
  size        Int
  uploaded_at DateTime @default(now())
}

model InvoiceTemplate {
  id          Int      @id @default(autoincrement())
  name        String   
  is_default  Boolean  @default(false)
  config      Json     // Enthält TemplateConfig
  created_by  String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

### Template-Konfiguration (JSON)

```typescript
interface TemplateConfig {
  elements: TemplateElement[]  // Alle drag-fähigen Elemente
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
  companyData: {
    name: string
    address: string
    city: string
    phone: string
    email: string
    website: string
  }
  bankDetails: {
    iban: string
    bic: string
    bank: string
  }
  grid: {
    enabled: boolean
    size: number
    snap: boolean
  }
}
```

## 📝 Verwendung

### 1. Neue Vorlage erstellen

1. Klicken Sie auf "Neue Vorlage"
2. Geben Sie einen Namen ein
3. Wählen Sie Farben aus
4. Fügen Sie Elemente hinzu:
   - Logos aus der Bibliothek hinzufügen
   - Textfelder über "Elemente"-Tab erstellen
   - Platzhalter für dynamische Daten einfügen
   - Tabelle für Rechnungspositionen hinzufügen
5. Positionieren Sie Elemente per Drag & Drop
6. Skalieren Sie Elemente mit Resize-Handles
7. Passen Sie Eigenschaften im Properties-Tab an
8. Klicken Sie auf "Speichern"

### 2. Vorlage bearbeiten

1. Klicken Sie auf das Bearbeiten-Icon einer Vorlage
2. Ändern Sie Elemente wie gewünscht
3. Nutzen Sie Undo/Redo bei Bedarf
4. Speichern Sie die Änderungen

### 3. Test-Rechnung anzeigen

1. Im Editor-Modus, klicken Sie auf "Test-Rechnung"
2. Alle Platzhalter werden mit Beispieldaten gefüllt
3. Prüfen Sie die Darstellung
4. Wechseln Sie zurück zu "Editor-Modus" zum Bearbeiten

### 4. Logo hochladen und verwenden

1. Öffnen Sie den "Logos"-Tab
2. Klicken Sie auf "[+ Upload]"
3. Wählen Sie ein oder mehrere Bilder aus
4. Klicken Sie auf das Augen-Icon 👁️ um Logo zur Vorlage hinzuzufügen
5. Positionieren und skalieren Sie das Logo wie gewünscht

## 🔐 Sicherheit

- Nur Bild-Dateien (JPEG, PNG, GIF) werden akzeptiert
- Maximale Dateigröße: 5MB
- Logos werden im `/public/uploads/logos/` Verzeichnis gespeichert
- Dateinamen werden mit UUID und Timestamp generiert
- Keine bekannten Sicherheitslücken in Abhängigkeiten

## 🚀 Deployment

### Voraussetzungen

```bash
# Frontend Dependencies installieren
cd frontend
npm install

# Backend Dependencies installieren
cd ../backend
npm install

# Prisma Datenbank-Schema aktualisieren
npx prisma db push
```

### Start im Development-Modus

```bash
# Backend
cd backend
npm start

# Frontend (in neuem Terminal)
cd frontend
npm run dev
```

## 🐛 Bekannte Einschränkungen

1. PDF-Export mit neuen Templates noch nicht implementiert
2. Logo-Rotation noch nicht verfügbar
3. Ebenen-Panel noch nicht vorhanden (Z-Index kann über Properties geändert werden)
4. Copy/Paste zwischen Vorlagen noch nicht möglich

## 📈 Zukünftige Verbesserungen

1. PDF-Export mit Multi-Logo-Support
2. Template-Duplikation
3. Template-Import/Export als JSON
4. Mehr Platzhalter-Typen
5. Benutzerdefinierte Schriftarten
6. Erweiterte Tabellen-Konfiguration
7. Gruppen von Elementen
8. Alignment-Hilfslinien
9. Element-Bibliothek mit vordefinierten Komponenten
10. Template-Vorlagen (Klassisch, Modern, etc.)

## 📞 Support

Bei Fragen oder Problemen, bitte ein Issue auf GitHub erstellen.

## 📄 Lizenz

Siehe Haupt-Repository Lizenz.
