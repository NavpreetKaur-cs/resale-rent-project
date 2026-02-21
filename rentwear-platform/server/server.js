const app = require('./app');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});