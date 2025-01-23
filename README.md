# Static CSV Fuzzer & Anonymizer

This is a static web application built with HTML, CSS, and JavaScript that allows you to fuzz and anonymize CSV files directly in your browser.  It preserves the structure of your CSV while altering the data inside to protect sensitive information.  This tool is designed to be used without requiring you to share your data with a server, ensuring privacy and eliminating the need for NDAs to share fuzzed CSVs.

**Key Features:**

*   **Client-Side Processing:** All CSV processing happens directly in your web browser. Your data never leaves your computer.
*   **Structure Preservation:** The tool maintains the original CSV structure (headers and columns) while modifying the data.
*   **Type-Aware Fuzzing:**  Attempts to detect data types (numbers, dates, emails, URLs, strings) and applies appropriate fuzzing or redaction techniques.
*   **Configurable Fuzziness:**
    *   **Presets:** Choose from pre-defined fuzzing levels (Mild, Moderate, Aggressive).
    *   **Advanced Configuration:**  Fine-tune fuzzing parameters for numbers, dates, and strings (fuzz factor, date variation, string fuzz probabilities).
    *   **Redaction Options:**  Optionally redact numbers, dates, and strings by replacing them with "REDACTED".
*   **Data Preview:**  Provides a preview of the first few rows of the fuzzed CSV data in a table format before download.
*   **Sleek and Easy-to-Use UI:**  Built with Bootstrap for a responsive and clean user interface.
*   **No Server-Side Component:**  Static application means no server setup or data transmission to external servers.

**How to Use:**

1.  **Open `index.html` in your web browser.**  Simply double-click the `index.html` file or open it via "File > Open" in your browser.
2.  **Upload your CSV file:** Click the "Choose File" button and select the CSV file you want to fuzz and anonymize.  Only `.csv` files are accepted.
3.  **Configure Fuzzing Options (Optional):**
    *   **Presets:**  Use the "Choose a Fuzzing Preset" dropdown to select a pre-defined fuzzing level (Mild, Moderate, Aggressive, or "Custom" for manual settings).
    *   **Advanced Settings:** Expand the "Advanced Fuzzing Configuration (Optional)" section to adjust parameters for numbers, dates, and strings.
        *   **Redaction Checkboxes:**  Check the boxes to redact numbers, dates, and strings instead of fuzzing.
        *   **Fuzz Factor/Probability Sliders:**  Use the range sliders to control the intensity of fuzzing for numbers and the probability of character changes for strings.
        *   **Date Variation Range:** Set the number of days to vary dates by (plus or minus).
4.  **Click "Fuzz & Anonymize":**  Once you have uploaded your CSV and configured your settings (or used a preset), click the "Fuzz & Anonymize" button.
5.  **View Data Preview:**  After processing, a "Fuzzed Data Preview" section will appear, displaying the first few rows of your anonymized data in a table. Review this to ensure the fuzzing is as expected.
6.  **Download Fuzzed CSV:** Click the "Download Fuzzed CSV" button to download the anonymized CSV file to your computer. The downloaded file will be named `fuzzed_data.csv`.
7.  **Share Safely:** You can now share the downloaded `fuzzed_data.csv` file without needing to worry about exposing the original sensitive data.

**Customization:**

*   **Fuzzing Parameters:**  Experiment with the "Advanced Fuzzing Configuration" options (fuzz factors, probabilities, date variation) to adjust the level of anonymization to your specific needs.
*   **Presets:** The "Fuzzing Preset" dropdown provides quick access to common fuzzing levels.  Select "Custom" to manually adjust all settings.
*   **Redaction:** Use the redaction checkboxes to completely replace sensitive data types with "REDACTED" for stronger anonymization.

**Limitations:**

*   **Client-Side Performance:** Processing very large CSV files (hundreds of MBs or GBs) may be slow in the browser. For extremely large files, consider server-side solutions or splitting the file.
*   **Heuristic Type Detection:** Data type detection is based on heuristics (patterns and simple checks). It might not be perfect and could misclassify some data, especially in complex or inconsistent CSVs.
*   **Basic Fuzzing Techniques:** The anonymization techniques used are primarily fuzzing and redaction.  For highly sensitive data or scenarios requiring very strong anonymization, more advanced techniques like differential privacy, k-anonymity, or pseudonymization (which are more complex to implement client-side) are not included.
*   **No Column-Specific Configuration (Yet):**  Currently, fuzzing settings are applied globally based on detected data types.  Column-specific configuration is not implemented.

**License:**

This project is open-source and available under the [AGPL3] license.
