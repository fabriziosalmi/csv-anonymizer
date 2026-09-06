# Changelog

All notable changes to the CSV Anonymizer project will be documented in this file.

## [Unreleased]

### Fixed

- **Header type detection matched substrings, so columns were typed wrongly and silently.** `provider`, `video_title`, `width` and `residence` all contain "id" and were typed as identifiers; `candidate` contains "date"; `plate_number` contains "lat" and was typed as a latitude, which sent its non-numeric values to a coordinate fuzzer that returns the input **unchanged**. Headers are now split into words and matched on whole words, with the common Italian, Spanish, French and German terms alongside the English ones.
- **National identifiers, bank and card numbers were treated as generic text.** `codice_fiscale`, `iban`, `ssn`, `partita_iva` and `credit_card` matched no rule and were fuzzed as strings, so the output was a recognisable variant of the original: with the Mild preset a card number came back with a single digit changed.
- **The "Moderate" preset redacted nothing**, which made it weaker than "Mild" despite its name and position. The three presets are now a ladder, each redacting everything the one below it redacts.

### Added

- **A `sensitive_id` category that is always redacted**, at every preset and in Custom, and cannot be fuzzed instead. Covers tax codes, national identity numbers, passports, bank accounts, IBANs, card numbers and security codes.
- **IBAN detection by value**, validated with the ISO 13616 mod-97 check, so an account number under an uninformative header is still caught. The check digits make false positives essentially impossible, which is why this is the only value-based sensitive detection: a Luhn check on a bare number would redact one numeric order id in ten.
- **A unit test suite** (`npm test`, no dependencies) covering the misclassifications above, so they cannot come back silently.

### Removed

- **`fuzzCSVData`, a second copy of the anonymization logic that nothing called.** It had diverged from the live path and logged every original value to the browser console, one line per cell.
- Per-cell `console.log` of original values and detected types.

### Changed

- Empty cells stay empty instead of becoming `REDACTED`.
- README: documented how columns are typed and what each preset does, corrected AGPL-3.0 being described as "permissive", and replaced a placeholder link.

## [1.2.0] - 2024-08-27

### 🚀 Major Improvements

#### Security & Dependencies
- **FIXED**: Updated Bootstrap from 4.5.2 to 5.3.2 for security patches
- **FIXED**: Updated Font Awesome from 6.0.0 to 6.5.1 
- **ADDED**: Proper file size validation (50MB limit)
- **ADDED**: MIME type validation for uploaded files
- **ADDED**: HTML sanitization to prevent XSS in preview tables

#### Performance & Scalability
- **ADDED**: Asynchronous CSV processing with progress indicators
- **ADDED**: Chunked processing for large files (configurable chunk size)
- **ADDED**: Memory-efficient file handling with streaming
- **IMPROVED**: CSV parser now handles quoted fields and edge cases properly

#### User Experience
- **ADDED**: Real-time file size display
- **ADDED**: Data preview table showing first 5 rows of anonymized data
- **ADDED**: Progress bar with visual feedback during processing
- **ADDED**: Success/error notifications with auto-hide
- **ADDED**: "Process Another File" button for easier workflow
- **ADDED**: Responsive design improvements for mobile devices
- **ADDED**: Dark mode support (follows system preference)
- **ADDED**: High contrast mode support for accessibility
- **IMPROVED**: Better emoji-enhanced preset options
- **IMPROVED**: More descriptive UI labels and help text
- **IMPROVED**: Enhanced button styling with hover effects

#### Code Quality & Maintenance
- **ADDED**: Comprehensive JSDoc documentation
- **ADDED**: Package.json for proper dependency management
- **ADDED**: Constants configuration object for easy maintenance
- **ADDED**: Error handling with detailed error messages
- **ADDED**: Input validation and sanitization
- **ADDED**: Proper async/await patterns
- **REFACTORED**: Modular function architecture
- **FIXED**: Bootstrap 5 compatibility issues
- **IMPROVED**: Code organization and readability

#### Features
- **ADDED**: Enhanced CSV parser supporting RFC 4180 standard
- **ADDED**: Better data type detection algorithms
- **ADDED**: Timestamped download filenames
- **ADDED**: Comprehensive form validation
- **IMPROVED**: More robust URL and email fuzzing
- **IMPROVED**: Better geographic coordinate handling

### 🛠️ Technical Details

#### Dependencies
- Bootstrap: 4.5.2 → 5.3.2
- Font Awesome: 6.0.0 → 6.5.1
- Removed jQuery dependency (Bootstrap 5 no longer requires it)

#### Browser Support
- Enhanced accessibility features
- Better mobile responsive design
- Dark mode support
- High contrast mode support

#### Performance Metrics
- Reduced memory usage for large files
- Faster processing through chunked operations
- Non-blocking UI updates during processing

### 🐛 Bug Fixes
- Fixed CSV parsing for files with quoted fields containing commas
- Fixed Bootstrap 4 to 5 compatibility issues
- Fixed form validation edge cases
- Fixed memory leaks with large file processing
- Fixed responsive design on small screens

### 📚 Documentation
- Added comprehensive inline documentation
- Updated README with new features
- Added this changelog

### 🔄 Migration Notes
If upgrading from version 1.1.x:
- No breaking changes for end users
- The tool remains a static web application
- All existing CSV files will work with the improved parser
- New features are automatically available

---

## [1.1.0] - Previous Version
- Initial release with basic CSV anonymization functionality
- Type-aware fuzzing for different data types
- Configurable anonymization presets
- Client-side processing for privacy
