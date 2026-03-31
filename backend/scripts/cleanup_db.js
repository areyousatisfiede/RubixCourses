const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function cleanUp() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eduhub';
  console.log(`Connecting to ${uri}...`);
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // 1. Отримуємо список індексів
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // 2. Видаляємоuid_1 якщо він є
    if (indexes.find(i => i.name === 'uid_1')) {
      await collection.dropIndex('uid_1');
      console.log('🗑️ Legacy index "uid_1" dropped successfully.');
    } else {
      console.log('ℹ️ Index "uid_1" not found.');
    }
    
    // 3. Видаляємо записи де uid: null (якщо вони залишилися від старої схеми)
    const result = await collection.deleteMany({ uid: { $exists: true } });
    console.log(`🧹 Removed ${result.deletedCount} legacy documents containing "uid" field.`);
    
    // Очистимо колекцію від усього старого щоб точно не було конфліктів
    // const clearAll = await collection.deleteMany({});
    // console.log(`💥 Cleared all ${clearAll.deletedCount} users for a fresh start.`);

  } catch (e) {
    console.error('❌ Cleanup error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
    process.exit(0);
  }
}

cleanUp();
