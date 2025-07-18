# Query-By-JSONPath

A VS Code extension that allows you to query JSON files in a directory using JSONPath expressions and view the results in a table format.

## Features

- **Directory Selection**: Choose any directory to search for JSON files
- **Workspace Search**: Search JSON files in the current workspace with one command
- **Recursive Search**: Automatically searches all subdirectories for JSON files
- **JSONPath Querying**: Use powerful JSONPath expressions to find specific data
- **Table Results**: View results in an organized table with file paths, matched values, and line numbers
- **Large File Support**: Efficiently handles large JSON files (tested with 5000+ lines)
- **Error Handling**: Gracefully handles invalid JSON files and JSONPath expressions

## Usage

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Choose one of these commands:
   - **"Query JSON Files by JSONPath (Select Directory)"** - Choose a specific directory to search
   - **"Query JSON Files by JSONPath (Current Workspace)"** - Search the current workspace
3. Enter a JSONPath expression (e.g., `$.data.users[*].name` or `$.data.books[*].title`)
4. View the results in the opened webview

The extension will recursively search through all subdirectories to find JSON files.

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

- `query-by-jsonpath.queryFiles`: Query JSON Files by JSONPath (Select Directory)
- `query-by-jsonpath.queryWorkspace`: Query JSON Files by JSONPath (Current Workspace)

## Known Issues

- Line number detection is basic and may not be accurate for complex nested structures
- Very large files (>100MB) may impact performance
- JSONPath conditional queries may be slower on large datasets

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
