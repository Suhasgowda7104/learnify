import * as pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
  process.exit(-1);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful.');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

export async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('Query error:', err.message);
    throw err;
  }
}

export default pool;
