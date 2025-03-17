
Actors
Candidate: The individual invited to submit their employment history via Trua Verify. They provide personal info (claimant) and a timeline of jobs/gaps, certifying it with a signature.
Verifier: The relying party (e.g., employer, recruiter, or background checker) who initiates the process via an invitation and uses the claim to verify the candidate’s employment history.

Use Cases
Use Case 1: Submit Employment History Claim
Actor: Candidate
Goal: Submit a complete, signed employment history claim for a specified timeframe as part of a job application.
Preconditions:
Candidate receives an invitation link from the Verifier (e.g., http://localhost:5000/verify?tracking_id=abc123&years=7).
System is accessible via a web browser.
Steps:
Candidate clicks the invitation link, loading the Trua Verify form with tracking_id pre-filled.
Candidate enters personal info:
Full Name: "John Michael Smith"
Email: "john.smith@example.com"
Phone: "555-987-6543" (optional).
Candidate selects or confirms the timeframe (e.g., "Last 7 Years").
Candidate adds timeline entries:
Job: "Product Manager at Nexlify, 2020-06-01 to 2023-05-31" with contact "Jane Doe (Supervisor, Senior Engineering Manager), 555-123-4567, jane.doe@nexlify.com".
Job: "Consultant at Freelance, 2019-01-01 to 2020-05-31" with contact "John Smith (Client, Project Lead), john.smith@clientco.com".
Gap: "Unemployed, 2018-03-17 to 2018-12-31".
System calculates and displays "Time accounted for: 7.2 years," confirming coverage.
Candidate signs digitally on the canvas, certifying accuracy.
Candidate submits the form.
System generates and saves a PDF (truaverify_abc123_20250317.pdf) and JSON (truaverify_abc123_20250317.json) in the claims directory.
Candidate downloads the PDF and sends it to the Verifier as instructed.
Postconditions:
Claim is stored with tracking_id "abc123" in claims.
Candidate has a PDF copy for their records.
Exceptions:
If timeframe isn’t covered (e.g., "6.5 years"), system alerts: "Please account for at least 7 years."
If required fields (e.g., full_name, email, job company_name) are missing, submission fails with an error.
Use Case 2: Verify Employment History Claim
Actor: Verifier
Goal: Confirm the candidate’s employment history using the submitted claim.
Preconditions:
Verifier has provided the tracking_id (e.g., "abc123") in the invitation.
Candidate has submitted the claim, and the PDF is received (e.g., via email).
Verifier has access to the claims directory (manually or via future system integration).
Steps:
Verifier opens the PDF (truaverify_abc123_20250317.pdf):
Sees claimant: "John Michael Smith, john.smith@example.com, 555-987-6543".
Reviews timeline covering 7 years with job details and contacts.
Confirms signature and submission date ("2025-03-17").
Verifier contacts "Jane Doe" (555-123-4567 or jane.doe@nexlify.com) to verify the Nexlify job:
Confirms "John Michael Smith" was "Product Manager" from 2020-06-01 to 2023-05-31.
Verifier contacts "John Smith" (john.smith@clientco.com) to verify the Freelance job:
Confirms consultancy work from 2019-01-01 to 2020-05-31.
Verifier notes the "Unemployed" gap (2018-03-17 to 2018-12-31) requires no further check.
(Optional) Verifier retrieves the JSON (truaverify_abc123_20250317.json) from claims to process data programmatically (e.g., import into HR system).
Postconditions:
Verifier confirms the claim’s accuracy and ties it to "John Michael Smith" via claimant details.
Employment history is validated for the job application.
Exceptions:
If contact info is missing or invalid, Verifier may contact the claimant directly (e.g., via "john.smith@example.com").
If timeline gaps are unexplained, Verifier may request clarification from the candidate.
Use Case 3: Review Incomplete Submission Attempt
Actor: Candidate
Goal: Understand and correct an incomplete submission to meet the timeframe requirement.
Preconditions:
Candidate is filling out the Trua Verify form via an invitation link.
Steps:
Candidate enters claimant details and one job: "Nexlify, 2020-06-01 to 2023-05-31".
System shows "Time accounted for: 3.0 years" (for a 7-year timeframe).
Candidate signs and submits.
System rejects submission: "Please account for at least 7 years."
Candidate adds more entries (e.g., Freelance job and Unemployed gap) to reach 7+ years.
Candidate re-submits successfully, downloading the PDF.
Postconditions:
Claim is only stored when complete, ensuring Verifier receives a full timeline.
Exceptions:
Candidate abandons the process if unable to fill the timeframe, requiring Verifier follow-up.
Use Case 4: Process Claim Data Programmatically
Actor: Verifier
Goal: Import the claim’s employment data into an HR or verification system using the JSON file.
Preconditions:
Candidate has submitted the claim.
Verifier has access to the claims directory.
Steps:
Verifier retrieves truaverify_abc123_20250317.json from claims.
System parses JSON:
Extracts claimant (e.g., "John Michael Smith", "john.smith@example.com").
Loads timeline into a database or tool, noting job details and contacts.
Verifier uses data to:
Auto-populate candidate profile with employment history.
Generate verification tasks (e.g., email "Jane Doe" for Nexlify job).
Verifier stores the PDF as a legal record alongside the processed data.
Postconditions:
Employment history is integrated into Verifier’s system efficiently.
Exceptions:
If JSON is malformed (unlikely with server generation), Verifier falls back to PDF manual review.
Use Case 5: Revisit and Resubmit Claim
Actor: Candidate
Goal: Correct or update a claim before final submission to the Verifier.
Preconditions:
Candidate is in the Trua Verify form, having added some entries.
Steps:
Candidate adds a job: "Nexlify, 2020-06-01 to 2023-05-31".
Realizes a mistake (e.g., wrong dates) and removes the entry.
Adds corrected job: "Nexlify, 2020-07-01 to 2023-06-30".
Adds remaining timeline entries to cover 7 years.
Signs and submits, generating new PDF and JSON with tracking_id "abc123".
Postconditions:
Only the final, corrected claim is stored in claims.
Exceptions:
If Verifier already received an earlier PDF, Candidate must notify them of the update (future feature: versioned claims).

System Use Case Summary
Primary Flow: Candidate submits a claim (Use Case 1), Verifier checks it (Use Case 2).
Support Flows:
Candidate handles incomplete attempts (Use Case 3).
Verifier processes data programmatically (Use Case 4).
Candidate revises before submission (Use Case 5).
Data Model Fit:
claimant: Enables identity verification (Use Cases 2, 4).
timeline: Provides employment history with contacts (Use Cases 1, 2, 4).
tracking_id: Links to the invitation (all use cases).
signature: Certifies authenticity (Use Cases 1, 2).
These use cases cover the core functionality of Trua Verify as a verification tool within the Trua ecosystem. Want to add more use cases (e.g., Verifier requesting resubmission) or refine these further? Let me know!



1. Overall Architecture
Frontend (HTML/JavaScript/CSS)
Form fields for entering employment history (company name, dates of employment, position, responsibilities, etc.).
A signature capture field (usually an HTML <canvas> element).
Backend (Python/Flask)
Handles form submission, storing data, and generating a final document (often a PDF) containing both the entered information and the signature.
Could optionally email a copy of the PDF or store it in a document repository.

2. Signature Capture
There are several ways to capture a “wet signature” in a web-based environment. The most common is using a canvas-based library. One popular JavaScript library for this is Signature Pad. It’s lightweight and easy to integrate.
Basic flow using Signature Pad:
Include the Signature Pad JS library in your HTML template.
Provide a <canvas> element for the user to sign in.
Once the user finishes signing, the signature can be exported as a Base64-encoded PNG image.
Send this Base64 data to your Flask backend using a standard form submission or an AJAX request.
Example minimal HTML snippet for signature capture:
html
CopyEdit
<html>
<head>
  <script src="signature_pad.js"></script> <!-- Signature Pad library -->
</head>
<body>
  <form id="employmentForm" action="/submit" method="POST">
    <!-- Employment history form fields -->
    <input type="text" name="company" placeholder="Company Name" required />
    <input type="text" name="position" placeholder="Position" required />
    <!-- ... more fields as needed ... -->

    <!-- Signature canvas -->
    <canvas id="signatureCanvas" width="400" height="200" style="border: 1px solid black;"></canvas>
    <input type="hidden" name="signatureData" id="signatureData"/>

    <!-- Possibly a 'Clear' button for re-signing -->
    <button type="button" onclick="clearSignature()">Clear Signature</button>

    <button type="submit">Submit</button>
  </form>

  <script>
    // Initialize Signature Pad
    var canvas = document.getElementById('signatureCanvas');
    var signaturePad = new SignaturePad(canvas);

    function clearSignature() {
      signaturePad.clear();
    }

    // On form submit, store Base64 signature in hidden field
    document.getElementById('employmentForm').addEventListener('submit', function () {
      var data = signaturePad.toDataURL(); // "data:image/png;base64, iVBORw0K..."
      document.getElementById('signatureData').value = data;
    });
  </script>
</body>
</html>

This snippet captures the user’s signature and places it into a hidden <input> named signatureData. On form submission, that data is available in the Flask backend.

3. Flask Backend
Let’s assume you have a typical Flask project structure:
cpp
CopyEdit
my_app/
  app.py
  templates/
    index.html
    ...
  static/
    signature_pad.js
    ...

A minimal Flask app could look like this:
python
CopyEdit
from flask import Flask, render_template, request, send_file
from io import BytesIO
import base64
# Libraries for PDF generation (for example, weasyprint or ReportLab)
# e.g., from weasyprint import HTML

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit_form():
    # Get the form data
    company = request.form.get('company')
    position = request.form.get('position')
    # ... get other fields ...
    
    # Get the signature data
    signature_data = request.form.get('signatureData')
    
    # signature_data is a base64 string like "data:image/png;base64,iVBOR..."
    # You can store it directly as a string in a database, or save it to disk.
    # For demonstration, we’ll just parse out the base64 content
    if signature_data.startswith("data:image/png;base64,"):
        signature_data = signature_data.replace("data:image/png;base64,", "")
    
    signature_binary = base64.b64decode(signature_data)
    
    # Save the signature to disk or S3, or generate a PDF.
    # For example, you could store it in a database along with the rest of the form data
    # Or generate a PDF and embed the signature image

    # Here’s a pseudo-code example for PDF generation:
    """
    html_content = render_template('pdf_template.html', company=company, position=position, ...)
    pdf = HTML(string=html_content).write_pdf()
    # This pdf is now in memory, you can store it or return as a response
    # Example of returning PDF back as download:
    return send_file(BytesIO(pdf), attachment_filename='employment_history.pdf')
    """

    # For now, just return a success page
    return "Form submitted successfully!"

if __name__ == '__main__':
    app.run(debug=True)

A Note on PDF Generation
WeasyPrint: lets you generate PDFs from HTML/CSS. It’s typically straightforward for “fill-in-a-template” usage.
ReportLab: more programmatic, but offers more control. You’d manually place text/images on the PDF canvas.
pdfkit (wkhtmltopdf wrapper): also popular for converting HTML to PDF.
Whichever you choose, the typical pattern is:
Create an HTML template for your document.
Embed the relevant form data (including the signature as a Base64 image).
Convert it to PDF.
Example of embedding Base64 image in HTML:
html
CopyEdit
<img src="data:image/png;base64,{{ signature_data }}" alt="Signature"/>

Then pass signature_data from your Flask route to the template.

4. Signed Attestation Workflow
In a typical DocuSign-like flow, you’d want:
User fills out the form.
User signs in the signature area.
The system ensures the user acknowledges an attestation (e.g., “I hereby certify that the above information is accurate…”).
Once submitted, the system locks or stores the data and signature so it can’t be altered.
If you need stronger legal enforceability, you might also consider:
Audit trails: Timestamps, IP addresses, or sending a confirmation email with a verification link.
Versioning: Keep track of all changes and final versions.
Encryption: Encrypt the signature data in your backend store.
Detailed disclaimers: A statement that the signature is an electronic signature that has the same effect as a written signature.

5. Database Considerations
For storing user submissions, you might use:
Relational DB: e.g., PostgreSQL or MySQL. You can store references to any PDF or image files that are saved in a cloud storage solution (S3, local file system, etc.).
NoSQL: e.g., MongoDB if your data is mostly documents.
In either case, store the signature and PDF securely.
Storing the Signature
You can store the Base64 string directly in the database, or store a file path/URL if you write the signature image to disk or S3.
If you plan to generate and keep a PDF as the permanent record, you may not need to store the signature image separately – the PDF will contain the signature.

6. Security & Authentication
To protect personal info:
Enable HTTPS (TLS/SSL).
If you’re capturing sensitive data (SSNs, addresses, etc.), ensure data is encrypted at rest.
Use Flask sessions or JWT for user authentication if needed.

7. Optional: Emailing or Providing Download Links
After the user signs and the PDF is generated, you may want to:
Send them an email with the final PDF as an attachment (Flask + smtplib or a transactional email service).
Provide a download link to the user so they can save the PDF record.
Example using send_file (as in code snippet above) to return the PDF directly in the response:
python
CopyEdit
from flask import send_file

pdf_bytes = generate_pdf(...)  # however you’re generating
return send_file(
    BytesIO(pdf_bytes),
    as_attachment=True,
    download_name='employment_history.pdf',
    mimetype='application/pdf'
)


8. Summary of Key Steps
Form & Signature UI:
Use an HTML form with JavaScript signature capture library like Signature Pad.
Flask Endpoint (/submit):
Parse form fields (employment history).
Parse the signature from Base64 format to raw image bytes.
Document Generation:
Generate PDF using a library such as WeasyPrint, pdfkit, or ReportLab.
Embed text fields and signature image.
Storage and/or Return:
Optionally store the PDF in your database or cloud, or just serve it back to the user.
Provide any needed attestation or disclaimers for a legally binding signature.
Security:
Use HTTPS, handle sensitive data with care.

Conclusion
By combining a Python/Flask backend with a JavaScript-based signature pad, you can build a custom employment history form that captures a user’s “wet signature.” You’ll have fine-grained control over the workflow (attestations, disclaimers, storage, PDF generation, etc.). While DocuSign provides a ready-made solution, rolling your own in Flask is definitely feasible and allows more flexibility and control over how you gather, store, and present employment history data.
o1
You said:
Now give me the UI specs 
Reasoned for 7 seconds
Below is an example set of UI specifications for a web-based employment history + electronic “wet signature” flow. These specs describe each screen or step, the required and optional form fields, interaction elements, and overall user flow. You can adapt these to match your branding, style guidelines, and any legal requirements in your organization.

1. Overall Flow
Landing/Introduction Page
Presents a brief introduction about the form’s purpose (e.g., collecting employment history and confirming accuracy).
Explains that the user will need to sign electronically.
“Get Started” button leading to the actual form.
Employment History Form (potentially multi-step or single page)
Fields for employment details (company name, dates, position, etc.).
Option to add multiple employments (repeatable blocks).
Validation and instructions.
Attestation & Signature Page
Legal text or disclaimer (e.g., “By signing here, I attest the provided information is true…”).
Signature capture area (HTML <canvas>).
“Clear” button to reset the signature.
“Submit” button to finalize.
Confirmation / Success Page
A message confirming the form submission.
Optional link or email instructions to download/keep a copy of the submitted details and signature as PDF.

2. Page-by-Page Specification
2.1. Landing/Introduction Page
Purpose: Let the user know what the form is for and any disclaimers before they begin.
Header:
Company logo in top-left.
Possibly a help or contact link in top-right.
Main Content:
Title: “Employment History & Attestation” (or similar).
Description: 1–2 paragraphs describing why you need their employment history, how you will use it, and that an electronic signature will be required.
Call to Action:
A prominent button labeled “Begin” or “Get Started.”
On click, navigates to the Employment History Form screen.
Footer:
Basic legal disclaimers or company info.
Possibly a progress indicator (e.g., Step 1 of 3).

2.2. Employment History Form
Purpose: Collect details of each previous employer. This could be on a single page or broken into multiple steps if there is a lot of data.
Layout (Single-Page Example)
Header:
Company logo or form title.
Step indicator: “Step 2 of 3: Employment History.”
Section A: Personal Information (optional if you need additional personal details)
Fields:
Full Name (required)
Email (required)
Phone (optional)
Section B: Employment History
Subsection (repeated for each prior job, or the user can add new blocks):
Company Name (required)
Text input; placeholder: “e.g. ABC Inc.”
Validation: non-empty
Position/Title (required)
Text input; placeholder: “e.g. Software Engineer”
Validation: non-empty
Dates of Employment (required)
Two date fields: Start Date, End Date (or “Present” check if still employed).
Validation: Start date must be before end date, unless “Present” is checked.
Responsibilities / Job Description (optional, or required if needed)
Text area for describing responsibilities.
Word limit or character limit.
Add Another Employment (button)
When clicked, dynamically inserts another set of the above fields.
Optionally limit the max number of jobs or let them add as many as needed.
Section C: Navigation / Progress
“Back” button (to return to Landing if needed).
“Next” or “Continue” button to proceed to the Attestation & Signature Page.
Footer:
Contact info or help link.
Possibly a link to Privacy Policy or Terms of Use.

2.3. Attestation & Signature Page
Purpose: Display a legal attestation statement and allow the user to sign electronically.
Header:
Company logo, form title (e.g., “Attestation & Signature”).
Progress: “Step 3 of 3.”
Attestation Statement / Legal Text:
Clearly visible block of text with any disclaimers:
“I, [User’s Name], hereby certify that the information I have provided is true and correct to the best of my knowledge. I understand that a false statement may disqualify me from… etc.”
Signature Capture UI:
A label: “Sign Below” or “Please sign in the box below.”
A <canvas> element with a border or background that indicates where to sign.
Buttons:
Clear: Clears the canvas so the user can re-draw the signature.
(Optional) Undo Last Stroke if you want more advanced functionality.
Hidden <input> that will store the Base64-encoded signature data upon submission.
Checkbox / Consent (optional but common):
“I acknowledge that this electronic signature has the same legal validity as a handwritten signature.”
Checking this is required to enable the submission button (client-side validation).
Submit Button:
Labeled “Submit” or “Finalize.”
On click:
Captures the signature from <canvas> as Base64.
Ensures all required fields are complete.
Submits form data + signature to the server.

2.4. Confirmation/Success Page
Purpose: Confirm that the form was submitted successfully and let the user know the next steps.
Header:
Simple branding or confirmation.
Main Content:
A message: “Thank you for submitting your employment history and signature. We have received your information.”
Optionally show a summary (non-editable) of the provided data or a short “What’s next?” note about processing times.
Optional Download / Email:
Provide a link to download a PDF copy of their signed form, or note that they will receive an email with a copy.
Optional Next Steps:
If there are subsequent onboarding or verification steps, provide them here (e.g., “We will contact you within 2 business days,” or “Upload additional documents”).
Footer:
Return to homepage link, if applicable.

3. Visual & Interaction Notes
Responsive Design:
Ensure that all form fields and the signature canvas scale down nicely on mobile devices.
The <canvas> signature pad should be sized appropriately (e.g., 100% width of the parent container up to a max width, with a consistent height, like 200–300px tall).
Field Validation:
Real-time client-side validation for required fields. For example, highlight empty required fields or invalid date ranges.
Display user-friendly error messages.
Error Handling:
If a server-side error occurs, present a clear message with steps to retry or contact support.
Accessibility:
Provide labels for each field (<label> tags), and ensure screen readers can read them.
Make sure the signature pad is keyboard-accessible or an alternative text-based e-sign process is available for users who cannot use pointer devices.
Styling/Branding:
Consistent color palette, typography, and button styles.
Visual cues to show which step the user is on (progress bar or step indicator).

4. Technical Components in the UI
HTML:
<form> with relevant <input> fields for employment details, <textarea> for job descriptions, etc.
<canvas> for signature capture.
<button> elements for clearing the signature and submitting the form.
CSS:
Responsiveness, form layout, error highlighting.
A straightforward grid or flexbox layout for alignment.
JavaScript (likely with a signature pad library like Signature Pad):
Initialize the signature pad on page load.
Provide a “Clear” function.
On submit, read signature data (toDataURL()), store it in a hidden <input>.

5. Sample Form Fields (Summary)
Below is an example data schema that you might collect for each job entry:
CompanyName (string, required)
Position (string, required)
StartDate (date, required)
EndDate (date, optional if “Present” is checked)
DescriptionOfDuties (text, optional/required based on needs)
Other details (like supervisor name, reason for leaving, etc.) can also be included if needed.

6. Pseudocode Example of UI Markup (Single-Page Variation)
Here is a condensed HTML wireframe to illustrate the form and signature page combined (though in practice, you might split into multiple pages or use a multi-step wizard):
html
CopyEdit
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Employment History & Signature</title>
  <link rel="stylesheet" href="/static/styles.css">
  <script src="/static/signature_pad.min.js"></script>
</head>
<body>

  <header>
    <img src="/static/logo.png" alt="Company Logo" />
    <h1>Employment History & Attestation</h1>
  </header>

  <main>
    <section id="introduction">
      <h2>Welcome</h2>
      <p>Please provide your employment history. Afterwards, you will be asked to sign electronically.</p>
      <button id="startButton">Get Started</button>
    </section>

    <form id="employmentForm" action="/submit" method="POST" style="display: none;">
      <h2>Step 1: Employment History</h2>

      <div class="employment-block">
        <label for="company">Company Name *</label>
        <input type="text" name="company" id="company" required />

        <label for="position">Position/Title *</label>
        <input type="text" name="position" id="position" required />

        <label for="startDate">Start Date *</label>
        <input type="date" name="startDate" id="startDate" required />

        <label for="endDate">End Date</label>
        <input type="date" name="endDate" id="endDate" />
        <label>
          <input type="checkbox" name="isCurrent" id="isCurrent" /> I am currently employed here
        </label>

        <label for="responsibilities">Responsibilities</label>
        <textarea name="responsibilities" id="responsibilities"></textarea>
      </div>

      <!-- Button to add more job entries if needed -->
      <button type="button" id="addEmployment">+ Add Another Employer</button>

      <!-- Next Step -->
      <button type="button" id="goToSignature">Next: Attestation & Signature</button>

      <div id="signatureSection" style="display: none;">
        <h2>Step 2: Attestation & Signature</h2>
        <p>By signing, you confirm that all information above is true and complete.</p>

        <canvas id="signatureCanvas" width="400" height="200" style="border: 1px solid #000;"></canvas>
        <button type="button" id="clearSignature">Clear</button>
        <input type="hidden" name="signatureData" id="signatureData" />

        <label>
          <input type="checkbox" id="agree" required />
          I acknowledge this electronic signature is legally binding.
        </label>

        <button type="submit">Submit</button>
      </div>
    </form>

    <section id="success" style="display: none;">
      <h2>Thank You!</h2>
      <p>Your submission has been received. We’ll get in touch soon.</p>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 Example Co.</p>
  </footer>

  <script>
    // JS to handle multi-step reveal/hide, signature pad init, etc.
    // (Not fully implemented here, just a conceptual outline)
    document.getElementById('startButton').addEventListener('click', function() {
      document.getElementById('introduction').style.display = 'none';
      document.getElementById('employmentForm').style.display = 'block';
    });

    // ... similarly handle "Next: Attestation & Signature" button
    // Initialize the signature pad, store data on form submit, etc.

  </script>
</body>
</html>


7. Final Notes
You can make this UI more “DocuSign-like” by incorporating a multi-step wizard with a progress bar, chunking the form into smaller steps (e.g., “Step 1: Personal Info,” “Step 2: Employment History,” “Step 3: Sign & Attest”).
Include robust client-side validation (e.g., you can’t proceed to signature until required fields are filled).
Ensure a polished, branded look with a consistent color scheme, typography, and spacing.
These specifications should give you a solid foundation for building a user-friendly, legally compliant, and visually coherent interface for collecting employment history and an electronic signature using Python/Flask on the backend.
Here's a clear, detailed UI mockup specification that matches your described use cases and workflow. This includes explicit layout details, interaction notes, and technical considerations for a Trua Verify employment history submission interface (including digital signature capture, similar to DocuSign).

🖥️ UI Specifications & Wireframes
✅ Screen 1: Invitation Landing Page
Purpose: Initial landing point for the Candidate, accessed via a direct invitation link.
URL example:
 bash
CopyEdit
http://localhost:5000/verify?tracking_id=abc123&years=7


UI Components:
Logo (Top-left corner)


Header:


Text: “Welcome to Trua Verify”
Body Text:


 "You've been invited to submit your employment history for the last [7 years]. You'll be asked to provide details of your employment, including gaps, and sign digitally to certify accuracy. This process takes approximately 5-10 minutes."



Button:


Text: "Start My Verification"
Action: Moves to the Employment History Form screen.

📋 Screen 2: Employment History Entry (Interactive Form)
⚙️ Fields & Layout
Header:


Trua Logo (top-left)
Step Indicator ("Step 1 of 2: Employment History")
Form Fields:


Personal Information (top section)


Full Name (required, pre-populated if available from invitation)
Email (required, validation: email format)
Phone (optional, placeholder: "555-987-6543")
Timeframe (non-editable, e.g., "Last 7 years" from URL parameter)
Employment History Timeline:


Allow dynamic addition of timeline entries.
For each timeline entry, fields are:
Type: Dropdown (Job, Unemployed/Gap, Education, Other)
Company/Organization (required if Type=Job/Education)
Position/Title (required if Type=Job/Education)
Start Date (required, date picker)
End Date (required, except for current position)
Currently employed here checkbox (sets EndDate = Present, disables EndDate)
Description/Details (optional)
Contact Name (required if Job)
Contact Email/Phone (required if Job)
Dynamic Interaction:


Button labeled “+ Add another entry” to dynamically add more timeline blocks.
Button labeled “Remove” at top-right of each entry block for deletion.
Time Accounted:


System calculates dynamically and displays total timeline coverage (e.g., "You've accounted for 7.2 years").
Validation Rules:


At least 7 years of total coverage required.
Highlight incomplete required fields clearly.
Display total accounted time prominently, validating before proceeding.
Navigation Buttons:


Button: “Continue to Signature”
Disabled until timeline covers required timeframe (7 years) and required fields are completed.
Enabled when validation passes.

✒️ Screen 2: Attestation & Digital Signature
Header:


Trua Logo
Step indicator ("Step 2 of 2: Review & Sign")
Summary Section (scrollable, read-only)


Clearly lists all entered employment history data for review.
Attestation (text displayed prominently above signature area):


 “I, [John Michael Smith], certify that the employment information provided is accurate and complete to the best of my knowledge.”



Electronic Signature Canvas:


Canvas for wet-signature capture (similar to DocuSign)
Dimensions: at least 400px width × 200px height with a clear, thin border.
Buttons below signature canvas:
Clear Signature (to clear signature and allow re-signing)
Checkbox below canvas:
"I understand this electronic signature is legally binding." (required to submit form)
Buttons:


Button: “Submit Claim” (disabled until signature is captured and checkbox is checked)

📥 Screen 3: Submission Confirmation
Header:


Trua Logo and friendly confirmation message (e.g., “Claim Submitted Successfully”)
Body Text:


 "Thank you, [John Michael Smith]. Your employment history and digital signature have been received. You can download your signed document below, and we've emailed a copy for your records."



Download PDF Button:


Button labeled “Download PDF Copy”
Downloads the generated PDF (truaverify_abc123_20250317.pdf).
Instructions (optional):


"Please send this PDF to your verifier (e.g., employer, recruiter) as instructed."

🎨 Visual Design & Interaction Principles
Clean and Professional Appearance:


Neutral or muted palette (white, gray, blue).
Use consistent fonts and adequate white space.
Responsive design compatible with desktop and mobile.
Validation and Feedback:


Clearly highlight errors (red outlines, inline error messages).
Dynamic messages to communicate submission progress and completeness (e.g., "You have accounted for 7.2 years out of 7 required years").
Accessibility:


Field labels clearly associated (<label> and for attribute)
Keyboard-accessible controls
ARIA attributes and screen-reader compatibility
High-contrast colors

📦 Technical Implementation Notes (Python/Flask)
Use Flask for routing, template rendering, form handling, and generating PDF documents (WeasyPrint or pdfkit).
For the signature, utilize the signature_pad.js library for capturing signatures as PNG (Base64).
On submission, generate two artifacts:
PDF (truaverify_<tracking_id>_<date>.pdf)
Includes all data provided and embedded signature
JSON (truaverify_<tracking_id>_<date>.json)
Stores structured data for future automated processing
Store these artifacts securely on the server or cloud storage (e.g., AWS S3, encrypted storage).

🛠️ Technologies Recommended:
Frontend
HTML/CSS (Bootstrap/Tailwind for responsive layout)
JavaScript library for signature: Signature Pad
Backend (Python/Flask)
Flask (routing and templating)
Flask-WTF (optional, form validation)
JSON (for structured data storage)
PDF generation (WeasyPrint recommended for simplicity)
Storage
Local file system for prototypes or S3/cloud for production deployments
Relational DB (PostgreSQL/MySQL) to store metadata (claim tracking_id, name, date, etc.)

📦 Example Data Files Naming Convention:
PDF:
 truaverify_<tracking_id>_<YYYYMMDD>.pdf
 (e.g., truaverify_abc123_20250317.pdf)
JSON:
truaverify_<tracking_id>_<YYYYMMDD>.json

✅ Success Criteria
Candidate easily fills employment history and signs digitally within 5 minutes.
Verifier can manually validate via PDF or import JSON easily into systems.
Legally-binding signature with timestamped audit trail.
Clear communication and error-handling encourage submission success.

🚧 Mockup Reference (Simple Example Layout)
[Landing Page]
pgsql
CopyEdit
+-------------------------------------+
| 🟦 TRUA Verify Logo                |
|                                    |
| Welcome to Trua Verify             |
|                                    |
| You are invited to submit your     |
| employment history for [7 years].  |
|                                    |
| [Start Submission] ▶️              |
|                                    |
+------------------------------------+

Employment Timeline Form (Step 1 of 2):
pgsql
CopyEdit
+-----------------------------------+
| 🟦 TRUA Verify (1 of 2)            |
|                                    |
| Full Name*: [John Michael Smith]   |
| Email*: [john.smith@example.com]   |
|                                    |
| Timeline Entries:                  |
| (Dynamic Entries with fields above)|
| [Add Another Entry]                |
|                                    |
| Total accounted for: 7.2 years ✅  |
| [Continue to Signature] ▶️         |
|                                    |
+------------------------------------+

less
CopyEdit
[Attestation and Signature]

I, [John Michael Smith], certify…

|------------------------| Clear ✖️  |
|                        | Canvas    |
|                        |           |
|                        (Signature) |
|                        |           |
|                        |           |
|                                    |
| ✅ Legal acknowledgment checkbox   |
|                                    |
| [Submit Claim] ▶️                  |


This specification can now directly inform your technical design 

