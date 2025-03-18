/**
 * Entry Management module - Handles creation, saving, editing, and deletion of timeline entries
 */

import { goToStep } from './formNavigation.js';
import { validateEntry, validateForm, showAccessibleError } from './validation.js';
import { calculateYearsAccounted, updateTimelineVisualization } from './timelineVisualization.js';
import { toggleRequired } from './utilities.js';

// Module state
let entryCount = 0;
let t; // Translations

/**
 * Initialize the entry management module
 * @param {Object} translations - Translation object
 */
export function initEntryManagement(translations) {
    t = translations;
    
    // Add entry button in timeline overview
    const addEntryBtn = document.getElementById('add-entry-btn');
    if (addEntryBtn) {
        addEntryBtn.addEventListener('click', function() {
            // Check if the timeline is already complete
            const yearsRequired = parseInt(document.querySelector('input[name="years"]').value) || 7;
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

/**
 * Create a new timeline entry
 */
export function createNewEntry() {
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

/**
 * Save the current entry and handle navigation
 * @returns {boolean} - Whether the save was successful
 */
export function saveCurrentEntry() {
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

/**
 * Update the entries list in the timeline overview
 * @param {Object} entryData - The entry data to update
 */
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

/**
 * Edit an existing entry
 * @param {string} index - The index of the entry to edit
 */
export function editEntry(index) {
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

/**
 * Delete an entry
 * @param {string} index - The index of the entry to delete
 */
export function deleteEntry(index) {
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

/**
 * Setup event listeners for a timeline entry
 * @param {string} index - The index of the entry
 */
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

/**
 * Update fields based on entry type
 * @param {string} index - The index of the entry
 */
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