/**
 * Main entry point for the form application
 * Initializes all modules and coordinates their setup
 */

import { initMultiStepForm } from './modules/formNavigation.js';
import { initEntryManagement } from './modules/entryManagement.js';
import { initTimelineVisualization } from './modules/timelineVisualization.js';
import { initSignaturePad, getSignatureData } from './modules/signaturePad.js';
import { initValidation, validateForm } from './modules/validation.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Detect language from HTML lang attribute or use 'en' as default
    const lang = document.documentElement.lang || 'en';
    console.log(`Detected language: ${lang}`);
    
    // Set up language switcher
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const newLang = this.value;
            // Get current URL
            const url = new URL(window.location.href);
            // Update or add lang parameter
            url.searchParams.set('lang', newLang);
            // Redirect to the new URL
            window.location.href = url.toString();
        });
    }
    
    // Fetch translations from server
    let t;
    try {
        const response = await fetch(`/translations/${lang}`);
        if (response.ok) {
            const translations = await response.json();
            console.log('Loaded translations from server:', translations);
            
            // Add helper functions for formatted strings
            t = {
                ...translations,
                // Add formatter functions for strings with parameters
                accountForYears: (years) => {
                    return translations.accountForYears.replace('{0}', years);
                },
                startBeforeEnd: (entryNum) => {
                    return translations.startBeforeEnd.replace('{0}', entryNum);
                },
                addAnotherDesc: (accounted, required) => {
                    return translations.addAnotherDesc
                        .replace('{0}', accounted)
                        .replace('{1}', required);
                }
            };
        } else {
            throw new Error('Failed to load translations');
        }
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English with basic translations
        t = {
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
        };
    }
    
    // Initialize variables
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
    
    // Initialize all modules
    initValidation(degreeRequired, t);
    initMultiStepForm(degreeRequired, t);
    initTimelineVisualization(yearsRequired, t);
    initEntryManagement(t);
    initSignaturePad();
    
    // Form submission
    const form = document.getElementById('employmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(true)) {
                e.preventDefault();
                return false;
            }
            
            // Add signature data to hidden input
            const signatureData = getSignatureData();
            if (signatureData) {
                document.getElementById('signature_data').value = signatureData;
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
});