document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const fuzzButton = document.getElementById('fuzzButton');
    const downloadLinkContainer = document.getElementById('downloadLinkContainer');
    const downloadLink = document.getElementById('downloadLink');
    const processingMessage = document.getElementById('processingMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Configuration UI Elements
    const fuzzPresetInput = document.getElementById('fuzzPreset');
    const redactNumbersCheckbox = document.getElementById('redactNumbers');
    const numberFuzzFactorInput = document.getElementById('numberFuzzFactor');
    const redactDatesCheckbox = document.getElementById('redactDates');
    const dateVariationDaysInput = document.getElementById('dateVariationDays');
    const redactStringsCheckbox = document.getElementById('redactStrings');
    const stringFuzzProbabilityInput = document.getElementById('stringFuzzProbability');
    const redactStringsLightCheckbox = document.getElementById('redactStringsLight');
    const stringLightFuzzProbabilityInput = document.getElementById('stringLightFuzzProbability');
    const numberFuzzFactorOutput = document.getElementById('numberFuzzFactorOutput');
    const stringFuzzProbabilityOutput = document.getElementById('stringFuzzProbabilityOutput');
    const stringLightFuzzProbabilityOutput = document.getElementById('stringLightFuzzProbabilityOutput');


    let csvData = null; // Store parsed CSV data

    csvFile.addEventListener('change', (event) => {
        resetUI(); // Reset UI on new file selection
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            fuzzButton.disabled = false; // Enable the fuzz button
            const reader = new FileReader();

            reader.onload = (e) => {
                const csvText = e.target.result;
                csvData = parseCSV(csvText); // Parse CSV data
                console.log("CSV Parsed:", csvData); // Optional: Check in console
            };

            reader.onerror = () => {
                showError("Error reading CSV file.");
                fuzzButton.disabled = true;
            };

            reader.readAsText(file);
        } else {
            showError("Please select a valid CSV file.");
            fuzzButton.disabled = true;
        }
    });

    fuzzButton.addEventListener('click', () => {
        if (csvData) {
            processingMessage.style.display = 'block'; // Show processing message
            errorMessage.style.display = 'none'; // Hide any previous errors

            setTimeout(() => { // Simulate processing time (remove in production if not needed)
                const fuzzedData = fuzzCSVData(csvData); // Apply fuzzing
                console.log("Fuzzed Data:", fuzzedData); // Optional: Check fuzzed data

                const fuzzedCsvText = convertToCSV(fuzzedData); // Convert back to CSV text
                downloadLink.href = createDownloadLink(fuzzedCsvText); // Create download link
                downloadLinkContainer.style.display = 'block'; // Show download link container
                processingMessage.style.display = 'none'; // Hide processing message
            }, 100); // 100ms delay - adjust or remove
        } else {
            showError("No CSV data to fuzz. Please upload a CSV file.");
        }
    });

    function resetUI() {
        downloadLinkContainer.style.display = 'none';
        errorMessage.style.display = 'none';
        processingMessage.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        processingMessage.style.display = 'none';
        downloadLinkContainer.style.display = 'none';
    }


    // --- CSV Parsing Function (same as before) ---
    function parseCSV(csvText, delimiter = ',', quote = '"') {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(delimiter).map(header => header.trim().replace(/^"+|"+$/g, '')); // Remove quotes from headers
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(delimiter);
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                let value = currentLine[j] ? currentLine[j].trim().replace(/^"+|"+$/g, '') : ''; // Remove quotes from values and handle missing values
                row[headers[j]] = value;
            }
            data.push(row);
        }
        return { headers: headers, data: data };
    }

    // --- CSV Conversion Function (same as before) ---
    function convertToCSV(csvObject, delimiter = ',', quote = '"') {
        const headerRow = csvObject.headers.map(header => quote + header + quote).join(delimiter) + '\n';
        let dataRows = '';
        for (const row of csvObject.data) {
            const rowValues = csvObject.headers.map(header => quote + (row[header] || '') + quote).join(delimiter); // Handle potentially missing keys
            dataRows += rowValues + '\n';
        }
        return headerRow + dataRows;
    }


    // --- Fuzzing/Anonymization Function (TYPE-AWARE - HEADER-NAME IGNORANT - WITH PRESETS & REDACTION) ---
    function fuzzCSVData(csvObject) {
        const fuzzedData = { headers: [...csvObject.headers], data: [] }; // Copy headers

        // Get configuration values from UI elements
        const currentNumberFuzzFactor = parseFloat(numberFuzzFactorInput.value);
        const currentDateVariationDays = parseInt(dateVariationDaysInput.value, 10);
        const currentStringFuzzProbability = parseFloat(stringFuzzProbabilityInput.value);
        const currentStringLightFuzzProbability = parseFloat(stringLightFuzzProbabilityInput.value);
        const shouldRedactNumbers = redactNumbersCheckbox.checked;
        const shouldRedactDates = redactDatesCheckbox.checked;
        const shouldRedactStrings = redactStringsCheckbox.checked;
        const shouldRedactStringsLight = redactStringsLightCheckbox.checked;


        for (const row of csvObject.data) {
            const fuzzedRow = {};
            for (const header of csvObject.headers) {
                let originalValue = row[header];
                let fuzzedValue = originalValue; // Default: no change

                const dataType = detectDataType(originalValue); // Detect data type - NOW HEADER-NAME IGNORANT
                console.log(`Header: ${header}, Original Value: ${originalValue}, Detected Type: ${dataType}`); // *** DEBUG LOGGING ***

                switch (dataType) {
                    case 'number':
                        if (shouldRedactNumbers) {
                            fuzzedValue = "REDACTED";
                        } else {
                            fuzzedValue = fuzzNumber(originalValue, currentNumberFuzzFactor); // Pass fuzzFactor
                        }
                        break;
                    case 'date':
                        if (shouldRedactDates) {
                            fuzzedValue = "REDACTED";
                        } else {
                            fuzzedValue = fuzzDate(originalValue, currentDateVariationDays); // Pass dayVariationDays
                        }
                        break;
                    case 'email':
                        fuzzedValue = fuzzEmail(originalValue); // Using fuzzEmail now (email redaction could be added similarly)
                        break;
                    case 'phone':
                        fuzzedValue = redactPhoneNumber(originalValue); // Phone number redaction is still fixed to "REDACTED"
                        break;
                    case 'url':
                        fuzzedValue = fuzzURL(originalValue);
                        break;
                    case 'currency': // Treat currency as number for now
                        if (shouldRedactNumbers) { // Use number redaction setting for currency too
                            fuzzedValue = "REDACTED";
                        } else {
                            fuzzedValue = fuzzNumber(originalValue, currentNumberFuzzFactor); // Pass fuzzFactor
                        }
                        break;
                    case 'string':
                    default: // Default to string fuzzing
                        if (shouldRedactStrings && dataType === 'string') { // Redact general strings
                            fuzzedValue = "REDACTED";
                        } else if (shouldRedactStringsLight && dataType !== 'string') { // Redact non-strings treated as light strings (IDs?) - Might need refinement
                           fuzzedValue = "REDACTED";
                        }
                        else if (dataType === 'string') {
                            fuzzedValue = fuzzString(originalValue, currentStringFuzzProbability); // General string fuzz
                        }
                        else {
                            fuzzedValue = fuzzStringLight(originalValue, currentStringLightFuzzProbability); // Light string fuzz
                        }
                        break;
                }
                console.log(`Header: ${header}, Fuzzed Value: ${fuzzedValue}`); // *** DEBUG LOGGING ***
                fuzzedRow[header] = fuzzedValue;
            }
            fuzzedData.data.push(fuzzedRow);
        }
        return fuzzedData;
    }

    // --- Data Type Detection Function (HEADER-NAME IGNORANT) ---
    function detectDataType(value) { // Removed headerLower parameter
        if (!value) return 'string'; // Empty values are strings

        if (isEmail(value)) return 'email'; // Check email format first (more specific than URL)
        if (isURL(value)) return 'url';
        if (isDate(value)) return 'date';
        if (isNumeric(value)) return 'number';
        // Currency detection is hard without context, let's keep it simple, if it's numeric, it could be currency too
        // For now, we are not explicitly differentiating currency from numbers without header hints

        return 'string'; // Default to string if no other type is detected
    }

    // --- Helper Fuzzing Functions (IMPROVED and added fuzzEmail - Now configurable) ---

    function generateRandomName() { // Kept for potential future use, though not used in core fuzzing now
        const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Harry", "Ivy", "Jack"];
        return names[Math.floor(Math.random() * names.length)] + " " + names[Math.floor(Math.random() * names.length)];
    }

    function generateRandomEmail() {
        const domains = ["example.com", "mail.net", "domain.org", "email.co"];
        const usernames = ["user", "test", "info", "contact", "support"];
        return usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 1000) + "@" + domains[Math.floor(Math.random() * domains.length)];
    }

    function redactPhoneNumber(phoneNumber) { // Kept, though might need adjustment if phone numbers are not always phone-like
        if (!phoneNumber) return "";
        return "REDACTED"; // Redact entire phone number
    }

    function fuzzNumber(numberString, fuzzFactor) { // Added fuzzFactor parameter
        const num = parseFloat(numberString);
        if (isNaN(num)) return numberString;

        const variation = num * fuzzFactor * (Math.random() - 0.5);
        return (num + variation).toFixed(2);
    }

    function fuzzDate(dateString, dayVariationDays) { // Added dayVariationDays parameter
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;

        const dayVariation = Math.floor(Math.random() * (dayVariationDays * 2 + 1)) - dayVariationDays; // +/- dayVariationDays
        date.setDate(date.getDate() + dayVariation);
        return date.toISOString().slice(0, 10);
    }

    function fuzzURL(url) {
        if (!url) return "";
        try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/');
            const fuzzedPathSegments = pathSegments.map(segment => fuzzStringLight(segment, parseFloat(stringLightFuzzProbabilityInput.value))); // Pass light prob
            urlObj.pathname = fuzzedPathSegments.join('/');
            urlObj.search = '?fuzzed=' + Math.random().toString(36).substring(7); // Add a random query parameter
            return urlObj.toString();
        } catch (e) {
            return fuzzStringLight(url, parseFloat(stringLightFuzzProbabilityInput.value)); // Pass light prob
        }
    }

    function fuzzEmail(email) {
        if (!email) return "";
        const parts = email.split('@');
        if (parts.length !== 2) return fuzzStringLight(email, parseFloat(stringLightFuzzProbabilityInput.value)); // Pass light prob

        const username = parts[0];
        const domain = parts[1];

        const fuzzedUsername = fuzzStringLight(username, parseFloat(stringLightFuzzProbabilityInput.value)); // Pass light prob
        const domainParts = domain.split('.');
        const fuzzedDomainParts = domainParts.map(part => fuzzStringLight(part, parseFloat(stringLightFuzzProbabilityInput.value))); // Pass light prob
        const fuzzedDomain = fuzzedDomainParts.join('.');

        return fuzzedUsername + "@" + fuzzedDomain;
    }


    function fuzzString(text, fuzzProbability) { // Added fuzzProbability parameter
        if (!text) return "";
        let fuzzed = "";
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < fuzzProbability) {
                const charCode = text.charCodeAt(i);
                if (charCode >= 97 && charCode <= 122) {
                    fuzzed += String.fromCharCode(97 + Math.floor(Math.random() * 26));
                } else if (charCode >= 65 && charCode <= 90) {
                    fuzzed += String.fromCharCode(65 + Math.floor(Math.random() * 26));
                } else if (charCode >= 48 && charCode <= 57) {
                    fuzzed += String.fromCharCode(48 + Math.floor(Math.random() * 10));
                } else {
                    fuzzed += text[i];
                }
            } else {
                fuzzed += text[i];
            }
        }
        return fuzzed;
    }

    function fuzzStringLight(text, fuzzProbability) { // Added fuzzProbability parameter
        if (!text) return "";
        if (text.length <= 3) return fuzzString(text, fuzzProbability); // Fuzz short strings with general fuzz

        let fuzzed = "";
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < fuzzProbability) {
                const charCode = text.charCodeAt(i);
                if (charCode >= 97 && charCode <= 122) {
                    fuzzed += String.fromCharCode(97 + Math.floor(Math.random() * 26));
                } else if (charCode >= 65 && charCode <= 90) {
                    fuzzed += String.fromCharCode(65 + Math.floor(Math.random() * 26));
                } else if (charCode >= 48 && charCode <= 57) {
                    fuzzed += String.fromCharCode(48 + Math.floor(Math.random() * 10));
                } else {
                    fuzzed += text[i];
                }
            } else {
                fuzzed += text[i];
            }
        }
        return fuzzed;
    }


    // --- Type Checking Functions (updated for header-name ignorance, added isEmail) ---

    function isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    function isDate(value) {
        return !isNaN(new Date(value)); // Basic date check - might need more robust date parsing
    }

    function isURL(value) {
        try {
            new URL(value);
            return true;
        } catch (_) {
            return false;
        }
    }

    function isEmail(value) { // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }


    // --- Download Link Creation Function (same as before) ---
    function createDownloadLink(csvText) {
        const blob = new Blob([csvText], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        return url;
    }

    // --- Event Listeners for UI Updates (for output elements) ---
    numberFuzzFactorInput.addEventListener('input', () => {
        numberFuzzFactorOutput.textContent = numberFuzzFactorInput.value;
    });
    stringFuzzProbabilityInput.addEventListener('input', () => {
        stringFuzzProbabilityOutput.textContent = stringFuzzProbabilityInput.value;
    });
    stringLightFuzzProbabilityInput.addEventListener('input', () => {
        stringLightFuzzProbabilityOutput.textContent = stringLightFuzzProbabilityInput.value;
    });

    // --- Preset Handling ---
    fuzzPresetInput.addEventListener('change', () => {
        const selectedPreset = fuzzPresetInput.value;
        applyPresetSettings(selectedPreset);
    });

    function applyPresetSettings(presetName) {
        let numberFuzzFactor = 0.3;
        let dateVariationDays = 30;
        let stringFuzzProbability = 0.4;
        let stringLightFuzzProbability = 0.15;
        let redactNumbers = false;
        let redactDates = false;
        let redactStrings = false;
        let redactStringsLight = false;

        switch (presetName) {
            case 'mild':
                numberFuzzFactor = 0.1;
                dateVariationDays = 10;
                stringFuzzProbability = 0.2;
                stringLightFuzzProbability = 0.05;
                redactNumbers = false;
                redactDates = false;
                redactStrings = false;
                redactStringsLight = true; // Mild redact IDs/light strings
                break;
            case 'moderate':
                numberFuzzFactor = 0.3;
                dateVariationDays = 30;
                stringFuzzProbability = 0.4;
                stringLightFuzzProbability = 0.15;
                redactNumbers = false;
                redactDates = false;
                redactStrings = false;
                redactStringsLight = false;
                break;
            case 'aggressive':
                numberFuzzFactor = 0.7;
                dateVariationDays = 90;
                stringFuzzProbability = 0.7;
                stringLightFuzzProbability = 0.3;
                redactNumbers = true;
                redactDates = true;
                redactStrings = true;
                redactStringsLight = true;
                break;
            case 'custom':
            default:
                // Custom - use current values in UI, or defaults if not set in UI yet.
                break;
        }

        // Update UI elements with preset values (only if not 'custom')
        if (presetName !== 'custom') {
            numberFuzzFactorInput.value = numberFuzzFactor;
            numberFuzzFactorOutput.textContent = numberFuzzFactor.toFixed(2);
            dateVariationDaysInput.value = dateVariationDays;
            stringFuzzProbabilityInput.value = stringFuzzProbability;
            stringFuzzProbabilityOutput.textContent = stringFuzzProbability.toFixed(2);
            stringLightFuzzProbabilityInput.value = stringLightFuzzProbability;
            stringLightFuzzProbabilityOutput.textContent = stringLightFuzzProbability.toFixed(2);
            redactNumbersCheckbox.checked = redactNumbers;
            redactDatesCheckbox.checked = redactDates;
            redactStringsCheckbox.checked = redactStrings;
            redactStringsLightCheckbox.checked = redactStringsLight;
        }
    }

});