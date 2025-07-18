import * as path from 'path';
import * as fs from 'fs';

const jsonpath = require('jsonpath');

// Test the unified schema with common JSONPath queries
async function testUnifiedSchema() {
    console.log('🧪 Testing Unified Schema...\n');
    
    const testDataDir = path.join(__dirname, '..', 'test-data');
    const files = ['config.json', 'store.json', 'users.json'];
    
    // Common queries that should work across all files
    const commonQueries = [
        '$.metadata.fileName',
        '$.metadata.type', 
        '$.metadata.version',
        '$.data.*',
        '$.settings.*',
        '$.tags[*]',
        '$.price',
        '$..name'
    ];
    
    console.log('📋 Testing Common Schema Queries:');
    console.log('='.repeat(60));
    
    for (const query of commonQueries) {
        console.log(`\n🔍 Query: ${query}`);
        console.log('-'.repeat(40));
        
        let totalResults = 0;
        
        for (const fileName of files) {
            const filePath = path.join(testDataDir, fileName);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);
            
            const results = jsonpath.query(jsonData, query);
            totalResults += results.length;
            
            console.log(`  📄 ${fileName}: ${results.length} results`);
            if (results.length > 0) {
                // Show first result as example
                const sample = typeof results[0] === 'string' ? results[0] : JSON.stringify(results[0]);
                console.log(`    📌 Sample: ${sample.substring(0, 50)}${sample.length > 50 ? '...' : ''}`);
            }
        }
        
        console.log(`  🎯 Total across all files: ${totalResults} results`);
    }
    
    // Test file-specific queries
    console.log('\n\n📋 Testing File-Specific Queries:');
    console.log('='.repeat(60));
    
    const specificQueries = [
        { query: '$.data.app.name', description: 'App name from config' },
        { query: '$.data.books[*].title', description: 'Book titles from store' },
        { query: '$.data.users[*].name', description: 'User names from users' },
        { query: '$..department', description: 'All departments' },
        { query: '$.data.books[?(@.price > 10)]', description: 'Expensive books' },
        { query: '$.data.users[?(@.active == true)]', description: 'Active users' }
    ];
    
    for (const test of specificQueries) {
        console.log(`\n🔍 ${test.description}: ${test.query}`);
        console.log('-'.repeat(40));
        
        let totalResults = 0;
        
        for (const fileName of files) {
            const filePath = path.join(testDataDir, fileName);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);
            
            try {
                const results = jsonpath.query(jsonData, test.query);
                totalResults += results.length;
                
                if (results.length > 0) {
                    console.log(`  📄 ${fileName}: ${results.length} results`);
                    results.forEach((result: any, index: number) => {
                        const sample = typeof result === 'string' ? result : JSON.stringify(result);
                        console.log(`    ${index + 1}. ${sample.substring(0, 60)}${sample.length > 60 ? '...' : ''}`);
                    });
                } else {
                    console.log(`  📄 ${fileName}: No results`);
                }
            } catch (error: any) {
                console.log(`  📄 ${fileName}: Query error - ${error.message}`);
            }
        }
        
        console.log(`  🎯 Total: ${totalResults} results`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Unified Schema Testing Complete!');
    console.log('='.repeat(60));
}

if (require.main === module) {
    testUnifiedSchema().catch(console.error);
}

export { testUnifiedSchema };
