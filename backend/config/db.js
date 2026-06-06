const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbConnectionString = process.env.SUPABASE_DB_URL ? process.env.SUPABASE_DB_URL.replace(/^"|"$/g, '').trim() : null;

let db;

if (dbConnectionString) {
  console.log('Production mode detected. Connecting to Supabase PostgreSQL database...');

  // Setup PostgreSQL pool
  const pool = new Pool({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  // Adapter mapping SQLite callbacks/methods to PostgreSQL pool queries
  const pgAdapter = {
    serialize: async function(callback) {
      // Direct execution since Postgres is active
      try {
        await this.initializePostgresSchema();
        if (callback) callback();
      } catch (err) {
        console.error('Error during schema initialization:', err.message);
      }
    },

    initializePostgresSchema: async function() {
      // 1. Create tables in correct dependency order
      const schemas = [
        `CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'customer',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          permissions VARCHAR(255) DEFAULT 'all',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          base_price DECIMAL(10, 2) NOT NULL,
          image_url TEXT,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS gallery (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          dimensions VARCHAR(100),
          medium VARCHAR(100),
          year VARCHAR(10),
          is_featured INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS custom_orders (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          artwork_type VARCHAR(255) NOT NULL,
          image_url TEXT,
          size_selection VARCHAR(50) NOT NULL,
          color_preference VARCHAR(100),
          message TEXT,
          delivery_date VARCHAR(100),
          budget DECIMAL(10, 2),
          additional_instructions TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          price DECIMAL(10, 2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS order_status_logs (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS quotes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT,
          proposed_price DECIMAL(10, 2),
          status VARCHAR(50) DEFAULT 'pending',
          admin_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS testimonials (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          review TEXT NOT NULL,
          rating INTEGER NOT NULL DEFAULT 5,
          is_approved INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          message TEXT NOT NULL,
          is_replied INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS faq (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS website_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(255) NOT NULL,
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      for (const sql of schemas) {
        await pool.query(sql);
      }
      console.log('PostgreSQL Tables initialized successfully.');
    },

    // Translate SQLite style query placeholders (e.g. "?") to PostgreSQL style (e.g. "$1", "$2")
    translateSql: function(sql) {
      let count = 0;
      let translated = sql.replace(/\?/g, () => `$${++count}`);
      
      // Translate SQLite specific commands to PostgreSQL dialect
      translated = translated
        .replace(/INSERT OR IGNORE INTO website_settings/gi, 'INSERT INTO website_settings')
        .replace(/INSERT OR IGNORE INTO categories/gi, 'INSERT INTO categories')
        .replace(/INSERT OR IGNORE INTO products/gi, 'INSERT INTO products')
        .replace(/INSERT OR IGNORE INTO faq/gi, 'INSERT INTO faq')
        .replace(/INSERT OR IGNORE INTO testimonials/gi, 'INSERT INTO testimonials')
        .replace(/INSERT OR REPLACE INTO website_settings/gi, 'INSERT INTO website_settings');

      // Append specific ON CONFLICT clauses for tables that require it
      if (sql.includes('website_settings')) {
        if (sql.includes('REPLACE')) {
          translated += ' ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP';
        } else {
          translated += ' ON CONFLICT (key) DO NOTHING';
        }
      } else if (sql.includes('categories') && sql.includes('IGNORE')) {
        translated += ' ON CONFLICT (name) DO NOTHING';
      } else if (sql.includes('users') && sql.includes('IGNORE')) {
        translated += ' ON CONFLICT (email) DO NOTHING';
      }

      // SQLite uses double pipes || for string concatenation, which Postgres supports, but some standard queries need "RETURNING id" for insertions
      if (translated.trim().toUpperCase().startsWith('INSERT')) {
        // Append RETURNING id to allow us to retrieve the auto-generated primary key
        if (!translated.toUpperCase().includes('RETURNING')) {
          translated += ' RETURNING id';
        }
      }

      return translated;
    },

    get: function(sql, params = [], callback) {
      const pgSql = this.translateSql(sql);
      pool.query(pgSql, params, (err, res) => {
        if (err) {
          if (callback) callback(err);
        } else {
          if (callback) callback(null, res.rows[0]);
        }
      });
    },

    all: function(sql, params = [], callback) {
      // Support missing params array parameter: db.all(sql, callback)
      let finalParams = params;
      let finalCallback = callback;
      if (typeof params === 'function') {
        finalCallback = params;
        finalParams = [];
      }

      const pgSql = this.translateSql(sql);
      pool.query(pgSql, finalParams, (err, res) => {
        if (err) {
          if (finalCallback) finalCallback(err);
        } else {
          if (finalCallback) finalCallback(null, res.rows);
        }
      });
    },

    run: function(sql, params = [], callback) {
      let finalParams = params;
      let finalCallback = callback;
      if (typeof params === 'function') {
        finalCallback = params;
        finalParams = [];
      }

      const pgSql = this.translateSql(sql);
      pool.query(pgSql, finalParams, function(err, res) {
        if (err) {
          if (finalCallback) finalCallback(err);
        } else {
          const insertedId = res.rows && res.rows[0] ? res.rows[0].id : null;
          const context = {
            lastID: insertedId,
            changes: res.rowCount
          };
          if (finalCallback) finalCallback.call(context, null);
        }
      });
    },

    prepare: function(sql) {
      const self = this;
      return {
        run: function(...args) {
          const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
          self.run(sql, args, callback);
        },
        finalize: function(callback) {
          if (callback) callback();
        }
      };
    }
  };

  db = pgAdapter;
} else {
  console.log('Development mode detected. Connecting to local SQLite database...');
  // Initialize local SQLite
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
}

// Ensure database creates and seeds tables on startup
db.serialize(() => {
  if (dbConnectionString) return; // Seeding is handled dynamically or done on schema creation

  // Local SQLite tables creation
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    permissions TEXT DEFAULT 'all',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    dimensions TEXT,
    medium TEXT,
    year TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS custom_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    artwork_type TEXT NOT NULL,
    image_url TEXT,
    size_selection TEXT NOT NULL,
    color_preference TEXT,
    message TEXT,
    delivery_date TEXT,
    budget REAL,
    additional_instructions TEXT,
    status TEXT DEFAULT 'pending',
    price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES custom_orders (id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    proposed_price REAL,
    status TEXT DEFAULT 'pending',
    admin_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar_url TEXT,
    review TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    is_approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_replied INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS faq (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS website_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id)
  )`);

  console.log('Tables initialized successfully.');

  // Seed Default Settings
  const settings = [
    { key: 'site_name', value: 'Kalaakar' },
    { key: 'site_tagline', value: 'Turning Memories Into Art' },
    { key: 'contact_whatsapp', value: '+916355303793' },
    { key: 'contact_instagram', value: '@kalaakar.art' },
    { key: 'contact_email', value: 'hello@kalaakar.com' },
    { key: 'contact_location', value: 'Mumbai, India' }
  ];

  settings.forEach(s => {
    db.run(`INSERT OR IGNORE INTO website_settings (key, value) VALUES (?, ?)`, [s.key, s.value]);
  });

  // Seed Default Categories
  const defaultCategories = [
    ['Memories in Colors', 'memories-in-colors', 'Turn your favorite moments into vibrant masterpieces.'],
    ['Monochrome Magic', 'monochrome-magic', 'Classic sketches that never go out of style.'],
    ['Crafted for Your Corner', 'crafted-for-your-corner', 'Decor that tells your story.'],
    ['Blooming Memories Bouquet', 'blooming-memories-bouquet', 'Where photographs blossom into unforgettable gifts.'],
    ['Treasures of Memories', 'treasures-of-memories', 'Open the box, relive the moments.'],
    ['Walls That Speak', 'walls-that-speak', 'Beautiful creations that bring life to every wall.'],
    ['Forever Blooms', 'forever-blooms', 'Flowers that never fade, memories that never end.'],
    ['The Forever Nest', 'the-forever-nest', 'A beautiful home for your precious promise.']
  ];

  defaultCategories.forEach(cat => {
    db.run(`INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`, cat);
  });

  // Seed Default Products/Pricing
  db.all(`SELECT id, name FROM categories`, [], (err, rows) => {
    if (err || !rows.length) return;
    
    const categoryMap = {};
    rows.forEach(r => { categoryMap[r.name] = r.id; });

    const memoriesInColorsId = categoryMap['Memories in Colors'];
    const monochromeMagicId = categoryMap['Monochrome Magic'];
    const foreverNestId = categoryMap['The Forever Nest'];
    const treasuresOfMemoriesId = categoryMap['Treasures of Memories'];

    if (memoriesInColorsId) {
      db.run(`INSERT OR IGNORE INTO products (category_id, name, description, base_price) VALUES 
        (?, 'Single Face Color Sketch (A4)', 'Handmade colored pencil portrait of single face on professional A4 artist paper', 1800.00),
        (?, 'Couple Color Sketch (A4)', 'Handmade couple colored pencil portrait on professional A4 artist paper', 2800.00),
        (?, 'Couple Color Sketch (A3)', 'Handmade couple colored pencil portrait on professional A3 artist paper', 4500.00)`,
        [memoriesInColorsId, memoriesInColorsId, memoriesInColorsId]
      );
    }

    if (monochromeMagicId) {
      db.run(`INSERT OR IGNORE INTO products (category_id, name, description, base_price) VALUES 
        (?, 'Single Face Pencil Sketch (A4)', 'Handmade pencil portrait of single face on professional A4 artist paper', 1500.00),
        (?, 'Couple Pencil Sketch (A4)', 'Handmade couple pencil portrait on professional A4 artist paper', 2500.00),
        (?, 'Couple Pencil Sketch (A3)', 'Handmade couple pencil portrait on professional A3 artist paper', 4200.00)`,
        [monochromeMagicId, monochromeMagicId, monochromeMagicId]
      );
    }

    if (foreverNestId) {
      db.run(`INSERT OR IGNORE INTO products (category_id, name, description, base_price) VALUES 
        (?, 'Engagement Ring Holder (Wooden)', 'Custom resin and wood ring holder decorated with dried flowers', 1800.00)`,
        [foreverNestId]
      );
    }

    if (treasuresOfMemoriesId) {
      db.run(`INSERT OR IGNORE INTO products (category_id, name, description, base_price) VALUES 
        (?, 'Paper Craft Explosion Box', 'Handcrafted multi-layered exploding gift box with photo slots', 1200.00)`,
        [treasuresOfMemoriesId]
      );
    }
  });

  // Seed Default Gallery Items
  const galleryItems = [
    {
      category_name: 'Monochrome Magic',
      title: 'Eternal Bond Wedding Sketch',
      description: 'An exquisite hand-drawn graphite and charcoal wedding couple portrait capturing the finest details of bridal jewelry and emotions.',
      image_url: '/couple_sketch.jpg',
      dimensions: 'A3 Size Frame',
      medium: 'Charcoal & Graphite on Archival paper',
      year: '2026',
      is_featured: 1
    },
    {
      category_name: 'Forever Blooms',
      title: 'Everlasting Paper Rose Bouquet',
      description: 'Delicately hand-folded red and pink cardstock roses, meticulously styled into a luxury bouquet that lasts forever.',
      image_url: '/paper_roses.jpg',
      dimensions: '12" Bouquet Height',
      medium: 'Premium Matte Craft Cardstock',
      year: '2026',
      is_featured: 1
    },
    {
      category_name: 'Treasures of Memories',
      title: 'Handcrafted Multi-Layer Explosion Box',
      description: 'A premium handcrafted exploding gift box featuring layered photo panels, custom pocket folds, and decorative top embellishments.',
      image_url: '/explosion_box.jpg',
      dimensions: '10" x 10" (Opened)',
      medium: 'Craft Cardstock & Ribbon accents',
      year: '2026',
      is_featured: 1
    },
    {
      category_name: 'Crafted for Your Corner',
      title: 'Lord Buddha Lippan Art Painting',
      description: 'Hand-painted Lord Buddha circular wooden panel set in a vibrant lotus background and detailed with concentric mirror tiles (Lippan work).',
      image_url: '/buddha_painting.jpg',
      dimensions: '12" Round Panel',
      medium: 'Acrylics, Mirror Tiles on MDF Board',
      year: '2026',
      is_featured: 1
    },
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
      category_name: 'The Forever Nest',
      title: 'Tejas & Bhargavi Name Ring Holder',
      description: 'Custom ring holder decorated with dried flowers and custom lettering.',
      image_url: '/ring_holder.png',
      dimensions: '8" Round velvet base',
      medium: 'Glitter Loop Outlines & Paper Florals',
      year: '2021',
      is_featured: 0
    },
    {
      category_name: 'Crafted for Your Corner',
      title: 'Krishna Mandala Bookmark',
      description: 'Lord Krishna silhouette drawing bordered with fine concentric mandalas.',
      image_url: '/krishna_bookmark.png',
      dimensions: '3" x 9" Bookmark Strip',
      medium: 'Black Ink Silhouette & Concentric Patterns',
      year: '2020',
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
      category_name: 'Monochrome Magic',
      title: 'Intricate Rabbit Mandala Sketch',
      description: 'A detailed rabbit drawing layered with mandala ink textures.',
      image_url: '/mandala_rabbit.png',
      dimensions: 'A4 size paper',
      medium: 'Fineliner ink and orange graphite shadings',
      year: '2021',
      is_featured: 0
    }
  ];

  galleryItems.forEach(item => {
    db.get(`SELECT id FROM categories WHERE name = ?`, [item.category_name], (err, catRow) => {
      if (catRow) {
        db.get(`SELECT id FROM gallery WHERE image_url = ?`, [item.image_url], (err, galRow) => {
          if (!galRow) {
            db.run(`INSERT INTO gallery (category_id, title, description, image_url, dimensions, medium, year, is_featured) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
              [catRow.id, item.title, item.description, item.image_url, item.dimensions, item.medium, item.year, item.is_featured]
            );
          }
        });
      }
    });
  });

  // Seed Admin user
  const adminEmail = 'admin@kalaakar.com';
  db.get(`SELECT id FROM users WHERE email = ?`, [adminEmail], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        ['Kalaakar Admin', adminEmail, hash, 'admin'], 
        function(err) {
          if (err) {
            console.error('Error seeding admin user:', err.message);
          } else {
            const userId = this.lastID;
            db.run(`INSERT INTO admins (user_id, permissions) VALUES (?, ?)`, [userId, 'all']);
            console.log('Seeded default admin (admin@kalaakar.com / admin123)');
          }
        }
      );
    }
  });

  // Seed initial FAQ
  const faqs = [
    ['How long does it take to make a custom portrait?', 'Typically, it takes 5 to 7 business days to complete a sketch portrait, depending on the complexity and paper size. Delivery takes another 2-4 days.', 'Delivery'],
    ['Can I request changes to my custom sketch?', 'Yes! We send you a preview photo of the completed sketch before framing and shipping. You can request minor modifications at this stage.', 'Customization'],
    ['Do you offer express shipping?', 'Yes, we have express shipping options available at checkout for an additional fee, which speeds up shipping to 24-48 hours after completion.', 'Delivery'],
    ['How is the price calculated for custom gifts?', 'Pricing is dynamic and depends on the artwork type (e.g. Sketch Art, Paper Craft), selected dimensions (A4, A3), and additional features like framing or custom text boxes.', 'Pricing']
  ];
  faqs.forEach(f => {
    db.run(`INSERT OR IGNORE INTO faq (question, answer, category) VALUES (?, ?, ?)`, f);
  });

  // Seed initial Testimonials
  const testims = [
    ['Rohan Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Absolutely stunning artwork! The pencil sketch of my parents for their anniversary was so lifelike. They both had tears in their eyes. Highly recommended!', 5, 1],
    ['Sneha Patel', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'The resin ring holder I ordered for my wedding is a work of art. The placement of the dried flowers and the smooth finish is pure luxury.', 5, 1],
    ['Kabir Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Beautiful paper craft explosion box! Extremely detailed and neatly made. It made my girlfriend’s birthday incredibly special.', 5, 1]
  ];
  testims.forEach(t => {
    db.run(`INSERT OR IGNORE INTO testimonials (name, avatar_url, review, rating, is_approved) VALUES (?, ?, ?, ?, ?)`, t);
  });
});

module.exports = db;
