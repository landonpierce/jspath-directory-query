import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const jsonpath = require('jsonpath');

suite('Extension Integration Test Suite', () => {
	
	test('Test complete workflow with line number detection', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'test-data', 'config.json');
			
			if (fs.existsSync(configPath)) {
				const fileContent = fs.readFileSync(configPath, 'utf-8');
				console.log('Config file content:');
				console.log(fileContent);
				
				// Parse the JSON
				const jsonData = JSON.parse(fileContent);
				
				// Execute a JSONPath query
				const appNameQuery = '$.data.app.name';
				const matches = jsonpath.query(jsonData, appNameQuery);
				
				assert.ok(matches.length > 0, 'Should find app name');
				console.log(`Found matches:`, matches);
				
				// Test our improved findLineNumber function
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
					
					for (let i = 0; i < lines.length; i++) {
						for (const pattern of patterns) {
							if (pattern.test(lines[i])) {
								return i + 1;
							}
						}
					}
					
					for (let i = 0; i < lines.length; i++) {
						if (lines[i].includes(stringValue)) {
							return i + 1;
						}
					}
					
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
					
					for (let i = 0; i < lines.length; i++) {
						for (const pattern of patterns) {
							if (pattern.test(lines[i])) {
								return i + 1;
							}
						}
					}
					
					return 1;
				}

				function findObjectLine(fileContent: string, obj: any): number {
					const lines = fileContent.split('\n');
					
					try {
						if (obj && typeof obj === 'object') {
							if (Array.isArray(obj)) {
								for (let i = 0; i < lines.length; i++) {
									if (lines[i].includes('[') && obj.length > 0) {
										const firstElement = obj[0];
										if (typeof firstElement === 'string') {
											const searchResult = findStringValueLine(fileContent.substring(lines.slice(0, i).join('\n').length), firstElement);
											if (searchResult > 1) {
												return i + searchResult;
											}
										}
									}
								}
							} else {
								const keys = Object.keys(obj);
								if (keys.length > 0) {
									const firstKey = keys[0];
									const firstValue = obj[firstKey];
									
									for (let i = 0; i < lines.length; i++) {
										if (lines[i].includes(`"${firstKey}"`)) {
											return i + 1;
										}
									}
									
									if (typeof firstValue === 'string') {
										return findStringValueLine(fileContent, firstValue);
									} else if (typeof firstValue === 'number' || typeof firstValue === 'boolean') {
										return findPrimitiveValueLine(fileContent, firstValue);
									}
								}
							}
						}
						
						const objStr = JSON.stringify(obj);
						if (objStr.length > 10) {
							const searchStr = objStr.substring(0, Math.min(50, objStr.length));
							for (let i = 0; i < lines.length; i++) {
								if (lines[i].includes(searchStr.substring(1, searchStr.length - 1))) {
									return i + 1;
								}
							}
						}
						
					} catch (error) {
						console.log(`Error processing object for line number: ${error}`);
					}
					
					return 1;
				}
				
				// Test line number detection for each match
				for (const match of matches) {
					const lineNumber = findLineNumber(fileContent, match);
					console.log(`Match "${match}" found on line ${lineNumber}`);
					assert.ok(lineNumber >= 1, 'Line number should be at least 1');
					
					// Verify the line actually contains something related to our match
					const lines = fileContent.split('\n');
					const actualLine = lines[lineNumber - 1];
					console.log(`Actual line ${lineNumber}: "${actualLine}"`);
					
					// For string values, the line should contain the value
					if (typeof match === 'string') {
						assert.ok(actualLine.includes(match) || actualLine.includes(`"${match}"`), 
							`Line ${lineNumber} should contain "${match}"`);
					}
				}
			}
		}
	});
});
