// =========================================================================
// KhabarKoi Database Initializer & CLI Tool
// Usage: tsx database/init_db.ts [--reset]
// =========================================================================

import { db } from './connection';
import fs from 'fs';
import path from 'path';

console.log('---------------------------------------------------------');
console.log('🚀 KhabarKoi Canteen Database Initialization & Status Check');
console.log('---------------------------------------------------------');

const info = db.getConnectionInfo();
console.log('Database Status:  ', info.status.toUpperCase());
console.log('Storage Mode:     ', info.type);
console.log('Storage File:     ', info.storagePath);
console.log('Total Food Items: ', info.totalFoodItems);
console.log('Total Suppliers:  ', info.totalSuppliers);
console.log('Total Orders:     ', info.totalOrders);
console.log('Restock Requests: ', info.totalRestockRequests);

if (process.argv.includes('--reset')) {
  console.log('\n[Database] Resetting database to original seed state...');
  const success = db.resetToSeed();
  if (success) {
    console.log('✅ Database reset to initial seed data successfully!');
  } else {
    console.log('❌ Could not reset database. Check dummy_database.json.');
  }
} else {
  console.log('\n[Database] Verified! Database is ready for localhost connection.');
}
console.log('---------------------------------------------------------');
