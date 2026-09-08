import axios from 'axios';
async function run() {
  try {
    const res = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: "fake",
      client_secret: "fake",
      code: "fake"
    }, { headers: { Accept: 'application/json' }});
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run();
