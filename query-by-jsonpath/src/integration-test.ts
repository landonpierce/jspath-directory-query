import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

// Test the actual search function logic
function testSearchJSONFiles(directory: string, jsonPathQuery: string) {
    console.log(`🔍 Testing search in directory: ${directory}`);
    console.log(`📋 Query: ${jsonPathQuery}`);
    
    const results: any[] = [];
    
    try {
        const files = fs.readdirSync(directory);
        console.log(`📁 Found files: ${files.join(', ')}`);
        
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
                console.log(`\n🔍 Processing: ${file}`);
                
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const jsonData = JSON.parse(fileContent);
                    
                    const matches = jsonpath.query(jsonData, jsonPathQuery);
                    console.log(`  ✅ Matches found: ${matches.length}`);
                    
                    if (matches && matches.length > 0) {
                        for (const match of matches) {
                            const lineNumber = findLineNumber(fileContent, match);
                            results.push({
                                filePath: filePath,
                                matchedValue: match,
                                lineNumber: lineNumber
                            });
                            console.log(`  📍 Match: ${JSON.stringify(match)} (line ${lineNumber})`);
                        }
                    }
                } catch (error) {
                    console.log(`  ❌ Error processing ${file}: ${error}`);
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error reading directory: ${error}`);
    }
    
    console.log(`\n🎉 Total results: ${results.length}`);
    return results;
}

function findLineNumber(fileContent: string, value: any): number {
    try {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const lines = fileContent.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(valueStr)) {
                return i + 1;
            }
        }
    } catch (error) {
        // If we can't find the line number, return 1
    }
    
    return 1;
}

// Run tests with different queries
async function runIntegrationTests() {
    const testDataDir = path.join(__dirname, '..', 'test-data');
    
    console.log('🧪 Running Integration Tests...\n');
    
    const testCases = [
        '$.config.app.name',
        '$.users[*].name', 
        '$.store.book[*].title',
        '$..department',
        '$.config.features.*',
        '$..price'
    ];
    
    for (const query of testCases) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🧪 Test Case: ${query}`);
        console.log(`${'='.repeat(50)}`);
        
        const results = testSearchJSONFiles(testDataDir, query);
        
        if (results.length > 0) {
            console.log('✅ SUCCESS - Found results!');
        } else {
            console.log('⚠️ No results found for this query');
        }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('🎉 Integration tests completed!');
    console.log(`${'='.repeat(50)}`);
}

if (require.main === module) {
    runIntegrationTests().catch(console.error);
}

export { testSearchJSONFiles };
