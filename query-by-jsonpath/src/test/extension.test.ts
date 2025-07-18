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
			const expectedFiles = ['config.json', 'store.json', 'users.json'];
			for (const file of expectedFiles) {
				const filePath = path.join(testDataDir, file);
				assert.ok(fs.existsSync(filePath), `File ${file} should exist`);
				
				// Verify it's valid JSON
				const content = fs.readFileSync(filePath, 'utf-8');
				assert.doesNotThrow(() => JSON.parse(content), `${file} should be valid JSON`);
			}
		}
	});

	test('JSONPath queries on test data', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'test-data', 'config.json');
			const configContent = fs.readFileSync(configPath, 'utf-8');
			const configData = JSON.parse(configContent);
			
			// Test specific queries
			const appNameResult = jsonpath.query(configData, '$.config.app.name');
			assert.strictEqual(appNameResult.length, 1);
			assert.strictEqual(appNameResult[0], 'My Application');
			
			const featuresResult = jsonpath.query(configData, '$.config.features.*');
			assert.ok(featuresResult.length > 0, 'Should find feature values');
			
			const usersPath = path.join(workspaceRoot, 'test-data', 'users.json');
			const usersContent = fs.readFileSync(usersPath, 'utf-8');
			const usersData = JSON.parse(usersContent);
			
			const userNamesResult = jsonpath.query(usersData, '$.users[*].name');
			assert.strictEqual(userNamesResult.length, 3);
			assert.ok(userNamesResult.includes('John Doe'));
			assert.ok(userNamesResult.includes('Jane Smith'));
			assert.ok(userNamesResult.includes('Bob Johnson'));
		}
	});

	test('Extension command is registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('query-by-jsonpath.queryFiles'), 'Command should be registered');
	});
});
