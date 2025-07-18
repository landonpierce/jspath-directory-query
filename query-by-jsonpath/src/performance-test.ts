import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

// Performance and large file tests
async function testLargeFilePerformance() {
    console.log('🚀 Starting Large File Performance Tests...\n');
    
    const testDataDir = path.join(__dirname, '..', 'test-data');
    const largeFilePath = path.join(testDataDir, 'large-test.json');
    
    // Ensure the large file exists
    if (!fs.existsSync(largeFilePath)) {
        throw new Error('Large test file not found. Run generate-large-test.js first.');
    }
    
    const fileStats = fs.statSync(largeFilePath);
    console.log(`📄 Large file stats:`);
    console.log(`   Size: ${Math.round(fileStats.size / 1024)} KB`);
    console.log(`   Path: ${largeFilePath}`);
    
    // Test 1: File reading performance
    console.log('\n🧪 Test 1: File Reading Performance');
    console.log('-'.repeat(40));
    
    const readStartTime = performance.now();
    const fileContent = fs.readFileSync(largeFilePath, 'utf-8');
    const readEndTime = performance.now();
    const readTime = readEndTime - readStartTime;
    
    const lineCount = fileContent.split('\n').length;
    console.log(`✅ Read ${lineCount} lines in ${readTime.toFixed(2)}ms`);
    
    // Test 2: JSON parsing performance
    console.log('\n🧪 Test 2: JSON Parsing Performance');
    console.log('-'.repeat(40));
    
    const parseStartTime = performance.now();
    const jsonData = JSON.parse(fileContent);
    const parseEndTime = performance.now();
    const parseTime = parseEndTime - parseStartTime;
    
    console.log(`✅ Parsed JSON in ${parseTime.toFixed(2)}ms`);
    console.log(`📊 Record count: ${jsonData.metadata.recordCount}`);
    
    // Test 3: JSONPath query performance on large dataset
    console.log('\n🧪 Test 3: JSONPath Query Performance');
    console.log('-'.repeat(40));
    
    const testQueries = [
        { query: '$.metadata.*', description: 'Simple metadata query' },
        { query: '$.data.users[*].name', description: 'All user names (500 items)' },
        { query: '$.data.products[*].price', description: 'All product prices (200 items)' },
        { query: '$.data.transactions[*].amount', description: 'All transaction amounts (1000 items)' },
        { query: '$..department', description: 'All departments (recursive search)' },
        { query: '$.data.users[?(@.active == true)]', description: 'Active users (conditional)' },
        { query: '$.data.products[?(@.price > 500)]', description: 'Expensive products (conditional)' },
        { query: '$.data.transactions[?(@.status == "completed")]', description: 'Completed transactions (conditional)' }
    ];
    
    const performanceResults = [];
    
    for (const test of testQueries) {
        const queryStartTime = performance.now();
        const results = jsonpath.query(jsonData, test.query);
        const queryEndTime = performance.now();
        const queryTime = queryEndTime - queryStartTime;
        
        performanceResults.push({
            query: test.query,
            description: test.description,
            resultCount: results.length,
            timeMs: queryTime
        });
        
        console.log(`  📋 ${test.description}`);
        console.log(`     Query: ${test.query}`);
        console.log(`     Results: ${results.length}`);
        console.log(`     Time: ${queryTime.toFixed(2)}ms`);
        
        // Basic validation
        if (test.query === '$.data.users[*].name') {
            assert.strictEqual(results.length, 500, 'Should find 500 user names');
        }
        if (test.query === '$.data.products[*].price') {
            assert.strictEqual(results.length, 200, 'Should find 200 product prices');
        }
        if (test.query === '$.data.transactions[*].amount') {
            assert.strictEqual(results.length, 1000, 'Should find 1000 transaction amounts');
        }
        
        console.log('');
    }
    
    // Test 4: Memory usage assessment
    console.log('🧪 Test 4: Memory Usage Assessment');
    console.log('-'.repeat(40));
    
    const memoryBefore = process.memoryUsage();
    
    // Perform multiple queries to test memory stability
    for (let i = 0; i < 10; i++) {
        jsonpath.query(jsonData, '$.data.users[*].name');
        jsonpath.query(jsonData, '$.data.products[*].price');
        jsonpath.query(jsonData, '$..department');
    }
    
    const memoryAfter = process.memoryUsage();
    
    console.log(`📊 Memory usage before: ${Math.round(memoryBefore.heapUsed / 1024 / 1024)}MB`);
    console.log(`📊 Memory usage after: ${Math.round(memoryAfter.heapUsed / 1024 / 1024)}MB`);
    console.log(`📊 Memory diff: ${Math.round((memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024)}MB`);
    
    // Test 5: Performance benchmarks
    console.log('\n🧪 Test 5: Performance Benchmarks');
    console.log('-'.repeat(40));
    
    const totalTime = readTime + parseTime;
    console.log(`⏱️ Total file processing time: ${totalTime.toFixed(2)}ms`);
    console.log(`📈 Lines per second: ${Math.round(lineCount / (totalTime / 1000))}`);
    console.log(`📈 KB per second: ${Math.round((fileStats.size / 1024) / (totalTime / 1000))}`);
    
    const avgQueryTime = performanceResults.reduce((sum, result) => sum + result.timeMs, 0) / performanceResults.length;
    console.log(`📈 Average query time: ${avgQueryTime.toFixed(2)}ms`);
    
    // Performance assertions
    assert.ok(readTime < 1000, 'File reading should complete within 1 second');
    assert.ok(parseTime < 2000, 'JSON parsing should complete within 2 seconds');
    assert.ok(avgQueryTime < 100, 'Average query time should be under 100ms');
    
    console.log('\n✅ All large file performance tests passed!');
    
    return {
        fileSize: fileStats.size,
        lineCount,
        readTime,
        parseTime,
        performanceResults,
        totalTime,
        avgQueryTime
    };
}

// Test recursive search functionality
async function testRecursiveSearch() {
    console.log('\n🔄 Testing Recursive Search Functionality...\n');
    
    const testDataDir = path.join(__dirname, '..', 'test-data');
    
    // Create a nested directory structure for testing
    const nestedDir = path.join(testDataDir, 'nested');
    const deepDir = path.join(nestedDir, 'deep');
    
    // Ensure directories exist
    if (!fs.existsSync(nestedDir)) {
        fs.mkdirSync(nestedDir, { recursive: true });
    }
    if (!fs.existsSync(deepDir)) {
        fs.mkdirSync(deepDir, { recursive: true });
    }
    
    // Create test files in nested directories
    const nestedFile = path.join(nestedDir, 'nested.json');
    const deepFile = path.join(deepDir, 'deep.json');
    
    const nestedData = {
        metadata: { fileName: 'nested.json', type: 'nested_test' },
        data: { message: 'Hello from nested directory' },
        level: 1
    };
    
    const deepData = {
        metadata: { fileName: 'deep.json', type: 'deep_test' },
        data: { message: 'Hello from deep directory' },
        level: 2
    };
    
    fs.writeFileSync(nestedFile, JSON.stringify(nestedData, null, 2));
    fs.writeFileSync(deepFile, JSON.stringify(deepData, null, 2));
    
    console.log('📁 Created nested test structure:');
    console.log(`   ${nestedFile}`);
    console.log(`   ${deepFile}`);
    
    // Test recursive search (simulate the extension's search function)
    const results: any[] = [];
    
    async function searchRecursive(directory: string, query: string): Promise<void> {
        const files = fs.readdirSync(directory);
        
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                await searchRecursive(filePath, query);
            } else if (stat.isFile() && path.extname(file).toLowerCase() === '.json') {
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const jsonData = JSON.parse(fileContent);
                    const matches = jsonpath.query(jsonData, query);
                    
                    if (matches && matches.length > 0) {
                        for (const match of matches) {
                            results.push({
                                filePath: filePath,
                                matchedValue: match,
                                lineNumber: 1
                            });
                        }
                    }
                } catch (error) {
                    console.log(`Error processing ${filePath}: ${error}`);
                }
            }
        }
    }
    
    await searchRecursive(testDataDir, '$..message');
    
    console.log(`\n🔍 Recursive search results for '$..message':`);
    console.log(`   Found ${results.length} matches`);
    
    const expectedMessages = ['Hello from nested directory', 'Hello from deep directory'];
    const foundMessages = results.map(r => r.matchedValue);
    
    for (const expectedMessage of expectedMessages) {
        assert.ok(foundMessages.includes(expectedMessage), `Should find message: ${expectedMessage}`);
    }
    
    console.log('✅ Recursive search test passed!');
    
    // Clean up
    fs.unlinkSync(nestedFile);
    fs.unlinkSync(deepFile);
    fs.rmdirSync(deepDir);
    fs.rmdirSync(nestedDir);
    
    return results;
}

// Main test runner
async function runAllTests() {
    console.log('🧪 Running All Enhanced Tests...\n');
    console.log('='.repeat(60));
    
    try {
        const performanceResults = await testLargeFilePerformance();
        const recursiveResults = await testRecursiveSearch();
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests completed successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Summary:');
        console.log(`   Large file size: ${Math.round(performanceResults.fileSize / 1024)} KB`);
        console.log(`   Lines processed: ${performanceResults.lineCount}`);
        console.log(`   Total processing time: ${performanceResults.totalTime.toFixed(2)}ms`);
        console.log(`   Average query time: ${performanceResults.avgQueryTime.toFixed(2)}ms`);
        console.log(`   Recursive search matches: ${recursiveResults.length}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runAllTests().catch(console.error);
}

export { testLargeFilePerformance, testRecursiveSearch };
