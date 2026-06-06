-- PostgreSQL / Supabase Schema for Kalaakar Database

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions VARCHAR(255) DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table (Pricing / Offerings)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
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
);

-- 6. Custom Orders Table
CREATE TABLE IF NOT EXISTS custom_orders (
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
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, delivered, rejected
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Order Status Logs Table
CREATE TABLE IF NOT EXISTS order_status_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Quotes Table (Quotation Request System)
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    proposed_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, negotiating, rejected
    admin_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    review TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    is_approved INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_replied INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. FAQ Table
CREATE TABLE IF NOT EXISTS faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for high-performance retrieval
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON custom_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_logs_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category_id);
