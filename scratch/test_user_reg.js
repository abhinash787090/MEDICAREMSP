const http = require('http');

async function testRegister() {
    const data = JSON.stringify({
        name: 'Abhinash Kumar',
        email: 'admin12@gamil.com',
        password: 'password',
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
