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

    // Theme Toggle Elements
    const body = document.body;

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

    function generateRandomName() {
        const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Harry", "Ivy", "Jack", "Liam", "Olivia", "Noah", "Emma", "Jackson", "Ava", "Aiden", "Sophia", "Lucas", "Isabella"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez"];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${firstName} ${lastName}`;
    }

    function generateRandomEmail() {
        const domains = ["example.com", "mail.net", "domain.org", "email.co", "techmail.io", "web.info", "service.biz"];
        const usernames = ["user", "test", "info", "contact", "support", "account", "help", "sales", "marketing", "admin", "service"];
        const usernameVariations = ["", ".", "-", "_", "123"]; // Variations to make usernames a bit more diverse
        const domainExtensions = [".com", ".net", ".org", ".io", ".info", ".biz"]; // More extension variety

        const baseUsername = usernames[Math.floor(Math.random() * usernames.length)];
        const usernameExtension = usernameVariations[Math.floor(Math.random() * usernameVariations.length)];
        const fullUsername = baseUsername + usernameExtension + Math.floor(Math.random() * 1000); // Added number at end

        const domainName = domains[Math.floor(Math.random() * domains.length)];
        const domainExtension = domainExtensions[Math.floor(Math.random() * domainExtensions.length)];
        const fullDomain = domainName + domainExtension;

        return `${fullUsername}@${fullDomain}`;
    }

    function redactPhoneNumber(phoneNumber) {
        if (!phoneNumber) return "";
        // Option for partial redaction - redact last 4 digits, keep first part
        // if (phoneNumber.length > 4) {
        //     return phoneNumber.slice(0, -4) + "XXXX";
        // }
        return "REDACTED"; // Redact entire phone number (default behavior as before)
    }

    function fuzzNumber(numberString, fuzzFactor) {
        const num = parseFloat(numberString);
        if (isNaN(num)) return numberString;

        const variationType = Math.random(); // Introduce different types of variation
        let variation = 0;

        if (variationType < 0.5) { // 50% chance: percentage variation (as before, but slightly enhanced range)
            variation = num * fuzzFactor * (Math.random() * 2 - 1); // Range -fuzzFactor to +fuzzFactor
        } else if (variationType < 0.8) { // 30% chance: fixed amount variation (small amount)
            variation = (Math.random() * 2 - 1) * fuzzFactor * 10; // +/- up to 10 * fuzzFactor
        } else { // 20% chance: replace with near zero or a small integer
            variation = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1); // 0 or small int +/-
        }

        return (num + variation).toFixed(2); // Keep to 2 decimal places for consistency
    }

    function fuzzDate(dateString, dayVariationDays) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;

        const variationType = Math.random();
        let dateVariation = 0;

        if (variationType < 0.7) { // 70% chance: day variation (as before)
            dateVariation = Math.floor(Math.random() * (dayVariationDays * 2 + 1)) - dayVariationDays;
        } else if (variationType < 0.9) { // 20% chance: month variation (smaller range)
            dateVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 month variation
            date.setMonth(date.getMonth() + dateVariation);
            dateVariation = 0; // Reset day variation after month change
        } else { // 10% chance: year variation (small range)
            dateVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1 year variation
            date.setFullYear(date.getFullYear() + dateVariation);
            dateVariation = 0; // Reset day variation after year change
        }

        if (variationType < 0.7) { // Apply day variation only for the most common case to avoid compounding changes
            date.setDate(date.getDate() + dateVariation);
        }

        return date.toISOString().slice(0, 10);
    }

    function fuzzURL(url) {
        if (!url) return "";
        try {
            const urlObj = new URL(url);
            const fuzzPart = Math.random();

            if (fuzzPart < 0.3) { // 30% chance: Fuzz path
                const pathSegments = urlObj.pathname.split('/');
                const fuzzedPathSegments = pathSegments.map(segment => fuzzStringLight(segment, parseFloat(stringLightFuzzProbabilityInput.value)));
                urlObj.pathname = fuzzedPathSegments.join('/');
            } else if (fuzzPart < 0.6) { // 30% chance: Fuzz domain (subtle typo)
                let domain = urlObj.hostname;
                if (domain.length > 3) {
                    const indexToFuzz = Math.floor(Math.random() * (domain.length - 1));
                    domain = domain.substring(0, indexToFuzz) + String.fromCharCode(domain.charCodeAt(indexToFuzz) + (Math.random() < 0.5 ? 1 : -1)) + domain.substring(indexToFuzz + 1);
                    urlObj.hostname = domain;
                }
            } else if (fuzzPart < 0.8) { // 20% chance: Add/modify query parameter
                urlObj.searchParams.set('fuzzed', Math.random().toString(36).substring(7) + (urlObj.searchParams.has('fuzzed') ? "_modified" : ""));
            } else { // 20% chance:  Slightly alter protocol (http vs https)
                if (urlObj.protocol === 'http:') {
                    urlObj.protocol = 'https:';
                } else if (urlObj.protocol === 'https:') {
                    urlObj.protocol = 'http:';
                }
            }
            return urlObj.toString();
        } catch (e) {
            return fuzzStringLight(url, parseFloat(stringLightFuzzProbabilityInput.value)); // Fallback to string fuzzing
        }
    }

    function fuzzEmail(email) {
        if (!email) return "";
        const parts = email.split('@');
        if (parts.length !== 2) return fuzzStringLight(email, parseFloat(stringLightFuzzProbabilityInput.value));

        let username = parts[0];
        let domain = parts[1];
        const fuzzPart = Math.random();

        if (fuzzPart < 0.4) { // 40% chance: Fuzz username
            username = fuzzStringLight(username, parseFloat(stringLightFuzzProbabilityInput.value));
        } else if (fuzzPart < 0.8) { // 40% chance: Fuzz domain part
            const domainParts = domain.split('.');
            const fuzzedDomainParts = domainParts.map(part => fuzzStringLight(part, parseFloat(stringLightFuzzProbabilityInput.value)));
            domain = fuzzedDomainParts.join('.');
        } else { // 20% chance: Add subdomain or change TLD subtly
            if (Math.random() < 0.5) { // Add subdomain
                const subdomain = fuzzStringLight("sub", parseFloat(stringLightFuzzProbabilityInput.value));
                domain = `${subdomain}.${domain}`;
            } else { // Slight TLD change (e.g., .com to .co)
                const domainParts = domain.split('.');
                if (domainParts.length > 1) {
                    domainParts[domainParts.length - 1] = fuzzStringLight(domainParts[domainParts.length - 1], 0.3); // Less aggressive fuzz on TLD
                    domain = domainParts.join('.');
                }
            }
        }

        return `${username}@${domain}`;
    }


    function fuzzString(text, fuzzProbability) {
        if (!text) return "";
        let fuzzed = "";
        const operations = ['insert', 'delete', 'substitute', 'transpose', 'repeat'];
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < fuzzProbability) {
                const operationType = operations[Math.floor(Math.random() * operations.length)]; // Random operation

                switch (operationType) {
                    case 'insert':
                        fuzzed += getRandomChar(); // Insert a random character
                        fuzzed += text[i];
                        break;
                    case 'delete':
                        // Skip current character (delete it)
                        break;
                    case 'substitute':
                        fuzzed += getRandomChar(); // Substitute with a random character
                        break;
                    case 'transpose':
                        if (i < text.length - 1 && Math.random() < 0.5) { // Swap with next character
                            fuzzed += text[i+1];
                            fuzzed += text[i];
                            i++; // Skip next character as it's already processed
                        } else {
                            fuzzed += text[i]; // No swap, just keep current char
                        }
                        break;
                    case 'repeat':
                        fuzzed += text[i];
                        fuzzed += text[i]; // Repeat current character
                        break;
                    default:
                        fuzzed += text[i]; // No fuzzing
                }
            } else {
                fuzzed += text[i];
            }
        }
        return fuzzed;
    }

    function fuzzStringLight(text, fuzzProbability) {
         if (!text) return "";
        if (text.length <= 3) return fuzzString(text, fuzzProbability); // Fallback for short strings

        let fuzzed = "";
        const lightOperations = ['substitute', 'transpose', 'caseFlip']; // Lighter operations
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < fuzzProbability) {
                const operationType = lightOperations[Math.floor(Math.random() * lightOperations.length)];

                switch (operationType) {
                    case 'substitute':
                        fuzzed += getRandomChar();
                        break;
                    case 'transpose':
                        if (i < text.length - 1 && Math.random() < 0.3) { // Less frequent transpose for light fuzz
                            fuzzed += text[i+1];
                            fuzzed += text[i];
                            i++;
                        } else {
                            fuzzed += text[i];
                        }
                        break;
                    case 'caseFlip':
                        const char = text[i];
                        if (char === char.toLowerCase() && char.toUpperCase() !== char) {
                            fuzzed += char.toUpperCase();
                        } else if (char === char.toUpperCase() && char.toLowerCase() !== char) {
                            fuzzed += char.toLowerCase();
                        } else {
                            fuzzed += char; // Keep as is if not a letter or already mixed case
                        }
                        break;
                    default:
                        fuzzed += text[i];
                }
            } else {
                fuzzed += text[i];
            }
        }
        return fuzzed;
    }

    // --- Helper function to get a random character (alphanumeric) ---
    function getRandomChar() {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return chars.charAt(Math.floor(Math.random() * chars.length));
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

    // --- Theme Toggle Functionality ---
    function setTheme(themeName) {
        if (themeName === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon'); // Moon icon for dark theme
        } else {
            body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun'); // Sun icon for light theme
        }
        localStorage.setItem('theme', themeName); // Save theme preference
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });

    // Immediately check and set the theme on page load
    const currentTheme = localStorage.getItem('theme') || 'light'; // Default to light
    setTheme(currentTheme);

});