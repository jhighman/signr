# Trua Verify Developer Guide

This guide provides technical information for developers who are maintaining or extending the Trua Verify system.

## System Architecture

Trua Verify follows a traditional web application architecture with:
- Flask backend (Python)
- HTML/JavaScript/CSS frontend
- File-based storage for claims

### Directory Structure

```
/
├── app.py                 # Main Flask application
├── claims/                # Directory for storing claim files
├── docs/                  # Documentation
├── static/                # Static assets
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   └── js/
│       ├── form.js        # Form handling and validation
│       └── signature_pad.min.js  # Signature capture library
└── templates/             # HTML templates
    ├── confirmation.html  # Confirmation page
    ├── error.html         # Error page
    ├── form.html          # Main form template
    └── index.html         # Landing page
```

## Key Components

### Backend (app.py)

The main Flask application handles:
- Routing and request handling
- Form processing and validation
- PDF and JSON generation
- File storage
- Internationalization (i18n) with Flask-Babel

Key routes:
- `/` - Redirects to verify
- `/verify` - Landing page
- `/form` - Employment form
- `/submit` - Form processing
- `/download/<filename>` - PDF retrieval
- `/translations/<lang>` - API endpoint for JavaScript translations

### Frontend

#### Templates

- `index.html` - Landing page with introduction and "Start" button
- `form.html` - Multi-step form for data collection
- `confirmation.html` - Success page with download link
- `error.html` - Error page for displaying validation errors

#### JavaScript

- `form.js` - Handles:
  - Multi-step form navigation
  - Timeline entry management
  - Signature capture
  - Client-side validation
  - Timeline visualization

#### CSS

- `styles.css` - Provides:
  - Responsive layout
  - Form styling
  - Timeline visualization styling
  - Signature pad styling

## Data Flow

1. **Invitation Access**:
   - User accesses system via URL with tracking_id and years parameters
   - Parameters are passed through the landing page to the form

2. **Form Completion**:
   - User enters personal information
   - User adds timeline entries
   - JavaScript calculates time coverage
   - User signs digitally

3. **Form Submission**:
   - JavaScript validates form completeness
   - Form data is submitted to server
   - Server processes and validates data
   - Server generates JSON and PDF files
   - Server returns confirmation page

4. **Document Retrieval**:
   - User downloads PDF from confirmation page
   - PDF is sent to verifier outside the system

## Key Implementation Details

### Multi-step Form

The form is implemented as a single HTML page with multiple sections that are shown/hidden using JavaScript:
- Step 1: Personal Information
- Step 2: Timeline Overview
- Step 3: Entry Form (for adding/editing individual entries)
- Step 4: Degree Verification (optional, shown when degree_required is true)
- Step 5: Attestation & Signature

Navigation between steps is handled by the `goToStep()` function in `form.js`.

### Timeline Entry Management

Timeline entries are managed dynamically using JavaScript:
- `createNewEntry()` - Creates a new entry form
- `saveCurrentEntry()` - Saves entry data
- `updateEntriesList()` - Updates the timeline overview
- `editEntry()` - Loads an entry for editing
- `deleteEntry()` - Removes an entry

Each entry is identified by a unique index and has its own set of form fields.

### Timeline Visualization

The timeline visualization is implemented in JavaScript:
- `updateTimelineVisualization()` - Creates visual representation of timeline
- `calculateYearsAccounted()` - Calculates total time covered
- Timeline segments are positioned using percentage-based calculations

### Signature Capture

Signature capture is implemented using the signature_pad.js library:
- Canvas element in the form
- Signature data is converted to a Base64-encoded PNG image
- Image is stored in a hidden form field for submission

### PDF Generation

PDF generation is handled by the ReportLab library:
- `generate_pdf()` function in app.py
- Creates a structured document with sections for:
  - Claimant information
  - Timeline entries
  - Digital signature
  - Attestation statement

### Security Features

The system includes:
- CSRF protection using Flask-WTF
- Input validation on both client and server sides
- Secure file naming conventions

### Internationalization (i18n)

The system supports multiple languages through Flask-Babel:

#### Backend Configuration
- Flask-Babel is configured in app.py
- Locale selector function determines the user's preferred language from:
  - URL parameters (e.g., ?lang=es)
  - Session storage
  - Browser's Accept-Language header
- Supported languages: English (en), Spanish (es), French (fr), Italian (it)

#### Translation Files
- Translation files are stored in the `translations` directory
- Each language has its own subdirectory (e.g., `translations/es/LC_MESSAGES/`)
- Messages are extracted from templates and Python files using Babel
- Translation files follow the gettext PO format

#### Template Integration
- Templates use the `_()` function to mark translatable strings
- Example: `{{ _('Personal Information') }}`
- Complex phrases are broken down into smaller translatable units

#### JavaScript Integration
- JavaScript translations are provided via the `/translations/<lang>` API endpoint
- The frontend fetches translations based on the current language
- Client-side strings are translated using a helper function

#### Adding a New Language
1. Create a new language file: `pybabel init -i translations/messages.pot -d translations -l <language_code>`
2. Add translations to the .po file
3. Compile translations: `pybabel compile -d translations`
4. Add the language to the language selector in form.html
5. Add translations for JavaScript strings in app.py

### Degree Verification

The system includes optional degree verification functionality:

#### Configuration
- Degree verification is enabled by passing `degreeRequired=true` in the URL
- When enabled, an additional step is shown in the form

#### Form Fields
- School Name
- Degree Level (Associate, Bachelor's, Master's, Doctorate, etc.)
- Degree Title
- Major
- Award Year

#### Implementation
- The degree verification step is conditionally shown based on the `degree_required` parameter
- Form navigation adapts to include or skip this step
- PDF generation includes a dedicated section for degree information when present

## Extending the System

### Adding New Timeline Entry Types

To add a new entry type:
1. Update the entry type dropdown in the form template
2. Add type-specific validation in `validateEntry()` in form.js
3. Update `updateEntryFields()` to show/hide relevant fields
4. Update the PDF generation to handle the new type

### Modifying the Form

To add new fields to the form:
1. Add the field to the appropriate section in form.html
2. Update the form processing in app.py
3. Update the JSON and PDF generation to include the new field
4. Add validation for the new field

### Implementing Database Storage

To replace file-based storage with a database:
1. Add a database connection (e.g., SQLAlchemy)
2. Create models for Claim, Claimant, and TimelineEntry
3. Update the form submission handler to store data in the database
4. Update the PDF download handler to retrieve data from the database

## Testing

The system can be tested by:
1. Running the Flask application locally
2. Accessing the system via http://localhost:5000/verify?tracking_id=test123&years=7
3. Completing the form with test data
4. Verifying that the PDF and JSON files are generated correctly

## Deployment Considerations

For production deployment:
1. Set up HTTPS using a proper SSL certificate
2. Configure a production-ready web server (e.g., Gunicorn, uWSGI)
3. Set a secure SECRET_KEY for CSRF protection
4. Implement proper authentication for accessing claims
5. Consider moving to a database for storage
6. Set up proper logging and monitoring

## Known Limitations

The current implementation has the following limitations:
1. File-based storage may not scale well for high volume
2. No authentication mechanism for accessing claims
3. Limited security features beyond CSRF protection
4. No dedicated verifier interface
5. Manual process for sharing PDFs with verifiers

See the [Recommendations](./recommendations.md) document for planned improvements to address these limitations.