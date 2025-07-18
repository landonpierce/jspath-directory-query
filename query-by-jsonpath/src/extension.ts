// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const jsonpath = require('jsonpath');

interface QueryResult {
	filePath: string;
	matchedValue: any;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "query-by-jsonpath" is now active!');

	// Register the main command
	const disposable = vscode.commands.registerCommand('query-by-jsonpath.queryFiles', async () => {
		try {
			await queryJSONFiles();
		} catch (error) {
			vscode.window.showErrorMessage(`Error querying JSON files: ${error}`);
		}
	});

	// Register the workspace command
	const disposable2 = vscode.commands.registerCommand('query-by-jsonpath.queryWorkspace', async () => {
		try {
			await queryJSONFilesInWorkspace();
		} catch (error) {
			vscode.window.showErrorMessage(`Error querying JSON files in workspace: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function queryJSONFiles(): Promise<void> {
	// Step 1: Ask user to select directory
	const directoryUri = await vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		openLabel: 'Select Directory to Search'
	});

	if (!directoryUri || directoryUri.length === 0) {
		return;
	}

	const selectedDirectory = directoryUri[0].fsPath;

	// Step 2: Ask user for JSONPath query
	const jsonPathQuery = await vscode.window.showInputBox({
		prompt: 'Enter JSONPath query (e.g., $.store.book[*].title)',
		placeHolder: '$.property.subproperty',
		validateInput: (value) => {
			if (!value || value.trim().length === 0) {
				return 'JSONPath query cannot be empty';
			}
			// Basic validation - check if it starts with $
			if (!value.trim().startsWith('$')) {
				return 'JSONPath query should start with $';
			}
			return null;
		}
	});

	if (!jsonPathQuery) {
		return;
	}

	// Step 3: Find JSON files and execute query
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Searching JSON files...",
		cancellable: false
	}, async (progress) => {
		try {
			const results = await searchJSONFiles(selectedDirectory, jsonPathQuery.trim());
			// Show results in webview
		const panel = vscode.window.createWebviewPanel(
			'jsonPathResults',
			`JSONPath Results (${results.length} matches)`,
			vscode.ViewColumn.Two,
			{}
		);
		
		panel.webview.html = generateWebviewContent(results);
		} catch (error) {
			vscode.window.showErrorMessage(`Error during search: ${error}`);
		}
	});
}

async function searchJSONFiles(directory: string, jsonPathQuery: string): Promise<QueryResult[]> {
	const results: QueryResult[] = [];
	
	try {
		await searchJSONFilesRecursive(directory, jsonPathQuery, results);
	} catch (error) {
		// Silently ignore directory read errors
		console.log(`Error reading directory ${directory}: ${error}`);
	}
	
	return results;
}

async function searchJSONFilesRecursive(directory: string, jsonPathQuery: string, results: QueryResult[]): Promise<void> {
	try {
		const files = fs.readdirSync(directory);
		
		for (const file of files) {
			const filePath = path.join(directory, file);
			const stat = fs.statSync(filePath);
			
			if (stat.isDirectory()) {
				// Recursively search subdirectories
				await searchJSONFilesRecursive(filePath, jsonPathQuery, results);
			} else if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
				try {
					const fileContent = fs.readFileSync(filePath, 'utf-8');
					const jsonData = JSON.parse(fileContent);
					
					// Execute JSONPath query
					const matches = jsonpath.query(jsonData, jsonPathQuery);
					
					if (matches && matches.length > 0) {
						for (const match of matches) {
							results.push({
								filePath: filePath,
								matchedValue: match
							});
						}
					}
				} catch (error) {
					// Silently ignore files that can't be parsed or other errors
					console.log(`Skipping file ${filePath}: ${error}`);
				}
			}
		}
	} catch (error) {
		// Silently ignore directory read errors
		console.log(`Error reading directory ${directory}: ${error}`);
	}
}

async function queryJSONFilesInWorkspace(): Promise<void> {
	const jsonPathQuery = await vscode.window.showInputBox({
		prompt: 'Enter JSONPath query (e.g., $.key or $..property)',
		placeHolder: '$.property'
	});
	
	if (!jsonPathQuery) {
		return; // User cancelled
	}
	
	// Get workspace folder
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage('No workspace folder is open');
		return;
	}
	
	const workspaceRoot = workspaceFolders[0].uri.fsPath;
	
	// Show progress while searching
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Searching workspace...',
		cancellable: false
	}, async (progress) => {
		progress.report({ message: 'Searching for JSON files in workspace...' });
		
		const results = await searchJSONFiles(workspaceRoot, jsonPathQuery);
		
		if (results.length === 0) {
			vscode.window.showInformationMessage('No matches found for the specified JSONPath query.');
			return;
		}
		
		// Show results in webview
		const panel = vscode.window.createWebviewPanel(
			'jsonPathResults',
			`JSONPath Results (${results.length} matches)`,
			vscode.ViewColumn.Two,
			{}
		);
		
		panel.webview.html = generateWebviewContent(results);
	});
}

function generateWebviewContent(results: QueryResult[]): string {
	const tableRows = results.map(result => {
		const valueDisplay = typeof result.matchedValue === 'string' 
			? result.matchedValue 
			: JSON.stringify(result.matchedValue, null, 2);
		
		// Escape HTML characters
		const escapedValue = valueDisplay
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
		
		return `
			<tr>
				<td title="${result.filePath}">${result.filePath}</td>
				<td><pre>${escapedValue}</pre></td>
			</tr>
		`;
	}).join('');

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSONPath Query Results</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .query-info {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--vscode-editor-background);
        }
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: var(--vscode-editor-selectionBackground);
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: var(--vscode-list-hoverBackground);
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 400px;
            overflow-x: auto;
        }
        .results-count {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>JSONPath Query Results</h1>
        <div class="query-info">
            <span class="results-count">Found ${results.length} result(s)</span>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>File Path</th>
                <th>Matched Value</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
</body>
</html>
	`;
}
