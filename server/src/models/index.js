import { sequelize } from '../../config/database.config.js';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

// Import all model files dynamically
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// Load models
for (const file of modelFiles) {
    const modelPath = path.join(__dirname, file);
    const fileUrl = `file://${modelPath.replace(/\\/g, '/')}`;
    const { default: model } = await import(fileUrl);
    const modelInstance = model(sequelize, sequelize.Sequelize.DataTypes);
    db[modelInstance.name] = modelInstance;
}

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

export { syncDatabase };
export default db;