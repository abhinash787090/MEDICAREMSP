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
        'Content-Length': body ? Buffer.byteLength(body) : 0
      }
    };
    const req = http.request(opts, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: resBody }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runOTPTest() {
  const email = 'admin@medicare.com'; // Existing user
  
  console.log('--- Step 1: Requesting OTP ---');
  const sendRes = await request('/api/auth/send-otp', 'POST', { email });
  console.log('Status:', sendRes.statusCode);
  console.log('Body:', sendRes.body);

  if (sendRes.statusCode !== 200) {
    console.error('Failed to send OTP. Is the email registered?');
    return;
  }

  console.log('\n--- Step 2: Check server console for the OTP ---');
  console.log('Enter the OTP you see in the server logs:');
  
  // Since we can't easily wait for user input in this script during automation, 
  // I will just stop here. But wait, I can read the server logs!
}

runOTPTest().catch(console.error);
