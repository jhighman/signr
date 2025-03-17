# Trua Verify User Guide

This guide provides step-by-step instructions for candidates using the Trua Verify system to submit their employment history claims.

## Overview

Trua Verify is a web-based system that allows you to submit your employment history in a structured format, which can then be verified by employers, recruiters, or background check services. The system ensures that your employment history covers the required timeframe (typically 7 years) and includes a digital signature to certify the accuracy of the information.

## Getting Started

### Accessing the System

1. You will receive an invitation link from the verifier (employer, recruiter, or background checker) via email.
2. The link will look something like: `http://localhost:5000/verify?tracking_id=abc123&years=7`
3. Click on the link to access the Trua Verify system.

### Landing Page

Upon accessing the system, you will see a welcome page that:
- Introduces the verification process
- Explains what information you'll need to provide
- Indicates the timeframe you need to account for (e.g., 7 years)

Click the "Start My Verification" button to begin the process.

## Completing the Form

The form is divided into multiple steps to make the process easier to complete:

### Step 1: Personal Information

1. Enter your full name (required)
2. Enter your email address (required)
3. Enter your phone number (optional)
4. Confirm the timeframe you need to account for (this is pre-filled based on the invitation)
5. Click "Next: Employment Timeline" to proceed

### Step 2: Employment Timeline

This step allows you to build a comprehensive timeline of your employment history:

1. Review the timeline visualization at the top of the page, which shows:
   - The timeframe you need to cover (e.g., from 2018 to 2025)
   - A visual representation of your entries as you add them
   - The total time accounted for

2. Click "Add Employment Entry" to add your first entry

3. For each entry, you'll need to provide:
   - Entry Type: Job, Education, Unemployed, or Other
   - For Job entries:
     - Company/Organization name
     - Position/Title
     - Start date (month and year)
     - End date (month and year), or check "I am currently employed here"
     - Description (optional)
     - Contact name (for verification)
     - Contact email or phone (for verification)
   - For Education entries:
     - Institution name
     - Degree/Program
     - Start date
     - End date
   - For Unemployed or Other entries:
     - Start date
     - End date
     - Description (optional)

4. After completing an entry, click "Save Entry" to add it to your timeline

5. Continue adding entries until you've covered the required timeframe
   - The system will show "Time accounted for: X.X years" to help you track your progress
   - You need to account for at least the required timeframe (e.g., 7 years)

6. Once you've covered the required timeframe, the "Next: Signature" button will be enabled
   - Click this button to proceed to the final step

### Step 3: Attestation & Signature

1. Review the attestation statement, which confirms that the information you've provided is accurate
2. Sign in the signature box by drawing your signature with your mouse or finger (on touch devices)
3. If you make a mistake, click "Clear Signature" and try again
4. Check the box to acknowledge that your electronic signature is legally binding
5. Click "Submit Claim" to complete the process

## Confirmation & Next Steps

After submitting your claim, you will see a confirmation page that:
1. Confirms your submission was successful
2. Provides a link to download a PDF copy of your claim
3. Explains the next steps in the verification process

Be sure to download the PDF copy for your records. You may need to send this PDF to the verifier as instructed.

## Tips for a Successful Submission

- Have your employment history details ready before starting
- Make sure to account for the entire required timeframe, including any gaps
- For job entries, include accurate contact information for verification
- Be precise with dates to ensure proper timeframe calculation
- Review all information before signing and submitting
- Download the PDF for your records

## Troubleshooting

If you encounter any issues during the submission process:

- **Incomplete Timeframe**: If you see a message that you haven't accounted for enough time, add more entries to cover the required timeframe.
- **Missing Required Fields**: The system will highlight any required fields you've missed. Complete these fields to proceed.
- **Date Errors**: Ensure that start dates are before end dates for all entries.
- **Signature Issues**: If you're having trouble with the signature pad, try using a different device or browser.

## Privacy & Security

Your information is used solely for the purpose of employment verification. The system generates:
1. A PDF document containing your employment history and signature
2. A JSON file with the structured data

These files are associated with your unique tracking ID and are only accessible to authorized verifiers.