const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // This is needed for self-signed certificates
    }
  });

  try {
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    client.release();
    await pool.end();
    console.log('Connection test completed successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testConnection(); 