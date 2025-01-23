# Static CSV Anonymizer

[![Try it online](https://img.shields.io/badge/Try%20it%20online-here-brightgreen)](https://fabriziosalmi.github.io/csv-anonymizer/)

Anonymize your CSV files directly in your browser with this static web application. Preserve data structure while fuzzing or redacting sensitive information.

**Try it now:** [https://fabriziosalmi.github.io/csv-anonymizer/](https://fabriziosalmi.github.io/csv-anonymizer/)

---

## ✨ Key Features

*   **🔒 Client-Side Privacy:** Your data stays on your computer. All processing is in your browser.
*   **🪧 Structure Preserved:** Keeps CSV structure intact while anonymizing data.
*   **🤩 Type-Aware Fuzzing/Redaction:**  Intelligently handles numbers, dates, emails, URLs, and strings.
*   **🎿 Configurable:** Mild, Moderate, Aggressive anonymization options. Advanced controls available.
*   **🛡️ Static & Serverless:** No server, no data transmission concerns.

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
5.  **Download Anonymized CSV:** Click "Download Fuzzed CSV" to save the anonymized file (`fuzzed_data.csv`) to your computer.
6.  **Share with Confidence:**  The downloaded CSV is now anonymized and safe to share without exposing original sensitive information.

## ⚙️ Customization Options

*   **Presets:**  Quickly apply different levels of anonymization using the "Fuzzing Preset" dropdown. "Custom" allows for manual adjustments.
*   **Advanced Configuration:** Tailor the anonymization precisely to your needs by adjusting fuzz factors, date variation, string fuzz probabilities, and redaction settings within the "Advanced Fuzzing Configuration" section.
*   **Redaction vs. Fuzzing:** Choose between fuzzing (slightly modifying data) or redaction (replacing data with `REDACTED`) for different data types based on your sensitivity requirements.

## Contribute

Contributions and feedback are welcome! Feel free to fork the repository and submit pull requests for improvements or new features.


## 📜 License

This project is open-source and available under the [AGPL3] license.
