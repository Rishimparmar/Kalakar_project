const baseUrl = 'https://kalakar-project.onrender.com/api';

async function checkLogs() {
  console.log('1. Logging in as admin to production backend...');
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

  console.log('\n2. Fetching activity logs...');
  const logsRes = await fetch(`${baseUrl}/activity-logs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!logsRes.ok) {
    console.error('Failed to fetch logs:', await logsRes.json());
    return;
  }

  const logs = await logsRes.json();
  console.log('Last 20 activity logs:');
  logs.slice(0, 20).forEach(log => {
    console.log(`[${log.created_at || log.timestamp}] Action: ${log.action} | Details: ${log.details}`);
  });
}

checkLogs().catch(console.error);
