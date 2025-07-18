import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const jsonpath = require('jsonpath');

suite('Line Number Detection Debug Suite', () => {
	
	test('Debug line number detection with real config file', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'test-data', 'config.json');
			
			if (fs.existsSync(configPath)) {
				const fileContent = fs.readFileSync(configPath, 'utf-8');
				const lines = fileContent.split('\n');
				
				console.log('\n=== CONFIG FILE ANALYSIS ===');
				console.log('Total lines:', lines.length);
				
				// Print each line with line numbers for debugging
				lines.forEach((line, index) => {
					console.log(`${String(index + 1).padStart(2)}: ${line}`);
				});
				
				// Test the actual extension's findLineNumber function
				function findLineNumber(fileContent: string, value: any): number {
					try {
						if (typeof value === 'string') {
							return findStringValueLine(fileContent, value);
						}
						if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
							return findPrimitiveValueLine(fileContent, value);
						}
						if (typeof value === 'object') {
							return findObjectLine(fileContent, value);
						}
					} catch (error) {
						console.log(`Error finding line number for value: ${error}`);
					}
					return 1;
				}

				function findStringValueLine(fileContent: string, stringValue: string): number {
					const lines = fileContent.split('\n');
					
					function escapeRegex(string: string): string {
						return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					}
					
					const patterns = [
						new RegExp(`:\\s*"${escapeRegex(stringValue)}"`, 'i'),
						new RegExp(`\\[\\s*"${escapeRegex(stringValue)}"`, 'i'),
						new RegExp(`"${escapeRegex(stringValue)}"`, 'i')
					];
					
					console.log(`\n--- Finding string value: "${stringValue}" ---`);
					console.log('Patterns:', patterns.map(p => p.toString()));
					
					for (let i = 0; i < lines.length; i++) {
						for (let j = 0; j < patterns.length; j++) {
							const pattern = patterns[j];
							if (pattern.test(lines[i])) {
								console.log(`Found with pattern ${j} on line ${i + 1}: "${lines[i]}"`);
								return i + 1;
							}
						}
					}
					
					console.log('No pattern match found, using fallback...');
					for (let i = 0; i < lines.length; i++) {
						if (lines[i].includes(stringValue)) {
							console.log(`Fallback found on line ${i + 1}: "${lines[i]}"`);
							return i + 1;
						}
					}
					
					console.log('No match found, returning 1');
					return 1;
				}

				function findPrimitiveValueLine(fileContent: string, value: any): number {
					const lines = fileContent.split('\n');
					const valueStr = String(value);
					
					function escapeRegex(string: string): string {
						return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					}
					
					const patterns = [
						new RegExp(`:\\s*${escapeRegex(valueStr)}\\s*[,}\\]]`, 'i'),
						new RegExp(`\\[\\s*${escapeRegex(valueStr)}\\s*[,\\]]`, 'i'),
						new RegExp(`\\b${escapeRegex(valueStr)}\\b`, 'i')
					];
					
					console.log(`\n--- Finding primitive value: ${valueStr} ---`);
					console.log('Patterns:', patterns.map(p => p.toString()));
					
					for (let i = 0; i < lines.length; i++) {
						for (let j = 0; j < patterns.length; j++) {
							const pattern = patterns[j];
							if (pattern.test(lines[i])) {
								console.log(`Found with pattern ${j} on line ${i + 1}: "${lines[i]}"`);
								return i + 1;
							}
						}
					}
					
					console.log('No match found, returning 1');
					return 1;
				}

				function findObjectLine(fileContent: string, obj: any): number {
					console.log(`\n--- Finding object: ${JSON.stringify(obj)} ---`);
					return 1; // Simplified for debugging
				}
				
				// Parse JSON and test various queries
				const jsonData = JSON.parse(fileContent);
				
				// Test cases that might have inconsistencies
				const testCases = [
					{ query: '$.metadata.fileName', description: 'fileName in metadata' },
					{ query: '$.data.app.name', description: 'app name' },
					{ query: '$.data.app.version', description: 'app version' },
					{ query: '$.data.database.port', description: 'database port' },
					{ query: '$.settings.debug', description: 'debug boolean' },
					{ query: '$.settings.maxConnections', description: 'maxConnections number' },
					{ query: '$.tags[0]', description: 'first tag' },
					{ query: '$.tags[1]', description: 'second tag' },
					{ query: '$.price', description: 'price value' }
				];
				
				console.log('\n=== TESTING JSONPATH QUERIES ===');
				
				for (const testCase of testCases) {
					console.log(`\n>>> Testing: ${testCase.description} (${testCase.query})`);
					
					const matches = jsonpath.query(jsonData, testCase.query);
					if (matches && matches.length > 0) {
						const value = matches[0];
						console.log(`JSONPath result: ${JSON.stringify(value)}`);
						
						const detectedLine = findLineNumber(fileContent, value);
						console.log(`Detected line: ${detectedLine}`);
						
						// Verify the detected line
						if (detectedLine <= lines.length) {
							const actualLine = lines[detectedLine - 1];
							console.log(`Actual line content: "${actualLine}"`);
							
							// Check if the line actually contains our value
							let contains = false;
							if (typeof value === 'string') {
								contains = actualLine.includes(value) || actualLine.includes(`"${value}"`);
							} else {
								contains = actualLine.includes(String(value));
							}
							
							if (!contains) {
								console.log(`❌ INCONSISTENCY: Line ${detectedLine} does not contain "${value}"`);
							} else {
								console.log(`✅ CORRECT: Line ${detectedLine} contains "${value}"`);
							}
						} else {
							console.log(`❌ ERROR: Detected line ${detectedLine} is beyond file length`);
						}
					} else {
						console.log('No matches found for query');
					}
				}
			}
		}
	});
});
