async function testDB() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@spiceroute.com', password: 'manager123' })
    });
    const data = await res.json();
    if (data.success && data.user) {
      console.log('✅ Database layer is WORKING!');
      console.log('👤 Logged in as:', data.user.name, `(${data.user.role})`);
      console.log('🏢 Restaurant ID:', data.user.restaurant);
    } else {
      console.log('❌ Database layer error:', data);
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}
testDB();
