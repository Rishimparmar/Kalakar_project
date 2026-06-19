const baseUrl = 'https://kalakar-project.onrender.com/api';

async function pollAndTest() {
  console.log('Polling /test-version on production...');
  const maxAttempts = 30; // 5 minutes max
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/test-version`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Attempt ${attempt}] Status: OK | Version:`, data.version);
        if (data.version === '1.0.1-diagnostic') {
          console.log('\nSUCCESS: Diagnostic version is live! Testing SMTP email sending...');
          await testEmail();
          return;
        }
      } else {
        console.log(`[Attempt ${attempt}] Status Code: ${res.status}`);
      }
    } catch (err) {
      console.log(`[Attempt ${attempt}] Failed to connect:`, err.message);
    }
    // Wait 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  console.error('TIMED OUT: Render build took too long to deploy.');
}

async function testEmail() {
  try {
    const res = await fetch(`${baseUrl}/test-email`);
    console.log('Test Email Response Status:', res.status);
    const data = await res.json();
    console.log('Test Email Response Body:', data);
  } catch (err) {
    console.error('Test Email Request failed:', err.message);
  }
}

pollAndTest().catch(console.error);
