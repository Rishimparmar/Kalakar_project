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
  ['Monochrome Magic', 'monochrome-magic', 'Classic sketches that never go out of style.'],
  ['Crafted for Your Corner', 'crafted-for-your-corner', 'Decor that tells your story.'],
  ['Blooming Memories Bouquet', 'blooming-memories-bouquet', 'Where photographs blossom into unforgettable gifts.'],
  ['Treasures of Memories', 'treasures-of-memories', 'Open the box, relive the moments.'],
  ['The Forever Nest', 'the-forever-nest', 'A beautiful home for your precious promise.']
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
    category_name: 'The Forever Nest',
    title: 'Customized Name Ring Holder',
    description: 'Bespoke wedding ring pedestal featuring personalized glitter lettering and handcrafted paper florals on a velvet base.',
    image_url: '/ring_holder.png',
    dimensions: '8" Diameter Base',
    medium: 'Glitter Ring Outlines & Paper Florals on Velvet',
    year: '2025',
    is_featured: 0
  },
  {
    category_name: 'Blooming Memories Bouquet',
    title: 'Cherished Moments Photo Bouquet',
    description: 'A custom floral bouquet featuring personalized photos nestled within handfolded paper flowers, creating an everlasting keepsake.',
    image_url: '/photo_bouquet.jpg',
    dimensions: '12" Bouquet Height',
    medium: 'Custom Photos, Premium Cardstock & Wrapping Accents',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Classic Pencil Couple Sketch',
    description: 'A beautiful graphite and charcoal couple sketch on premium paper.',
    image_url: '/couple_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Graphite & Charcoal on Premium Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Treasures of Memories',
    title: 'Treasures of Memories Explosion Box',
    description: 'An interactive explosion box filled with memories.',
    image_url: '/explosion_box.jpg',
    dimensions: '8" x 8" Box',
    medium: 'Premium Cardstock, Photos & Ribbons',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Intimate Selfie Pencil Portrait',
    description: 'A stunning pencil portrait capturing an intimate selfie moment.',
    image_url: '/selfie_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Graphite & Charcoal on Premium Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Memories in Colors',
    title: 'Contemplative Standing Portrait',
    description: 'A thoughtful standing portrait done in graphite.',
    image_url: '/girl_standing_tattoo_sketch.jpg',
    dimensions: 'A3 Size Frame',
    medium: 'Graphite on Archival Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Thoughtful Portrait in Glasses',
    description: 'A highly detailed charcoal and pencil sketch of a woman in glasses.',
    image_url: '/girl_glasses_hand_chin_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Charcoal & Pencil on Fine Art Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Vibrant Smile Pencil Portrait',
    description: 'A lively portrait sketch capturing a vibrant smile.',
    image_url: '/girl_glasses_smile_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Graphite & Charcoal on Fine Art Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Classic Boy Portrait Sketch',
    description: 'A classic and expressive boy portrait sketch in charcoal.',
    image_url: '/boy_portrait_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Charcoal on Archival Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Vibrant Girl in Striped Dress',
    description: 'A lively colored pencil sketch of a girl in a striped dress.',
    image_url: '/girl_striped_dress_sketch.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Colored Pencil on Archival Drawing Sheet',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Memories in Colors',
    title: 'Graceful Woman in Red Saree',
    description: 'A beautiful mixed media artwork of a woman in a red saree.',
    image_url: '/woman_red_saree_sketch.jpg',
    dimensions: 'A3 Size Frame',
    medium: 'Soft Pastels & Colored Pencil on Paper',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Memories in Colors',
    title: 'Joyful Duo in Maroon Sarees',
    description: 'A vibrant portrait of two women in maroon sarees.',
    image_url: '/two_women_maroon_sarees.jpg',
    dimensions: 'A3 Size Frame',
    medium: 'Premium Color Pencil & Charcoal on Board',
    year: '2026',
    is_featured: 0
  },
  {
    category_name: 'Monochrome Magic',
    title: 'Lotus Serenity Portrait',
    description: 'A serene mixed media portrait featuring a lotus backdrop.',
    image_url: '/woman_lotus_backdrop.jpg',
    dimensions: 'A4 Size Frame',
    medium: 'Mixed Media (Graphite & Pink Colored Pencil)',
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
