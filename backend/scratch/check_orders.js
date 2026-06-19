const baseUrl = 'https://kalakar-project.onrender.com/api';

async function checkOrders() {
  console.log('1. Logging in as admin...');
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

  console.log('\n2. Fetching orders...');
  const ordersRes = await fetch(`${baseUrl}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!ordersRes.ok) {
    console.error('Failed to fetch orders:', await ordersRes.json());
    return;
  }

  const orders = await ordersRes.json();
  console.log(`Found ${orders.length} orders. Latest orders:`);
  orders.slice(0, 5).forEach(o => {
    console.log(`Order ID: ${o.id} | Order No: ${o.order_number} | Email: ${o.email} | Created At: ${o.created_at}`);
  });
}

checkOrders().catch(console.error);
