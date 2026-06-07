const baseUrl = 'http://localhost:5000/api';

async function testOrderStatusUpdate() {
  console.log('1. Admin Login...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@kalaakar.com', password: 'admin123' })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.json());
    return;
  }
  
  const { token } = await loginRes.json();
  console.log('Login successful.');

  console.log('\n2. Fetching Custom Orders...');
  let ordersRes = await fetch(`${baseUrl}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!ordersRes.ok) {
    console.error('Failed to fetch orders:', await ordersRes.json());
    return;
  }
  
  let orders = await ordersRes.json();
  console.log(`Found ${orders.length} orders.`);

  if (orders.length === 0) {
    console.log('Creating a test custom order...');
    const createRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Rishi Test User',
        phone: '1234567890',
        email: 'rishi.test@example.com',
        artwork_type: 'Sketch Portrait',
        size_selection: 'A4',
        color_preference: 'Monochrome',
        message: 'A nice test artwork'
      })
    });

    if (!createRes.ok) {
      console.error('Failed to create test order:', await createRes.json());
      return;
    }

    console.log('Test order created.');

    // Fetch again
    ordersRes = await fetch(`${baseUrl}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    orders = await ordersRes.json();
  }

  const testOrder = orders[0];
  console.log(`\nTesting with Order No: ${testOrder.order_number}, Current Status: ${testOrder.status}, ID: ${testOrder.id}`);

  // Let's toggle the status: if it is pending, set it to in_progress, else pending
  const targetStatus = testOrder.status === 'pending' ? 'in_progress' : 'pending';
  console.log(`Updating status to "${targetStatus}"...`);

  const updateRes = await fetch(`${baseUrl}/orders/${testOrder.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: targetStatus,
      notes: 'Testing status update from scratch script.',
      price: testOrder.price
    })
  });

  console.log('Update API Status Code:', updateRes.status);
  const updateData = await updateRes.json();
  console.log('Update API Response:', updateData);

  // Fetch again to verify
  const verifyRes = await fetch(`${baseUrl}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const verifyOrders = await verifyRes.json();
  const updatedOrder = verifyOrders.find(o => o.id === testOrder.id);
  console.log(`\nVerified Order Status in DB: ${updatedOrder ? updatedOrder.status : 'NOT FOUND'}`);
}

testOrderStatusUpdate().catch(console.error);
