const http = require('http');

async function testValidation(payload, expectedStatus, description) {
    return new Promise((resolve) => {
        console.log(`Testing: ${description}`);
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            console.log(`  Expected ${expectedStatus}, got ${res.statusCode}`);
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('  Response:', body);
                if (res.statusCode === expectedStatus) {
                    console.log('  ✅ Pass');
                } else {
                    console.log('  ❌ Fail');
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('  Error:', error);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    // 1. Missing password
    await testValidation({ email: 'admin@medicare.com' }, 400, 'Missing password');
    
    // 2. Missing email
    await testValidation({ password: 'admin123' }, 400, 'Missing email');
    
    // 3. Both missing
    await testValidation({}, 400, 'Empty payload');
    
    // 4. Valid login (should still work)
    await testValidation({ email: 'admin@medicare.com', password: 'admin123' }, 200, 'Valid login');
    
    process.exit();
}

runTests();
