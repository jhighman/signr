/**
 * Timeline Visualization module - Manages the timeline visualization and years-accounted calculation
 */

import { calculatePositionPercentage, formatDateRange, formatMonthYear } from './utilities.js';

// Module state
let yearsRequired = 7;
let currentYear = new Date().getFullYear();
let startYear = currentYear - yearsRequired;
let t; // Translations

/**
 * Initialize the timeline visualization module
 * @param {number} requiredYears - The number of years required
 * @param {Object} translations - Translation object
 */
export function initTimelineVisualization(requiredYears, translations) {
    yearsRequired = requiredYears;
    currentYear = new Date().getFullYear();
    startYear = currentYear - yearsRequired;
    t = translations;
    
    // Initialize timeline labels
    const startYearLabel = document.getElementById('timeline-start-year');
    const endYearLabel = document.getElementById('timeline-end-year');
    
    if (startYearLabel) startYearLabel.textContent = startYear;
    if (endYearLabel) endYearLabel.textContent = currentYear;
}

/**
 * Calculate total years accounted for
 * @returns {number} - The total years accounted for
 */
export function calculateYearsAccounted() {
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

/**
 * Update timeline visualization
 */
export function updateTimelineVisualization() {
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
    
    // Create a background element to highlight the required period
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
    
    // Update years accounted display
    const yearsAccounted = calculateYearsAccounted();
    const yearsAccountedElement = document.getElementById('years-accounted');
    if (yearsAccountedElement) {
        yearsAccountedElement.textContent = yearsAccounted.toFixed(1);
    }
    
    // Update time validation message
    const timeValidation = document.getElementById('time-validation');
    if (timeValidation) {
        if (yearsRequired === 0) {
            // Special case: If years=0, we only need one employer
            const entriesList = document.getElementById('entries-list');
            const entryElements = entriesList?.querySelectorAll('.entry-summary') || [];
            if (entryElements.length > 0) {
                timeValidation.textContent = 'Employment verification complete.';
                timeValidation.classList.add('success');
                timeValidation.style.color = '#28a745'; // Green color for success
            } else {
                timeValidation.textContent = t.pleaseAddEmployer;
                timeValidation.classList.remove('success');
                timeValidation.style.color = '#dc3545'; // Red color for warning
            }
        } else if (yearsAccounted < yearsRequired) {
            timeValidation.textContent = t.accountForYears(yearsRequired);
            timeValidation.classList.remove('success');
            timeValidation.style.color = '#dc3545'; // Red color for warning
        } else {
            timeValidation.textContent = 'Timeframe requirement met.';
            timeValidation.classList.add('success');
            timeValidation.style.color = '#28a745'; // Green color for success
        }
    }
    
    // Enable/disable the "Next: Signature" button based on timeline completion
    const toSignatureBtn = document.getElementById('to-signature-btn');
    if (toSignatureBtn) {
        const timelineComplete = yearsRequired === 0 ? 
            entryElements.length > 0 : 
            yearsAccounted >= yearsRequired;
        
        console.log(`Setting "Next: Signature" button disabled=${!timelineComplete}`);
        toSignatureBtn.disabled = !timelineComplete;
    }
}