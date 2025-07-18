// Generator for creating a large JSON test file
import * as fs from 'fs';
import * as path from 'path';

function generateLargeJSON(targetLines: number = 25000): any {
    const data = {
        metadata: {
            fileName: "large-test.json",
            type: "large_dataset",
            version: "1.0",
            lastModified: "2025-01-17",
            recordCount: 0,
            generatedAt: new Date().toISOString()
        },
        data: {
            users: [] as any[],
            transactions: [] as any[],
            products: [] as any[],
            orders: [] as any[]
        },
        settings: {
            batchSize: 1000,
            compressionEnabled: true,
            encryptionLevel: "AES256"
        },
        tags: ["large", "test", "performance", "benchmark"],
        price: 999.99
    };

    // Calculate rough scaling factor based on target lines
    // Current base generates ~5000 lines, so scale accordingly
    const scaleFactor = Math.max(1, Math.floor(targetLines / 5000));

    // Generate users
    const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    const roles = ["manager", "developer", "analyst", "coordinator", "specialist"];
    const statuses = ["active", "inactive", "pending"];
    
    for (let i = 1; i <= 500 * scaleFactor; i++) {
        data.data.users.push({
            id: i,
            name: `User ${i}`,
            email: `user${i}@company.com`,
            department: departments[i % departments.length],
            role: roles[i % roles.length],
            status: statuses[i % statuses.length],
            salary: Math.floor(Math.random() * 100000) + 40000,
            joinDate: `202${(i % 5)}-0${(i % 9) + 1}-${(i % 28) + 1}`,
            active: i % 3 !== 0,
            permissions: {
                read: true,
                write: i % 2 === 0,
                admin: i % 10 === 0
            },
            profile: {
                age: 25 + (i % 40),
                location: `City ${i % 50}`,
                timezone: `UTC${(i % 24) - 12}`
            }
        });
    }

    // Generate products
    const categories = ["Electronics", "Books", "Clothing", "Home", "Sports", "Toys"];
    for (let i = 1; i <= 200 * scaleFactor; i++) {
        data.data.products.push({
            id: i,
            name: `Product ${i}`,
            category: categories[i % categories.length],
            price: Math.floor(Math.random() * 1000) + 10,
            inStock: i % 4 !== 0,
            rating: Math.floor(Math.random() * 5) + 1,
            reviews: Math.floor(Math.random() * 1000),
            description: `This is a detailed description for product ${i}. It has many features and benefits that make it unique.`,
            specifications: {
                weight: `${Math.floor(Math.random() * 10) + 1}kg`,
                dimensions: `${10 + (i % 50)}x${10 + (i % 30)}x${5 + (i % 20)}cm`,
                warranty: `${1 + (i % 3)} years`
            },
            tags: [`tag${i % 10}`, `category${i % 5}`, `feature${i % 15}`]
        });
    }

    // Generate transactions
    for (let i = 1; i <= 1000 * scaleFactor; i++) {
        data.data.transactions.push({
            id: i,
            userId: 1 + (i % 500),
            productId: 1 + (i % 200),
            amount: Math.floor(Math.random() * 500) + 10,
            currency: ["USD", "EUR", "GBP", "JPY"][i % 4],
            status: ["completed", "pending", "failed", "refunded"][i % 4],
            timestamp: `2025-01-${String((i % 28) + 1).padStart(2, '0')}T${String((i % 24)).padStart(2, '0')}:${String((i % 60)).padStart(2, '0')}:${String((i % 60)).padStart(2, '0')}Z`,
            paymentMethod: ["credit_card", "debit_card", "paypal", "bank_transfer"][i % 4],
            metadata: {
                ip: `192.168.${i % 255}.${(i * 7) % 255}`,
                userAgent: `Browser/${i % 10}.0`,
                sessionId: `session_${i}_${Date.now()}`
            }
        });
    }

    // Generate orders
    for (let i = 1; i <= 300 * scaleFactor; i++) {
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const items = [];
        for (let j = 0; j < itemCount; j++) {
            items.push({
                productId: 1 + ((i + j) % 200),
                quantity: Math.floor(Math.random() * 5) + 1,
                price: Math.floor(Math.random() * 100) + 10
            });
        }

        data.data.orders.push({
            id: i,
            userId: 1 + (i % 500),
            items: items,
            totalAmount: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            status: ["pending", "processing", "shipped", "delivered", "cancelled"][i % 5],
            orderDate: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
            shippingAddress: {
                street: `${i} Main Street`,
                city: `City ${i % 50}`,
                state: `State ${i % 50}`,
                zipCode: `${10000 + (i % 90000)}`,
                country: ["USA", "Canada", "UK", "Germany", "France"][i % 5]
            },
            trackingNumber: `TRACK${String(i).padStart(6, '0')}`
        });
    }

    // Update record count
    data.metadata.recordCount = data.data.users.length + data.data.products.length + 
                               data.data.transactions.length + data.data.orders.length;

    return data;
}

function createLargeTestFile(): void {
    const testDataDir = path.join(__dirname, '..', 'test-data');
    const filePath = path.join(testDataDir, 'large-test.json');
    
    console.log('🏗️ Generating large test JSON file...');
    const data = generateLargeJSON(25000);
    
    const jsonString = JSON.stringify(data, null, 2);
    const lineCount = jsonString.split('\n').length;
    
    console.log(`📊 Generated JSON with ${lineCount} lines`);
    console.log(`📋 Records: ${data.metadata.recordCount}`);
    console.log(`💾 Size: ${Math.round(jsonString.length / 1024)} KB`);
    
    fs.writeFileSync(filePath, jsonString);
    console.log(`✅ Large test file created: ${filePath}`);
}

if (require.main === module) {
    createLargeTestFile();
}

export { generateLargeJSON, createLargeTestFile };
