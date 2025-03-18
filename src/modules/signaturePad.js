/**
 * Signature Pad module - Initializes and manages the signature pad functionality
 */

import { validateForm } from './validation.js';

// Module state
let signaturePad;

/**
 * Initialize the signature pad
 */
export function initSignaturePad() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        console.error("Signature canvas element not found");
        return;
    }
    
    // Initialize SignaturePad
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
    
    // Make signature pad accessible
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
    const clearButton = document.getElementById('clear-signature');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
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
    
    // Make the signaturePad instance available globally for other modules
    window.signaturePad = signaturePad;
}

/**
 * Get the signature data as a base64-encoded PNG
 * @returns {string|null} - The signature data or null if empty
 */
export function getSignatureData() {
    if (signaturePad && !signaturePad.isEmpty()) {
        return signaturePad.toDataURL();
    }
    return null;
}

/**
 * Check if the signature pad is empty
 * @returns {boolean} - Whether the signature pad is empty
 */
export function isSignatureEmpty() {
    return signaturePad ? signaturePad.isEmpty() : true;
}