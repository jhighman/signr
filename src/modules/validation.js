/**
 * Validation module - Centralizes all validation logic for steps, entries, and the entire form
 */

import { calculateYearsAccounted, updateTimelineVisualization } from './timelineVisualization.js';

// Module state
let degreeRequired = false;
let t; // Translations

/**
 * Initialize the validation module
 * @param {boolean} isDegreeRequired - Whether degree verification is required
 * @param {Object} translations - Translation object
 */
export function initValidation(isDegreeRequired, translations) {
    degreeRequired = isDegreeRequired;
    t = translations;
}

/**
 * Validate a specific step
 * @param {number} step - The step number to validate
 * @returns {boolean} - Whether the step is valid
 */
export function validateStep(step) {
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

/**
 * Validate a single entry
 * @param {Element} entry - The entry element to validate
 * @returns {boolean} - Whether the entry is valid
 */
export function validateEntry(entry) {
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
                showAccessibleError(startDate, t.startBeforeEnd(parseInt(index) + 1));
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

/**
 * Validate the entire form
 * @param {boolean} isSubmission - Whether this is a form submission
 * @returns {boolean} - Whether the form is valid
 */
export function validateForm(isSubmission = false) {
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
    
    // Check years accounted - only if we have entries
    const entriesList = document.getElementById('entries-list');
    const entryElements = entriesList?.querySelectorAll('.entry-summary') || [];
    const hasEntries = entryElements.length > 0;
    
    console.log(`Form validation found ${entryElements.length} entries in the timeline`);
    
    // Update timeline visualization
    updateTimelineVisualization();
    
    // Check degree verification (only if required)
    if (degreeRequired) {
        const schoolName = document.getElementById('school_name');
        const degreeLevel = document.getElementById('degree_level');
        
        if (schoolName && !schoolName.value) {
            isValid = false;
        }
        
        if (degreeLevel && !degreeLevel.value) {
            isValid = false;
        }
    }
    
    // Check signature
    const signaturePad = window.signaturePad; // Access from global scope
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
    
    console.log(`Form validation result: ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
}

/**
 * Show accessible error message
 * @param {Element} field - The field with the error
 * @param {string} message - The error message
 * @returns {Element} - The error element
 */
export function showAccessibleError(field, message) {
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

/**
 * Clear error from a field
 * @param {Element} field - The field to clear error from
 */
export function clearError(field) {
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    field.removeAttribute('aria-invalid');
}