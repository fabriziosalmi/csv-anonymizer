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


    // --- Fuzzing/Anonymization Function (TYPE-AWARE - HEADER-NAME AWARE - WITH PRESETS & REDACTION) ---
    /**
     * Anonymizes CSV data by fuzzing or redacting values based on their data type and user configuration.
     * @param {Object} csvObject - The CSV data object containing headers and data arrays
     * @param {string[]} csvObject.headers - Array of column headers
     * @param {Object[]} csvObject.data - Array of data objects where each object represents a row
     * @returns {Object} A new object with the same structure as input but with fuzzed/redacted data
     * @description
     * This function processes CSV data and applies different fuzzing/redaction strategies based on:
     * - Data type detection (numbers, dates, emails, phones, URLs, coordinates, addresses, IDs, strings)
     * - User-configured fuzzing factors from UI inputs (number variation, date range, string modification probability)
     * - User-selected redaction options (numbers, dates, strings, light strings)
     * 
     * The function preserves the original structure while anonymizing sensitive data through:
     * - Number fuzzing with configurable variation
     * - Date fuzzing within specified day ranges
     * - Email anonymization
     * - Phone number redaction
     * - URL fuzzing (including special handling for YouTube URLs)
     * - Geographic coordinate fuzzing
     * - Address fuzzing
     * - ID/identifier light fuzzing
     * - Currency handling
     * - String fuzzing with configurable probability
     */
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

                const dataType = detectDataType(originalValue, header.toLowerCase()); // Detect data type - NOW HEADER-NAME AWARE
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
                        fuzzedValue = redactPhoneNumber(originalValue); // Phone number redaction is still fixed to "REDACTED" - Could be improved
                        break;
                    case 'youtube_url': // Specific case for YouTube URLs
                        fuzzedValue = fuzzYoutubeURL(originalValue);
                        break;
                    case 'url':
                        fuzzedValue = fuzzURL(originalValue);
                        break;
                    case 'latitude': // Geographic data types
                    case 'longitude':
                        if (shouldRedactNumbers) { // Reusing number redaction for coordinates for simplicity - Could have separate setting
                            fuzzedValue = "REDACTED";
                        } else {
                            fuzzedValue = fuzzGeoCoordinate(originalValue, currentNumberFuzzFactor); // Using number fuzz factor for geo-coordinates for now
                        }
                        break;
                    case 'address': // Simple address fuzzing - Could be significantly improved with address parsing libraries
                        fuzzedValue = fuzzAddress(originalValue, currentStringLightFuzzProbability);
                        break;
                    case 'id': // Generic ID - Light string fuzzing
                    case 'identifier':
                        if (shouldRedactStringsLight) {
                            fuzzedValue = "REDACTED";
                        } else {
                            fuzzedValue = fuzzStringLightLengthPreserving(originalValue, currentStringLightFuzzProbability, 'alphanumeric'); // Assuming alphanumeric IDs
                        }
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
                        } else if (shouldRedactStringsLight && dataType !== 'string') { // Redact non-strings treated as light strings (IDs?) - Refinement might be needed here
                           fuzzedValue = "REDACTED";
                        }
                        else if (dataType === 'string') {
                            fuzzedValue = fuzzString(originalValue, currentStringFuzzProbability); // General string fuzz
                        }
                        else {
                            fuzzedValue = fuzzStringLight(originalValue, currentStringLightFuzzProbability); // Light string fuzz for anything not explicitly typed
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

    // --- Data Type Detection Function (HEADER-NAME AWARE) ---
    function detectDataType(value, headerLower) {
        if (!value) return 'string'; // Empty values are strings

        if (headerLower.includes("email") || headerLower.includes("mail")) return 'email';
        if (headerLower.includes("youtube") && headerLower.includes("url")) return 'youtube_url'; // More specific YouTube URL detection based on header
        if (headerLower.includes("url") || headerLower.includes("link") || headerLower.includes("web")) return 'url';
        if (headerLower.includes("date") || headerLower.includes("time") || headerLower.includes("year") || headerLower.includes("month") || headerLower.includes("day")) return 'date';
        if (headerLower.includes("phone") || headerLower.includes("tel") || headerLower.includes("fax")) return 'phone';
        if (headerLower.includes("latitude") || headerLower.includes("lat")) return 'latitude';
        if (headerLower.includes("longitude") || headerLower.includes("long") || headerLower.includes("lng")) return 'longitude';
        if (headerLower.includes("address") || headerLower.includes("addr")) return 'address';
        if (headerLower.includes("id") || headerLower.includes("identifier") || headerLower.includes("code") || headerLower.includes("number") || headerLower.includes("serial")) return 'id'; // Broader ID detection
        if (headerLower.includes("price") || headerLower.includes("cost") || headerLower.includes("amount") || headerLower.includes("currency") || headerLower.includes("value")) return 'currency';


        if (isEmail(value)) return 'email'; // Pattern-based checks as fallback, after header hints
        if (isYoutubeURL(value)) return 'youtube_url';
        if (isURL(value)) return 'url';
        if (isDate(value)) return 'date';
        if (isNumeric(value)) return 'number';


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
                const fuzzedPathSegments = pathSegments.map(segment => fuzzStringLightLengthPreserving(segment, parseFloat(stringLightFuzzProbabilityInput.value))); // Using length preserving version
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
            return fuzzStringLightLengthPreserving(url, parseFloat(stringLightFuzzProbabilityInput.value)); // Fallback to length preserving string fuzzing
        }
    }

    function fuzzYoutubeURL(url) {
        if (!url) return "";
        try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            const pathnameParts = urlObj.pathname.split('/');

            if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com' || urlObj.hostname === 'm.youtube.com' || urlObj.hostname === 'youtu.be') {
                if (urlObj.hostname === 'youtu.be') { // youtu.be format: youtu.be/{video_id}
                    if (pathnameParts.length > 1 && pathnameParts[1]) {
                        const videoId = pathnameParts[1];
                        pathnameParts[1] = fuzzStringLightLengthPreserving(videoId, 0.3, 'alphanumeric'); // Fuzz video ID, keep alphanumeric
                    }
                } else if (pathnameParts[1] === 'watch' && params.has('v')) { // Standard watch format: /watch?v={video_id}
                    const videoId = params.get('v');
                    params.set('v', fuzzStringLightLengthPreserving(videoId, 0.3, 'alphanumeric')); // Fuzz video ID, keep alphanumeric
                } else if (pathnameParts[1] === 'channel' && pathnameParts.length > 2) { // Channel URL: /channel/{channel_id}
                    const channelId = pathnameParts[2];
                    pathnameParts[2] = fuzzStringLightLengthPreserving(channelId, 0.2, 'alphanumeric'); // Fuzz channel ID
                } else if (pathnameParts[1] === 'user' && pathnameParts.length > 2) { // User URL: /user/{username}
                    const username = pathnameParts[2];
                    pathnameParts[2] = fuzzStringLightLengthPreserving(username, 0.2); // Fuzz username
                } else if (pathnameParts[1] === 'c' && pathnameParts.length > 2) { // Custom channel URL: /c/{custom_name}
                    const customName = pathnameParts[2];
                    pathnameParts[2] = fuzzStringLightLengthPreserving(customName, 0.2); // Fuzz custom name
                }
                urlObj.pathname = pathnameParts.join('/');
                urlObj.search = params.toString();
                return urlObj.toString();
            }
            return fuzzURL(url); // Fallback to general URL fuzzing if not recognized as YouTube
        } catch (e) {
            return fuzzStringLightLengthPreserving(url, parseFloat(stringLightFuzzProbabilityInput.value)); // Fallback to string fuzzing
        }
    }

    function fuzzEmail(email) {
        if (!email) return "";
        const parts = email.split('@');
        if (parts.length !== 2) return fuzzStringLightLengthPreserving(email, parseFloat(stringLightFuzzProbabilityInput.value));

        let username = parts[0];
        let domain = parts[1];
        const fuzzPart = Math.random();

        if (fuzzPart < 0.4) { // 40% chance: Fuzz username
            username = fuzzStringLightLengthPreserving(username, parseFloat(stringLightFuzzProbabilityInput.value));
        } else if (fuzzPart < 0.8) { // 40% chance: Fuzz domain part
            const domainParts = domain.split('.');
            const fuzzedDomainParts = domainParts.map(part => fuzzStringLightLengthPreserving(part, parseFloat(stringLightFuzzProbabilityInput.value)));
            domain = fuzzedDomainParts.join('.');
        } else { // 20% chance: Add subdomain or change TLD subtly
            if (Math.random() < 0.5) { // Add subdomain
                const subdomain = fuzzStringLightLengthPreserving("sub", parseFloat(stringLightFuzzProbabilityInput.value));
                domain = `${subdomain}.${domain}`;
            } else { // Slight TLD change (e.g., .com to .co)
                const domainParts = domain.split('.');
                if (domainParts.length > 1) {
                    domainParts[domainParts.length - 1] = fuzzStringLightLengthPreserving(domainParts[domainParts.length - 1], 0.3); // Less aggressive fuzz on TLD
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

    function fuzzStringLightLengthPreserving(text, fuzzProbability, charSetType = 'alphanumeric') {
        if (!text) return "";
        let fuzzed = "";
        const charSet = getCharset(charSetType);

        for (let i = 0; i < text.length; i++) {
            if (Math.random() < fuzzProbability) {
                fuzzed += charSet.charAt(Math.floor(Math.random() * charSet.length)); // Substitute with random char from charset
            } else {
                fuzzed += text[i];
            }
        }
        return fuzzed;
    }

    function getCharset(charSetType) {
        switch (charSetType) {
            case 'alphanumeric':
                return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            case 'numeric':
                return "0123456789";
            case 'alphabetic':
                return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            case 'hex':
                return "0123456789abcdef";
            default: // default to alphanumeric
                return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        }
    }

    function getRandomChar() {
        return getCharset('alphanumeric').charAt(Math.floor(Math.random() * getCharset('alphanumeric').length));
    }


    // --- New Fuzzing Functions for extended types ---

    function fuzzGeoCoordinate(coordinateString, fuzzFactor) {
        const coord = parseFloat(coordinateString);
        if (isNaN(coord)) return coordinateString;
        // Simple fuzzing: add a small random variation, keeping it within reasonable bounds might be needed for real-world coordinates
        const variation = fuzzFactor * (Math.random() * 2 - 1); // Variation based on fuzzFactor
        return (coord + variation).toFixed(6); // Keep precision, adjust as needed
    }

    function fuzzAddress(addressString, fuzzProbability) {
        if (!addressString) return "";
        // Very basic address fuzzing -  more sophisticated methods would involve address parsing and rule-based modification
        // For now, just apply light string fuzzing to the address as a whole.
        return fuzzStringLight(addressString, fuzzProbability);
    }


    // --- Type Checking Functions (updated for header-name ignorance, added isEmail) ---
    function isNumeric(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    }

    function isDate(value) {
        const date = new Date(value);
        return !isNaN(date) && date.toString() !== 'Invalid Date';
    }

    function isURL(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    function isYoutubeURL(value) {
        try {
            const url = new URL(value);
            return url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com' || url.hostname === 'm.youtube.com' || url.hostname === 'youtu.be';
        } catch {
            return false;
        }
    }

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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