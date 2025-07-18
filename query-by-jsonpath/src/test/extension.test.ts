import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('JSONPath library functionality', () => {
		const testData = {
			config: {
				app: {
					name: "Test Application",
					version: "1.0.0"
				}
			}
		};

		const result = jsonpath.query(testData, '$.config.app.name');
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0], "Test Application");
	});

	test('Test data files exist', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const testDataDir = path.join(workspaceRoot, 'test-data');
			
			// Check if test data directory exists
			assert.ok(fs.existsSync(testDataDir), 'Test data directory should exist');
			
			// Check for JSON files
			const expectedFiles = ['config.json', 'store.json', 'users.json', 'large-test.json'];
			for (const file of expectedFiles) {
				const filePath = path.join(testDataDir, file);
				assert.ok(fs.existsSync(filePath), `File ${file} should exist`);
				
				// Verify it's valid JSON
				const content = fs.readFileSync(filePath, 'utf-8');
				assert.doesNotThrow(() => JSON.parse(content), `${file} should be valid JSON`);
			}
		}
	});

	test('Large file performance test', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const largeFilePath = path.join(workspaceRoot, 'test-data', 'large-test.json');
			
			// Ensure large file exists
			assert.ok(fs.existsSync(largeFilePath), 'Large test file should exist');
			
			const startTime = performance.now();
			const fileContent = fs.readFileSync(largeFilePath, 'utf-8');
			const endTime = performance.now();
			
			// Performance assertions
			const readTime = endTime - startTime;
			assert.ok(readTime < 1000, 'Large file should read within 1 second');
			
			const lineCount = fileContent.split('\n').length;
			assert.ok(lineCount > 5000, 'Large file should have more than 5000 lines');
			
			// Test JSON parsing
			const parseStartTime = performance.now();
			const jsonData = JSON.parse(fileContent);
			const parseEndTime = performance.now();
			
			const parseTime = parseEndTime - parseStartTime;
			assert.ok(parseTime < 2000, 'Large file JSON parsing should complete within 2 seconds');
			
			// Test JSONPath queries on large data
			const queryStartTime = performance.now();
			const userNames = jsonpath.query(jsonData, '$.data.users[*].name');
			const queryEndTime = performance.now();
			
			const queryTime = queryEndTime - queryStartTime;
			assert.ok(queryTime < 100, 'JSONPath query on large data should complete within 100ms');
			assert.strictEqual(userNames.length, 500, 'Should find 500 user names in large file');
		}
	});

	test('JSONPath queries on unified schema', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'test-data', 'config.json');
			const configContent = fs.readFileSync(configPath, 'utf-8');
			const configData = JSON.parse(configContent);
			
			// Test unified schema queries
			const metadataFileName = jsonpath.query(configData, '$.metadata.fileName');
			assert.strictEqual(metadataFileName.length, 1);
			assert.strictEqual(metadataFileName[0], 'config.json');
			
			const dataApp = jsonpath.query(configData, '$.data.app.name');
			assert.strictEqual(dataApp.length, 1);
			assert.strictEqual(dataApp[0], 'My Application');
			
			const tags = jsonpath.query(configData, '$.tags[*]');
			assert.ok(tags.length > 0, 'Should find tags in config file');
			
			const usersPath = path.join(workspaceRoot, 'test-data', 'users.json');
			const usersContent = fs.readFileSync(usersPath, 'utf-8');
			const usersData = JSON.parse(usersContent);
			
			const userNamesResult = jsonpath.query(usersData, '$.data.users[*].name');
			assert.strictEqual(userNamesResult.length, 3);
			assert.ok(userNamesResult.includes('John Doe'));
			assert.ok(userNamesResult.includes('Jane Smith'));
			assert.ok(userNamesResult.includes('Bob Johnson'));
			
			// Test conditional queries
			const activeUsers = jsonpath.query(usersData, '$.data.users[?(@.active == true)]');
			assert.ok(activeUsers.length > 0, 'Should find active users');
		}
	});

	test('Recursive search simulation', () => {
		// This test simulates the recursive search functionality
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const testDataDir = path.join(workspaceRoot, 'test-data');
			
			function searchRecursiveSync(directory: string, query: string): any[] {
				const results: any[] = [];
				const files = fs.readdirSync(directory);
				
				for (const file of files) {
					const filePath = path.join(directory, file);
					const stat = fs.statSync(filePath);
					
					if (stat.isDirectory()) {
						results.push(...searchRecursiveSync(filePath, query));
					} else if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
						try {
							const fileContent = fs.readFileSync(filePath, 'utf-8');
							const jsonData = JSON.parse(fileContent);
							const matches = jsonpath.query(jsonData, query);
							
							for (const match of matches) {
								results.push({
									filePath: filePath,
									matchedValue: match
								});
							}
						} catch (error) {
							// Ignore parse errors for this test
						}
					}
				}
				
				return results;
			}
			
			// Test recursive search for names
			const nameResults = searchRecursiveSync(testDataDir, '$..name');
			assert.ok(nameResults.length > 0, 'Should find name values across all files');
			
			// Test recursive search for prices
			const priceResults = searchRecursiveSync(testDataDir, '$..price');
			assert.ok(priceResults.length > 0, 'Should find price values across all files');
		}
	});

	test('Extension commands are registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('query-by-jsonpath.queryFiles'), 'queryFiles command should be registered');
		assert.ok(commands.includes('query-by-jsonpath.queryWorkspace'), 'queryWorkspace command should be registered');
	});
});
