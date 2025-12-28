# Fix: Rechnungsvorlagen-Editor - Fabric.js Drag & Drop Implementation

## Problem

Der Rechnungsvorlagen-Editor war kaputt. Elemente konnten nicht verschoben werden.
(The invoice template editor was broken. Elements could not be moved.)

## Requirements

1. ✅ **Fabric.js Canvas mit Drag & Drop** - Fabric.js Canvas with Drag & Drop functionality
2. ✅ **Alle Elemente verschiebbar** - All elements must be movable
3. ✅ **Resize-Handles** - Resize handles on all elements
4. ✅ **NIGHTDUTY Standardvorlage** - NIGHTDUTY default template
5. ✅ **Vorschau-Funktion** - Preview function

## Solution Implemented

### 1. Fixed Fabric.js Controls Configuration

**File**: `frontend/src/components/invoice-editor/EditorCanvas.vue`

#### Changes Made:

1. **Enhanced Canvas Initialization**:
   ```typescript
   canvas = new Canvas(fabricCanvas.value, {
     width: 794,
     height: 1123,
     backgroundColor: props.backgroundColor,
     selection: true,
     preserveObjectStacking: true,
     // NEW: Enable controls for all objects
     uniformScaling: false,
     centeredRotation: true,
     centeredScaling: false
   })
   ```

2. **Configured Default Controls for All Objects**:
   - Added event listener on `object:added` to ensure all objects have controls
   - Configured resize handles (8 corner controls)
   - Set custom styling (pink/magenta theme matching NightDUTY branding)
   - Enabled all movement, scaling, and rotation options
   
   ```typescript
   canvas.on('object:added', (e) => {
     if (e.target && !e.target.data?.isGrid) {
       e.target.set({
         lockMovementX: false,
         lockMovementY: false,
         lockScalingX: false,
         lockScalingY: false,
         lockRotation: false,
         hasControls: true,
         hasBorders: true,
         borderColor: '#ff006e',
         cornerColor: '#ff006e',
         cornerSize: 10,
         transparentCorners: false,
         cornerStyle: 'circle'
       })
     }
   })
   ```

3. **Updated All Add Element Methods**:
   - `addRectangle()` - Rectangle with full controls
   - `addCircle()` - Circle with full controls
   - `addText()` - Text with full controls (IText for editing)
   - `addLine()` - Line with full controls
   - `addImage()` - Image with full controls

### 2. Created NIGHTDUTY Default Template

**File**: `frontend/src/components/invoice-editor/EditorCanvas.vue`

#### New Method: `loadNightDutyTemplate()`

Creates a professional invoice template with:

- **Header Section**:
  - NIGHTDUTY company logo/text (large, bold, blue)
  - Company information (address, contact)
  
- **Invoice Info Box**:
  - Invoice number (RE-2025-001)
  - Date (28.12.2025)
  - Due date (11.01.2026)
  - Customer number
  
- **Customer Address Section**:
  - Label: "Rechnungsempfänger:"
  - Customer name and address
  
- **Line Items Table**:
  - Table header (blue background, white text)
  - Columns: Position, Description, Quantity, Price, Total
  - Sample line item (Nachtdienst service)
  
- **Totals Section**:
  - Subtotal (Zwischensumme)
  - VAT 19% (MwSt.)
  - Grand Total (Gesamtbetrag)
  
- **Footer**:
  - Bank details (IBAN, BIC, USt-ID)
  - Thank you message
  
- **Decorative Elements**:
  - Pink/magenta top stripe (5px, NightDUTY brand color)

All elements are fully movable, resizable, and rotatable.

### 3. Implemented Preview Mode

**File**: `frontend/src/views/RechnungsvorlageEditorView.vue`

#### New Features:

1. **Preview Toggle Button**:
   - Eye icon button in header
   - Shows "Vorschau" when in edit mode
   - Shows "Bearbeiten" when in preview mode
   - Active state styling (green tint)

2. **Preview Mode Functionality**:
   ```typescript
   function togglePreview() {
     previewMode.value = !previewMode.value
     
     const objects = canvas.getObjects()
     objects.forEach(obj => {
       if (obj.data && obj.data.isGrid) return // Skip grid lines
       
       obj.selectable = !previewMode.value
       obj.evented = !previewMode.value
       obj.hasControls = !previewMode.value
       obj.hasBorders = !previewMode.value
     })
     
     canvas.discardActiveObject()
     canvas.renderAll()
   }
   ```

3. **Load Default Template Button**:
   - Button to quickly load the NIGHTDUTY standard template
   - Automatically sets template name to "NIGHTDUTY Standardvorlage"
   - Saves to undo history

### 4. Enhanced User Interface

**File**: `frontend/src/views/RechnungsvorlageEditorView.vue`

#### New UI Elements:

1. **Header Buttons** (left to right):
   - Back button
   - Template name input
   - **NEW**: "Standard laden" button (loads NIGHTDUTY template)
   - **NEW**: "Vorschau" button (toggles preview mode)
   - Save button

2. **Button Styling**:
   - `btn-default`: Blue-themed button for loading default template
   - `btn-preview`: Toggle button with active state
   - Consistent hover effects and animations
   - Accessibility with title tooltips

## Technical Details

### Fabric.js Version
- Using **Fabric.js 6.9.1** (latest stable)
- Full ES6 module support
- TypeScript definitions included

### Canvas Configuration
- **Size**: 794 × 1123 pixels (DIN A4 at 96 DPI)
- **Background**: White (#ffffff)
- **Grid**: 10px grid with light gray lines
- **Controls**: 8-point resize handles (corners)
- **Selection**: Multi-selection enabled
- **Rotation**: Enabled with green rotation handle

### Object Properties
All canvas objects have the following properties enabled:
- `hasControls: true` - Shows resize/rotate handles
- `hasBorders: true` - Shows selection border
- `selectable: true` - Object can be selected
- `evented: true` - Object responds to events
- `lockMovementX: false` - X-axis movement unlocked
- `lockMovementY: false` - Y-axis movement unlocked
- `lockScalingX: false` - X-axis scaling unlocked
- `lockScalingY: false` - Y-axis scaling unlocked
- `lockRotation: false` - Rotation unlocked

### Styling
- Border color: `#ff006e` (NIGHTDUTY pink/magenta)
- Corner color: `#ff006e` (NIGHTDUTY pink/magenta)
- Corner size: `10px`
- Corner style: `circle` (rounded corners)
- Transparent corners: `false` (solid filled)

## Testing

### Manual Test Steps:

1. **Start Application**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to Editor**:
   - Go to `/rechnungsvorlage/editor/new`
   - Or click "Neue Vorlage" from `/rechnungsvorlage`

3. **Test Drag & Drop**:
   - Click "Standard laden" to load template
   - Click any element
   - Drag it to a new position ✅
   - Element should move smoothly

4. **Test Resize Handles**:
   - Select any element
   - You should see 8 circular handles at corners ✅
   - Drag a handle to resize
   - Element should resize proportionally

5. **Test Rotation**:
   - Select any element
   - Look for green rotation handle above element ✅
   - Drag to rotate
   - Element should rotate around center

6. **Test Preview Mode**:
   - Click "Vorschau" button
   - All controls should disappear ✅
   - Elements should not be selectable
   - Click "Bearbeiten" to return to edit mode

7. **Test Element Addition**:
   - Click toolbar buttons to add:
     - Text (📝)
     - Rectangle (▭)
     - Circle (⭕)
     - Line (─)
     - Image (upload)
   - All new elements should have controls ✅

## Files Modified

1. **frontend/src/components/invoice-editor/EditorCanvas.vue**
   - Enhanced Fabric.js canvas initialization
   - Added control configuration
   - Updated all element creation methods
   - Added `loadNightDutyTemplate()` method
   - Exposed new method via defineExpose

2. **frontend/src/views/RechnungsvorlageEditorView.vue**
   - Added "Standard laden" button
   - Added "Vorschau" button
   - Implemented `loadDefaultTemplate()` function
   - Implemented `togglePreview()` function
   - Added `previewMode` state
   - Added button styles

## Demo

A standalone demo HTML file has been created for testing:
- **File**: `frontend/demo-editor.html`
- **Purpose**: Demonstrates Fabric.js functionality without backend
- **Features**:
  - Load NIGHTDUTY template
  - Add shapes (rectangle, circle, line)
  - Add text
  - Delete elements
  - Toggle preview mode
  - All with drag & drop and resize handles

## Future Enhancements

Potential improvements that could be made:

1. **Alignment Guides**: Snap-to-align when dragging objects
2. **Grouping**: Group multiple objects together
3. **Layers Panel**: Visual layer management in right sidebar
4. **More Templates**: Additional pre-made templates
5. **Export Options**: Export as PDF, PNG, SVG
6. **Undo/Redo**: Enhanced history with better feedback
7. **Copy/Paste**: Duplicate elements with Ctrl+C/Ctrl+V
8. **Text Formatting**: Rich text editor for text elements

## Conclusion

All requirements have been successfully implemented:

✅ Fabric.js Canvas mit Drag & Drop  
✅ Alle Elemente verschiebbar  
✅ Resize-Handles  
✅ NIGHTDUTY Standardvorlage  
✅ Vorschau-Funktion  

The invoice template editor is now fully functional with professional drag & drop capabilities, resize handles on all elements, a beautiful NIGHTDUTY default template, and a preview mode for testing the final result.
