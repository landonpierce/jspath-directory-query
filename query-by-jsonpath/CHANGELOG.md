# Change Log

All notable changes to the "query-by-jsonpath" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-01-17

### Added

- Initial release of JSONPath Directory Query extension
- **Dual Command System**: Two ways to search JSON files
  - `JSONPath Query: Select Directory` - Choose any directory to search
  - `JSONPath Query: Current Workspace` - Search the open workspace folder
- **Recursive Directory Search**: Automatically finds JSON files in all subdirectories
- **Advanced Line Number Detection**: Sophisticated pattern matching to accurately locate values in JSON files
  - Context-aware regex patterns that understand JSON structure
  - Priority-based candidate selection for accurate line number reporting
  - Handles strings, numbers, booleans, arrays, and complex objects
- **Interactive Results Display**: Beautiful webview table showing:
  - File path (relative to search directory)
  - Matched values (with proper JSON formatting)  
  - Accurate line numbers for easy navigation
- **Comprehensive Test Suite**: Extensive testing including:
  - Unit tests for core functionality
  - Performance tests with large files (25k+ lines)
  - Schema validation tests
  - Integration tests for end-to-end workflows
- **Error Handling**: Graceful handling of malformed JSON files and permission errors

### Features

- **JSONPath Support**: Full JSONPath syntax support (e.g., `$.store.book[*].title`, `$..price`)
- **Large File Performance**: Optimized for files with thousands of lines
- **Unified Test Schema**: Consistent JSON structure across test files for reliable testing
- **Cross-Platform Compatibility**: Works on Windows, macOS, and Linux

### Technical Details

- Built with TypeScript and VS Code Extension API
- Uses `jsonpath` npm library for robust query execution
- Advanced regex patterns for JSON-aware line number detection
- Webview-based results display with VS Code theming support

## [Unreleased]

### Planned

- Support for JSON Schema validation
- Export results to CSV/JSON formats
- Advanced filtering and sorting options
- Syntax highlighting in results preview
