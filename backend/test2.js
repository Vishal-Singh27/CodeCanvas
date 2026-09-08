import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('https://api.github.com/user', { headers: { Authorization: 'Bearer fake' }});
    console.log("Success");
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run();
