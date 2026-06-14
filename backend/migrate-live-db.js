/**
 * Database Migration Script
 * Use this script to push the new categories and gallery items to your live Supabase PostgreSQL database.
 * 
 * Instructions:
 * 1. Install pg dependency if not already done: npm install pg
 * 2. Set your Supabase connection string:
 *    On Windows (PowerShell):
 *    $env:SUPABASE_DB_URL="your-supabase-db-connection-string"
 *    node migrate-live-db.js
 * 
 *    On macOS/Linux:
 *    SUPABASE_DB_URL="your-supabase-db-connection-string" node migrate-live-db.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('Error: SUPABASE_DB_URL environment variable is missing.');
  console.log('Please set it using: $env:SUPABASE_DB_URL="your_connection_string" before running.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString.replace(/^"|"$/g, '').trim(),
  ssl: { rejectUnauthorized: false }
});

const defaultCategories = [
  ['Memories in Colors', 'memories-in-colors', 'Turn your favorite moments into vibrant masterpieces.'],
  ['Crafted for Your Corner', 'crafted-for-your-corner', 'Decor that tells your story.']
];

const galleryItems = [
  {
    category_name: 'Memories in Colors',
    title: 'Hand-drawn Indian Couple Portrait',
    description: 'A detailed colored pencil commission capturing life-like parent smiles.',
    image_url: '/parents_portrait.png',
    dimensions: 'A3 Size Frame',
    medium: 'Colored Pencil on Archival Drawing Sheet',
    year: '2022',
    is_featured: 0
  },
  {
    category_name: 'Crafted for Your Corner',
    title: 'Vibrant Paper Lotus Decor',
    description: 'Handfolded pink and teal lotuses designed to make home celebrations bloom.',
    image_url: '/paper_lotus.png',
    dimensions: '12" x 12" base',
    medium: 'Handfolded Premium Craft Cardstock',
    year: '2025',
    is_featured: 0
  },
  {
    category_name: 'Blooming Memories Bouquet',
    title: 'Bespoke Red Paper Roses Bouquet',
    description: 'Meticulously handfolded bright red paper roses styled into a classic everlasting hand bouquet.',
    image_url: '/red_paper_roses.jpg',
    dimensions: '12" Bouquet Height',
    medium: 'Premium Cardstock & Green floral wire',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Blooming Memories Bouquet',
    title: 'Everlasting Pink Paper Roses Bouquet',
    description: 'Hand-rolled pastel pink roses arranged in a gorgeous decorative bouquet.',
    image_url: '/pink_paper_roses.jpg',
    dimensions: '12" Bouquet Height',
    medium: 'Premium Cardstock & Wrapping accents',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Crafted for Your Corner',
    title: 'Customized Name Ring Holder',
    description: 'Bespoke wedding ring pedestal featuring personalized glitter lettering and handcrafted paper florals on a velvet base.',
    image_url: '/ring_holder.png',
    dimensions: '8" Diameter Base',
    medium: 'Glitter Ring Outlines & Paper Florals on Velvet',
    year: '2025',
    is_featured: 0
  },
  {
    category_name: 'Crafted for Your Corner',
    title: 'Cherished Moments Photo Bouquet',
    description: 'A custom floral bouquet featuring personalized photos nestled within handfolded paper flowers, creating an everlasting keepsake.',
    image_url: '/photo_bouquet.jpg',
    dimensions: '12" Bouquet Height',
    medium: 'Custom Photos, Premium Cardstock & Wrapping Accents',
    year: '2026',
    is_featured: 0
  }
];

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Connected to Supabase PostgreSQL database.');
    
    // Begin transaction
    await client.query('BEGIN');

    // 1. Seed Categories
    console.log('Seeding categories...');
    for (const cat of defaultCategories) {
      await client.query(
        `INSERT INTO categories (name, slug, description) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO NOTHING`,
        cat
      );
    }
    console.log('Categories synced.');

    // 2. Fetch category IDs
    const catRes = await client.query('SELECT id, name FROM categories');
    const categoryMap = {};
    catRes.rows.forEach(r => { categoryMap[r.name] = r.id; });

    // 3. Seed Gallery Items
    console.log('Clearing old gallery items...');
    await client.query('DELETE FROM gallery');
    console.log('Seeding new gallery items...');
    for (const item of galleryItems) {
      const categoryId = categoryMap[item.category_name];
      if (!categoryId) {
        console.warn(`Category "${item.category_name}" not found. Skipping "${item.title}".`);
        continue;
      }

      // Check if it already exists
      const checkRes = await client.query('SELECT id FROM gallery WHERE image_url = $1', [item.image_url]);
      if (checkRes.rows.length === 0) {
        await client.query(
          `INSERT INTO gallery (category_id, title, description, image_url, dimensions, medium, year, is_featured) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [categoryId, item.title, item.description, item.image_url, item.dimensions, item.medium, item.year, item.is_featured]
        );
        console.log(`Inserted artwork: "${item.title}"`);
      } else {
        console.log(`Skipped existing artwork: "${item.title}"`);
      }
    }

    // 4. Update website settings telephone
    console.log('Updating admin contact settings...');
    await client.query(
      `INSERT INTO website_settings (key, value) 
       VALUES ('contact_whatsapp', '+916355303793') 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
    );
    console.log('Admin contact phone updated.');

    await client.query('COMMIT');
    console.log('\nMigration successfully finished!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error migrating data:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
