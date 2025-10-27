const app = require('./index');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // prefer IPv4 to avoid IPv6 ETIMEDOUT

const PORT = process.env.PORT || 5000;
console.log('Booting server.js', { cwd: process.cwd(), PORT });
app.listen(PORT, () => console.log(`API listening on ${PORT}`));