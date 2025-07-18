# Query-By-JSONPath

A VS Code extension that allows you to query JSON files in a directory using JSONPath expressions and view the results in a table format.

## Features

- **Directory Selection**: Choose any directory to search for JSON files
- **JSONPath Querying**: Use powerful JSONPath expressions to find specific data
- **Table Results**: View results in an organized table with file paths, matched values, and line numbers
- **Error Handling**: Gracefully handles invalid JSON files and JSONPath expressions

## Usage

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Query JSON Files by JSONPath" and select the command
3. Choose a directory containing JSON files
4. Enter a JSONPath expression (e.g., `$.users[*].name` or `$.store.book[*].title`)
5. View the results in the opened webview

## JSONPath Examples

Here are some common JSONPath expressions you can use with the test data:

**Common Schema Queries (work across all files):**
- `$.metadata.fileName` - Get the file name from metadata
- `$.metadata.type` - Get the file type
- `$.data.*` - All data properties
- `$.settings.*` - All settings values
- `$.tags[*]` - All tags
- `$.price` - Get the price value
- `$..name` - Find all "name" values anywhere

**File-Specific Queries:**
- `$.data.app.name` - App name from config.json
- `$.data.books[*].title` - All book titles from store.json
- `$.data.users[*].name` - All user names from users.json
- `$..department` - All department values
- `$.data.books[?(@.price > 10)]` - Books over $10
- `$.data.users[?(@.active == true)]` - Active users only

## Sample Test Data

The extension includes sample JSON files in the `test-data` directory with a unified schema:

- `config.json` - Application configuration data
- `store.json` - Bookstore inventory data  
- `users.json` - Employee directory data

**Unified Schema Structure:**
```json
{
  "metadata": { "fileName", "type", "version", "lastModified" },
  "data": { /* file-specific content */ },
  "settings": { /* configuration settings */ },
  "tags": [ /* array of tags */ ],
  "price": /* numeric value */
}
```

Try these queries with the test data:

- `$.metadata.fileName` - Get file names
- `$.data.books[*].title` - Get all book titles  
- `$.data.users[*].name` - Get all user names
- `$..department` - Get all department values
- `$.tags[*]` - Get all tags
- `$.data.users[?(@.active == true)]` - Get active users only

## Requirements

- VS Code 1.102.0 or higher

## Commands

This extension contributes the following commands:

- `query-by-jsonpath.queryFiles`: Query JSON Files by JSONPath

## Known Issues

- Line number detection is basic and may not be accurate for complex nested structures
- Only searches the specified directory (not recursive)
- Only processes files with `.json` extension

## Release Notes

### 0.0.1

Initial release of Query-By-JSONPath extension.

## Development

To test and develop this extension:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new Extension Development Host window
4. Test the extension using the sample data in the `test-data` directory

---

**Enjoy querying your JSON files!**
