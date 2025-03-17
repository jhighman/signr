document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let entryCount = 0;
    let signaturePad;
    let currentStep = 1;
    const yearsRequired = parseFloat(document.querySelector('input[name="years"]').value) || 7;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsRequired;
    
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
        
        // Clear signature button
        document.getElementById('clear-signature').addEventListener('click', function() {
            signaturePad.clear();
            validateForm();
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
            saveEntryBtn.addEventListener('click', function() {
                // saveCurrentEntry now handles the navigation based on entry index
                saveCurrentEntry();
            });
        }
    }
    
    // Create a new timeline entry
    function createNewEntry() {
        const template = document.getElementById('timeline-entry-template').innerHTML;
        const currentEntryContainer = document.getElementById('current-entry-container');
        
        // Clear any existing content
        currentEntryContainer.innerHTML = '';
        
        // Replace placeholders in template
        let entryHtml = template
            .replace(/{index}/g, entryCount)
            .replace(/{index_plus_one}/g, entryCount + 1);
        
        // Create temporary container to hold the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = entryHtml;
        
        // Append the entry to the container
        currentEntryContainer.appendChild(tempDiv.firstElementChild);
        
        // Get the current entry elements
        const isCurrentCheckbox = document.getElementById(`is_current_${entryCount}`);
        const currentEmploymentCheckbox = document.querySelector(`.current-employment-checkbox`);
        const endDateGroup = document.querySelector(`.end-date-group`);
        const endDateInput = document.getElementById(`end_date_${entryCount}`);
        const startDateInput = document.getElementById(`start_date_${entryCount}`);
        
        // For the first entry (current employment)
        if (entryCount === 0) {
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
            }
            
            // Set start date to current month/year
            if (startDateInput) {
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                startDateInput.value = `${year}-${month}`;
            }
        }
        // For subsequent entries
        else {
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
                    
                    // Set this entry's end date to one month before the previous entry's start date
                    const prevStartDateParts = previousStartDate.split('-');
                    const prevStartYear = parseInt(prevStartDateParts[0]);
                    const prevStartMonth = parseInt(prevStartDateParts[1]);
                    
                    // Calculate one month before for end date
                    let endMonth = prevStartMonth - 1;
                    let endYear = prevStartYear;
                    if (endMonth < 1) {
                        endMonth = 12;
                        endYear--;
                    }
                    
                    // Format as YYYY-MM
                    const endDateStr = `${endYear}-${endMonth.toString().padStart(2, '0')}`;
                    
                    // Set the end date for the new entry
                    if (endDateInput) {
                        endDateInput.value = endDateStr;
                    }
                    
                    // Set start date to one month before the end date
                    let newStartMonth = endMonth - 1;
                    let newStartYear = endYear;
                    if (newStartMonth < 1) {
                        newStartMonth = 12;
                        newStartYear--;
                    }
                    
                    // Format as YYYY-MM
                    const startDateStr = `${newStartYear}-${newStartMonth.toString().padStart(2, '0')}`;
                    
                    // Set the start date
                    if (startDateInput) {
                        startDateInput.value = startDateStr;
                    }
                }
            }
        }
        
        // Add event listeners to the new entry
        setupEntryEventListeners(entryCount);
        
        // Focus on the first field
        const firstField = currentEntryContainer.querySelector('select, input, textarea');
        if (firstField) {
            firstField.focus();
        }
    }
    
    // Save the current entry and handle navigation
    function saveCurrentEntry() {
        const currentEntryContainer = document.getElementById('current-entry-container');
        const entry = currentEntryContainer.querySelector('.timeline-entry');
        
        if (!entry) return false;
        
        const index = entry.getAttribute('data-index');
        
        // Validate the entry
        if (!validateEntry(entry)) {
            alert('Please fill in all required fields before saving.');
            return false;
        }
        
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
        
        // Add to entries list or update existing
        updateEntriesList(entryData);
        
        // Increment entry count for new entries
        if (parseInt(index) === entryCount - 1) {
            entryCount++;
        }
        
        // Validate form and update timeline
        validateForm();
        
        // If this is the first entry (index 0), go to timeline overview
        if (parseInt(index) === 0) {
            // Go to timeline overview (step 2)
            goToStep(2);
        } else {
            // For subsequent entries, create a new entry and stay on entry form
            createNewEntry();
        }
        
        return true;
    }
    
    // Update the entries list in the timeline overview
    function updateEntriesList(entryData) {
        const entriesList = document.getElementById('entries-list');
        if (!entriesList) return;
        
        // Remove "no entries" message if present
        const noEntriesMsg = entriesList.querySelector('.no-entries-message');
        if (noEntriesMsg) {
            noEntriesMsg.remove();
        }
        
        // Check if entry already exists
        let entryElement = entriesList.querySelector(`.entry-summary[data-index="${entryData.index}"]`);
        
        // Format dates for display
        const formatMonthYear = (dateStr) => {
            if (!dateStr) return '';
            const [year, month] = dateStr.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        };
        
        const startDateFormatted = formatMonthYear(entryData.startDate);
        const endDateFormatted = entryData.isCurrent ? 'Present' : formatMonthYear(entryData.endDate);
        
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
            entryElement.innerHTML = entryHTML;
        } else {
            // Create new entry
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
                if (endDateInput) endDateInput.value = '';
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
        if (confirm('Are you sure you want to delete this entry?')) {
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
                    // Create hidden input to preserve the name but clear the value
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = id;
                    hiddenInput.name = field.name;
                    hiddenInput.value = '';
                    
                    // Replace the original field with the hidden input
                    field.parentNode.replaceChild(hiddenInput, field);
                }
            });
            
            // Check if there are no more entries
            if (entriesList.children.length === 0) {
                entriesList.innerHTML = '<p class="no-entries-message">No entries yet. Add your first employment entry.</p>';
            }
            
            // Validate form and update timeline
            validateForm();
        }
    }
    
    // Validate a single entry
    function validateEntry(entry) {
        if (!entry) return false;
        
        const index = entry.getAttribute('data-index');
        const entryType = document.getElementById(`entry_type_${index}`);
        
        if (!entryType || !entryType.value) {
            return false;
        }
        
        // Check required fields based on entry type
        if (entryType.value === 'Job') {
            const company = document.getElementById(`company_${index}`);
            const position = document.getElementById(`position_${index}`);
            const contactName = document.getElementById(`contact_name_${index}`);
            const contactInfo = document.getElementById(`contact_info_${index}`);
            
            if (company && !company.value) return false;
            if (position && !position.value) return false;
            if (contactName && !contactName.value) return false;
            if (contactInfo && !contactInfo.value) return false;
        } else if (entryType.value === 'Education') {
            const company = document.getElementById(`company_${index}`);
            const position = document.getElementById(`position_${index}`);
            
            if (company && !company.value) return false;
            if (position && !position.value) return false;
        }
        
        // Check dates
        const startDate = document.getElementById(`start_date_${index}`);
        const endDate = document.getElementById(`end_date_${index}`);
        const isCurrent = document.getElementById(`is_current_${index}`);
        
        if (startDate && !startDate.value) {
            return false;
        }
        
        if (endDate && !isCurrent.checked && !endDate.value) {
            return false;
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
                
                if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
                    alert('Start month must be before end month');
                    return false;
                }
            }
        }
        
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
                    }
                } else {
                    // Show the end date field when "currently employed" is unchecked
                    if (endDateGroup) {
                        endDateGroup.style.display = 'block';
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
        let totalYears = 0;
        const entries = document.querySelectorAll('.timeline-entry');
        
        entries.forEach(entry => {
            const index = entry.getAttribute('data-index');
            const startDateInput = document.getElementById(`start_date_${index}`);
            const endDateInput = document.getElementById(`end_date_${index}`);
            const isCurrentInput = document.getElementById(`is_current_${index}`);
            
            if (startDateInput && startDateInput.value) {
                // For month inputs, the format is YYYY-MM
                // We'll create dates on the first day of each month
                const startDateParts = startDateInput.value.split('-');
                const startYear = parseInt(startDateParts[0]);
                const startMonth = parseInt(startDateParts[1]) - 1; // JavaScript months are 0-indexed
                const startDate = new Date(startYear, startMonth, 1);
                
                let endDate;
                
                if (isCurrentInput && isCurrentInput.checked) {
                    // Current date - set to the end of the current month
                    const now = new Date();
                    endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (endDateInput && endDateInput.value) {
                    const endDateParts = endDateInput.value.split('-');
                    const endYear = parseInt(endDateParts[0]);
                    const endMonth = parseInt(endDateParts[1]) - 1; // JavaScript months are 0-indexed
                    
                    // Set to the end of the month to include the full month
                    endDate = new Date(endYear, endMonth, 1);
                }
                
                if (endDate && startDate <= endDate) {
                    // Calculate years between dates based on months
                    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                                     (endDate.getMonth() - startDate.getMonth()) + 1; // +1 to include the end month
                    const yearDiff = monthDiff / 12;
                    totalYears += yearDiff;
                }
            }
        });
        
        return totalYears;
    }
    
    // Update timeline visualization
    function updateTimelineVisualization() {
        const timelineSegments = document.getElementById('timeline-segments');
        if (!timelineSegments) return;
        
        // Clear existing segments
        timelineSegments.innerHTML = '';
        
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - yearsRequired;
        const timelineWidth = timelineSegments.parentElement.offsetWidth;
        
        // Get all entries with valid dates
        const validEntries = [];
        const entries = document.querySelectorAll('.timeline-entry');
        
        entries.forEach(entry => {
            const index = entry.getAttribute('data-index');
            const entryType = document.getElementById(`entry_type_${index}`).value;
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
                    // Current date - set to the end of the current month
                    const now = new Date();
                    endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (endDateInput && endDateInput.value) {
                    const endDateParts = endDateInput.value.split('-');
                    const endYear = parseInt(endDateParts[0]);
                    const endMonth = parseInt(endDateParts[1]) - 1; // JavaScript months are 0-indexed
                    
                    // Set to the end of the month to include the full month
                    endDate = new Date(endYear, endMonth, 1);
                }
                
                if (endDate && startDate <= endDate) {
                    validEntries.push({
                        type: entryType,
                        startDate,
                        endDate,
                        company: document.getElementById(`company_${index}`)?.value || '',
                        position: document.getElementById(`position_${index}`)?.value || '',
                        startDateDisplay: startDateInput.value,
                        endDateDisplay: isCurrentInput.checked ? 'Present' : endDateInput.value
                    });
                }
            }
        });
        
        // Sort entries by start date
        validEntries.sort((a, b) => a.startDate - b.startDate);
        
        // Create timeline segments
        validEntries.forEach((entry, i) => {
            // Calculate position and width
            const startPos = calculatePositionPercentage(entry.startDate, startYear, currentYear);
            const endPos = calculatePositionPercentage(entry.endDate, startYear, currentYear);
            const width = endPos - startPos;
            
            // Create segment element
            const segment = document.createElement('div');
            segment.className = `timeline-segment ${entry.type.toLowerCase()}`;
            segment.style.left = `${startPos}%`;
            segment.style.width = `${width}%`;
            
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
                tooltipText = `${entry.position} at ${entry.company}\n${formatMonthYear(entry.startDateDisplay)} - ${formatMonthYear(entry.endDateDisplay)}`;
            } else {
                tooltipText = `${entry.type}\n${formatMonthYear(entry.startDateDisplay)} - ${formatMonthYear(entry.endDateDisplay)}`;
            }
            
            tooltip.textContent = tooltipText;
            segment.appendChild(tooltip);
            
            timelineSegments.appendChild(segment);
        });
        
        // Check for gaps
        if (validEntries.length > 1) {
            for (let i = 0; i < validEntries.length - 1; i++) {
                const currentEnd = validEntries[i].endDate;
                const nextStart = validEntries[i + 1].startDate;
                
                // For month-level granularity, check if there's a gap of more than 1 month
                // Calculate months between the end of one entry and start of the next
                const monthsBetween =
                    (nextStart.getFullYear() - currentEnd.getFullYear()) * 12 +
                    (nextStart.getMonth() - currentEnd.getMonth());
                
                // If there's a gap of more than 1 month
                if (monthsBetween > 1) {
                    const startPos = calculatePositionPercentage(currentEnd, startYear, currentYear);
                    const endPos = calculatePositionPercentage(nextStart, startYear, currentYear);
                    const width = endPos - startPos;
                    
                    // Create gap segment
                    const gapSegment = document.createElement('div');
                    gapSegment.className = 'timeline-segment gap';
                    gapSegment.style.left = `${startPos}%`;
                    gapSegment.style.width = `${width}%`;
                    
                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'timeline-segment-tooltip';
                    tooltip.textContent = 'Gap';
                    gapSegment.appendChild(tooltip);
                    
                    timelineSegments.appendChild(gapSegment);
                }
            }
        }
    }
    
    // Helper function to calculate position percentage on timeline
    function calculatePositionPercentage(date, startYear, endYear) {
        const totalYears = endYear - startYear;
        const dateYear = date.getFullYear();
        const dateMonth = date.getMonth();
        const dateDay = date.getDate();
        
        // Calculate years from start with decimal for partial years
        const yearsFromStart = (dateYear - startYear) + (dateMonth / 12) + (dateDay / 365.25);
        
        // Convert to percentage
        return (yearsFromStart / totalYears) * 100;
    }
    
    // Initialize multi-step form navigation
    function initMultiStepForm() {
        // Add event listeners to next buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function() {
                const nextStep = parseInt(this.getAttribute('data-next'));
                
                // If going to signature step, validate timeline completion
                if (nextStep === 4) {
                    const yearsAccounted = calculateYearsAccounted();
                    if (yearsAccounted < yearsRequired) {
                        alert(`Please account for at least ${yearsRequired} years before proceeding to signature.`);
                        return;
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
        // Hide all steps
        document.querySelectorAll('.form-section[data-step]').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show the target step
        const targetStep = document.getElementById(`step-${step}`);
        if (targetStep) {
            targetStep.style.display = 'block';
            currentStep = step;
            updateStepIndicator(step);
            
            // Scroll to top of the form
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Update the step indicator text
    function updateStepIndicator(step) {
        const stepIndicator = document.getElementById('step-indicator');
        if (stepIndicator) {
            let stepText = '';
            switch (step) {
                case 1:
                    stepText = 'Step 1 of 4: Personal Information';
                    break;
                case 2:
                    stepText = 'Step 2 of 4: Timeline Overview';
                    break;
                case 3:
                    stepText = 'Step 3 of 4: Employment Entry';
                    break;
                case 4:
                    stepText = 'Step 4 of 4: Attestation & Signature';
                    break;
            }
            stepIndicator.textContent = stepText;
        }
    }
    
    // Validate a specific step
    function validateStep(step) {
        switch (step) {
            case 1:
                // Validate personal information
                const fullName = document.getElementById('full_name');
                const email = document.getElementById('email');
                
                if (!fullName.value) {
                    alert('Please enter your full name.');
                    fullName.focus();
                    return false;
                }
                
                if (!email.value) {
                    alert('Please enter your email address.');
                    email.focus();
                    return false;
                }
                
                return true;
                
            case 2:
                // Timeline validation is handled by the next button's event listener
                return true;
                
            case 3:
                // Signature validation is handled by the submit button
                return true;
                
            default:
                return true;
        }
    }
    
    // Validate the form
    function validateForm(isSubmission = false) {
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
                            alert('Start month must be before end month for entry #' + (parseInt(index) + 1));
                        }
                    }
                }
            }
        });
        
        // Check years accounted
        const yearsAccounted = calculateYearsAccounted();
        document.getElementById('years-accounted').textContent = yearsAccounted.toFixed(1);
        
        // Update timeline visualization
        updateTimelineVisualization();
        
        // Timeline completion check
        let timelineComplete = false;
        if (yearsAccounted < yearsRequired) {
            isValid = false;
            if (timeValidation) {
                timeValidation.textContent = `Please account for at least ${yearsRequired} years.`;
                timeValidation.classList.remove('success');
            }
        } else {
            timelineComplete = true;
            if (timeValidation) {
                timeValidation.textContent = 'Timeframe requirement met.';
                timeValidation.classList.add('success');
            }
        }
        
        // Enable/disable the "Next: Signature" button based on timeline completion
        if (toSignatureBtn) {
            toSignatureBtn.disabled = !timelineComplete;
        }
        
        // Check signature
        if (signaturePad && signaturePad.isEmpty()) {
            isValid = false;
        }
        
        // Check legal acknowledgment
        const legalCheckbox = document.getElementById('legal-acknowledgment');
        if (legalCheckbox && !legalCheckbox.checked) {
            isValid = false;
        }
        
        // Update submit button
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
        
        return isValid;
    }
});