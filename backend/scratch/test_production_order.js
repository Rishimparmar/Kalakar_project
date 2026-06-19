const baseUrl = 'https://kalakar-project.onrender.com/api';

async function sendTestOrder() {
  console.log('Sending OAuth2 test order to production backend...');
  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Rishi OAuth2 Test',
      phone: '6355303793',
      email: 'rishimparmar19@gmail.com',
      artwork_type: 'Sketch Portrait',
      size_selection: 'A4',
      color_preference: 'Monochrome',
      message: 'Testing Gmail REST API over HTTPS',
      delivery_date: '2026-06-25',
      budget: 2000,
      additional_instructions: 'Testing automated email receipt with OAuth2 REST API',
      address: 'Bharuch, India',
      delivery_zone: 'Local',
      calculated_price: 2000
    })
  });

  console.log('Response Status:', response.status);
  const data = await response.json();
  console.log('Response Body:', data);
}

sendTestOrder().catch(console.error);
