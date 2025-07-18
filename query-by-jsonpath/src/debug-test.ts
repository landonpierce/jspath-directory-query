import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

// Create a simple test to debug JSONPath functionality
async function testJSONPathQueries() {
    console.log('🧪 Starting JSONPath debugging tests...');

    // Test 1: Basic JSONPath functionality
    const testData = {
        config: {
            app: {
                name: "My Application",
                version: "1.2.3"
            },
            features: {
                feature1: true,
                feature2: false
            }
        }
    };

    console.log('\n📋 Test data:', JSON.stringify(testData, null, 2));

    // Test different JSONPath expressions
    const queries = [
        '$.config.app.name',
        '$.config.app.*',
        '$.config.features.*',
        '$..name',
        '$.config.*'
    ];

    for (const query of queries) {
        try {
            const result = jsonpath.query(testData, query);
            console.log(`\n🔍 Query: ${query}`);
            console.log(`✅ Result:`, result);
            console.log(`📊 Count: ${result.length}`);
        } catch (error) {
            console.log(`\n🔍 Query: ${query}`);
            console.log(`❌ Error:`, error);
        }
    }

    // Test 2: Read actual test files
    const testDataDir = path.join(__dirname, '..', 'test-data');
    console.log(`\n📁 Test data directory: ${testDataDir}`);
    
    if (fs.existsSync(testDataDir)) {
        const files = fs.readdirSync(testDataDir);
        console.log(`📋 Files found: ${files.join(', ')}`);

        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.json') {
                const filePath = path.join(testDataDir, file);
                console.log(`\n📄 Testing file: ${file}`);
                
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const jsonData = JSON.parse(fileContent);
                    
                    console.log(`🗂️ File structure:`, Object.keys(jsonData));
                    
                    // Test common queries on this file
                    const testQueries = ['$.*', '$..name', '$..title'];
                    
                    for (const query of testQueries) {
                        try {
                            const result = jsonpath.query(jsonData, query);
                            if (result.length > 0) {
                                console.log(`  ✅ ${query}: ${result.length} results - ${JSON.stringify(result[0])}`);
                            } else {
                                console.log(`  ⚠️ ${query}: No results`);
                            }
                        } catch (queryError) {
                            console.log(`  ❌ ${query}: Error - ${queryError}`);
                        }
                    }
                } catch (fileError) {
                    console.log(`❌ Error reading ${file}: ${fileError}`);
                }
            }
        }
    } else {
        console.log(`❌ Test data directory not found: ${testDataDir}`);
    }
}

// Test 3: Test the actual search function
async function testSearchFunction() {
    console.log('\n🔧 Testing search function...');
    
    // Import our search function (we'll need to export it first)
    // For now, let's recreate the logic here to test it
    
    const testDirectory = path.join(__dirname, '..', 'test-data');
    const testQuery = '$.config.app.name';
    
    console.log(`🎯 Testing search in: ${testDirectory}`);
    console.log(`🔍 Using query: ${testQuery}`);
    
    const results: any[] = [];
    
    try {
        const files = fs.readdirSync(testDirectory);
        console.log(`📋 Files in directory: ${files.join(', ')}`);
        
        for (const file of files) {
            const filePath = path.join(testDirectory, file);
            const stat = fs.statSync(filePath);
            
            console.log(`📄 Checking file: ${file}`);
            console.log(`  📊 Is file: ${stat.isFile()}`);
            console.log(`  📂 Extension: ${path.extname(file).toLowerCase()}`);
            
            if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
                console.log(`  ✅ Processing JSON file: ${file}`);
                
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    console.log(`  📖 File content length: ${fileContent.length}`);
                    
                    const jsonData = JSON.parse(fileContent);
                    console.log(`  🗂️ Parsed JSON keys: ${Object.keys(jsonData).join(', ')}`);
                    
                    const matches = jsonpath.query(jsonData, testQuery);
                    console.log(`  🎯 Query matches: ${matches.length}`);
                    console.log(`  📋 Match values:`, matches);
                    
                    if (matches && matches.length > 0) {
                        for (const match of matches) {
                            results.push({
                                filePath: filePath,
                                matchedValue: match,
                                lineNumber: 1 // simplified for testing
                            });
                        }
                    }
                } catch (error) {
                    console.log(`  ❌ Error processing ${file}: ${error}`);
                }
            } else {
                console.log(`  ⏭️ Skipping non-JSON file: ${file}`);
            }
        }
    } catch (error) {
        console.log(`❌ Error reading directory: ${error}`);
    }
    
    console.log(`\n🎉 Final results: ${results.length} matches found`);
    results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${path.basename(result.filePath)}: ${JSON.stringify(result.matchedValue)}`);
    });
}

// Run the tests
if (require.main === module) {
    testJSONPathQueries()
        .then(() => testSearchFunction())
        .then(() => console.log('\n✅ All tests completed'))
        .catch(error => console.log('\n❌ Test failed:', error));
}

export { testJSONPathQueries, testSearchFunction };
