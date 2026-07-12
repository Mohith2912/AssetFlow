require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('MySQL database connection successful');
  } catch (error) {
    console.error('Failed to connect to MySQL. Exiting...', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
