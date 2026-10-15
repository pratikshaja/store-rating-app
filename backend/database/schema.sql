

-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS store_rating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

  -- user table

CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash, never plain text
  address    VARCHAR(400) DEFAULT NULL,
  role       ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(TRIM(name)) >= 20),
  CONSTRAINT chk_address_length CHECK (address IS NULL OR CHAR_LENGTH(address) <= 400),

  -- Indexes
  UNIQUE INDEX uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_name (name)
);

--stores table 
CREATE TABLE IF NOT EXISTS stores (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL,
  owner_id   INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key: owner must be an existing user
  CONSTRAINT fk_stores_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Indexes
  UNIQUE INDEX uq_stores_email (email),
  INDEX idx_stores_owner (owner_id),
  INDEX idx_stores_name (name),
  INDEX idx_stores_address (address(100))
);


-- 4. RATINGS TABLE

CREATE TABLE IF NOT EXISTS ratings (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  store_id   INT UNSIGNED NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),

  -- One rating per user per store
  CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id),

  -- Foreign keys
  CONSTRAINT fk_ratings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_ratings_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Indexes
  INDEX idx_ratings_user  (user_id),
  INDEX idx_ratings_store (store_id)
);


-- 5. SEED: First Admin Account

INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator Account',
  'admin@storerating.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '123 Admin Street, System City, 000001',
  'ADMIN'
)
ON DUPLICATE KEY UPDATE id = id;  
