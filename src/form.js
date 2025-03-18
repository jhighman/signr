/**
 * Combined form.js file that imports and re-exports all modules
 * This file can be used as a single entry point for the HTML file
 */

// Import the main entry point
import './index.js';

// Re-export all modules for external use if needed
export * from './modules/formNavigation.js';
export * from './modules/entryManagement.js';
export * from './modules/timelineVisualization.js';
export * from './modules/signaturePad.js';
export * from './modules/validation.js';
export * from './modules/utilities.js';