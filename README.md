# Static CSV Anonymizer - Fuzz and Redact CSV Data in your Browser

[![Try it online](https://img.shields.io/badge/Try%20it%20online-here-brightgreen)](https://fabriziosalmi.github.io/csv-anonymizer/)

**Anonymize your CSV files directly in your browser with this static web application. Preserve data structure while fuzzing or redacting sensitive information, ensuring privacy and eliminating the need for NDAs.**

**Try it now:** [https://fabriziosalmi.github.io/csv-anonymizer/](https://fabriziosalmi.github.io/csv-anonymizer/)

---

## ✨ Key Features

*   **🔒 Client-Side Processing:** Your data stays completely private! All CSV processing happens directly in your browser, never leaving your computer.
*   **<0xF0><0x9F><0xAA><0x97> Structure Preservation:** Maintains the original CSV structure (headers and columns) while intelligently modifying the data content.
*   **<0xF0><0x9F><0xA7><0x90> Type-Aware Anonymization:** Detects data types (numbers, dates, emails, URLs, strings) and applies relevant fuzzing or redaction techniques for optimal anonymization.
*   **<0xF0><0x9F><0x9B><0xBC> Configurable Anonymization:**
    *   **Presets:** Quickly choose from pre-defined anonymization levels (Mild, Moderate, Aggressive) for common use cases.
    *   **Advanced Settings:** Fine-tune anonymization parameters for different data types:
        *   **Fuzzing:** Control the intensity of fuzzing for numbers and the probability of character changes for strings.
        *   **Date Variation:**  Set the range for date shifting.
        *   **Redaction:**  Optionally redact numbers, dates, and strings by replacing them with `REDACTED`.
*   **<0xF0><0x9F><0x91><0x8D> User-Friendly Interface:** Built with Bootstrap for a clean, responsive, and intuitive user experience.
*   **<0xE2><0x9B><0xAE> No Server-Side Dependency:**  A purely static application, meaning no server setup, external data transmission, or privacy concerns.

## 🚀 How to Use

1.  **Access the Anonymizer:**
    *   **Open in Browser:**  Go to [https://fabriziosalmi.github.io/csv-anonymizer/](https://fabriziosalmi.github.io/csv-anonymizer/) directly in your browser.
    *   **Run Locally:** Alternatively, [download or clone the repository](<link to your repo if public>) and open `index.html` by double-clicking or via "File > Open" in your browser.
2.  **Upload CSV File:** Click "Choose File" and select the `.csv` file you wish to anonymize.
3.  **Configure Anonymization (Optional but Recommended):**
    *   **Choose a Preset:**  For quick setup, select "Mild," "Moderate," or "Aggressive" from the "Fuzzing Preset" dropdown.
    *   **Customize Settings:** For granular control, expand "Advanced Fuzzing Configuration" to:
        *   **Redact Data:** Check the redaction boxes for Numbers, Dates, and Strings to replace values with `REDACTED`.
        *   **Adjust Fuzzing Intensity:** Use sliders and number inputs to fine-tune fuzzing parameters for each data type.
4.  **Process CSV:** Click the "Fuzz & Anonymize" button.
5.  **Review Data Preview:** Examine the "Fuzzed Data Preview" table that appears. This shows the first few rows of your anonymized CSV, allowing you to verify the results before downloading.
6.  **Download Anonymized CSV:** Click "Download Fuzzed CSV" to save the anonymized file (`fuzzed_data.csv`) to your computer.
7.  **Share with Confidence:**  The downloaded CSV is now anonymized and safe to share without exposing original sensitive information.

## ⚙️ Customization Options

*   **Presets:**  Quickly apply different levels of anonymization using the "Fuzzing Preset" dropdown. "Custom" allows for manual adjustments.
*   **Advanced Configuration:** Tailor the anonymization precisely to your needs by adjusting fuzz factors, date variation, string fuzz probabilities, and redaction settings within the "Advanced Fuzzing Configuration" section.
*   **Redaction vs. Fuzzing:** Choose between fuzzing (slightly modifying data) or redaction (replacing data with `REDACTED`) for different data types based on your sensitivity requirements.

## ⚠️ Limitations

*   **Performance on Very Large Files:** Client-side processing might be slow for extremely large CSV files (hundreds of MBs or GBs). Consider splitting large files or server-side solutions for optimal performance in such cases.
*   **Heuristic Data Type Detection:** Data type detection relies on pattern recognition and may not be foolproof. Complex or inconsistent CSV formats might lead to occasional misclassifications. Always review the preview.
*   **Basic Anonymization Techniques:** This tool uses fuzzing and redaction, which are effective for many use cases. However, for highly sensitive data requiring robust anonymization against advanced re-identification attacks, consider more sophisticated techniques beyond the scope of this client-side tool.
*   **No Column-Specific Rules (Yet):**  Anonymization settings are currently applied globally based on detected data types. Column-level configuration is a potential future enhancement.

## 📜 License

This project is open-source and available under the [AGPL3] license.

## <0xF0><0x9F><0xA6><0x80> Contribute

Contributions and feedback are welcome! Feel free to fork the repository and submit pull requests for improvements or new features.

---

**Made with ❤️ for privacy-preserving data sharing.**