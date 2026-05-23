const API_BASE = 'http://localhost:3000';

async function testAuth() {
    console.log('--- Testing OTP-only Authentication Flow ---');

    try {
        // 1. Test Registration
        console.log('\nTesting Registration...');
        const regEmail = `test_${Date.now()}@example.com`;
        const regRes = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: regEmail,
                role: 'Patient'
            })
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Data:', regData);

        if (!regRes.ok) throw new Error('Registration failed');

        // 2. Test OTP Sending (Login Flow)
        console.log('\nTesting Login - Sending OTP...');
        const sendOtpRes = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: regEmail })
        });
        const sendOtpData = await sendOtpRes.json();
        console.log('Send OTP Status:', sendOtpRes.status);
        console.log('Send OTP Data:', sendOtpData);

        console.log('\nDone. Please check the server terminal for the OTP logs.');
    } catch (error) {
        console.error('Error during testing:', error.message);
    }
}

testAuth();
