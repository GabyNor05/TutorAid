require('dotenv').config();
const app = require('./index');

const PORT = process.env.PORT || 5000;
console.log('Booting API on port', PORT);
app.listen(PORT, () => console.log(`API listening on ${PORT}`));