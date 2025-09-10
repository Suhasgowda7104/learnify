import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Create Sequelize instance for PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

export { sequelize };
export default sequelize;
