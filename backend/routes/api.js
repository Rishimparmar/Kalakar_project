const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');
const { sendEmail, templates } = require('../utils/mailer');

// Setup Multer storage for image uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to handle persistent file uploads (Supabase Storage in production, Local disk in development)
async function handleFileUpload(file) {
  if (!file) return null;
  
  const supabaseKey = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.replace(/^"|"$/g, '').trim() : null;
  const dbUrl = process.env.SUPABASE_DB_URL ? process.env.SUPABASE_DB_URL.replace(/^"|"$/g, '').trim() : null;
  const localPath = `/uploads/${file.filename}`;
  
  if (supabaseKey && dbUrl) {
    try {
      let projectId = '';
      const matchDirect = dbUrl.match(/@db\.(.+?)\.supabase\.co/);
      if (matchDirect) {
        projectId = matchDirect[1];
      } else {
        const matchPooler = dbUrl.match(/postgres\.(.+?):/);
        if (matchPooler) {
          projectId = matchPooler[1];
        }
      }
      
      if (projectId) {
        const bucketName = 'kalakar-uploads';
        const filename = `${Date.now()}-${file.filename}`;
        
        const fileBuffer = fs.readFileSync(file.path);
        const uploadUrl = `https://${projectId}.supabase.co/storage/v1/object/${bucketName}/${filename}`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': file.mimetype
          },
          body: fileBuffer
        });
        
        if (response.ok) {
          // File uploaded successfully. Delete local temp file.
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting local temp file:', err);
          });
          // Return the public access URL
          return `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${filename}`;
        } else {
          const errMsg = await response.text();
          console.error('Supabase storage upload failed:', errMsg);
          throw new Error('Supabase Storage Error: Please create a public bucket named "kalakar-uploads"');
        }
      }
    } catch (err) {
      console.error('Error uploading file to Supabase storage:', err);
      throw new Error(err.message || 'Error uploading file to Supabase storage');
    }
  } else {
    // If Supabase is completely disabled, use local path
    return localPath;
  }
}

// Regex for field validations
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s\-()]{9,20}$/;

// XSS Sanitizer Helper (escapes key HTML tokens)
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Remote File Deletion helper for Supabase
async function deleteSupabaseFile(imageUrl) {
  const supabaseKey = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.replace(/^"|"$/g, '').trim() : null;
  if (!supabaseKey || !imageUrl || !imageUrl.startsWith('http')) return false;

  try {
    const match = imageUrl.match(/https:\/\/(.+?)\.supabase\.co\/storage\/v1\/object\/public\/(.+?)\/(.+)$/);
    if (match) {
      const projectId = match[1];
      const bucketName = match[2];
      const filename = match[3];

      const deleteUrl = `https://${projectId}.supabase.co/storage/v1/object/${bucketName}/${filename}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (response.ok) {
        console.log(`Deleted file from Supabase storage: ${filename}`);
        return true;
      } else {
        const errMsg = await response.text();
        console.error(`Failed to delete Supabase file: ${errMsg}`);
      }
    }
  } catch (err) {
    console.error('Error deleting file from Supabase:', err);
  }
  return false;
}

// Helper to log administrative actions
function logActivity(adminId, action, details) {
  db.run(`INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)`, [adminId, escapeHtml(action), escapeHtml(details)]);
}

// Helper for Email Automation
function sendMailNotification(to, subject, htmlContent) {
  // Send actual email using Nodemailer via mailer.js
  sendEmail(to, subject, htmlContent).catch(err => console.error('Failed to send email async', err));
  
  // Save mail activity to activity log
  db.run(`INSERT INTO activity_logs (admin_id, action, details) VALUES (NULL, 'Email Sent', 'To: ' || ? || ' | Subject: ' || ?)`, [to, subject]);
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Admin Login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanedEmail = email.trim().toLowerCase();
  db.get(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanedEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

// Verify Admin Token
router.get('/auth/verify', requireAdmin, (req, res) => {
  res.json({ valid: true, user: req.user });
});


// ----------------------------------------------------
// WEBSITE SETTINGS
// ----------------------------------------------------
router.get('/settings', (req, res) => {
  db.all(`SELECT * FROM website_settings`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    const settingsMap = {};
    rows.forEach(r => { settingsMap[r.key] = r.value; });
    res.json(settingsMap);
  });
});

router.put('/settings', requireAdmin, (req, res) => {
  const settings = req.body;
  const adminId = req.user.id;

  const stmt = db.prepare(`INSERT OR REPLACE INTO website_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`);
  Object.keys(settings).forEach(key => {
    stmt.run(key, settings[key]);
  });
  stmt.finalize(() => {
    logActivity(adminId, 'Update Settings', `Updated settings keys: ${Object.keys(settings).join(', ')}`);
    res.json({ message: 'Settings updated successfully' });
  });
});


// ----------------------------------------------------
// CUSTOM ORDERS
// ----------------------------------------------------

// Submit Custom Order
router.post('/orders', upload.single('photo'), async (req, res) => {
  const {
    name, phone, email, artwork_type, size_selection,
    color_preference, message, delivery_date, budget, additional_instructions,
    address, delivery_zone, calculated_price
  } = req.body;

  if (!name || !phone || !email || !artwork_type || !size_selection) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }

  const orderNumber = 'KK-' + Math.round(100000 + Math.random() * 900000);
  const imageUrl = req.file ? await handleFileUpload(req.file) : null;

  // Let's use frontend calculated price if provided, else fallback
  let estimatedPrice = calculated_price ? parseFloat(calculated_price) : (budget ? parseFloat(budget) : 2000);

  const query = `INSERT INTO custom_orders (
    order_number, name, phone, email, artwork_type, image_url, size_selection,
    color_preference, message, delivery_date, budget, additional_instructions, 
    address, delivery_zone, status, price
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`;

  const cleanName = escapeHtml(name.trim());
  const cleanPhone = escapeHtml(phone.trim());
  const cleanEmail = escapeHtml(email.trim().toLowerCase());
  const cleanArtworkType = escapeHtml(artwork_type.trim());
  const cleanSizeSelection = escapeHtml(size_selection.trim());
  const cleanColorPref = escapeHtml((color_preference || '').trim());
  const cleanMessage = escapeHtml((message || '').trim());
  const cleanDeliveryDate = escapeHtml((delivery_date || '').trim());
  const cleanInstructions = escapeHtml((additional_instructions || '').trim());
  const cleanAddress = escapeHtml((address || '').trim());
  const cleanDeliveryZone = escapeHtml((delivery_zone || 'Local').trim());

  db.run(query, [
    orderNumber, cleanName, cleanPhone, cleanEmail, cleanArtworkType, imageUrl, cleanSizeSelection,
    cleanColorPref, cleanMessage, cleanDeliveryDate, budget, cleanInstructions, cleanAddress, cleanDeliveryZone, estimatedPrice
  ], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error saving order: ' + err.message });
    }
    
    const orderId = this.lastID;
    
    // Log initial status
    db.run(`INSERT INTO order_status_logs (order_id, status, notes) VALUES (?, 'pending', 'Order placed successfully.')`, [orderId]);

    // Send confirmation email to Customer
    sendMailNotification(
      cleanEmail,
      `Order Receipt & Confirmation - Kalaakar (Order No: ${orderNumber})`,
      templates.customerOrderConfirmation({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        orderNumber: orderNumber,
        type: cleanArtworkType,
        size: cleanSizeSelection,
        color: cleanColorPref,
        instructions: cleanInstructions,
        address: cleanAddress,
        deliveryZone: cleanDeliveryZone,
        price: estimatedPrice
      })
    );

    // Send alert email to Admin
    sendMailNotification(
      process.env.EMAIL_USER, // Send to self
      `New Order Alert: ${orderNumber}`,
      templates.adminNewOrderAlert(cleanName, orderNumber, cleanArtworkType, cleanEmail, cleanPhone)
    );

    res.status(201).json({
      message: 'Order submitted successfully',
      order_id: orderId,
      order_number: orderNumber,
      estimated_price: estimatedPrice
    });
  });
});

// Track Order
router.get('/orders/track', (req, res) => {
  const { order_number, phone } = req.query;
  if (!order_number || !phone) {
    return res.status(400).json({ message: 'Order number and phone number are required' });
  }

  // Find order
  db.get(`SELECT * FROM custom_orders WHERE order_number = ? AND phone = ?`, [order_number, phone], (err, order) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!order) return res.status(404).json({ message: 'Order not found with provided credentials' });

    // Fetch status logs
    db.all(`SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY updated_at DESC`, [order.id], (err, logs) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ order, tracking: logs });
    });
  });
});

// Admin: Get All Orders
router.get('/orders', requireAdmin, (req, res) => {
  db.all(`SELECT * FROM custom_orders ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// Admin: Update Order Status
router.put('/orders/:id/status', requireAdmin, (req, res) => {
  const { status, notes, price } = req.body;
  const orderId = req.params.id;
  const adminId = req.user.id;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  db.get(`SELECT * FROM custom_orders WHERE id = ?`, [orderId], (err, order) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let updateQuery = `UPDATE custom_orders SET status = ?`;
    const params = [status];

    if (price !== undefined) {
      updateQuery += `, price = ?`;
      params.push(price);
    }
    updateQuery += ` WHERE id = ?`;
    params.push(orderId);

    db.run(updateQuery, params, function(err) {
      if (err) return res.status(500).json({ message: err.message });

      // Add log entry
      db.run(`INSERT INTO order_status_logs (order_id, status, notes) VALUES (?, ?, ?)`, [orderId, status, notes || `Status updated by Admin.`]);

      logActivity(adminId, 'Update Order Status', `Order ID ${orderId} updated to status: ${status}`);

      // Send status update email
      sendMailNotification(
        order.email,
        `Order Update: ${status.toUpperCase()} - Kalaakar (Order No: ${order.order_number})`,
        templates.customerStatusUpdate(order.name, order.order_number, status)
      );

      res.json({ message: 'Order status updated successfully' });
    });
  });
});

// Admin: Delete Order
router.delete('/orders/:id', requireAdmin, (req, res) => {
  const orderId = req.params.id;
  const adminId = req.user.id;

  db.get(`SELECT * FROM custom_orders WHERE id = ?`, [orderId], (err, order) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    db.run(`DELETE FROM custom_orders WHERE id = ?`, [orderId], function(err) {
      if (err) return res.status(500).json({ message: err.message });

      // Clean up associated file if it exists and is local or supabase
      if (order.image_url) {
        if (order.image_url.startsWith('https://')) {
          deleteSupabaseFile(order.image_url);
        } else {
          const filePath = path.join(__dirname, '..', order.image_url);
          fs.unlink(filePath, (e) => {
            if (e && e.code !== 'ENOENT') console.error('Error deleting local file:', e);
          });
        }
      }

      logActivity(adminId, 'Delete Order', `Deleted Order ID ${orderId} (${order.order_number})`);
      res.json({ message: 'Order deleted successfully' });
    });
  });
});


// ----------------------------------------------------
// QUOTATION REQUEST SYSTEM
// ----------------------------------------------------

// Submit Quote Request
router.post('/quotes', upload.single('photo'), async (req, res) => {
  const { name, email, phone, description } = req.body;

  if (!name || !email || !phone || !description) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }

  const imageUrl = req.file ? await handleFileUpload(req.file) : null;

  const cleanName = escapeHtml(name.trim());
  const cleanEmail = escapeHtml(email.trim().toLowerCase());
  const cleanPhone = escapeHtml(phone.trim());
  const cleanDesc = escapeHtml(description.trim());

  db.run(`INSERT INTO quotes (name, email, phone, description, image_url, status) VALUES (?, ?, ?, ?, ?, 'pending')`, 
    [cleanName, cleanEmail, cleanPhone, cleanDesc, imageUrl],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });

      sendMailNotification(
        cleanEmail,
        'Quotation Request Submitted - Kalaakar',
        `<h3>Hello ${cleanName},</h3><p>We received your quotation request for customized handmade art.</p><p><strong>Description:</strong> ${cleanDesc}</p><p>Our artist will review the details and respond with a price estimate within 24-48 hours.</p><p>Best regards,<br/>Kalaakar</p>`
      );

      res.status(201).json({ message: 'Quotation request submitted successfully', quote_id: this.lastID });
    }
  );
});

// Admin: Get All Quotes
router.get('/quotes', requireAdmin, (req, res) => {
  db.all(`SELECT * FROM quotes ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// Admin: Respond to Quote
router.put('/quotes/:id', requireAdmin, (req, res) => {
  const { proposed_price, status, admin_message } = req.body;
  const quoteId = req.params.id;
  const adminId = req.user.id;

  db.get(`SELECT * FROM quotes WHERE id = ?`, [quoteId], (err, quote) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    db.run(`UPDATE quotes SET proposed_price = ?, status = ?, admin_message = ? WHERE id = ?`,
      [proposed_price, status, admin_message, quoteId],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });

        logActivity(adminId, 'Update Quote', `Quote ID ${quoteId} updated to status: ${status} with proposed price: ₹${proposed_price}`);

        sendMailNotification(
          quote.email,
          `Quotation Update from Kalaakar`,
          `<h3>Hello ${quote.name},</h3><p>Your quotation request has been updated.</p><p><strong>Status:</strong> ${status.toUpperCase()}</p><p><strong>Proposed Price:</strong> ₹${proposed_price}</p><p><strong>Artist Remarks:</strong> ${admin_message || 'N/A'}</p><p>Please reply directly or contact us on WhatsApp (+91 98765 43210) to finalize details.</p>`
        );

        res.json({ message: 'Quotation updated successfully' });
      }
    );
  });
});


// ----------------------------------------------------
// DYNAMIC PRICING SYSTEM (PRODUCTS)
// ----------------------------------------------------
router.get('/products', (req, res) => {
  db.all(`SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.put('/products/:id', requireAdmin, (req, res) => {
  const { base_price, is_active, name, description } = req.body;
  const productId = req.params.id;
  const adminId = req.user.id;

  db.run(`UPDATE products SET base_price = COALESCE(?, base_price), is_active = COALESCE(?, is_active), name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
    [base_price, is_active, name, description, productId],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      
      logActivity(adminId, 'Update Product Pricing', `Product ID ${productId} updated (price/info)`);
      res.json({ message: 'Product updated successfully' });
    }
  );
});


// ----------------------------------------------------
// GALLERY ENDPOINTS
// ----------------------------------------------------
router.get('/gallery', (req, res) => {
  db.all(`SELECT g.*, c.name as category_name FROM gallery g JOIN categories c ON g.category_id = c.id ORDER BY g.created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/gallery', requireAdmin, upload.single('photo'), async (req, res) => {
  const { category_id, title, description, dimensions, medium, year, is_featured } = req.body;
  const adminId = req.user.id;

  if (!category_id || !title || !req.file) {
    return res.status(400).json({ message: 'Category, title, and image are required' });
  }

  const imageUrl = await handleFileUpload(req.file);

  db.run(`INSERT INTO gallery (category_id, title, description, image_url, dimensions, medium, year, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id, title, description, imageUrl, dimensions, medium, year, is_featured ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      
      logActivity(adminId, 'Add Gallery Item', `Added gallery artwork "${title}"`);
      res.status(201).json({ message: 'Gallery item added successfully', item_id: this.lastID });
    }
  );
});

router.delete('/gallery/:id', requireAdmin, (req, res) => {
  const galleryId = req.params.id;
  const adminId = req.user.id;

  // Fetch the file path to remove it from disk
  db.get(`SELECT image_url, title FROM gallery WHERE id = ?`, [galleryId], (err, item) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    db.run(`DELETE FROM gallery WHERE id = ?`, [galleryId], function(err) {
      if (err) return res.status(500).json({ message: err.message });

      // Safely delete file
      if (item.image_url) {
        if (item.image_url.startsWith('http')) {
          deleteSupabaseFile(item.image_url);
        } else {
          const filePath = path.join(__dirname, '..', item.image_url);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file from disk:', err.message);
          });
        }
      }

      logActivity(adminId, 'Delete Gallery Item', `Deleted gallery artwork "${item.title}"`);
      res.json({ message: 'Gallery item deleted successfully' });
    });
  });
});

router.get('/categories', (req, res) => {
  db.all(`SELECT * FROM categories`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});


// ----------------------------------------------------
// TESTIMONIALS
// ----------------------------------------------------
router.get('/testimonials', (req, res) => {
  db.all(`SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.get('/testimonials/all', requireAdmin, (req, res) => {
  db.all(`SELECT * FROM testimonials ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/testimonials', (req, res) => {
  const { name, review, rating, avatar_url } = req.body;
  if (!name || !review || !rating) {
    return res.status(400).json({ message: 'Missing testimonial details' });
  }

  db.run(`INSERT INTO testimonials (name, avatar_url, review, rating, is_approved) VALUES (?, ?, ?, ?, 0)`,
    [name, avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', review, rating],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: 'Testimonial submitted, awaiting administrator approval.' });
    }
  );
});

router.put('/testimonials/:id/approve', requireAdmin, (req, res) => {
  const { is_approved } = req.body;
  const testimonialId = req.params.id;
  const adminId = req.user.id;

  db.run(`UPDATE testimonials SET is_approved = ? WHERE id = ?`, [is_approved ? 1 : 0, testimonialId], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    
    logActivity(adminId, 'Approve Testimonial', `Testimonial ID ${testimonialId} approval toggled to: ${is_approved}`);
    res.json({ message: 'Testimonial approval status updated successfully.' });
  });
});


// ----------------------------------------------------
// CONTACT MESSAGES
// ----------------------------------------------------
router.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }
  if (phone && !phoneRegex.test(phone.trim())) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }

  const cleanName = escapeHtml(name.trim());
  const cleanEmail = escapeHtml(email.trim().toLowerCase());
  const cleanPhone = phone ? escapeHtml(phone.trim()) : null;
  const cleanMessage = escapeHtml(message.trim());

  db.run(`INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)`,
    [cleanName, cleanEmail, cleanPhone, cleanMessage],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });

      sendMailNotification(
        cleanEmail,
        'Thank You for Contacting Kalaakar',
        `<h3>Hello ${cleanName},</h3><p>We have received your message:</p><p>"${cleanMessage}"</p><p>We will get back to you shortly.</p><p>Warm regards,<br/>Kalaakar</p>`
      );

      res.status(201).json({ message: 'Contact message sent successfully' });
    }
  );
});

router.get('/contact', requireAdmin, (req, res) => {
  db.all(`SELECT * FROM contact_messages ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.put('/contact/:id/reply', requireAdmin, (req, res) => {
  const messageId = req.params.id;
  const adminId = req.user.id;

  db.run(`UPDATE contact_messages SET is_replied = 1 WHERE id = ?`, [messageId], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    
    logActivity(adminId, 'Reply Contact Message', `Contact message ID ${messageId} marked as replied`);
    res.json({ message: 'Contact message status updated.' });
  });
});


// ----------------------------------------------------
// FAQ ENDPOINTS
// ----------------------------------------------------
router.get('/faq', (req, res) => {
  db.all(`SELECT * FROM faq ORDER BY category ASC, id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

router.post('/faq', requireAdmin, (req, res) => {
  const { question, answer, category } = req.body;
  const adminId = req.user.id;

  if (!question || !answer || !category) {
    return res.status(400).json({ message: 'Missing FAQ details' });
  }

  db.run(`INSERT INTO faq (question, answer, category) VALUES (?, ?, ?)`,
    [question, answer, category],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      
      logActivity(adminId, 'Add FAQ', `Added FAQ ID ${this.lastID}`);
      res.status(201).json({ message: 'FAQ added successfully', faq_id: this.lastID });
    }
  );
});

router.delete('/faq/:id', requireAdmin, (req, res) => {
  const faqId = req.params.id;
  const adminId = req.user.id;

  db.run(`DELETE FROM faq WHERE id = ?`, [faqId], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    
    logActivity(adminId, 'Delete FAQ', `Deleted FAQ ID ${faqId}`);
    res.json({ message: 'FAQ deleted successfully' });
  });
});


// ----------------------------------------------------
// ADMIN ACTIVITY LOGS & STATUS DASHBOARD
// ----------------------------------------------------
router.get('/activity-logs', requireAdmin, (req, res) => {
  db.all(`SELECT a.*, u.name as admin_name FROM activity_logs a LEFT JOIN users u ON a.admin_id = u.id ORDER BY a.created_at DESC LIMIT 100`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// Overall stats for Dashboard
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {};
  
  db.get(`SELECT COUNT(*) as count FROM custom_orders`, (err, r) => {
    stats.total_orders = r ? r.count : 0;
    
    db.get(`SELECT COUNT(*) as count FROM custom_orders WHERE status = 'pending'`, (err, r) => {
      stats.pending_orders = r ? r.count : 0;
      
      db.get(`SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'`, (err, r) => {
        stats.pending_quotes = r ? r.count : 0;
        
        db.get(`SELECT SUM(price) as revenue FROM custom_orders WHERE status = 'delivered' OR status = 'completed'`, (err, r) => {
          stats.revenue = r && r.revenue ? r.revenue : 0;
          
          db.get(`SELECT COUNT(*) as count FROM contact_messages WHERE is_replied = 0`, (err, r) => {
            stats.unread_messages = r ? r.count : 0;
            res.json(stats);
          });
        });
      });
    });
  });
});

module.exports = router;
