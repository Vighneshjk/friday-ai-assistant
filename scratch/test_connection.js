fetch('http://127.0.0.1:5001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Test', history: [] })
})
.then(res => res.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => console.error('FAILED:', err.message));
