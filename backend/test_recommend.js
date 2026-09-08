const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:5001/api/ai/recommend', { repos: [{id: 1, name: 'test', description: 'test repo'}] });
    console.log(res.status, res.data);
  } catch(e) {
    console.log(e.response?.status, e.response?.data);
  }
}
test();
