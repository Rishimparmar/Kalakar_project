/**
 * SQLite to Supabase (PostgreSQL) Data Migration Tool
 * 
 * Instructions:
 * 1. Configure the remote connection in your .env or run with:
 *    SUPABASE_DB_URL="postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres" node migrate-to-supabase.js
 * 2. Ensure both 'sqlite3' and 'pg' npm packages are installed:
 *    npm install pg sqlite3
 */

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
require('dotenv').config();

// PostgreSQL Connection String (Supabase Direct Connection URL)
const pgConnectionString = process.env.SUPABASE_DB_URL;

if (!pgConnectionString) {
  console.error('Error: SUPABASE_DB_URL environment variable is not defined.');
  console.log('Please set the environment variable in your .env file or command line.');
  console.log('Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres');
  process.exit(1);
}

const dbPath = path.join(__dirname, 'database.sqlite');
const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error loading SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to local SQLite database successfully.');
});

const pgClient = new Client({
  connectionString: pgConnectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase SSL connections
});

// Helper to query SQLite
const querySQLite = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Main Migration Runner
async function runMigration() {
  try {
    await pgClient.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // We migrate tables in order of foreign key dependencies
    const tables = [
      { name: 'users', query: 'SELECT * FROM users' },
      { name: 'admins', query: 'SELECT * FROM admins' },
      { name: 'categories', query: 'SELECT * FROM categories' },
      { name: 'products', query: 'SELECT * FROM products' },
      { name: 'gallery', query: 'SELECT * FROM gallery' },
      { name: 'custom_orders', query: 'SELECT * FROM custom_orders' },
      { name: 'order_status_logs', query: 'SELECT * FROM order_status_logs' },
      { name: 'quotes', query: 'SELECT * FROM quotes' },
      { name: 'testimonials', query: 'SELECT * FROM testimonials' },
      { name: 'contact_messages', query: 'SELECT * FROM contact_messages' },
      { name: 'faq', query: 'SELECT * FROM faq' },
      { name: 'website_settings', query: 'SELECT * FROM website_settings' },
      { name: 'activity_logs', query: 'SELECT * FROM activity_logs' }
    ];

    // Disable triggers/constraints during bulk import if needed, but let's just insert sequentially
    console.log('\nStarting table transfer...');

    for (const table of tables) {
      console.log(`Migrating table: "${table.name}"...`);
      
      const rows = await querySQLite(table.query);
      if (rows.length === 0) {
        console.log(`  Table "${table.name}" is empty. Skipping.`);
        continue;
      }

      // Clear existing records in PG to avoid duplicates
      await pgClient.query(`TRUNCATE TABLE ${table.name} RESTART IDENTITY CASCADE`);

      // Get columns
      const cols = Object.keys(rows[0]);
      const colNames = cols.join(', ');
      
      for (const row of rows) {
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = cols.map(col => row[col]);

        const insertQuery = `INSERT INTO ${table.name} (${colNames}) VALUES (${placeholders})`;
        await pgClient.query(insertQuery, values);
      }

      // Reset Postgres serial sequences so that future autoincrements start after the imported IDs
      if (table.name !== 'website_settings') {
        const seqResult = await pgClient.query(`SELECT pg_get_serial_sequence('${table.name}', 'id') as seq`);
        const seqName = seqResult.rows[0].seq;
        if (seqName) {
          await pgClient.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX(id) FROM ${table.name}), 1))`);
        }
      }

      console.log(`  Successfully migrated ${rows.length} rows into "${table.name}".`);
    }

    console.log('\nMigration process completed successfully!');
  } catch (error) {
    console.error('\nMigration failed due to an error:');
    console.error(error);
  } finally {
    sqliteDb.close();
    await pgClient.end();
    console.log('Database connections closed.');
  }
}

runMigration();
