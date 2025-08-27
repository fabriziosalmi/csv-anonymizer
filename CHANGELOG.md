# Changelog

All notable changes to the CSV Anonymizer project will be documented in this file.

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
