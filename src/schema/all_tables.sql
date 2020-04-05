DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY NOT NULL,
  phone_number text NOT NULL,
  temp_pin numeric NOT NULL,
  device_id text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);