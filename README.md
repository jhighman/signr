_______                __      __           _  __       
 |__   __|               \ \    / /          (_)/ _|      
    | |_ __ _   _  __ _   \ \  / /__ _ __ ___ _| |_ _   _ 
    | | '__| | | |/ _` |   \ \/ / _ \ '__/ _ \ |  _| | | |
    | | |  | |_| | (_| |    \  /  __/ | |  __/ | | | |_| |
    |_|_|   \__,_|\__,_|     \/ \___|_|  \___|_|_|  \__, |
                                                      __/ |
                                                     |___/ 
```

# 🔐 Trua Verify: Employment History Verification System

> *Truth, Trust & Ownership in Employment Verification*

[![Flask](https://img.shields.io/badge/Flask-2.0.1-blue)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-green)](https://www.python.org/)
[![Internationalization](https://img.shields.io/badge/i18n-Supported-orange)](https://flask-babel.tkte.ch/)

## 📋 Overview

Trua Verify is a web-based system designed to facilitate employment history verification. It allows candidates to submit a detailed employment history claim, which can then be verified by employers, recruiters, or background check services.

### ✨ Key Features

- 🌐 **Multi-language Support** - Available in English, Spanish, French, and Italian
- 📝 **Employment Timeline Creation** - Add multiple types of timeline entries
- 📊 **Timeline Visualization** - Interactive visual representation of employment coverage
- 🎓 **Education Verification** - Optional degree verification functionality
- ✍️ **Digital Signature** - Legally binding electronic signature
- 📄 **Document Generation** - PDF and JSON formats for verification
- 🔒 **Secure Storage** - Claims stored with unique tracking IDs

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │◄───►│  Flask Backend  │◄───►│  File Storage   │
│  (HTML/JS/CSS)  │     │    (Python)     │     │  (PDF/JSON)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 📂 Directory Structure

```
/
├── app.py                 # Main Flask application
├── babel.cfg              # Babel extraction configuration
├── init_translations.py   # Script to initialize translations
├── claims/                # Directory for storing claim files
├── docs/                  # Documentation
├── static/                # Static assets
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   └── js/
│       ├── form.js        # Form handling and validation
│       └── signature_pad.min.js  # Signature capture library
├── templates/             # HTML templates
│   ├── confirmation.html  # Confirmation page
│   ├── error.html         # Error page
│   ├── form.html          # Main form template
│   └── index.html         # Landing page
└── translations/          # Internationalization files
    ├── en/                # English translations
    ├── es/                # Spanish translations
    ├── fr/                # French translations
    └── it/                # Italian translations
```

## 👥 Key Actors

1. **👤 Candidate**: The individual invited to submit their employment history. They provide personal information, a timeline of jobs and gaps, and certify the information with a digital signature.

2. **🔍 Verifier**: The relying party (employer, recruiter, or background checker) who initiates the process via an invitation and uses the claim to verify the candidate's employment history.

## 🔄 Core Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Invitation │────►│  Personal   │────►│ Employment  │────►│   Degree    │
│   Access    │     │ Information │     │  Timeline   │     │Verification*│
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Download   │◄────│Confirmation │◄────│  Digital    │◄────│ Attestation │
│    PDF      │     │    Page     │     │  Signature  │     │             │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘

* Optional, based on verification requirements
```

## 🌐 Internationalization

Trua Verify supports multiple languages:

- 🇺🇸 English (default)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇮🇹 Italian (Italiano)

Users can switch languages using the language dropdown in the top-right corner of any page.

## 🎓 Education Verification

When required, the system collects detailed information about the candidate's educational background:

- 🏫 School Name
- 🎓 Degree Level (Associate, Bachelor's, Master's, Doctorate, etc.)
- 📜 Degree Title
- 📚 Major/Field of Study
- 📅 Award Year

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `python app.py`
4. Access the application at: `http://localhost:8080/verify?tracking_id=test123&years=7`

## 📚 Documentation

For more detailed information, see the documentation in the `docs/` directory:

- [System Overview](docs/system-overview.md)
- [Implementation Status](docs/implementation-status.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Recommendations](docs/recommendations.md)

## 🔒 Security Features

- CSRF protection using Flask-WTF
- Input validation on both client and server sides
- Secure file naming conventions

## 📄 License

© 2025 Trua Verify. All rights reserved.
