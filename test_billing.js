const fetch = require('node-fetch');

async function testBilling() {
    const API_BASE = 'http://localhost:3000';
    
    // 1. Get Token (assuming admin login works)
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@medicare.com', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
        console.error('Login failed');
        return;
    }
    
    const { token } = await loginRes.json();
    console.log('Got token, testing billing...');

    // 2. Test POST /api/billing
    const billingData = {
        patientId: 'PT-123',
        patient: 'Test Patient',
        date: '2026-04-08',
        items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }],
        subtotal: 100,
        tax: 18,
        discount: 0,
        totalAmount: 118,
        status: 'Paid'
    };

    const res = await fetch(`${API_BASE}/api/billing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billingData)
    });

    if (res.ok) {
        const data = await res.json();
        console.log('Success:', data);
    } else {
        const err = await res.text();
        console.error('Failed:', res.status, err);
    }
}

testBilling();
