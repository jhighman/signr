/**
 * Form Navigation module - Manages the multi-step form navigation, step indicators, and step transitions
 */

import { validateStep } from './validation.js';
import { createNewEntry } from './entryManagement.js';
import { updateTimelineVisualization } from './timelineVisualization.js';

// Module state
let currentStep = 1;
let degreeRequired = false;
let t; // Translations

/**
 * Initialize the multi-step form navigation
 * @param {boolean} isDegreeRequired - Whether degree verification is required
 * @param {Object} translations - Translation object
 */
export function initMultiStepForm(isDegreeRequired, translations) {
    degreeRequired = isDegreeRequired;
    t = translations;
    currentStep = 1;
    
    // Add event listeners to next buttons
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            
            // If going to degree verification or signature step, validate timeline completion
            if (nextStep === 4 || nextStep === 5) {
                // Special case: If years=0, we only need one employer
                const yearsRequired = parseInt(document.querySelector('input[name="years"]').value) || 7;
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
                    // Get the years accounted from the display element
                    const yearsAccountedElement = document.getElementById('years-accounted');
                    const yearsAccounted = yearsAccountedElement ? parseFloat(yearsAccountedElement.textContent) : 0;
                    
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

/**
 * Go to a specific step
 * @param {number} step - The step number to go to
 */
export function goToStep(step) {
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
                    const yearsRequired = parseInt(document.querySelector('input[name="years"]').value) || 7;
                    const currentYear = new Date().getFullYear();
                    const startYear = currentYear - yearsRequired;
                    
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

/**
 * Update the step indicator text
 * @param {number} step - The current step number
 */
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

/**
 * Get the current step
 * @returns {number} - The current step number
 */
export function getCurrentStep() {
    return currentStep;
}