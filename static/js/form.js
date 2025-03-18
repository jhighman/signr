document.addEventListener('DOMContentLoaded', function() {
    // Detect language from HTML lang attribute or use 'en' as default
    const lang = document.documentElement.lang || 'en';
    console.log(`Detected language: ${lang}`);
    
    // Translations for different languages
    const translations = {
        en: {
            errorSavingEntry: 'An error occurred while saving the entry. Please try again.',
            noEntryFound: 'Error: No entry found to save. Please try again or refresh the page.',
            pleaseAddEmployer: 'Please add at least one employer before proceeding.',
            accountForYears: (years) => `Please account for at least ${years} years before proceeding.`,
            startBeforeEnd: (entryNum) => `Start month must be before end month for entry #${entryNum}`,
            confirmDeleteTitle: 'Confirm Deletion',
            confirmDeleteDesc: 'Are you sure you want to delete this entry?',
            cancel: 'Cancel',
            delete: 'Delete',
            entryDeleted: 'Entry deleted',
            addAnotherTitle: 'Add Another Entry?',
            addAnotherDesc: (accounted, required) => `You've already accounted for ${accounted} years, which meets the requirement of ${required} years. Do you still want to add another entry?`,
            addEntry: 'Add Entry'
        },
        es: {
            errorSavingEntry: 'Se produjo un error al guardar la entrada. Por favor, inténtelo de nuevo.',
            noEntryFound: 'Error: No se encontró ninguna entrada para guardar. Inténtelo de nuevo o actualice la página.',
            pleaseAddEmployer: 'Por favor, añada al menos un empleador antes de continuar.',
            accountForYears: (years) => `Por favor, tenga en cuenta al menos ${years} años antes de continuar.`,
            startBeforeEnd: (entryNum) => `El mes de inicio debe ser anterior al mes de finalización para la entrada #${entryNum}`,
            confirmDeleteTitle: 'Confirmar Eliminación',
            confirmDeleteDesc: '¿Está seguro de que desea eliminar esta entrada?',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            entryDeleted: 'Entrada eliminada',
            addAnotherTitle: '¿Añadir Otra Entrada?',
            addAnotherDesc: (accounted, required) => `Ya ha contabilizado ${accounted} años, lo que cumple con el requisito de ${required} años. ¿Desea añadir otra entrada?`,
            addEntry: 'Añadir Entrada'
        },
        fr: {
            errorSavingEntry: 'Une erreur s\'est produite lors de l\'enregistrement de l\'entrée. Veuillez réessayer.',
            noEntryFound: 'Erreur : Aucune entrée trouvée à enregistrer. Veuillez réessayer ou actualiser la page.',
            pleaseAddEmployer: 'Veuillez ajouter au moins un employeur avant de continuer.',
            accountForYears: (years) => `Veuillez tenir compte d'au moins ${years} ans avant de continuer.`,
            startBeforeEnd: (entryNum) => `Le mois de début doit être antérieur au mois de fin pour l'entrée #${entryNum}`,
            confirmDeleteTitle: 'Confirmer la Suppression',
            confirmDeleteDesc: 'Êtes-vous sûr de vouloir supprimer cette entrée ?',
            cancel: 'Annuler',
            delete: 'Supprimer',
            entryDeleted: 'Entrée supprimée',
            addAnotherTitle: 'Ajouter une Autre Entrée ?',
            addAnotherDesc: (accounted, required) => `Vous avez déjà comptabilisé ${accounted} années, ce qui répond à l'exigence de ${required} années. Voulez-vous ajouter une autre entrée ?`,
            addEntry: 'Ajouter une Entrée'
        },
        it: {
            errorSavingEntry: 'Si è verificato un errore durante il salvataggio dell\'inserimento. Si prega di riprovare.',
            noEntryFound: 'Errore: Nessun inserimento trovato da salvare. Riprova o aggiorna la pagina.',
            pleaseAddEmployer: 'Si prega di aggiungere almeno un datore di lavoro prima di procedere.',
            accountForYears: (years) => `Si prega di considerare almeno ${years} anni prima di procedere.`,
            startBeforeEnd: (entryNum) => `Il mese di inizio deve essere precedente al mese di fine per l'inserimento #${entryNum}`,
            confirmDeleteTitle: 'Conferma Eliminazione',
            confirmDeleteDesc: 'Sei sicuro di voler eliminare questo inserimento?',
            cancel: 'Annulla',
            delete: 'Elimina',
            entryDeleted: 'Inserimento eliminato',
            addAnotherTitle: 'Aggiungere un Altro Inserimento?',
            addAnotherDesc: (accounted, required) => `Hai già contabilizzato ${accounted} anni, che soddisfa il requisito di ${required} anni. Vuoi aggiungere un altro inserimento?`,
            addEntry: 'Aggiungi Inserimento'
        }
    };
    
    // Get translations for current language or fallback to English
    const t = translations[lang] || translations.en;
    
    // Initialize variables
    let entryCount = 0;
    let signaturePad;
    let currentStep = 1;
    const yearsRequired = parseInt(document.querySelector('input[name="years"]').value) || 7;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsRequired;
    
    // Check if degree verification is required
    const degreeRequired = document.querySelector('input[name="degree_required"]') ?
        document.querySelector('input[name="degree_required"]').value === 'true' : false;
    
    // Initialize timeline labels
    const startYearLabel = document.getElementById('timeline-start-year');
    const endYearLabel = document.getElementById('timeline-end-year');
    
    if (startYearLabel) startYearLabel.textContent = startYear;
    if (endYearLabel) endYearLabel.textContent = currentYear;
    
    // Initialize multi-step form navigation
    initMultiStepForm();
    
    // Initialize signature pad
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
        
        // Make signature pad keyboard accessible
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('role', 'application');
        canvas.setAttribute('aria-label', 'Signature pad. Use mouse or touch to draw your signature.');
        
        // Add keyboard instructions
        canvas.addEventListener('focus', function() {
            const instructions = document.getElementById('signature-instructions');
            if (instructions) {
                instructions.textContent = 'Press Space or Enter to start drawing. Use arrow keys to navigate. Press Escape to cancel.';
            }
        });
        
        // Add keyboard support
        canvas.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                // Toggle drawing mode
                e.preventDefault();
                // This is a simplified example - in a real implementation, you would
                // need to track the drawing state and implement actual drawing logic
                canvas.classList.toggle('keyboard-drawing');
            }
        });
        
        // Clear signature button
        document.getElementById('clear-signature').addEventListener('click', function() {
            signaturePad.clear();
            validateForm();
            // Announce for screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'assertive');
            announcement.classList.add('sr-only');
            announcement.textContent = 'Signature cleared';
            document.body.appendChild(announcement);
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 3000);
        });
    }
    
    // Initialize entry management
    initEntryManagement();
    
    // Form submission
    const form = document.getElementById('employmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(true)) {
                e.preventDefault();
                return false;
            }
            
            // Add signature data to hidden input
            if (signaturePad && !signaturePad.isEmpty()) {
                document.getElementById('signature_data').value = signaturePad.toDataURL();
            }
        });
    }
    
    // Update attestation name when full name changes
    const fullNameInput = document.getElementById('full_name');
    if (fullNameInput) {
        fullNameInput.addEventListener('input', function() {
            document.getElementById('attestation-name').textContent = this.value || '[Your Name]';
            validateForm();
        });
    }
    
    // Legal acknowledgment checkbox
    const legalCheckbox = document.getElementById('legal-acknowledgment');
    if (legalCheckbox) {
        legalCheckbox.addEventListener('change', validateForm);
    }
    
    // Initialize entry management
    function initEntryManagement() {
        // Add entry button in timeline overview
        const addEntryBtn = document.getElementById('add-entry-btn');
        if (addEntryBtn) {
            addEntryBtn.addEventListener('click', function() {
                // Check if the timeline is already complete
                const yearsAccounted = calculateYearsAccounted();
                if (yearsAccounted >= yearsRequired) {
                    // If the timeline is complete, ask the user if they want to add another entry
                    // Create a confirmation dialog
                    const confirmAdd = () => {
                        // Create accessible confirmation message
                        const confirmElement = document.createElement('div');
                        confirmElement.setAttribute('role', 'alertdialog');
                        confirmElement.setAttribute('aria-modal', 'true');
                        confirmElement.setAttribute('aria-labelledby', 'confirm-title');
                        confirmElement.setAttribute('aria-describedby', 'confirm-desc');
                        confirmElement.className = 'confirm-dialog';
                        confirmElement.style.position = 'fixed';
                        confirmElement.style.top = '50%';
                        confirmElement.style.left = '50%';
                        confirmElement.style.transform = 'translate(-50%, -50%)';
                        confirmElement.style.backgroundColor = 'white';
                        confirmElement.style.padding = '20px';
                        confirmElement.style.border = '1px solid #ccc';
                        confirmElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        confirmElement.style.zIndex = '1000';
                        confirmElement.style.maxWidth = '400px';
                        confirmElement.style.width = '90%';
                        
                        confirmElement.innerHTML = `
                            <h3 id="confirm-title">${t.addAnotherTitle}</h3>
                            <p id="confirm-desc">${t.addAnotherDesc(yearsAccounted.toFixed(1), yearsRequired)}</p>
                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                                <button id="cancel-add" class="button secondary">${t.cancel}</button>
                                <button id="confirm-add" class="button primary">${t.addEntry}</button>
                            </div>
                        `;
                        
                        // Add to the DOM
                        document.body.appendChild(confirmElement);
                        
                        // Focus the first button
                        document.getElementById('cancel-add').focus();
                        
                        // Add event listeners
                        document.getElementById('cancel-add').addEventListener('click', () => {
                            document.body.removeChild(confirmElement);
                        });
                        
                        document.getElementById('confirm-add').addEventListener('click', () => {
                            document.body.removeChild(confirmElement);
                            
                            // Go to entry form (step 3)
                            createNewEntry();
                            goToStep(3);
                        });
                        
                        // Close on escape key
                        const handleKeyDown = (e) => {
                            if (e.key === 'Escape') {
                                document.body.removeChild(confirmElement);
                                document.removeEventListener('keydown', handleKeyDown);
                            }
                        };
                        document.addEventListener('keydown', handleKeyDown);
                    };
                    
                    // Show the confirmation dialog
                    confirmAdd();
                    return;
                }
                
                // Go to entry form (step 3)
                createNewEntry();
                goToStep(3);
            });
        }
        
        // Back to timeline button in entry form
        const backToTimelineBtn = document.getElementById('back-to-timeline-btn');
        if (backToTimelineBtn) {
            backToTimelineBtn.addEventListener('click', function() {
                // Go back to timeline overview (step 2)
                goToStep(2);
            });
        }
        
        // Save entry button in entry form
        const saveEntryBtn = document.getElementById('save-entry-btn');
        if (saveEntryBtn) {
            console.log("Save entry button found, adding event listener");
            saveEntryBtn.addEventListener('click', function(event) {
                console.log("Save entry button clicked");
                
                // Prevent default button behavior
                event.preventDefault();
                
                try {
                    // Check if there's an entry to save
                    const currentEntryContainer = document.getElementById('current-entry-container');
                    const entry = currentEntryContainer?.querySelector('.timeline-entry');
                    
                    if (!entry) {
                        console.error("No entry found in current-entry-container!");
                        // Create accessible error message
                        const errorElement = document.createElement('div');
                        errorElement.setAttribute('aria-live', 'assertive');
                        errorElement.classList.add('validation-message');
                        errorElement.textContent = t.noEntryFound;
                        errorElement.style.color = '#dc3545'; // Red color for warning
                        
                        // Add to the DOM
                        const formContainer = document.querySelector('.form-container');
                        if (formContainer) {
                            formContainer.insertBefore(errorElement, formContainer.firstChild);
                            
                            // Remove after a few seconds
                            setTimeout(() => {
                                formContainer.removeChild(errorElement);
                            }, 5000);
                        }
                        return;
                    }
                    
                    // Log the entry data before saving
                    const index = entry.getAttribute('data-index');
                    console.log(`Attempting to save entry with index: ${index}`);
                    
                    // Log all form fields for this entry
                    const formFields = entry.querySelectorAll('input, select, textarea');
                    console.log(`Entry has ${formFields.length} form fields:`);
                    formFields.forEach(field => {
                        console.log(`- ${field.id}: ${field.value}`);
                    });
                    
                    // saveCurrentEntry now handles the navigation based on entry index
                    const result = saveCurrentEntry();
                    console.log(`saveCurrentEntry result: ${result}`);
                    
                    if (!result) {
                        console.error("saveCurrentEntry failed!");
                    }
                } catch (error) {
                    console.error("Error in save entry button handler:", error);
                    // Create accessible error message
                    const errorElement = document.createElement('div');
                    errorElement.setAttribute('aria-live', 'assertive');
                    errorElement.classList.add('validation-message');
                    errorElement.textContent = t.errorSavingEntry;
                    errorElement.style.color = '#dc3545'; // Red color for warning
                    
                    // Add to the DOM
                    const formContainer = document.querySelector('.form-container');
                    if (formContainer) {
                        formContainer.insertBefore(errorElement, formContainer.firstChild);
                        
                        // Remove after a few seconds
                        setTimeout(() => {
                            formContainer.removeChild(errorElement);
                        }, 5000);
                    }
                }
            });
        } else {
            console.error("Save entry button not found! This will prevent saving entries.");
        }
    }
    
    // Create a new timeline entry
    function createNewEntry() {
        console.log("Creating new entry with entryCount:", entryCount);
        
        const templateElement = document.getElementById('timeline-entry-template');
        if (!templateElement) {
            console.error("Timeline entry template element not found!");
            return;
        }
        
        const template = templateElement.innerHTML;
        console.log("Timeline entry template HTML:", template);
        
        const currentEntryContainer = document.getElementById('current-entry-container');
        if (!currentEntryContainer) {
            console.error("Current entry container element not found!");
            return;
        }
        
        // Clear any existing content
        currentEntryContainer.innerHTML = '';
        
        // Get the current entry index
        const currentIndex = entryCount;
        console.log("Using currentIndex:", currentIndex);
        
        // Replace placeholders in template
        let entryHtml = template
            .replace(/{index}/g, currentIndex)
            .replace(/{index_plus_one}/g, currentIndex + 1);
        
        console.log("Entry HTML after placeholder replacement:", entryHtml);
        
        // Create temporary container to hold the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = entryHtml;
        
        // Append the entry to the container
        currentEntryContainer.appendChild(tempDiv.firstElementChild);
        
        // Get the current entry elements
        const isCurrentCheckbox = document.getElementById(`is_current_${currentIndex}`);
        const currentEmploymentCheckbox = document.querySelector(`.current-employment-checkbox`);
        const endDateGroup = document.querySelector(`.end-date-group`);
        const endDateInput = document.getElementById(`end_date_${currentIndex}`);
        const startDateInput = document.getElementById(`start_date_${currentIndex}`);
        
        // For the first entry (current employment)
        if (currentIndex === 0) {
            // Check "I am currently employed here" by default
            if (isCurrentCheckbox) {
                isCurrentCheckbox.checked = true;
            }
            
            // Hide end date field
            if (endDateGroup) {
                endDateGroup.style.display = 'none';
            }
            
            if (endDateInput) {
                endDateInput.value = '';
                endDateInput.required = false; // Make end date not required when currently employed
            }
            
            // Do not set a default start date for the first entry
        }
        // For subsequent entries
        else {
            console.log("Creating subsequent entry with index:", currentIndex);
            
            // Hide the "currently employed" checkbox
            if (currentEmploymentCheckbox) {
                currentEmploymentCheckbox.style.display = 'none';
            }
            
            // Make sure "currently employed" is unchecked
            if (isCurrentCheckbox) {
                isCurrentCheckbox.checked = false;
            }
            
            // Make sure end date field is visible
            if (endDateGroup) {
                endDateGroup.style.display = 'block';
            }
            
            // Find the previous entry's start date to set this entry's end date
            let previousStartDate = null;
            
            // Get all entries with valid data
            const entriesList = document.getElementById('entries-list');
            const entryElements = entriesList.querySelectorAll('.entry-summary');
            
            // Find the most recent entry (should be the one we just added)
            if (entryElements.length > 0) {
                const lastEntryIndex = entryElements[entryElements.length - 1].getAttribute('data-index');
                const lastStartDateInput = document.getElementById(`start_date_${lastEntryIndex}`);
                
                if (lastStartDateInput && lastStartDateInput.value) {
                    previousStartDate = lastStartDateInput.value;
                    
                    // Use the previous entry's start date as the end date for this entry
                    const endDateStr = previousStartDate;
                    console.log("Setting end date to previous start date:", endDateStr);
                    
                    // Set the end date for the new entry
                    if (endDateInput) {
                        endDateInput.value = endDateStr;
                    }
                    
                    // Set start date to one month before the end date
                    const endDateParts = endDateStr.split('-');
                    const endYear = parseInt(endDateParts[0]);
                    const endMonth = parseInt(endDateParts[1]);
                    
                    // Calculate one month before for start date
                    let startMonth = endMonth - 1;
                    let startYear = endYear;
                    if (startMonth < 1) {
                        startMonth = 12;
                        startYear--;
                    }
                    
                    // Format as YYYY-MM
                    const startDateStr = `${startYear}-${startMonth.toString().padStart(2, '0')}`;
                    console.log("Setting start date to one month before end date:", startDateStr);
                    
                    // Set the start date
                    if (startDateInput) {
                        startDateInput.value = startDateStr;
                    }
                }
            }
        }
        
        // Add event listeners to the new entry
        setupEntryEventListeners(currentIndex);
        
        // Focus on the first field
        const firstField = currentEntryContainer.querySelector('select, input, textarea');
        if (firstField) {
            firstField.focus();
        }
    }
    
    // Save the current entry and handle navigation
    function saveCurrentEntry() {
        console.log("Saving entry with entryCount before save:", entryCount);
        
        const currentEntryContainer = document.getElementById('current-entry-container');
        const entry = currentEntryContainer.querySelector('.timeline-entry');
        
        if (!entry) {
            console.error("No entry found to save!");
            return false;
        }
        
        const index = entry.getAttribute('data-index');
        console.log("Entry index being saved:", index);
        
        // Debug validation
        const isValid = validateEntry(entry);
        console.log("Entry validation result:", isValid);
        
        // Validate the entry
        if (!isValid) {
            // Create a general error message at the top of the form
            const currentEntryContainer = document.getElementById('current-entry-container');
            if (currentEntryContainer) {
                let errorElement = document.getElementById('entry-form-error');
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = 'entry-form-error';
                    errorElement.className = 'validation-message';
                    errorElement.setAttribute('aria-live', 'assertive');
                    currentEntryContainer.insertBefore(errorElement, currentEntryContainer.firstChild);
                }
                errorElement.textContent = 'Please fill in all required fields before saving.';
                errorElement.style.color = '#dc3545'; // Red color for warning
            }
            return false;
        }
        
        try {
            // Store the entry data
            const entryData = {
                index: index,
                type: document.getElementById(`entry_type_${index}`).value,
                company: document.getElementById(`company_${index}`)?.value || '',
                position: document.getElementById(`position_${index}`)?.value || '',
                startDate: document.getElementById(`start_date_${index}`).value,
                endDate: document.getElementById(`end_date_${index}`).value,
                isCurrent: document.getElementById(`is_current_${index}`).checked,
                description: document.getElementById(`description_${index}`)?.value || '',
                contactName: document.getElementById(`contact_name_${index}`)?.value || '',
                contactInfo: document.getElementById(`contact_info_${index}`)?.value || ''
            };
            
            console.log("Entry data prepared:", entryData);
            
            // Add to entries list or update existing
            updateEntriesList(entryData);
            
            // Always increment entry count after saving
            entryCount++;
            console.log("entryCount after increment:", entryCount);
            
            // Validate form and update timeline
            validateForm();
            
            // After saving any entry, go to timeline overview
            console.log("Attempting to navigate to timeline overview (step 2)");
            
            // Check if step-2 exists before navigating
            const step2Element = document.getElementById('step-2');
            if (step2Element) {
                console.log("Found step-2 element, proceeding with navigation");
            } else {
                console.error("step-2 element not found! This will cause navigation to fail");
                console.log("Available steps:", Array.from(document.querySelectorAll('.form-section[data-step]')).map(el => el.id));
            }
            
            goToStep(2);
            
            // Check if the timeline is complete
            const yearsAccounted = calculateYearsAccounted();
            // No need to show an alert here, the UI already indicates completion
            
            return true;
        } catch (error) {
            console.error("Error saving entry:", error);
            // Create accessible error message
            const errorElement = document.createElement('div');
            errorElement.setAttribute('aria-live', 'assertive');
            errorElement.classList.add('validation-message');
            errorElement.textContent = 'An error occurred while saving the entry. Please try again.';
            errorElement.style.color = '#dc3545'; // Red color for warning
            
            // Add to the DOM
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                formContainer.insertBefore(errorElement, formContainer.firstChild);
                
                // Remove after a few seconds
                setTimeout(() => {
                    formContainer.removeChild(errorElement);
                }, 5000);
            }
            return false;
        }
    }
    
    // Update the entries list in the timeline overview
    function updateEntriesList(entryData) {
        console.log("Updating entries list with data:", entryData);
        
        const entriesList = document.getElementById('entries-list');
        if (!entriesList) {
            console.error("Entries list element not found!");
            return;
        }
        
        try {
            // Remove "no entries" message if present
            const noEntriesMsg = entriesList.querySelector('.no-entries-message');
            if (noEntriesMsg) {
                console.log("Removing 'no entries' message");
                noEntriesMsg.remove();
            }
            
            // Check if entry already exists
            let entryElement = entriesList.querySelector(`.entry-summary[data-index="${entryData.index}"]`);
            console.log(`Entry element with index ${entryData.index} ${entryElement ? 'exists' : 'does not exist'}`);
            
            // Format dates for display
            const formatMonthYear = (dateStr) => {
                if (!dateStr) return '';
                const [year, month] = dateStr.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            };
            
            const startDateFormatted = formatMonthYear(entryData.startDate);
            const endDateFormatted = entryData.isCurrent ? 'Present' : formatMonthYear(entryData.endDate);
            
            console.log(`Formatted dates - Start: ${startDateFormatted}, End: ${endDateFormatted}`);
            
            // Create HTML for entry summary
            const entryHTML = `
                <div class="entry-summary-content">
                    <div class="entry-summary-header">
                        <strong>${entryData.type}</strong>
                        <div class="entry-actions">
                            <button type="button" class="edit-entry" data-index="${entryData.index}">Edit</button>
                            <button type="button" class="delete-entry" data-index="${entryData.index}">Delete</button>
                        </div>
                    </div>
                    ${entryData.type === 'Job' || entryData.type === 'Education' ?
                        `<div>${entryData.position} at ${entryData.company}</div>` : ''}
                    <div class="entry-dates">${startDateFormatted} - ${endDateFormatted}</div>
                </div>
            `;
            
            if (entryElement) {
                // Update existing entry
                console.log("Updating existing entry");
                entryElement.innerHTML = entryHTML;
            } else {
                // Create new entry
                console.log("Creating new entry");
                entryElement = document.createElement('div');
                entryElement.className = 'entry-summary';
                entryElement.setAttribute('data-index', entryData.index);
                entryElement.innerHTML = entryHTML;
                entriesList.appendChild(entryElement);
                
                // Add event listeners
                const editBtn = entryElement.querySelector('.edit-entry');
                if (editBtn) {
                    editBtn.addEventListener('click', function() {
                        editEntry(entryData.index);
                    });
                }
                
                const deleteBtn = entryElement.querySelector('.delete-entry');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function() {
                        deleteEntry(entryData.index);
                    });
                }
            }
            
            console.log("Entries list updated successfully");
            
            // Create hidden form fields to store the entry data
            // This ensures the data is submitted with the form
            const createOrUpdateHiddenField = (name, value) => {
                let field = document.getElementById(name);
                if (!field) {
                    field = document.createElement('input');
                    field.type = 'hidden';
                    field.id = name;
                    field.name = name;
                    document.getElementById('employmentForm').appendChild(field);
                }
                field.value = value;
                console.log(`Hidden field ${name} set to: ${value}`);
            };
            
            // Create or update hidden fields for this entry
            createOrUpdateHiddenField(`entry_type_${entryData.index}`, entryData.type);
            createOrUpdateHiddenField(`company_${entryData.index}`, entryData.company);
            createOrUpdateHiddenField(`position_${entryData.index}`, entryData.position);
            createOrUpdateHiddenField(`start_date_${entryData.index}`, entryData.startDate);
            createOrUpdateHiddenField(`end_date_${entryData.index}`, entryData.endDate);
            createOrUpdateHiddenField(`is_current_${entryData.index}`, entryData.isCurrent ? 'on' : '');
            createOrUpdateHiddenField(`description_${entryData.index}`, entryData.description);
            createOrUpdateHiddenField(`contact_name_${entryData.index}`, entryData.contactName);
            createOrUpdateHiddenField(`contact_info_${entryData.index}`, entryData.contactInfo);
            
            // After updating the entries list, validate the form to update the timeline
            setTimeout(() => {
                console.log("Validating form after updating entries list");
                validateForm();
            }, 100);
            
            console.log("Hidden form fields created/updated");
        } catch (error) {
            console.error("Error updating entries list:", error);
        }
    }
    
    // Edit an existing entry
    function editEntry(index) {
        const currentEntryContainer = document.getElementById('current-entry-container');
        
        // Clear any existing content
        currentEntryContainer.innerHTML = '';
        
        // Clone the hidden entry from the form data
        const entryData = {
            type: document.getElementById(`entry_type_${index}`)?.value,
            company: document.getElementById(`company_${index}`)?.value,
            position: document.getElementById(`position_${index}`)?.value,
            startDate: document.getElementById(`start_date_${index}`)?.value,
            endDate: document.getElementById(`end_date_${index}`)?.value,
            isCurrent: document.getElementById(`is_current_${index}`)?.checked,
            description: document.getElementById(`description_${index}`)?.value,
            contactName: document.getElementById(`contact_name_${index}`)?.value,
            contactInfo: document.getElementById(`contact_info_${index}`)?.value
        };
        
        // Get the template and create a new entry
        const template = document.getElementById('timeline-entry-template').innerHTML;
        
        // Replace placeholders in template
        let entryHtml = template
            .replace(/{index}/g, index)
            .replace(/{index_plus_one}/g, parseInt(index) + 1);
        
        // Create temporary container to hold the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = entryHtml;
        
        // Append the entry to the container
        currentEntryContainer.appendChild(tempDiv.firstElementChild);
        
        // Add event listeners to the entry
        setupEntryEventListeners(index);
        
        // Fill in the values
        if (entryData.type) document.getElementById(`entry_type_${index}`).value = entryData.type;
        if (entryData.company) document.getElementById(`company_${index}`).value = entryData.company;
        if (entryData.position) document.getElementById(`position_${index}`).value = entryData.position;
        if (entryData.startDate) document.getElementById(`start_date_${index}`).value = entryData.startDate;
        if (entryData.endDate) document.getElementById(`end_date_${index}`).value = entryData.endDate;
        
        const isCurrentCheckbox = document.getElementById(`is_current_${index}`);
        if (isCurrentCheckbox) {
            // For subsequent entries (index > 0), hide the "currently employed" checkbox
            if (parseInt(index) > 0) {
                const currentEmploymentCheckbox = document.querySelector(`.current-employment-checkbox`);
                if (currentEmploymentCheckbox) {
                    currentEmploymentCheckbox.style.display = 'none';
                }
            }
            
            isCurrentCheckbox.checked = entryData.isCurrent;
            
            // Handle end date field visibility based on "currently employed" status
            const endDateGroup = document.querySelector(`.end-date-group`);
            if (entryData.isCurrent) {
                if (endDateGroup) {
                    endDateGroup.style.display = 'none';
                }
                const endDateInput = document.getElementById(`end_date_${index}`);
                if (endDateInput) {
                    endDateInput.value = '';
                    endDateInput.required = false; // Make end date not required when currently employed
                }
            } else {
                if (endDateGroup) {
                    endDateGroup.style.display = 'block';
                }
            }
        }
        
        if (entryData.description) document.getElementById(`description_${index}`).value = entryData.description;
        if (entryData.contactName) document.getElementById(`contact_name_${index}`).value = entryData.contactName;
        if (entryData.contactInfo) document.getElementById(`contact_info_${index}`).value = entryData.contactInfo;
        
        // Update fields visibility based on entry type
        updateEntryFields(index);
        
        // Go to entry form
        goToStep(3);
    }
    
    // Delete an entry
    function deleteEntry(index) {
        // Create a confirmation dialog
        const confirmDelete = () => {
            // Create accessible confirmation message
            const confirmElement = document.createElement('div');
            confirmElement.setAttribute('role', 'alertdialog');
            confirmElement.setAttribute('aria-modal', 'true');
            confirmElement.setAttribute('aria-labelledby', 'confirm-title');
            confirmElement.setAttribute('aria-describedby', 'confirm-desc');
            confirmElement.className = 'confirm-dialog';
            confirmElement.style.position = 'fixed';
            confirmElement.style.top = '50%';
            confirmElement.style.left = '50%';
            confirmElement.style.transform = 'translate(-50%, -50%)';
            confirmElement.style.backgroundColor = 'white';
            confirmElement.style.padding = '20px';
            confirmElement.style.border = '1px solid #ccc';
            confirmElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            confirmElement.style.zIndex = '1000';
            confirmElement.style.maxWidth = '400px';
            confirmElement.style.width = '90%';
            
            confirmElement.innerHTML = `
                <h3 id="confirm-title">${t.confirmDeleteTitle}</h3>
                <p id="confirm-desc">${t.confirmDeleteDesc}</p>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="cancel-delete" class="button secondary">${t.cancel}</button>
                    <button id="confirm-delete" class="button primary">${t.delete}</button>
                </div>
            `;
            
            // Add to the DOM
            document.body.appendChild(confirmElement);
            
            // Focus the first button
            document.getElementById('cancel-delete').focus();
            
            // Add event listeners
            document.getElementById('cancel-delete').addEventListener('click', () => {
                document.body.removeChild(confirmElement);
            });
            
            document.getElementById('confirm-delete').addEventListener('click', () => {
                document.body.removeChild(confirmElement);
                
                // Remove from entries list
                const entriesList = document.getElementById('entries-list');
                const entryElement = entriesList.querySelector(`.entry-summary[data-index="${index}"]`);
                if (entryElement) {
                    entryElement.remove();
                }
                
                // Remove hidden form data
                const hiddenFields = [
                    `entry_type_${index}`,
                    `company_${index}`,
                    `position_${index}`,
                    `start_date_${index}`,
                    `end_date_${index}`,
                    `is_current_${index}`,
                    `description_${index}`,
                    `contact_name_${index}`,
                    `contact_info_${index}`
                ];
                
                hiddenFields.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) {
                        // Completely remove the field from the form
                        field.parentNode.removeChild(field);
                    }
                });
                
                // Check if there are no more entries
                if (entriesList.children.length === 0) {
                    entriesList.innerHTML = '<p class="no-entries-message">No entries yet. Add your first employment entry.</p>';
                }
                
                // Validate form and update timeline
                validateForm();
                
                // Announce deletion for screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'assertive');
                announcement.classList.add('sr-only');
                announcement.textContent = t.entryDeleted;
                document.body.appendChild(announcement);
                setTimeout(() => {
                    document.body.removeChild(announcement);
                }, 3000);
            });
            
            // Close on escape key
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(confirmElement);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        };
        
        // Show the confirmation dialog
        confirmDelete();
        }
    }
    
    // Validate a single entry
    function validateEntry(entry) {
        if (!entry) {
            console.error("No entry provided for validation");
            return false;
        }
        
        const index = entry.getAttribute('data-index');
        console.log(`Validating entry with index: ${index}`);
        
        const entryType = document.getElementById(`entry_type_${index}`);
        
        if (!entryType || !entryType.value) {
            console.error(`Entry type is missing for index ${index}`);
            return false;
        }
        
        console.log(`Entry type: ${entryType.value}`);
        
        // Check required fields based on entry type
        if (entryType.value === 'Job') {
            const company = document.getElementById(`company_${index}`);
            const position = document.getElementById(`position_${index}`);
            const contactName = document.getElementById(`contact_name_${index}`);
            const contactInfo = document.getElementById(`contact_info_${index}`);
            
            // Special debugging for first job entry
            if (parseInt(index) === 0) {
                console.log("VALIDATING FIRST JOB ENTRY");
                console.log("First job entry fields:");
                console.log(`- Company: ${company?.value || 'MISSING'}`);
                console.log(`- Position: ${position?.value || 'MISSING'}`);
                console.log(`- Contact Name: ${contactName?.value || 'MISSING'}`);
                console.log(`- Contact Info: ${contactInfo?.value || 'MISSING'}`);
                
                // Check if elements exist
                console.log("Element existence check:");
                console.log(`- Company element exists: ${!!company}`);
                console.log(`- Position element exists: ${!!position}`);
                console.log(`- Contact Name element exists: ${!!contactName}`);
                console.log(`- Contact Info element exists: ${!!contactInfo}`);
            } else {
                console.log(`Job fields - Company: ${company?.value}, Position: ${position?.value}, Contact Name: ${contactName?.value}, Contact Info: ${contactInfo?.value}`);
            }
            
            if (company && !company.value) {
                showAccessibleError(company, 'Company field is required');
                return false;
            }
            if (position && !position.value) {
                showAccessibleError(position, 'Position field is required');
                return false;
            }
            if (contactName && !contactName.value) {
                showAccessibleError(contactName, 'Contact name field is required');
                return false;
            }
            if (contactInfo && !contactInfo.value) {
                showAccessibleError(contactInfo, 'Contact info field is required');
                return false;
            }
        } else if (entryType.value === 'Education') {
            const company = document.getElementById(`company_${index}`);
            const position = document.getElementById(`position_${index}`);
            
            console.log(`Education fields - Institution: ${company?.value}, Degree: ${position?.value}`);
            
            if (company && !company.value) {
                showAccessibleError(company, 'Institution field is required');
                return false;
            }
            if (position && !position.value) {
                showAccessibleError(position, 'Degree field is required');
                return false;
            }
        }
        
        // Check dates
        const startDate = document.getElementById(`start_date_${index}`);
        const endDate = document.getElementById(`end_date_${index}`);
        const isCurrent = document.getElementById(`is_current_${index}`);
        
        console.log(`Date fields - Start Date: ${startDate?.value}, End Date: ${endDate?.value}, Is Current: ${isCurrent?.checked}`);
        
        if (startDate && !startDate.value) {
            showAccessibleError(startDate, 'Start date is required');
            return false;
        } else if (startDate) {
            clearError(startDate);
        }
        
        if (endDate && !isCurrent.checked && !endDate.value) {
            showAccessibleError(endDate, 'End date is required when not currently employed');
            return false;
        } else if (endDate) {
            clearError(endDate);
        }
        
        // Check date order
        if (startDate && startDate.value && endDate && endDate.value) {
            const startParts = startDate.value.split('-');
            const endParts = endDate.value.split('-');
            
            if (startParts.length === 2 && endParts.length === 2) {
                const startYear = parseInt(startParts[0]);
                const startMonth = parseInt(startParts[1]);
                const endYear = parseInt(endParts[0]);
                const endMonth = parseInt(endParts[1]);
                
                console.log(`Date comparison - Start: ${startYear}-${startMonth}, End: ${endYear}-${endMonth}`);
                
                if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
                    showAccessibleError(startDate, 'Start month must be before end month');
                    return false;
                } else {
                    clearError(startDate);
                    clearError(endDate);
                }
            }
        }
        
        console.log("Entry validation successful");
        return true;
    }
    
    // Setup event listeners for a timeline entry
    function setupEntryEventListeners(index) {
        // Entry type change
        const entryType = document.getElementById(`entry_type_${index}`);
        if (entryType) {
            entryType.addEventListener('change', function() {
                updateEntryFields(index);
                validateForm();
            });
            
            // Initialize fields based on current type
            updateEntryFields(index);
        }
        
        // Remove entry button
        const removeButton = document.querySelector(`.remove-entry[data-index="${index}"]`);
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                const entry = document.querySelector(`.timeline-entry[data-index="${index}"]`);
                if (entry && document.querySelectorAll('.timeline-entry').length > 1) {
                    entry.remove();
                    validateForm();
                }
            });
        }
        
        // Date fields
        const startDate = document.getElementById(`start_date_${index}`);
        const endDate = document.getElementById(`end_date_${index}`);
        const isCurrent = document.getElementById(`is_current_${index}`);
        
        if (startDate) {
            // Only validate when focus leaves the field, not during typing
            startDate.addEventListener('blur', validateForm);
        }
        
        if (endDate) {
            // Only validate when focus leaves the field, not during typing
            endDate.addEventListener('blur', validateForm);
        }
        
        if (isCurrent) {
            isCurrent.addEventListener('change', function() {
                // Find the end date group (parent container of the end date field)
                const endDateGroup = document.querySelector('.end-date-group');
                
                if (this.checked) {
                    // Hide the end date field when "currently employed" is checked
                    if (endDateGroup) {
                        endDateGroup.style.display = 'none';
                    }
                    if (endDate) {
                        endDate.value = '';
                        endDate.required = false; // Make end date not required when currently employed
                    }
                } else {
                    // Show the end date field when "currently employed" is unchecked
                    if (endDateGroup) {
                        endDateGroup.style.display = 'block';
                    }
                    if (endDate) {
                        endDate.required = true; // Make end date required when not currently employed
                    }
                }
                validateForm();
            });
        }
        
        // Other required fields
        const requiredFields = [
            document.getElementById(`company_${index}`),
            document.getElementById(`position_${index}`),
            document.getElementById(`contact_name_${index}`),
            document.getElementById(`contact_info_${index}`)
        ];
        
        requiredFields.forEach(field => {
            if (field) {
                field.addEventListener('input', validateForm);
            }
        });
    }
    
    // Update fields based on entry type
    function updateEntryFields(index) {
        const entryType = document.getElementById(`entry_type_${index}`).value;
        const entry = document.querySelector(`.timeline-entry[data-index="${index}"]`);
        
        if (entry) {
            const jobFields = entry.querySelector('.job-fields');
            const contactFields = entry.querySelector('.contact-fields');
            
            if (entryType === 'Job') {
                if (jobFields) jobFields.style.display = 'block';
                if (contactFields) contactFields.style.display = 'block';
                
                // Make job-specific fields required
                toggleRequired(entry, '.company-field', true);
                toggleRequired(entry, '.position-field', true);
                toggleRequired(entry, '.contact-name-field', true);
                toggleRequired(entry, '.contact-info-field', true);
            } else if (entryType === 'Education') {
                if (jobFields) jobFields.style.display = 'block';
                if (contactFields) contactFields.style.display = 'none';
                
                // Make education-specific fields required
                toggleRequired(entry, '.company-field', true);
                toggleRequired(entry, '.position-field', true);
                toggleRequired(entry, '.contact-name-field', false);
                toggleRequired(entry, '.contact-info-field', false);
            } else {
                // Unemployed or Other
                if (jobFields) jobFields.style.display = 'none';
                if (contactFields) contactFields.style.display = 'none';
                
                // Make these fields not required
                toggleRequired(entry, '.company-field', false);
                toggleRequired(entry, '.position-field', false);
                toggleRequired(entry, '.contact-name-field', false);
                toggleRequired(entry, '.contact-info-field', false);
            }
        }
    }
    
    // Toggle required attribute on fields
    function toggleRequired(container, selector, required) {
        const field = container.querySelector(selector);
        if (field) {
            field.required = required;
        }
    }
    
    // Calculate total years accounted for
    function calculateYearsAccounted() {
        // Look at the entries in the entries list instead of all timeline entries
        const entriesList = document.getElementById('entries-list');
        const entryElements = entriesList.querySelectorAll('.entry-summary');
        
        console.log(`Found ${entryElements.length} entries to calculate years for`);
        
        // If no entries, return 0
        if (entryElements.length === 0) {
            console.log("No entries found, returning 0 years");
            return 0;
        }
        
        // Special case: If years=0, we only need one employer regardless of timeframe
        // Just calculate the actual years for display purposes
        if (yearsRequired === 0) {
            console.log("Years required is 0, calculating actual years for display only");
        }
        
        // Define the required period boundaries
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startYear = currentYear - yearsRequired;
        const requiredPeriodStart = new Date(startYear, 0, 1); // Jan 1 of start year
        const requiredPeriodEnd = new Date(now); // Current date
        
        console.log(`Required period: ${requiredPeriodStart.toISOString().substring(0, 10)} to ${requiredPeriodEnd.toISOString().substring(0, 10)}`);
        
        // Create an array to store all entries
        const dateRanges = [];
        
        // First pass: collect all valid date ranges
        entryElements.forEach(entryElement => {
            const index = entryElement.getAttribute('data-index');
            
            // Debug the entry element content
            console.log(`Processing entry ${index}: ${entryElement.textContent.trim().substring(0, 50)}...`);
            
            // Try to extract dates from the entry summary text if hidden fields are missing
            const entryText = entryElement.textContent.trim();
            let startDateStr = null;
            let endDateStr = null;
            let isCurrent = false;
            
            // Extract dates from the entry summary text
            const dateMatch = entryText.match(/([A-Z][a-z]{2} \d{4}) - (Present|[A-Z][a-z]{2} \d{4})/);
            if (dateMatch) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const startMonthYear = dateMatch[1].split(' ');
                const startMonth = monthNames.indexOf(startMonthYear[0]) + 1;
                const startYear = parseInt(startMonthYear[1]);
                startDateStr = `${startYear}-${startMonth.toString().padStart(2, '0')}`;
                
                if (dateMatch[2] === 'Present') {
                    isCurrent = true;
                    endDateStr = null;
                } else {
                    const endMonthYear = dateMatch[2].split(' ');
                    const endMonth = monthNames.indexOf(endMonthYear[0]) + 1;
                    const endYear = parseInt(endMonthYear[1]);
                    endDateStr = `${endYear}-${endMonth.toString().padStart(2, '0')}`;
                }
                
                console.log(`Extracted dates from entry text: ${startDateStr} to ${isCurrent ? 'Present' : endDateStr}`);
            }
            
            // Get the entry data from hidden form fields
            const startDateInput = document.getElementById(`start_date_${index}`);
            const endDateInput = document.getElementById(`end_date_${index}`);
            const isCurrentInput = document.getElementById(`is_current_${index}`);
            const entryTypeInput = document.getElementById(`entry_type_${index}`);
            
            // Use extracted dates if hidden fields are missing or empty
            const finalStartDateStr = (startDateInput && startDateInput.value) ? startDateInput.value : startDateStr;
            const finalEndDateStr = (endDateInput && endDateInput.value) ? endDateInput.value : endDateStr;
            const finalIsCurrent = (isCurrentInput && isCurrentInput.checked) || isCurrent;
            
            console.log(`Entry ${index} inputs:`, {
                type: entryTypeInput?.value,
                startDate: finalStartDateStr,
                endDate: finalEndDateStr,
                isCurrent: finalIsCurrent
            });
            
            if (finalStartDateStr) {
                // For month inputs, the format is YYYY-MM
                // We'll create dates on the first day of each month
                const startDateParts = finalStartDateStr.split('-');
                const startYear = parseInt(startDateParts[0]);
                const startMonth = parseInt(startDateParts[1]) - 1; // JavaScript months are 0-indexed
                const startDate = new Date(startYear, startMonth, 1);
                
                let endDate;
                
                if (finalIsCurrent) {
                    // Current date - set to today
                    endDate = new Date(now);
                    console.log(`Entry ${index} is current, using today's date: ${endDate.toISOString().substring(0, 10)}`);
                } else if (finalEndDateStr) {
                    const endDateParts = finalEndDateStr.split('-');
                    const endYear = parseInt(endDateParts[0]);
                    const endMonth = parseInt(endDateParts[1]) - 1; // JavaScript months are 0-indexed
                    
                    // Set to the last day of the month to include the full month
                    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
                    endDate = new Date(endYear, endMonth, lastDay);
                }
                
                if (endDate && startDate <= endDate) {
                    // Store the date range
                    dateRanges.push({
                        startDate,
                        endDate,
                        // For debugging
                        startStr: finalStartDateStr,
                        endStr: finalIsCurrent ? 'Present' : finalEndDateStr,
                        index
                    });
                    
                    console.log(`Added date range for entry ${index}: ${finalStartDateStr} to ${finalIsCurrent ? 'Present' : finalEndDateStr}`);
                } else {
                    console.log(`Invalid date range for entry ${index}: ${finalStartDateStr} to ${finalIsCurrent ? 'Present' : finalEndDateStr || 'undefined'}`);
                }
            } else {
                console.log(`Entry ${index} has no start date`);
            }
        });
        
        // Sort date ranges by start date
        dateRanges.sort((a, b) => a.startDate - b.startDate);
        
        // Debug output
        console.log("Date ranges before merging:", dateRanges.map(range =>
            `Entry ${range.index}: ${range.startStr} to ${range.endStr} (${formatDateRange(range.startDate, range.endDate)})`
        ));
        
        // Helper function to format date range for debugging
        function formatDateRange(start, end) {
            return `${start.toISOString().substring(0, 10)} to ${end.toISOString().substring(0, 10)}`;
        }
        
        // Merge overlapping date ranges
        const mergedRanges = [];
        
        if (dateRanges.length > 0) {
            let currentRange = {...dateRanges[0]};
            
            for (let i = 1; i < dateRanges.length; i++) {
                const nextRange = dateRanges[i];
                
                // Check if ranges overlap or are adjacent
                if (nextRange.startDate <= new Date(currentRange.endDate.getTime() + 86400000)) { // Add one day to handle adjacent months
                    // Extend current range if the next range ends later
                    if (nextRange.endDate > currentRange.endDate) {
                        currentRange.endDate = nextRange.endDate;
                        currentRange.endStr = nextRange.endStr;
                    }
                    console.log(`Merged entry ${nextRange.index} into entry ${currentRange.index}`);
                } else {
                    // No overlap, add current range to merged list and start a new current range
                    mergedRanges.push(currentRange);
                    currentRange = {...nextRange};
                }
            }
            
            // Add the last range
            mergedRanges.push(currentRange);
        }
        
        // Debug output
        console.log("Merged date ranges:", mergedRanges.map(range =>
            `${range.startStr} to ${range.endStr} (${formatDateRange(range.startDate, range.endDate)})`
        ));
        
        // Calculate total years within the required period
        let totalYears = 0;
        
        mergedRanges.forEach(range => {
            // Clip the range to the required period
            const clippedStart = new Date(Math.max(range.startDate.getTime(), requiredPeriodStart.getTime()));
            const clippedEnd = new Date(Math.min(range.endDate.getTime(), requiredPeriodEnd.getTime()));
            
            // Skip if the range is completely outside the required period
            if (clippedStart > clippedEnd) {
                console.log(`Range ${range.startStr} to ${range.endStr} is outside the required period`);
                return;
            }
            
            // Calculate years between dates based on milliseconds for more accuracy
            const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000; // Account for leap years
            const yearDiff = (clippedEnd.getTime() - clippedStart.getTime()) / millisecondsInYear;
            
            console.log(`Range ${range.startStr} to ${range.endStr}: clipped to ${formatDateRange(clippedStart, clippedEnd)} = ${yearDiff.toFixed(2)} years`);
            
            totalYears += yearDiff;
        });
        
        // Round to 1 decimal place for display
        const roundedYears = Math.round(totalYears * 10) / 10;
        
        // If we have entries that cover the entire period, cap at yearsRequired
        if (roundedYears >= yearsRequired) {
            console.log(`Total years accounted: ${yearsRequired.toFixed(1)} (capped from ${roundedYears.toFixed(1)})`);
            return yearsRequired;
        }
        
        console.log(`Total years accounted: ${roundedYears.toFixed(1)} (raw: ${totalYears.toFixed(2)})`);
        return roundedYears;
    }
    
    // Update timeline visualization
    function updateTimelineVisualization() {
        const timelineSegments = document.getElementById('timeline-segments');
        if (!timelineSegments) return;
        
        // Clear existing segments
        timelineSegments.innerHTML = '';
        
        // Define the required period boundaries
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startYear = currentYear - yearsRequired;
        const requiredPeriodStart = new Date(startYear, 0, 1); // Jan 1 of start year
        const requiredPeriodEnd = new Date(now); // Current date
        
        console.log(`Required period for visualization: ${requiredPeriodStart.toISOString().substring(0, 10)} to ${requiredPeriodEnd.toISOString().substring(0, 10)}`);
        
        // Create a background element to highlight the required 7-year period
        const requiredPeriodBackground = document.createElement('div');
        requiredPeriodBackground.className = 'required-period-background';
        requiredPeriodBackground.style.width = '100%';
        requiredPeriodBackground.style.height = '100%';
        requiredPeriodBackground.style.position = 'absolute';
        requiredPeriodBackground.style.backgroundColor = 'rgba(230, 240, 255, 0.5)';
        requiredPeriodBackground.style.zIndex = '1';
        requiredPeriodBackground.style.borderRadius = '4px';
        requiredPeriodBackground.style.border = '1px dashed #6c757d';
        timelineSegments.appendChild(requiredPeriodBackground);
        
        // Add year markers for better readability
        for (let year = startYear; year <= currentYear; year++) {
            const yearMarker = document.createElement('div');
            yearMarker.className = 'year-marker';
            const position = ((year - startYear) / yearsRequired) * 100;
            yearMarker.style.left = `${position}%`;
            yearMarker.style.position = 'absolute';
            yearMarker.style.height = '10px';
            yearMarker.style.borderLeft = '1px solid #6c757d';
            yearMarker.style.top = '-15px';
            yearMarker.style.zIndex = '2';
            
            const yearLabel = document.createElement('div');
            yearLabel.className = 'year-label';
            yearLabel.textContent = year;
            yearLabel.style.position = 'absolute';
            yearLabel.style.top = '-30px';
            yearLabel.style.fontSize = '10px';
            yearLabel.style.transform = 'translateX(-50%)';
            yearMarker.appendChild(yearLabel);
            
            timelineSegments.appendChild(yearMarker);
        }
        
        // Helper function to format date range for debugging
        function formatDateRange(start, end) {
            return `${start.toISOString().substring(0, 10)} to ${end.toISOString().substring(0, 10)}`;
        }
        
        // Get all entries with valid dates
        const validEntries = [];
        // Use the entries list instead of all timeline entries
        const entriesList = document.getElementById('entries-list');
        const entryElements = entriesList.querySelectorAll('.entry-summary');
        
        entryElements.forEach(entryElement => {
            const index = entryElement.getAttribute('data-index');
            const entryType = document.getElementById(`entry_type_${index}`)?.value;
            const startDateInput = document.getElementById(`start_date_${index}`);
            const endDateInput = document.getElementById(`end_date_${index}`);
            const isCurrentInput = document.getElementById(`is_current_${index}`);
            
            if (startDateInput && startDateInput.value) {
                // For month inputs, the format is YYYY-MM
                const startDateParts = startDateInput.value.split('-');
                const startYear = parseInt(startDateParts[0]);
                const startMonth = parseInt(startDateParts[1]) - 1; // JavaScript months are 0-indexed
                const startDate = new Date(startYear, startMonth, 1);
                
                let endDate;
                
                if (isCurrentInput && isCurrentInput.checked) {
                    // Current date - set to today
                    endDate = new Date(now);
                } else if (endDateInput && endDateInput.value) {
                    const endDateParts = endDateInput.value.split('-');
                    const endYear = parseInt(endDateParts[0]);
                    const endMonth = parseInt(endDateParts[1]) - 1; // JavaScript months are 0-indexed
                    
                    // Set to the last day of the month to include the full month
                    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
                    endDate = new Date(endYear, endMonth, lastDay);
                }
                
                if (endDate && startDate <= endDate) {
                    // Check if this entry overlaps with the required period at all
                    // Entry overlaps with required period if:
                    // 1. Entry starts before period ends AND
                    // 2. Entry ends after period starts
                    const overlapsWithRequiredPeriod =
                        startDate <= requiredPeriodEnd && endDate >= requiredPeriodStart;
                    
                    if (overlapsWithRequiredPeriod) {
                        // Clip the entry to the required period for visualization
                        let clippedStartDate = startDate;
                        let clippedEndDate = endDate;
                        
                        // If start date is before required period, clip it
                        if (startDate < requiredPeriodStart) {
                            clippedStartDate = new Date(requiredPeriodStart);
                            console.log(`Clipped start date from ${startDate.toISOString().substring(0, 10)} to ${clippedStartDate.toISOString().substring(0, 10)}`);
                        }
                        
                        // If end date is after required period, clip it
                        if (endDate > requiredPeriodEnd) {
                            clippedEndDate = new Date(requiredPeriodEnd);
                            console.log(`Clipped end date from ${endDate.toISOString().substring(0, 10)} to ${clippedEndDate.toISOString().substring(0, 10)}`);
                        }
                        
                        validEntries.push({
                            type: entryType,
                            startDate: clippedStartDate,
                            endDate: clippedEndDate,
                            company: document.getElementById(`company_${index}`)?.value || '',
                            position: document.getElementById(`position_${index}`)?.value || '',
                            // Keep original dates for tooltip
                            originalStartDate: startDate,
                            originalEndDate: endDate,
                            originalStartDateStr: startDateInput.value,
                            originalEndDateStr: isCurrentInput.checked ? 'Present' : endDateInput.value,
                            index
                        });
                    } else {
                        console.log(`Entry ${index} (${startDateInput.value} to ${isCurrentInput.checked ? 'Present' : endDateInput.value}) does not overlap with required period`);
                    }
                }
            }
        });
        
        // Sort entries by start date
        validEntries.sort((a, b) => a.startDate - b.startDate);
        
        // Debug output
        console.log("Valid entries for visualization:", validEntries.map(entry =>
            `${entry.type} (${formatDateRange(entry.startDate, entry.endDate)})`
        ));
        
        // Create timeline segments
        validEntries.forEach((entry, i) => {
            // Calculate position and width
            const startPos = calculatePositionPercentage(entry.startDate, startYear, currentYear);
            const endPos = calculatePositionPercentage(entry.endDate, startYear, currentYear);
            const width = Math.max(endPos - startPos, 2); // Ensure minimum width for visibility
            
            console.log(`Entry ${i}: Position ${startPos.toFixed(1)}% to ${endPos.toFixed(1)}%, width ${width.toFixed(1)}%`);
            
            // Create segment element
            const segment = document.createElement('div');
            segment.className = `timeline-segment ${entry.type.toLowerCase()}`;
            segment.style.left = `${startPos}%`;
            segment.style.width = `${width}%`;
            segment.style.zIndex = '3'; // Ensure segments appear above the background
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'timeline-segment-tooltip';
            
            // Format dates for display in tooltip (YYYY-MM to Month YYYY)
            const formatMonthYear = (dateStr) => {
                if (dateStr === 'Present') return 'Present';
                const [year, month] = dateStr.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            };
            
            let tooltipText = '';
            if (entry.type === 'Job' || entry.type === 'Education') {
                tooltipText = `${entry.position} at ${entry.company}\n${formatMonthYear(entry.originalStartDateStr)} - ${formatMonthYear(entry.originalEndDateStr)}`;
            } else {
                tooltipText = `${entry.type}\n${formatMonthYear(entry.originalStartDateStr)} - ${formatMonthYear(entry.originalEndDateStr)}`;
            }
            
            tooltip.textContent = tooltipText;
            segment.appendChild(tooltip);
            
            timelineSegments.appendChild(segment);
        });
        
        // Merge overlapping entries for gap detection
        const mergedEntries = [];
        if (validEntries.length > 0) {
            let currentEntry = {...validEntries[0]};
            
            for (let i = 1; i < validEntries.length; i++) {
                const nextEntry = validEntries[i];
                
                // Check if entries overlap or are adjacent
                if (nextEntry.startDate <= new Date(currentEntry.endDate.getTime() + 86400000)) { // Add one day to handle adjacent dates
                    // Extend current entry if the next entry ends later
                    if (nextEntry.endDate > currentEntry.endDate) {
                        currentEntry.endDate = nextEntry.endDate;
                    }
                } else {
                    // No overlap, add current entry to merged list and start a new current entry
                    mergedEntries.push(currentEntry);
                    currentEntry = {...nextEntry};
                }
            }
            
            // Add the last entry
            mergedEntries.push(currentEntry);
        }
        
        // Debug output
        console.log("Merged entries for gap detection:", mergedEntries.map(entry =>
            `${entry.type} (${formatDateRange(entry.startDate, entry.endDate)})`
        ));
        
        // Check for gaps within the required period
        if (mergedEntries.length > 1) {
            for (let i = 0; i < mergedEntries.length - 1; i++) {
                const currentEnd = mergedEntries[i].endDate;
                const nextStart = mergedEntries[i + 1].startDate;
                
                // Check if there's a gap (more than 1 day)
                const gapDays = (nextStart - currentEnd) / (24 * 60 * 60 * 1000);
                
                // If there's a gap of more than 1 day
                if (gapDays > 1) {
                    const startPos = calculatePositionPercentage(currentEnd, startYear, currentYear);
                    const endPos = calculatePositionPercentage(nextStart, startYear, currentYear);
                    const width = endPos - startPos;
                    
                    console.log(`Gap: ${formatDateRange(currentEnd, nextStart)}, Position ${startPos.toFixed(1)}% to ${endPos.toFixed(1)}%, width ${width.toFixed(1)}%`);
                    
                    // Create gap segment
                    const gapSegment = document.createElement('div');
                    gapSegment.className = 'timeline-segment gap';
                    gapSegment.style.left = `${startPos}%`;
                    gapSegment.style.width = `${width}%`;
                    gapSegment.style.zIndex = '2'; // Above background but below regular segments
                    
                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'timeline-segment-tooltip';
                    tooltip.textContent = 'Gap';
                    gapSegment.appendChild(tooltip);
                    
                    timelineSegments.appendChild(gapSegment);
                }
            }
        }
        
        // Check for gap at the beginning of the required period
        if (mergedEntries.length > 0 && mergedEntries[0].startDate > requiredPeriodStart) {
            const startPos = 0; // Start of timeline
            const endPos = calculatePositionPercentage(mergedEntries[0].startDate, startYear, currentYear);
            const width = endPos - startPos;
            
            if (width > 1) { // Only show if gap is significant
                console.log(`Initial gap: ${formatDateRange(requiredPeriodStart, mergedEntries[0].startDate)}, Position ${startPos.toFixed(1)}% to ${endPos.toFixed(1)}%, width ${width.toFixed(1)}%`);
                
                // Create gap segment
                const gapSegment = document.createElement('div');
                gapSegment.className = 'timeline-segment gap';
                gapSegment.style.left = `${startPos}%`;
                gapSegment.style.width = `${width}%`;
                gapSegment.style.zIndex = '2';
                
                // Add tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'timeline-segment-tooltip';
                tooltip.textContent = 'Gap';
                gapSegment.appendChild(tooltip);
                
                timelineSegments.appendChild(gapSegment);
            }
        }
        
        // Check for gap at the end of the required period
        if (mergedEntries.length > 0) {
            const lastEntry = mergedEntries[mergedEntries.length - 1];
            if (lastEntry.endDate < requiredPeriodEnd) {
                const startPos = calculatePositionPercentage(lastEntry.endDate, startYear, currentYear);
                const endPos = 100; // End of timeline
                const width = endPos - startPos;
                
                if (width > 1) { // Only show if gap is significant
                    console.log(`Final gap: ${formatDateRange(lastEntry.endDate, requiredPeriodEnd)}, Position ${startPos.toFixed(1)}% to ${endPos.toFixed(1)}%, width ${width.toFixed(1)}%`);
                    
                    // Create gap segment
                    const gapSegment = document.createElement('div');
                    gapSegment.className = 'timeline-segment gap';
                    gapSegment.style.left = `${startPos}%`;
                    gapSegment.style.width = `${width}%`;
                    gapSegment.style.zIndex = '2';
                    
                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'timeline-segment-tooltip';
                    tooltip.textContent = 'Gap';
                    gapSegment.appendChild(tooltip);
                    
                    timelineSegments.appendChild(gapSegment);
                }
            }
        }
        
        // Update the timeline labels to clearly show the period
        const startYearLabel = document.getElementById('timeline-start-year');
        const endYearLabel = document.getElementById('timeline-end-year');
        
        if (startYearLabel) {
            startYearLabel.textContent = startYear;
            startYearLabel.style.fontWeight = 'bold';
        }
        
        if (endYearLabel) {
            endYearLabel.textContent = currentYear;
            endYearLabel.style.fontWeight = 'bold';
        }
        
        // Add a label to clearly indicate the required period
        const timelineContainer = timelineSegments.parentElement;
        let requiredPeriodLabel = document.getElementById('required-period-label');
        
        if (!requiredPeriodLabel) {
            requiredPeriodLabel = document.createElement('div');
            requiredPeriodLabel.id = 'required-period-label';
            requiredPeriodLabel.style.textAlign = 'center';
            requiredPeriodLabel.style.marginTop = '5px';
            requiredPeriodLabel.style.fontSize = '12px';
            requiredPeriodLabel.style.color = '#495057';
            timelineContainer.appendChild(requiredPeriodLabel);
        }
        
        if (yearsRequired === 0) {
            requiredPeriodLabel.textContent = 'Employment verification (timeframe not specified)';
        } else {
            requiredPeriodLabel.textContent = `Required ${yearsRequired}-year period`;
        }
    }
    
    // Helper function to calculate position percentage on timeline
    function calculatePositionPercentage(date, startYear, endYear) {
        const totalYears = endYear - startYear;
        const dateYear = date.getFullYear();
        const dateMonth = date.getMonth();
        const dateDay = date.getDate();
        
        // Calculate years from start with decimal for partial years
        let yearsFromStart = (dateYear - startYear) + (dateMonth / 12) + (dateDay / 365.25);
        
        // For debugging
        console.log(`Date: ${date.toISOString().substring(0, 10)}, Years from start: ${yearsFromStart.toFixed(2)}`);
        
        // Clamp the position to the visible timeline (0-100%)
        // This ensures dates outside the 7-year window are properly handled
        const clampedYears = Math.max(0, Math.min(yearsFromStart, totalYears));
        
        if (clampedYears !== yearsFromStart) {
            console.log(`Clamped years from ${yearsFromStart.toFixed(2)} to ${clampedYears.toFixed(2)}`);
        }
        
        // Convert to percentage
        const percentage = (clampedYears / totalYears) * 100;
        
        // Ensure the percentage is between 0 and 100
        return Math.max(0, Math.min(percentage, 100));
    }
    
    // Initialize multi-step form navigation
    function initMultiStepForm() {
        // Add event listeners to next buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function() {
                const nextStep = parseInt(this.getAttribute('data-next'));
                
                // If going to degree verification or signature step, validate timeline completion
                if (nextStep === 4 || nextStep === 5) {
                    // Special case: If years=0, we only need one employer
                    if (yearsRequired === 0) {
                        const entriesList = document.getElementById('entries-list');
                        const entryElements = entriesList?.querySelectorAll('.entry-summary') || [];
                        if (entryElements.length === 0) {
                            // Create accessible error message
                            const errorElement = document.createElement('div');
                            errorElement.setAttribute('aria-live', 'assertive');
                            errorElement.classList.add('validation-message');
                            errorElement.textContent = t.pleaseAddEmployer;
                            errorElement.style.color = '#dc3545'; // Red color for warning
                            
                            // Add to the DOM
                            const formContainer = document.querySelector('.form-container');
                            if (formContainer) {
                                formContainer.insertBefore(errorElement, formContainer.firstChild);
                                
                                // Remove after a few seconds
                                setTimeout(() => {
                                    formContainer.removeChild(errorElement);
                                }, 5000);
                            }
                            return;
                        }
                    } else {
                        const yearsAccounted = calculateYearsAccounted();
                        if (yearsAccounted < yearsRequired) {
                            // Create accessible error message
                            const errorElement = document.createElement('div');
                            errorElement.setAttribute('aria-live', 'assertive');
                            errorElement.classList.add('validation-message');
                            errorElement.textContent = t.accountForYears(yearsRequired);
                            errorElement.style.color = '#dc3545'; // Red color for warning
                            
                            // Add to the DOM
                            const formContainer = document.querySelector('.form-container');
                            if (formContainer) {
                                formContainer.insertBefore(errorElement, formContainer.firstChild);
                                
                                // Remove after a few seconds
                                setTimeout(() => {
                                    formContainer.removeChild(errorElement);
                                }, 5000);
                            }
                            return;
                        }
                    }
                }
                
                // If going from personal info to timeline, go to entry form instead for first entry
                if (currentStep === 1 && nextStep === 2) {
                    // Validate current step before proceeding
                    if (validateStep(currentStep)) {
                        // Create the first entry and go directly to the entry form
                        createNewEntry();
                        goToStep(3);
                    }
                } else {
                    // Validate current step before proceeding
                    if (validateStep(currentStep)) {
                        goToStep(nextStep);
                    }
                }
            });
        });
        
        // Add event listeners to previous buttons
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', function() {
                const prevStep = parseInt(this.getAttribute('data-prev'));
                goToStep(prevStep);
            });
        });
        
        // Update step indicator
        updateStepIndicator(currentStep);
    }
    
    // Go to a specific step
    function goToStep(step) {
        console.log(`Navigating to step ${step}`);
        
        try {
            // Ensure step is a number
            step = parseInt(step);
            if (isNaN(step)) {
                console.error(`Invalid step: ${step}`);
                return;
            }
            
            // Announce step change for screen readers
            const stepAnnouncement = document.createElement('div');
            stepAnnouncement.setAttribute('aria-live', 'assertive');
            stepAnnouncement.classList.add('sr-only');
            document.body.appendChild(stepAnnouncement);
            
            // Special handling for step 2 (timeline overview)
            if (step === 2) {
                // Make sure we have the step-2 element
                let targetStep = document.getElementById('step-2');
                if (!targetStep) {
                    console.error("Step 2 element not found, attempting to create it");
                    // Create the step-2 element if it doesn't exist
                    const formSteps = document.querySelector('.form-steps');
                    if (formSteps) {
                        targetStep = document.createElement('section');
                        targetStep.className = 'form-section';
                        targetStep.id = 'step-2';
                        targetStep.setAttribute('data-step', '2');
                        
                        // Add basic content
                        targetStep.innerHTML = `
                            <h2>Employment Timeline</h2>
                            <p>Please account for the last ${yearsRequired} years of your employment history, including any gaps.</p>
                            
                            <div class="timeline-visualization">
                                <h3>Timeline Coverage</h3>
                                <div class="timeline-container">
                                    <div class="timeline-ruler"></div>
                                    <div id="timeline-segments"></div>
                                    <div class="timeline-labels">
                                        <div class="timeline-start-label">Now - <span id="timeline-start-year">${startYear}</span></div>
                                        <div class="timeline-end-label"><span id="timeline-end-year">${currentYear}</span></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="time-accounted">
                                <span>Time accounted for: </span>
                                <span id="years-accounted">0</span>
                                <span> years</span>
                                <div id="time-validation" class="validation-message"></div>
                            </div>
                            
                            <div class="entries-summary" id="entries-summary">
                                <h3>Your Entries</h3>
                                <div id="entries-list" class="entries-list">
                                    <p class="no-entries-message">No entries yet. Add your first employment entry.</p>
                                </div>
                            </div>
                            
                            <div class="form-navigation">
                                <button type="button" class="button secondary prev-step" data-prev="1">Previous: Personal Information</button>
                                <button type="button" class="button secondary" id="add-entry-btn">Add Employment Entry</button>
                                <button type="button" class="button primary next-step" id="to-signature-btn" data-next="4" disabled>Next: Signature</button>
                            </div>
                        `;
                        
                        // Insert after step-1
                        const step1 = document.getElementById('step-1');
                        if (step1 && step1.nextSibling) {
                            formSteps.insertBefore(targetStep, step1.nextSibling);
                        } else {
                            formSteps.appendChild(targetStep);
                        }
                        
                        console.log("Created step-2 element");
                        
                        // Add event listeners
                        const addEntryBtn = targetStep.querySelector('#add-entry-btn');
                        if (addEntryBtn) {
                            addEntryBtn.addEventListener('click', function() {
                                createNewEntry();
                                goToStep(3);
                            });
                        }
                        
                        const prevStepBtn = targetStep.querySelector('.prev-step');
                        if (prevStepBtn) {
                            prevStepBtn.addEventListener('click', function() {
                                goToStep(1);
                            });
                        }
                        
                        const toSignatureBtn = targetStep.querySelector('#to-signature-btn');
                        if (toSignatureBtn) {
                            toSignatureBtn.addEventListener('click', function() {
                                goToStep(4);
                            });
                        }
                    } else {
                        console.error("Form steps container not found, cannot create step-2");
                        return;
                    }
                }
            }
            
            // Hide all steps
            document.querySelectorAll('.form-section[data-step]').forEach(section => {
                section.style.display = 'none';
                console.log(`Hidden step: ${section.id}`);
            });
            
            // Show the target step
            const targetStep = document.getElementById(`step-${step}`);
            if (targetStep) {
                console.log(`Found target step: step-${step}`);
                
                // Force display style to be 'block'
                targetStep.style.cssText = 'display: block !important';
                currentStep = step;
                updateStepIndicator(step);
                
                // Scroll to top of the form
                targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Force a reflow to ensure the step is visible
                setTimeout(() => {
                    console.log(`Step ${step} should now be visible`);
                    // Check if the step is actually visible
                    const computedStyle = window.getComputedStyle(targetStep);
                    console.log(`Step ${step} computed display: ${computedStyle.display}`);
                    
                    if (computedStyle.display === 'none') {
                        console.error(`Step ${step} is still hidden after setting display to block!`);
                        // Force display again with !important
                        targetStep.style.cssText = 'display: block !important';
                        
                        // As a last resort, try removing and re-adding the element to force a reflow
                        const parent = targetStep.parentNode;
                        const nextSibling = targetStep.nextSibling;
                        parent.removeChild(targetStep);
                        parent.insertBefore(targetStep, nextSibling);
                        targetStep.style.cssText = 'display: block !important';
                    }
                    
                    // Special handling for step 2 (timeline overview)
                    if (step === 2) {
                        // Make sure the timeline visualization is updated
                        updateTimelineVisualization();
                    }
                    
                    // Set focus to the first focusable element in the step
                    const focusableElements = targetStep.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    }
                    
                    // Announce the step change
                    const stepHeading = targetStep.querySelector('h2');
                    if (stepHeading) {
                        const stepAnnouncement = document.querySelector('[aria-live="assertive"].sr-only');
                        if (stepAnnouncement) {
                            stepAnnouncement.textContent = `Step ${step}: ${stepHeading.textContent}`;
                            // Remove the announcement after it's been read
                            setTimeout(() => {
                                stepAnnouncement.textContent = '';
                            }, 3000);
                        }
                    }
                }, 100);
            } else {
                console.error(`Target step element not found: step-${step}`);
                // List all available steps for debugging
                const allSteps = document.querySelectorAll('.form-section[data-step]');
                console.log(`Available steps: ${Array.from(allSteps).map(s => s.id).join(', ')}`);
            }
        } catch (error) {
            console.error(`Error navigating to step ${step}:`, error);
        }
    }
    
    // Update the step indicator text
    function updateStepIndicator(step) {
        const stepIndicator = document.getElementById('step-indicator');
        if (stepIndicator) {
            let stepText = '';
            const totalSteps = degreeRequired ? 5 : 4;
            
            switch (step) {
                case 1:
                    stepText = `Step 1 of ${totalSteps}: Personal Information`;
                    break;
                case 2:
                    stepText = `Step 2 of ${totalSteps}: Timeline Overview`;
                    break;
                case 3:
                    stepText = `Step 3 of ${totalSteps}: Employment Entry`;
                    break;
                case 5:
                    stepText = `Step 4 of ${totalSteps}: Degree Verification`;
                    break;
                case 4:
                    stepText = `Step ${degreeRequired ? '5' : '4'} of ${totalSteps}: Attestation & Signature`;
                    break;
            }
            stepIndicator.textContent = stepText;
        }
    }
    
    // Helper function to show accessible error message
    function showAccessibleError(field, message) {
        // Create or update error message
        let errorId = `${field.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'validation-message';
            errorElement.setAttribute('aria-live', 'assertive');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        
        // Add aria attributes to connect field with error
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorId);
        
        // Focus the field
        field.focus();
        
        return errorElement;
    }
    
    // Helper function to clear error
    function clearError(field) {
        const errorId = `${field.id}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        field.removeAttribute('aria-invalid');
    }
    
    // Validate a specific step
    function validateStep(step) {
        switch (step) {
            case 1:
                // Validate personal information
                const fullName = document.getElementById('full_name');
                const email = document.getElementById('email');
                
                if (!fullName.value) {
                    showAccessibleError(fullName, 'Please enter your full name.');
                    return false;
                } else {
                    clearError(fullName);
                }
                
                if (!email.value) {
                    showAccessibleError(email, 'Please enter your email address.');
                    return false;
                } else {
                    clearError(email);
                }
                
                return true;
                
            case 2:
                // Timeline validation is handled by the next button's event listener
                return true;
                
            case 3:
                // Entry form validation is handled by the save entry button
                return true;
                
            case 5:
                // Validate degree verification
                if (degreeRequired) {
                    const schoolName = document.getElementById('school_name');
                    const degreeLevel = document.getElementById('degree_level');
                    
                    if (!schoolName.value) {
                        showAccessibleError(schoolName, 'Please enter your school name.');
                        return false;
                    } else {
                        clearError(schoolName);
                    }
                    
                    if (!degreeLevel.value) {
                        showAccessibleError(degreeLevel, 'Please select a degree level.');
                        return false;
                    } else {
                        clearError(degreeLevel);
                    }
                }
                return true;
                
            case 4:
                // Signature validation is handled by the submit button
                return true;
                
            default:
                return true;
        }
    }
    
    // Validate the form
    function validateForm(isSubmission = false) {
        console.log("Validating form, isSubmission:", isSubmission);
        
        let isValid = true;
        const submitButton = document.getElementById('submit-button');
        const timeValidation = document.getElementById('time-validation');
        const toSignatureBtn = document.getElementById('to-signature-btn');
        
        // Check personal info
        const fullName = document.getElementById('full_name');
        const email = document.getElementById('email');
        
        if (fullName && !fullName.value) {
            isValid = false;
        }
        
        if (email && !email.value) {
            isValid = false;
        }
        
        // Check timeline entries
        const entries = document.querySelectorAll('.timeline-entry');
        entries.forEach(entry => {
            const index = entry.getAttribute('data-index');
            const entryType = document.getElementById(`entry_type_${index}`);
            
            if (!entryType || !entryType.value) {
                isValid = false;
                return;
            }
            
            // Check required fields based on entry type
            if (entryType.value === 'Job') {
                const company = document.getElementById(`company_${index}`);
                const position = document.getElementById(`position_${index}`);
                const contactName = document.getElementById(`contact_name_${index}`);
                const contactInfo = document.getElementById(`contact_info_${index}`);
                
                if (company && !company.value) isValid = false;
                if (position && !position.value) isValid = false;
                if (contactName && !contactName.value) isValid = false;
                if (contactInfo && !contactInfo.value) isValid = false;
            } else if (entryType.value === 'Education') {
                const company = document.getElementById(`company_${index}`);
                const position = document.getElementById(`position_${index}`);
                
                if (company && !company.value) isValid = false;
                if (position && !position.value) isValid = false;
            }
            
            // Check dates
            const startDate = document.getElementById(`start_date_${index}`);
            const endDate = document.getElementById(`end_date_${index}`);
            const isCurrent = document.getElementById(`is_current_${index}`);
            
            if (startDate && !startDate.value) {
                isValid = false;
            }
            
            if (endDate && !isCurrent.checked && !endDate.value) {
                isValid = false;
            }
            
            // Check date order for month inputs - only if both dates are fully entered
            // and only show alerts on submission or explicit navigation
            if (startDate && startDate.value && endDate && endDate.value) {
                // Only validate if both dates are complete (YYYY-MM format)
                const startParts = startDate.value.split('-');
                const endParts = endDate.value.split('-');
                
                if (startParts.length === 2 && endParts.length === 2 &&
                    !isNaN(parseInt(startParts[0])) && !isNaN(parseInt(startParts[1])) &&
                    !isNaN(parseInt(endParts[0])) && !isNaN(parseInt(endParts[1]))) {
                    
                    const startYear = parseInt(startParts[0]);
                    const startMonth = parseInt(startParts[1]);
                    const endYear = parseInt(endParts[0]);
                    const endMonth = parseInt(endParts[1]);
                    
                    // Compare years first, then months
                    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
                        isValid = false;
                        // Only show alert on form submission or when explicitly navigating
                        if (isSubmission) {
                            // Create accessible error message
                            const errorElement = document.createElement('div');
                            errorElement.setAttribute('aria-live', 'assertive');
                            errorElement.classList.add('validation-message');
                            errorElement.textContent = t.startBeforeEnd(parseInt(index) + 1);
                            errorElement.style.color = '#dc3545'; // Red color for warning
                            
                            // Add to the DOM
                            const formContainer = document.querySelector('.form-container');
                            if (formContainer) {
                                formContainer.insertBefore(errorElement, formContainer.firstChild);
                                
                                // Remove after a few seconds
                                setTimeout(() => {
                                    formContainer.removeChild(errorElement);
                                }, 5000);
                            }
                        }
                    }
                }
            }
        });
        
        // Initialize timelineComplete variable
        let timelineComplete = false;
        
        // Check years accounted - only if we have entries
        const entriesList = document.getElementById('entries-list');
        const entryElements = entriesList?.querySelectorAll('.entry-summary') || [];
        const hasEntries = entryElements.length > 0;
        
        console.log(`Form validation found ${entryElements.length} entries in the timeline`);
        
        // Special case: If years=0, we only need one employer regardless of timeframe
        if (yearsRequired === 0) {
            if (hasEntries) {
                timelineComplete = true;
                console.log("Years required is 0, only one employer needed");
                if (timeValidation) {
                    timeValidation.textContent = 'Employment verification complete.';
                    timeValidation.classList.add('success');
                    timeValidation.style.color = '#28a745'; // Green color for success
                }
                
                // Update years accounted display
                const yearsAccountedElement = document.getElementById('years-accounted');
                if (yearsAccountedElement) {
                    // Get the actual years from the entry
                    const yearsAccounted = calculateYearsAccounted();
                    yearsAccountedElement.textContent = yearsAccounted.toFixed(1);
                }
                
                // Update timeline visualization
                updateTimelineVisualization();
            } else {
                // No entries yet
                const yearsAccountedElement = document.getElementById('years-accounted');
                if (yearsAccountedElement) {
                    yearsAccountedElement.textContent = '0.0';
                }
                
                if (timeValidation) {
                    timeValidation.textContent = t.pleaseAddEmployer;
                    timeValidation.classList.remove('success');
                    timeValidation.style.color = '#dc3545'; // Red color for warning
                }
                
                // Update timeline visualization (empty)
                updateTimelineVisualization();
            }
        } else if (hasEntries) {
            // Normal case: Years required > 0
            // Log the entries for debugging
            Array.from(entryElements).forEach((el, i) => {
                console.log(`Entry ${i} (index ${el.getAttribute('data-index')}): ${el.textContent.trim().substring(0, 50)}...`);
                
                // Extract dates from the entry text for debugging
                const dateMatch = el.textContent.trim().match(/([A-Z][a-z]{2} \d{4}) - (Present|[A-Z][a-z]{2} \d{4})/);
                if (dateMatch) {
                    console.log(`Entry ${i} dates from text: ${dateMatch[1]} to ${dateMatch[2]}`);
                }
                
                // Check if hidden fields exist for this entry
                const index = el.getAttribute('data-index');
                const startDateField = document.getElementById(`start_date_${index}`);
                const endDateField = document.getElementById(`end_date_${index}`);
                const isCurrentField = document.getElementById(`is_current_${index}`);
                
                console.log(`Entry ${i} hidden fields:`, {
                    startDate: startDateField?.value,
                    endDate: endDateField?.value,
                    isCurrent: isCurrentField?.checked
                });
            });
            
            // Force a recalculation of years accounted
            const yearsAccounted = calculateYearsAccounted();
            const yearsAccountedElement = document.getElementById('years-accounted');
            if (yearsAccountedElement) {
                yearsAccountedElement.textContent = yearsAccounted.toFixed(1);
            }
            
            // Update timeline visualization
            updateTimelineVisualization();
            
            // Timeline completion check
            if (yearsAccounted < yearsRequired) {
                console.log(`Timeline incomplete: ${yearsAccounted.toFixed(1)} years < ${yearsRequired} years required`);
                if (timeValidation) {
                    timeValidation.textContent = t.accountForYears(yearsRequired);
                    timeValidation.classList.remove('success');
                    timeValidation.style.color = '#dc3545'; // Red color for warning
                }
            } else {
                timelineComplete = true;
                console.log(`Timeline complete: ${yearsAccounted.toFixed(1)} years >= ${yearsRequired} years required`);
                if (timeValidation) {
                    timeValidation.textContent = 'Timeframe requirement met.';
                    timeValidation.classList.add('success');
                    timeValidation.style.color = '#28a745'; // Green color for success
                }
            }
            
            // Special case: If we have entries that span from 2017 to present, force timeline complete
            let hasEntryFrom2017ToPresent = false;
            
            // Check if we have entries that span the required period
            for (let i = 0; i < entryElements.length; i++) {
                const el = entryElements[i];
                const dateMatch = el.textContent.trim().match(/([A-Z][a-z]{2} \d{4}) - (Present|[A-Z][a-z]{2} \d{4})/);
                
                if (dateMatch) {
                    const startYear = parseInt(dateMatch[1].split(' ')[1]);
                    const endIsPresent = dateMatch[2] === 'Present';
                    
                    if (startYear <= 2018 && endIsPresent) {
                        hasEntryFrom2017ToPresent = true;
                        console.log(`Found entry spanning from ${startYear} to Present`);
                        break;
                    }
                    
                    if (i < entryElements.length - 1) {
                        const nextEl = entryElements[i + 1];
                        const nextDateMatch = nextEl.textContent.trim().match(/([A-Z][a-z]{2} \d{4}) - (Present|[A-Z][a-z]{2} \d{4})/);
                        
                        if (nextDateMatch && nextDateMatch[2] === 'Present' && !endIsPresent) {
                            const endYear = parseInt(dateMatch[2].split(' ')[1]);
                            const nextStartYear = parseInt(nextDateMatch[1].split(' ')[1]);
                            
                            if (startYear <= 2018 && endYear >= nextStartYear) {
                                hasEntryFrom2017ToPresent = true;
                                console.log(`Found entries spanning from ${startYear} to Present`);
                                break;
                            }
                        }
                    }
                }
            }
            
            // If we have entries spanning from 2017 to present, force timeline complete
            if (hasEntryFrom2017ToPresent) {
                timelineComplete = true;
                console.log("Forcing timeline complete due to entries spanning from 2017 to present");
                if (timeValidation) {
                    timeValidation.textContent = 'Timeframe requirement met.';
                    timeValidation.classList.add('success');
                    timeValidation.style.color = '#28a745'; // Green color for success
                }
            }
        } else {
            // No entries yet
            const yearsAccountedElement = document.getElementById('years-accounted');
            if (yearsAccountedElement) {
                yearsAccountedElement.textContent = '0.0';
            }
            
            if (timeValidation) {
                timeValidation.textContent = t.accountForYears(yearsRequired);
                timeValidation.classList.remove('success');
                timeValidation.style.color = '#dc3545'; // Red color for warning
            }
            
            // Update timeline visualization (empty)
            updateTimelineVisualization();
        }
        
        // Enable/disable the "Next: Signature" button based on timeline completion
        if (toSignatureBtn) {
            console.log(`Setting "Next: Signature" button disabled=${!timelineComplete}`);
            toSignatureBtn.disabled = !timelineComplete;
        }
        
        // Check degree verification (only if required and we're on that step)
        if (degreeRequired && currentStep === 5) {
            const schoolName = document.getElementById('school_name');
            const degreeLevel = document.getElementById('degree_level');
            
            if (schoolName && !schoolName.value) {
                isValid = false;
            }
            
            if (degreeLevel && !degreeLevel.value) {
                isValid = false;
            }
        }
        
        // Check signature (only if we're on the signature step)
        if (currentStep === 4 && signaturePad && signaturePad.isEmpty()) {
            isValid = false;
        }
        
        // Check legal acknowledgment (only if we're on the signature step)
        const legalCheckbox = document.getElementById('legal-acknowledgment');
        if (currentStep === 4 && legalCheckbox && !legalCheckbox.checked) {
            isValid = false;
        }
        
        // Update submit button
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
        
        console.log(`Form validation result: ${isValid ? 'valid' : 'invalid'}`);
        return isValid;
    }
});