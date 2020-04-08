DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS login CASCADE;


CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY NOT NULL,
  device_id text NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS login (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  created_at timestamp DEFAULT NOW()
);