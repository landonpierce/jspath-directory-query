// Debug line number detection without VSCode dependency
const fs = require('fs');
const path = require('path');
const jsonpath = require('jsonpath');

// Read the config file
const configPath = path.join(__dirname, 'test-data', 'config.json');
const fileContent = fs.readFileSync(configPath, 'utf-8');
const lines = fileContent.split('\n');

console.log('\n=== CONFIG FILE ANALYSIS ===');
console.log('Total lines:', lines.length);

// Print each line with line numbers for debugging
lines.forEach((line, index) => {
	console.log(`${String(index + 1).padStart(2)}: ${line}`);
});

function findStringValueLine(fileContent, stringValue) {
	const lines = fileContent.split('\n');
	
	function escapeRegex(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	
	// Try to find all occurrences and use context to pick the best one
	const candidates = [];
	
	// Pattern 1: As a property value: "key": "value"
	const propertyPattern = new RegExp(`"[^"]*":\\s*"${escapeRegex(stringValue)}"`, 'i');
	// Pattern 2: As an array element: "value"
	const arrayElementPattern = new RegExp(`\\[([^\\]]*"${escapeRegex(stringValue)}"[^\\]]*)\\]`, 'i');
	// Pattern 3: Simple quoted occurrence (fallback)
	const simplePattern = new RegExp(`"${escapeRegex(stringValue)}"`, 'i');
	
	console.log(`\n--- Finding string value: "${stringValue}" ---`);
	console.log('Property pattern:', propertyPattern.toString());
	console.log('Array pattern:', arrayElementPattern.toString());
	console.log('Simple pattern:', simplePattern.toString());
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		// Check for property value pattern (highest priority)
		if (propertyPattern.test(line)) {
			candidates.push({ line: i + 1, priority: 1, type: 'property', content: line });
			console.log(`Found property match on line ${i + 1}: "${line}"`);
		}
		// Check for array element pattern (medium priority)
		else if (arrayElementPattern.test(line)) {
			candidates.push({ line: i + 1, priority: 2, type: 'array', content: line });
			console.log(`Found array match on line ${i + 1}: "${line}"`);
		}
		// Check for simple pattern (lowest priority)
		else if (simplePattern.test(line)) {
			candidates.push({ line: i + 1, priority: 3, type: 'simple', content: line });
			console.log(`Found simple match on line ${i + 1}: "${line}"`);
		}
	}
	
	// Sort candidates by priority and return the best match
	if (candidates.length > 0) {
		candidates.sort((a, b) => a.priority - b.priority);
		console.log(`Selected best match: line ${candidates[0].line} (${candidates[0].type})`);
		return candidates[0].line;
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

function findPrimitiveValueLine(fileContent, value) {
	const lines = fileContent.split('\n');
	const valueStr = String(value);
	
	function escapeRegex(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	
	// For primitive values, we need to be more careful about context
	const candidates = [];
	
	// Pattern 1: As a property value: "key": value
	const propertyPattern = new RegExp(`"[^"]*":\\s*${escapeRegex(valueStr)}\\s*[,}\\]]`, 'i');
	// Pattern 2: As an array element: value
	const arrayElementPattern = new RegExp(`\\[([^\\]]*\\b${escapeRegex(valueStr)}\\b[^\\]]*)\\]`, 'i');
	// Pattern 3: Simple boundary match (fallback)
	const boundaryPattern = new RegExp(`\\b${escapeRegex(valueStr)}\\b`, 'i');
	
	console.log(`\n--- Finding primitive value: ${valueStr} ---`);
	console.log('Property pattern:', propertyPattern.toString());
	console.log('Array pattern:', arrayElementPattern.toString());
	console.log('Boundary pattern:', boundaryPattern.toString());
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		// Check for property value pattern (highest priority)
		if (propertyPattern.test(line)) {
			candidates.push({ line: i + 1, priority: 1, type: 'property', content: line });
			console.log(`Found property match on line ${i + 1}: "${line}"`);
		}
		// Check for array element pattern (medium priority)
		else if (arrayElementPattern.test(line)) {
			candidates.push({ line: i + 1, priority: 2, type: 'array', content: line });
			console.log(`Found array match on line ${i + 1}: "${line}"`);
		}
		// Check for boundary pattern (lowest priority, but avoid partial matches)
		else if (boundaryPattern.test(line)) {
			// Additional check: make sure it's not part of a larger number/string
			const beforeChar = line.charAt(line.search(boundaryPattern) - 1);
			const afterMatch = line.substring(line.search(boundaryPattern) + valueStr.length);
			const afterChar = afterMatch.charAt(0);
			
			// Check if it's truly a standalone value
			const isStandalone = (
				(beforeChar === ':' || beforeChar === '[' || beforeChar === ' ' || beforeChar === '\t') &&
				(afterChar === ',' || afterChar === '}' || afterChar === ']' || afterChar === ' ' || afterChar === '\t' || afterChar === '')
			);
			
			if (isStandalone) {
				candidates.push({ line: i + 1, priority: 3, type: 'boundary', content: line });
				console.log(`Found boundary match on line ${i + 1}: "${line}"`);
			} else {
				console.log(`Skipped partial match on line ${i + 1}: "${line}" (before: '${beforeChar}', after: '${afterChar}')`);
			}
		}
	}
	
	// Sort candidates by priority and return the best match
	if (candidates.length > 0) {
		candidates.sort((a, b) => a.priority - b.priority);
		console.log(`Selected best match: line ${candidates[0].line} (${candidates[0].type})`);
		return candidates[0].line;
	}
	
	console.log('No match found, returning 1');
	return 1;
}

function findLineNumber(fileContent, value) {
	try {
		if (typeof value === 'string') {
			return findStringValueLine(fileContent, value);
		}
		if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
			return findPrimitiveValueLine(fileContent, value);
		}
	} catch (error) {
		console.log(`Error finding line number for value: ${error}`);
	}
	return 1;
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
				
				// Find all lines that contain this value
				console.log('All lines containing this value:');
				lines.forEach((line, index) => {
					if (typeof value === 'string' && (line.includes(value) || line.includes(`"${value}"`))) {
						console.log(`  Line ${index + 1}: "${line}"`);
					} else if (typeof value !== 'string' && line.includes(String(value))) {
						console.log(`  Line ${index + 1}: "${line}"`);
					}
				});
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
