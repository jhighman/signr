from flask import Flask, render_template, request, redirect, url_for, send_file, jsonify, session, g
from flask_babel import Babel, gettext as _, lazy_gettext as _l
from datetime import datetime
import os
import json
import base64
from io import BytesIO
import re
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from flask_wtf.csrf import CSRFProtect, CSRFError

app = Flask(__name__)
# Set a secret key for CSRF protection
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-truaverify-do-not-use-in-production')
# Initialize CSRF protection
csrf = CSRFProtect(app)

# Configure Flask-Babel
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

# Language selector function
def get_locale():
    # Try to get the language from the URL parameter
    lang = request.args.get('lang')
    if lang and lang in ['en', 'es', 'fr', 'it']:
        session['lang'] = lang
        return lang
    
    # Try to get the language from the session
    if 'lang' in session and session['lang'] in ['en', 'es', 'fr', 'it']:
        return session['lang']
    
    # Try to get the language from the Accept-Language header
    return request.accept_languages.best_match(['en', 'es', 'fr', 'it'])

babel = Babel(app, locale_selector=get_locale)

# CSRF error handler
@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return render_template('error.html',
                          error_title="Security Error",
                          error_message="The form submission failed due to a security validation error. Please try again."), 400

# Ensure claims directory exists
os.makedirs('claims', exist_ok=True)

@app.route('/')
def index():
    return redirect(url_for('verify'))

@app.route('/verify')
def verify():
    tracking_id = request.args.get('tracking_id', '')
    years = request.args.get('years', '7')
    return render_template('index.html', tracking_id=tracking_id, years=years, lang=get_locale())

@app.route('/form')
def form():
    tracking_id = request.args.get('tracking_id', '')
    years = request.args.get('years', '7')
    degree_required = request.args.get('degreeRequired', 'false').lower() == 'true'
    return render_template('form.html', tracking_id=tracking_id, years=years, degree_required=degree_required, lang=get_locale())

@app.route('/translations/<lang>')
def get_translations(lang):
    """API endpoint to get translations for JavaScript"""
    if lang not in ['en', 'es', 'fr', 'it']:
        lang = 'en'
    
    # Define translations for JavaScript
    translations = {
        'en': {
            'errorSavingEntry': 'An error occurred while saving the entry. Please try again.',
            'noEntryFound': 'Error: No entry found to save. Please try again or refresh the page.',
            'pleaseAddEmployer': 'Please add at least one employer before proceeding.',
            'accountForYears': 'Please account for at least {0} years before proceeding.',
            'startBeforeEnd': 'Start month must be before end month for entry #{0}',
            'confirmDeleteTitle': 'Confirm Deletion',
            'confirmDeleteDesc': 'Are you sure you want to delete this entry?',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'entryDeleted': 'Entry deleted',
            'addAnotherTitle': 'Add Another Entry?',
            'addAnotherDesc': 'You\'ve already accounted for {0} years, which meets the requirement of {1} years. Do you still want to add another entry?',
            'addEntry': 'Add Entry'
        },
        'es': {
            'errorSavingEntry': 'Se produjo un error al guardar la entrada. Por favor, inténtelo de nuevo.',
            'noEntryFound': 'Error: No se encontró ninguna entrada para guardar. Inténtelo de nuevo o actualice la página.',
            'pleaseAddEmployer': 'Por favor, añada al menos un empleador antes de continuar.',
            'accountForYears': 'Por favor, tenga en cuenta al menos {0} años antes de continuar.',
            'startBeforeEnd': 'El mes de inicio debe ser anterior al mes de finalización para la entrada #{0}',
            'confirmDeleteTitle': 'Confirmar Eliminación',
            'confirmDeleteDesc': '¿Está seguro de que desea eliminar esta entrada?',
            'cancel': 'Cancelar',
            'delete': 'Eliminar',
            'entryDeleted': 'Entrada eliminada',
            'addAnotherTitle': '¿Añadir Otra Entrada?',
            'addAnotherDesc': 'Ya ha contabilizado {0} años, lo que cumple con el requisito de {1} años. ¿Desea añadir otra entrada?',
            'addEntry': 'Añadir Entrada'
        },
        'fr': {
            'errorSavingEntry': 'Une erreur s\'est produite lors de l\'enregistrement de l\'entrée. Veuillez réessayer.',
            'noEntryFound': 'Erreur : Aucune entrée trouvée à enregistrer. Veuillez réessayer ou actualiser la page.',
            'pleaseAddEmployer': 'Veuillez ajouter au moins un employeur avant de continuer.',
            'accountForYears': 'Veuillez tenir compte d\'au moins {0} ans avant de continuer.',
            'startBeforeEnd': 'Le mois de début doit être antérieur au mois de fin pour l\'entrée #{0}',
            'confirmDeleteTitle': 'Confirmer la Suppression',
            'confirmDeleteDesc': 'Êtes-vous sûr de vouloir supprimer cette entrée ?',
            'cancel': 'Annuler',
            'delete': 'Supprimer',
            'entryDeleted': 'Entrée supprimée',
            'addAnotherTitle': 'Ajouter une Autre Entrée ?',
            'addAnotherDesc': 'Vous avez déjà comptabilisé {0} années, ce qui répond à l\'exigence de {1} années. Voulez-vous ajouter une autre entrée ?',
            'addEntry': 'Ajouter une Entrée'
        },
        'it': {
            'errorSavingEntry': 'Si è verificato un errore durante il salvataggio dell\'inserimento. Si prega di riprovare.',
            'noEntryFound': 'Errore: Nessun inserimento trovato da salvare. Riprova o aggiorna la pagina.',
            'pleaseAddEmployer': 'Si prega di aggiungere almeno un datore di lavoro prima di procedere.',
            'accountForYears': 'Si prega di considerare almeno {0} anni prima di procedere.',
            'startBeforeEnd': 'Il mese di inizio deve essere precedente al mese di fine per l\'inserimento #{0}',
            'confirmDeleteTitle': 'Conferma Eliminazione',
            'confirmDeleteDesc': 'Sei sicuro di voler eliminare questo inserimento?',
            'cancel': 'Annulla',
            'delete': 'Elimina',
            'entryDeleted': 'Inserimento eliminato',
            'addAnotherTitle': 'Aggiungere un Altro Inserimento?',
            'addAnotherDesc': 'Hai già contabilizzato {0} anni, che soddisfa il requisito di {1} anni. Vuoi aggiungere un altro inserimento?',
            'addEntry': 'Aggiungi Inserimento'
        }
    }
    
    return jsonify(translations.get(lang, translations['en']))

@app.route('/submit', methods=['POST'])
def submit():
    # Get form data
    data = request.form.to_dict()
    
    # Process timeline entries
    timeline = []
    i = 0
    while f'entry_type_{i}' in data:
        entry_type = data.get(f'entry_type_{i}', '')
        # Only include non-empty entries
        if entry_type:
            entry = {
                'type': entry_type,
                'company': data.get(f'company_{i}', ''),
                'position': data.get(f'position_{i}', ''),
                'start_date': data.get(f'start_date_{i}', ''),
                'end_date': data.get(f'end_date_{i}', ''),
                'is_current': f'is_current_{i}' in data,
                'description': data.get(f'description_{i}', ''),
                'contact_name': data.get(f'contact_name_{i}', ''),
                'contact_info': data.get(f'contact_info_{i}', '')
            }
            # Only add entries with valid data
            if (entry_type not in ['Job', 'Education']) or (entry['company'] and entry['start_date']):
                timeline.append(entry)
                print(f"Added entry {i}: {entry_type} - {entry['company']} ({entry['start_date']} to {entry['end_date'] if not entry['is_current'] else 'Present'})")
            else:
                print(f"Skipped incomplete entry {i}: {entry_type}")
        i += 1
    
    # Sort timeline entries by start date
    timeline.sort(key=lambda x: x['start_date'], reverse=True)
    
    # Process degree verification data if present
    degree_verification = None
    if 'school_name' in data and data['school_name']:
        degree_verification = {
            'school_name': data.get('school_name', ''),
            'degree_level': data.get('degree_level', ''),
            'degree_title': data.get('degree_title', ''),
            'major': data.get('major', ''),
            'award_year': data.get('award_year', '')
        }
        print(f"Added degree verification: {degree_verification['school_name']} - {degree_verification['degree_level']} in {degree_verification['major']}")
    
    # Get signature data
    signature_data = data.get('signature_data', '')
    
    # Create claim data
    claim = {
        'tracking_id': data.get('tracking_id', ''),
        'submission_date': datetime.now().strftime('%Y-%m-%d'),
        'claimant': {
            'full_name': data.get('full_name', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', '')
        },
        'years_requested': data.get('years', '7'),
        'timeline': timeline,
        'degree_verification': degree_verification,
        'signature': signature_data
    }
    
    # Generate filenames
    tracking_id = data.get('tracking_id', 'unknown')
    date_str = datetime.now().strftime('%Y%m%d')
    json_filename = f"truaverify_{tracking_id}_{date_str}.json"
    pdf_filename = f"truaverify_{tracking_id}_{date_str}.pdf"
    
    # Save JSON
    json_path = os.path.join('claims', json_filename)
    with open(json_path, 'w') as f:
        json.dump(claim, f, indent=2)
    
    # Generate and save PDF
    pdf_path = os.path.join('claims', pdf_filename)
    generate_pdf(claim, pdf_path)
    
    return render_template('confirmation.html', 
                          tracking_id=tracking_id, 
                          pdf_filename=pdf_filename,
                          claimant_name=claim['claimant']['full_name'])

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join('claims', filename), as_attachment=True)

def generate_pdf(claim, output_path):
    # Create a PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Create a custom style for the attestation
    attestation_style = ParagraphStyle(
        'Attestation',
        parent=normal_style,
        fontName='Helvetica',  # Use standard Helvetica font
        fontSize=10,
        spaceAfter=12,
        italic=True  # Set italic property separately
    )
    
    # Create content elements
    elements = []
    
    # Title
    elements.append(Paragraph("Trua Verify - Employment History Claim", title_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Claimant Information
    elements.append(Paragraph("Claimant Information", heading_style))
    elements.append(Paragraph(f"<b>Name:</b> {claim['claimant']['full_name']}", normal_style))
    elements.append(Paragraph(f"<b>Email:</b> {claim['claimant']['email']}", normal_style))
    elements.append(Paragraph(f"<b>Phone:</b> {claim['claimant']['phone'] or 'Not provided'}", normal_style))
    elements.append(Paragraph(f"<b>Tracking ID:</b> {claim['tracking_id']}", normal_style))
    elements.append(Paragraph(f"<b>Submission Date:</b> {claim['submission_date']}", normal_style))
    # Handle special case for years=0
    if claim['years_requested'] == '0':
        elements.append(Paragraph("<b>Verification Type:</b> Employment Verification (single employer)", normal_style))
    else:
        elements.append(Paragraph(f"<b>Years Requested:</b> {claim['years_requested']}", normal_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Employment Timeline
    elements.append(Paragraph("Employment Timeline", heading_style))
    
    # Helper function to format dates
    def format_date(date_str):
        if not date_str:
            return ""
        try:
            year, month = date_str.split('-')
            month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
            return f"{month_names[int(month)-1]} {year}"
        except:
            return date_str
    
    # Add timeline entries
    if claim['timeline']:
        for i, entry in enumerate(claim['timeline']):
            # Skip empty entries
            if not entry['type'] or (entry['type'] in ['Job', 'Education'] and not entry['company']):
                continue
                
            elements.append(Spacer(1, 0.1*inch))
            elements.append(Paragraph(f"Entry #{i+1}: {entry['type']}", styles['Heading3']))
            
            if entry['type'] == 'Job' or entry['type'] == 'Education':
                elements.append(Paragraph(f"<b>Company/Organization:</b> {entry['company']}", normal_style))
                elements.append(Paragraph(f"<b>Position/Title:</b> {entry['position']}", normal_style))
            
            end_date = "Present" if entry['is_current'] else format_date(entry['end_date'])
            elements.append(Paragraph(f"<b>Start Date:</b> {format_date(entry['start_date'])}", normal_style))
            elements.append(Paragraph(f"<b>End Date:</b> {end_date}", normal_style))
            
            if entry['description']:
                elements.append(Paragraph(f"<b>Description:</b> {entry['description']}", normal_style))
            
            if entry['type'] == 'Job' and (entry['contact_name'] or entry['contact_info']):
                elements.append(Paragraph(f"<b>Contact:</b> {entry['contact_name']}", normal_style))
                elements.append(Paragraph(f"<b>Contact Info:</b> {entry['contact_info']}", normal_style))
    else:
        elements.append(Paragraph("No employment entries provided.", normal_style))
    
    # Add degree verification if present
    if claim.get('degree_verification'):
        elements.append(Spacer(1, 0.25*inch))
        elements.append(Paragraph("Degree Verification", heading_style))
        
        degree = claim['degree_verification']
        elements.append(Paragraph(f"<b>School Name:</b> {degree['school_name']}", normal_style))
        elements.append(Paragraph(f"<b>Degree Level:</b> {degree['degree_level']}", normal_style))
        
        if degree['degree_title']:
            elements.append(Paragraph(f"<b>Degree Title:</b> {degree['degree_title']}", normal_style))
        
        if degree['major']:
            elements.append(Paragraph(f"<b>Major:</b> {degree['major']}", normal_style))
        
        if degree['award_year']:
            elements.append(Paragraph(f"<b>Award Year:</b> {degree['award_year']}", normal_style))
    
    # Add signature
    if claim['signature']:
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph("Digital Signature", heading_style))
        
        # Attestation text
        attestation_text = f"I, {claim['claimant']['full_name']}, certify that the employment information provided is accurate and complete to the best of my knowledge."
        elements.append(Paragraph(attestation_text, attestation_style))
        
        # Process signature image
        if claim['signature'].startswith('data:image/png;base64,'):
            signature_data = claim['signature'].replace('data:image/png;base64,', '')
            signature_image = BytesIO(base64.b64decode(signature_data))
            img = Image(signature_image, width=4*inch, height=2*inch)
            elements.append(img)
        
        elements.append(Paragraph(f"Signed on: {claim['submission_date']}", normal_style))
    
    # Build the PDF
    doc.build(elements)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)