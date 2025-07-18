import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

// Test the updated search function with recursive capability
async function testNewFeatures() {
    console.log('🧪 Testing New Features...\n');
    
    const testDataDir = path.join(__dirname, '..', 'test-data');
    
    // Create nested directories for testing
    const nestedDir = path.join(testDataDir, 'level1');
    const deeperDir = path.join(nestedDir, 'level2');
    
    if (!fs.existsSync(nestedDir)) {
        fs.mkdirSync(nestedDir, { recursive: true });
    }
    if (!fs.existsSync(deeperDir)) {
        fs.mkdirSync(deeperDir, { recursive: true });
    }
    
    // Create test files
    const level1File = path.join(nestedDir, 'level1.json');
    const level2File = path.join(deeperDir, 'level2.json');
    
    const level1Data = {
        metadata: { fileName: 'level1.json', type: 'nested_level1' },
        data: { message: 'Hello from level 1', depth: 1 },
        tags: ['level1', 'nested'],
        price: 10.50
    };
    
    const level2Data = {
        metadata: { fileName: 'level2.json', type: 'nested_level2' },
        data: { message: 'Hello from level 2', depth: 2 },
        tags: ['level2', 'deep'],
        price: 20.75
    };
    
    fs.writeFileSync(level1File, JSON.stringify(level1Data, null, 2));
    fs.writeFileSync(level2File, JSON.stringify(level2Data, null, 2));
    
    console.log('📁 Created nested test structure:');
    console.log(`   ${level1File}`);
    console.log(`   ${level2File}`);
    
    // Test 1: Recursive search simulation
    console.log('\n🔍 Test 1: Recursive Search Simulation');
    console.log('='.repeat(50));
    
    async function searchJSONFilesRecursive(directory: string, jsonPathQuery: string, results: any[]): Promise<void> {
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
                                    matchedValue: match,
                                    lineNumber: 1
                                });
                            }
                        }
                    } catch (error) {
                        console.log(`Skipping file ${filePath}: ${error}`);
                    }
                }
            }
        } catch (error) {
            console.log(`Error reading directory ${directory}: ${error}`);
        }
    }
    
    // Test various queries
    const testQueries = [
        '$..message',
        '$.metadata.fileName',
        '$.tags[*]',
        '$..depth',
        '$.price'
    ];
    
    for (const query of testQueries) {
        console.log(`\n🔍 Query: ${query}`);
        console.log('-'.repeat(30));
        
        const results: any[] = [];
        await searchJSONFilesRecursive(testDataDir, query, results);
        
        console.log(`📊 Found ${results.length} results`);
        
        results.forEach((result, index) => {
            const relativePath = path.relative(testDataDir, result.filePath);
            const value = typeof result.matchedValue === 'string' 
                ? result.matchedValue 
                : JSON.stringify(result.matchedValue);
            console.log(`  ${index + 1}. ${relativePath}: ${value}`);
        });
        
        if (results.length === 0) {
            console.log('  No matches found');
        }
    }
    
    // Test 2: Large file query performance
    console.log('\n🚀 Test 2: Large File Query Performance');
    console.log('='.repeat(50));
    
    const largeFilePath = path.join(testDataDir, 'large-test.json');
    if (fs.existsSync(largeFilePath)) {
        const fileContent = fs.readFileSync(largeFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        const performanceQueries = [
            '$.data.users[*].name',
            '$.data.products[?(@.price > 500)]',
            '$..department',
            '$.data.transactions[?(@.status == "completed")]'
        ];
        
        for (const query of performanceQueries) {
            const startTime = performance.now();
            const results = jsonpath.query(jsonData, query);
            const endTime = performance.now();
            
            const queryTime = endTime - startTime;
            console.log(`⚡ ${query}`);
            console.log(`   Results: ${results.length}`);
            console.log(`   Time: ${queryTime.toFixed(2)}ms`);
        }
    } else {
        console.log('⚠️ Large test file not found. Run generate-large-test.js first.');
    }
    
    // Test 3: File count and distribution
    console.log('\n📊 Test 3: File Count and Distribution');
    console.log('='.repeat(50));
    
    function countJSONFiles(directory: string): { files: string[], totalCount: number } {
        const files: string[] = [];
        
        function countRecursive(dir: string) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    countRecursive(itemPath);
                } else if (stat.isFile() && path.extname(item).toLowerCase() === '.json') {
                    files.push(path.relative(testDataDir, itemPath));
                }
            }
        }
        
        countRecursive(directory);
        return { files, totalCount: files.length };
    }
    
    const fileInfo = countJSONFiles(testDataDir);
    console.log(`📄 Total JSON files found: ${fileInfo.totalCount}`);
    console.log('📋 File list:');
    fileInfo.files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
    });
    
    // Clean up
    fs.unlinkSync(level1File);
    fs.unlinkSync(level2File);
    fs.rmdirSync(deeperDir);
    fs.rmdirSync(nestedDir);
    
    console.log('\n✅ All new feature tests completed!');
}

if (require.main === module) {
    testNewFeatures().catch(console.error);
}

export { testNewFeatures };
