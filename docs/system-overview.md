# Trua Verify System Overview

## Introduction

Trua Verify is a web-based system designed to facilitate employment history verification. It allows candidates to submit a detailed employment history claim, which can then be verified by employers, recruiters, or background check services.

## System Purpose

The primary purpose of Trua Verify is to:

1. Provide a structured way for candidates to submit their employment history
2. Ensure the submitted history covers the required timeframe (e.g., 7 years)
3. Capture a legally binding digital signature to certify the accuracy of the information
4. Generate standardized documents (PDF and JSON) for verification purposes
5. Enable verifiers to efficiently check the candidate's employment claims

## Key Actors

The system involves two primary actors:

1. **Candidate**: The individual invited to submit their employment history. They provide personal information, a timeline of jobs and gaps, and certify the information with a digital signature.

2. **Verifier**: The relying party (employer, recruiter, or background checker) who initiates the process via an invitation and uses the claim to verify the candidate's employment history.

## Core Functionality

Trua Verify provides the following core functionality:

1. **Invitation-based Access**: Candidates access the system via a unique URL containing a tracking ID and timeframe parameter.

2. **Multi-language Support**: The system supports multiple languages (English, Spanish, French, and Italian) with a language switcher, allowing candidates to complete the process in their preferred language.

3. **Employment Timeline Creation**: Candidates can add multiple types of timeline entries:
   - Jobs (with company, position, dates, and contact information)
   - Education periods
   - Unemployment gaps
   - Other relevant periods

4. **Timeline Visualization**: The system provides an interactive visual representation of the timeline, showing coverage and gaps, helping candidates understand their progress toward meeting the timeframe requirement.

5. **Timeframe Validation**: The system calculates the total time accounted for and ensures it meets the required timeframe, with real-time feedback to the candidate.

6. **Education Verification**: When required, the system collects detailed information about the candidate's educational background, including school name, degree level, major, and award year.

7. **Digital Signature**: Candidates sign their submission using a canvas-based signature capture powered by the signature_pad.js library.

8. **Document Generation**: The system generates both PDF and JSON versions of the claim for different verification needs.

9. **Claim Storage**: All submissions are stored with a unique tracking ID for future reference.

## Current Implementation

The current implementation is a Flask-based web application with:

- A multi-step user flow (landing page, personal information, timeline entries, optional degree verification, signature & submission)
- Interactive timeline visualization with real-time validation
- Comprehensive client-side validation for data completeness and timeframe coverage
- Server-side processing and document generation
- CSRF protection using Flask-WTF
- Internationalization (i18n) using Flask-Babel with support for multiple languages
- Responsive design for various device sizes
- File-based storage in the claims directory

## Implementation Status

All core functionality is fully implemented and operational. The system successfully:
- Guides candidates through the submission process
- Validates timeline completeness
- Captures digital signatures
- Generates both PDF and JSON documents
- Provides a confirmation page with download capability
- Supports multiple languages (English, Spanish, French, Italian)
- Collects and verifies education credentials when required

For a detailed breakdown of implementation status, see [Implementation Status](./implementation-status.md).

## System Boundaries

The current system focuses on the claim submission process. It does not include:

1. A dedicated verifier portal for claim management
2. Automated verification processes
3. Integration with background check systems
4. User account management
5. Database storage (currently uses file-based storage)
6. Advanced security features beyond CSRF protection

These areas represent potential future enhancements to the system, as outlined in the [Recommendations](./recommendations.md) document.