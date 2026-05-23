// Using native fetch

async function testPharmacy() {
    const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@medicare.com', password: 'admin123' })
    });
    const { token } = await res.json();
    
    if (!token) {
        console.error('Failed to get token');
        return;
    }

    console.log('Got token, adding medicine...');
    const medRes = await fetch('http://localhost:3000/api/pharmacy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Test Medicine',
            category: 'Tablet',
            brand: 'TestBrand',
            manufacturer: 'TestMfr',
            unit: 'Strip',
            stock: 100,
            batch: 'TX-100',
            manufacturingDate: '2023-01-01',
            expiryDate: '2025-01-01'
        })
    });
    
    if (medRes.ok) {
        const data = await medRes.json();
        console.log('Success:', data);
    } else {
        const err = await medRes.text();
        console.error('Failed:', medRes.status, err);
    }
}

testPharmacy();
