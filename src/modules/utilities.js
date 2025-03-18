/**
 * Utilities module - Provides shared helper functions used across modules
 */

/**
 * Toggle required attribute on fields
 * @param {Element} container - The container element
 * @param {string} selector - CSS selector for the field
 * @param {boolean} required - Whether the field should be required
 */
export function toggleRequired(container, selector, required) {
    const field = container.querySelector(selector);
    if (field) {
        field.required = required;
    }
}

/**
 * Calculate timeline position percentage
 * @param {Date} date - The date to calculate position for
 * @param {number} startYear - The start year of the timeline
 * @param {number} endYear - The end year of the timeline
 * @returns {number} - The percentage position (0-100)
 */
export function calculatePositionPercentage(date, startYear, endYear) {
    const totalYears = endYear - startYear;
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    
    // Calculate years from start with decimal for partial years
    let yearsFromStart = (dateYear - startYear) + (dateMonth / 12) + (dateDay / 365.25);
    
    // For debugging
    console.log(`Date: ${date.toISOString().substring(0, 10)}, Years from start: ${yearsFromStart.toFixed(2)}`);
    
    // Clamp the position to the visible timeline (0-100%)
    // This ensures dates outside the timeline window are properly handled
    const clampedYears = Math.max(0, Math.min(yearsFromStart, totalYears));
    
    if (clampedYears !== yearsFromStart) {
        console.log(`Clamped years from ${yearsFromStart.toFixed(2)} to ${clampedYears.toFixed(2)}`);
    }
    
    // Convert to percentage
    const percentage = (clampedYears / totalYears) * 100;
    
    // Ensure the percentage is between 0 and 100
    return Math.max(0, Math.min(percentage, 100));
}

/**
 * Format a date string (YYYY-MM) to a human-readable month and year
 * @param {string} dateStr - The date string in YYYY-MM format or "Present"
 * @returns {string} - Formatted date string (e.g., "Jan 2023")
 */
export function formatMonthYear(dateStr) {
    if (!dateStr || dateStr === 'Present') return dateStr || '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Format a date range for debugging
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} - Formatted date range
 */
export function formatDateRange(start, end) {
    return `${start.toISOString().substring(0, 10)} to ${end.toISOString().substring(0, 10)}`;
}