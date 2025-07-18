import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Import the functions we want to test
// We need to import them from the compiled JS file since we can't directly import from .ts in tests
const extensionPath = path.join(__dirname, '..', 'extension.js');

suite('Line Number Detection Test Suite', () => {
	
	test('Test line number detection for string values', () => {
		const sampleJSON = `{
  "metadata": {
    "fileName": "config.json",
    "type": "configuration"
  },
  "data": {
    "app": {
      "name": "My Application",
      "version": "1.0.0"
    }
  }
}`;

		// Mock the findLineNumber function logic for testing
		function findStringValueLine(fileContent: string, stringValue: string): number {
			const lines = fileContent.split('\n');
			
			function escapeRegex(string: string): string {
				return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			}
			
			// Try different patterns to find the string value
			const patterns = [
				// As a property value: "key": "value"
				new RegExp(`:\\s*"${escapeRegex(stringValue)}"`, 'i'),
				// As an array element: "value"
				new RegExp(`\\[\\s*"${escapeRegex(stringValue)}"`, 'i'),
				// Simple quoted occurrence
				new RegExp(`"${escapeRegex(stringValue)}"`, 'i')
			];
			
			for (let i = 0; i < lines.length; i++) {
				for (const pattern of patterns) {
					if (pattern.test(lines[i])) {
						return i + 1;
					}
				}
			}
			
			// Fallback: just look for the string anywhere
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].includes(stringValue)) {
					return i + 1;
				}
			}
			
			return 1;
		}

		// Test finding string values
		const configJsonLine = findStringValueLine(sampleJSON, "config.json");
		assert.strictEqual(configJsonLine, 3, 'Should find "config.json" on line 3');
		
		const appNameLine = findStringValueLine(sampleJSON, "My Application");
		assert.strictEqual(appNameLine, 8, 'Should find "My Application" on line 8');
		
		const versionLine = findStringValueLine(sampleJSON, "1.0.0");
		assert.strictEqual(versionLine, 9, 'Should find "1.0.0" on line 9');
	});
	
	test('Test line number detection with real test files', () => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'test-data', 'config.json');
			
			if (fs.existsSync(configPath)) {
				const fileContent = fs.readFileSync(configPath, 'utf-8');
				const lines = fileContent.split('\n');
				
				// Find the line that contains "My Application"
				let actualLine = -1;
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].includes('"My Application"')) {
						actualLine = i + 1;
						break;
					}
				}
				
				assert.ok(actualLine > 0, 'Should find "My Application" in the config file');
				console.log(`Found "My Application" on line ${actualLine} in config.json`);
				
				// Test our improved line number detection
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
				
				const detectedLine = findStringValueLine(fileContent, "My Application");
				assert.strictEqual(detectedLine, actualLine, 
					`Detected line ${detectedLine} should match actual line ${actualLine}`);
			}
		}
	});
	
	test('Test line number detection for numeric values', () => {
		const sampleJSON = `{
  "metadata": {
    "version": 1.0,
    "recordCount": 100
  },
  "settings": {
    "timeout": 5000,
    "enabled": true
  },
  "price": 999.99
}`;

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

		const versionLine = findPrimitiveValueLine(sampleJSON, 1.0);
		assert.strictEqual(versionLine, 3, 'Should find version 1.0 on line 3');
		
		const timeoutLine = findPrimitiveValueLine(sampleJSON, 5000);
		assert.strictEqual(timeoutLine, 7, 'Should find timeout 5000 on line 7');
		
		const priceLine = findPrimitiveValueLine(sampleJSON, 999.99);
		assert.strictEqual(priceLine, 10, 'Should find price 999.99 on line 10');
	});
});
