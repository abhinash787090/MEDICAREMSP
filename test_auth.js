const http = require('http');

async function request(path, method, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      host: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(opts, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: resBody }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log('--- Testing Registration ---');
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Test Dr.',
    email: email,
    password: password,
    role: 'Doctor'
  });
  console.log('Status:', regRes.statusCode);
  console.log('Body:', regRes.body);

  if (regRes.statusCode !== 201) {
    console.error('Registration failed!');
    return;
  }

  console.log('\n--- Testing Login ---');
  const loginRes = await request('/api/auth/login', 'POST', {
    email: email,
    password: password
  });
  console.log('Status:', loginRes.statusCode);
  console.log('Body:', loginRes.body);

  if (loginRes.statusCode === 200) {
    const data = JSON.parse(loginRes.body);
    console.log('\n--- Testing Protected Route (/api/data) ---');
    const dataRes = await new Promise((resolve, reject) => {
      const opts = {
        host: '127.0.0.1',
        port: 3000,
        path: '/api/data',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      };
      const req = http.request(opts, res => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: resBody }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log('Status:', dataRes.statusCode);
    // console.log('Body:', dataRes.body.substring(0, 100) + '...');
  }
  

  // Test duplicate registration
  console.log('\n--- Testing Duplicate Registration ---');
  const dupRes = await request('/api/auth/register', 'POST', {
    name: 'Duplicate',
    email: email,
    password: password,
    role: 'Doctor'
  });
  console.log('Status:', dupRes.statusCode);
  console.log('Body:', dupRes.body);

  // Test wrong password
  console.log('\n--- Testing Login with Wrong Password ---');
  const wrongPassRes = await request('/api/auth/login', 'POST', {
    email: email,
    password: 'wrongpassword'
  });
  console.log('Status:', wrongPassRes.statusCode);
  console.log('Body:', wrongPassRes.body);
}

runTests().catch(console.error);

