const http = require('http');

async function testRegister() {
    const data = JSON.stringify({
        name: 'New Tester',
        email: `tester_${Date.now()}@example.com`,
        password: 'password123',
        role: 'Admin'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Response:', body);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
}

testRegister();
