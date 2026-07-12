const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function setup() {
  let connection;
  try {
    console.log('Connecting to MySQL without database selection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log(`Creating database ${process.env.DB_NAME}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    console.log('Executing schema.sql...');
    await connection.query(schemaSql);

    console.log('Reading seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    console.log('Executing seed.sql...');
    await connection.query(seedSql);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
