const app = require('./index');
const PORT = process.env.PORT || 5000;

console.log('Booting server.js', { cwd: process.cwd(), PORT });
app.listen(PORT, () => console.log(`API listening on ${PORT}`));