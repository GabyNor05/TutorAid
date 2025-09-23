const express = require('express');
const cors = require('cors');
const app = express();

const userController = require('./controls/userController');

app.use(express.json());
app.use(cors());

app.get('api/test', userController.createTestUser);

// Import user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});