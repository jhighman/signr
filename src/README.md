# Modular Form.js Structure

This directory contains a modularized version of the form.js file, following the Single Responsibility Principle and loose coupling between modules.

## Directory Structure

```
src/
├── modules/
│   ├── formNavigation.js       # Multi-step form logic
│   ├── entryManagement.js      # Entry creation, saving, editing, deletion
│   ├── timelineVisualization.js # Timeline rendering and years calculation
│   ├── signaturePad.js         # Signature pad initialization and management
│   ├── validation.js           # Form and entry validation logic
│   └── utilities.js            # Shared helper functions
├── index.js                    # Main entry point to initialize and connect modules
└── form.js                     # Combined output that re-exports all modules
```

## Module Responsibilities

### formNavigation.js
- Manages the multi-step form navigation, step indicators, and step transitions
- Handles step transitions (goToStep, updateStepIndicator)
- Coordinates with validation before advancing steps

### entryManagement.js
- Handles creation, saving, editing, and deletion of timeline entries
- Manages entry-specific event listeners
- Updates entry fields based on type

### timelineVisualization.js
- Manages the timeline visualization and years-accounted calculation
- Renders the timeline with segments and gaps
- Calculates total years accounted for

### signaturePad.js
- Initializes and manages the signature pad functionality
- Adds accessibility features
- Handles clear signature action

### validation.js
- Centralizes all validation logic for steps, entries, and the entire form
- Shows/clears accessible error messages
- Validates individual steps and entries

### utilities.js
- Provides shared helper functions used across modules
- Handles toggle required attribute on fields
- Calculates timeline position percentages

## Main Entry Point

### index.js
- Initializes all modules in the correct order
- Sets up global variables
- Handles form submission with signature data integration

## Usage

To use this modular structure in your HTML file, you can include the combined form.js file:

```html
<script type="module" src="src/form.js"></script>
```

Or, if you prefer to use the individual modules directly:

```html
<script type="module" src="src/index.js"></script>
```

## Inter-Module Interactions

- Form Navigation ↔ Entry Management: goToStep is called when saving/adding entries; createNewEntry is triggered from step transitions
- Entry Management ↔ Timeline Visualization: Updates timeline after saving entries; checks years accounted for confirmation prompts
- Entry Management ↔ Validation: Validates entries before saving; updates form validity after changes
- Signature Pad ↔ Validation: Checks signature presence during form validation
- Validation ↔ Timeline Visualization: Uses calculateYearsAccounted to validate timeline completeness