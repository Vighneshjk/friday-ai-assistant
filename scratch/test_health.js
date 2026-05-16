const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://127.0.0.1:5001/health');
        console.log('Health Check:', res.data);
    } catch (err) {
        console.error('Health Check Failed:', err.message);
    }
}

test();
