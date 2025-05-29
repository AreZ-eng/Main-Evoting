-- Membuat tabel users
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255),
  alamat TEXT,
  tiket VARCHAR(255),
  tps INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Menyisipkan data ke dalam tabel users
INSERT INTO "users" (id, nama, alamat, tiket, tps, "createdAt", "updatedAt") 
VALUES
('a86e1b44-a49c-4e69-812f-d1b849760018', 'John Doe', '123 Main St, Springfield, IL', '$2b$08$dU899fYSTFB5mA3WClB0POjeWj0qfENVdiLHqTJVrDOEQiUFs8sIi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6b68295b-e2a4-4313-9b61-1c2b2922aa19', 'Jane Smith', '456 Oak St, Springfield, IL', '$2b$08$A74AmJm0RokL0hbvc.cnVeyH321qEL6fKSewzXZtHlJYPww2uIxTe', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d1623ada-a545-4249-bdc3-c9e0bd11dfe0', 'Alice Johnson', '789 Pine St, Springfield, IL', '$2b$08$94WGemtRnLt.bbelvrNTnex3rin1zt9gmpSUG0KjWwZl4sllTzbg6', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('95eee59f-db16-4ebc-8af5-2e81d4676695', 'Bob Brown', '101 Maple St, Springfield, IL', '$2b$08$kt31xVeHCeu7Tv01teMx1uKTueIYKB.t0nenUOvN8MAcYCG80XQpm', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('51f04eb7-0947-4344-b2c8-21651684695b', 'Charlie Green', '202 Birch St, Springfield, IL', '$2b$08$/HAZO5FJiSJf0Cjt5BNDxu5anAjN/lqJ7jzS54bIth8BskdpFsL5K', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ded9e73e-dff1-47fe-8e19-90ddd54a0977', 'David White', '303 Cedar St, Springfield, IL', '$2b$08$o1d1y91i9rw8kr/Z539QN.Y8NgYYBhkqz98mIYkI.dTjT6BV0kouW', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dba13c7b-33a8-42f9-be15-e64be9683aa9', 'Eva Black', '404 Elm St, Springfield, IL', '$2b$08$KBhTGD7lbYoQHlpO8Livv.to9X38D5XnVGDQPdzWDSvKpuI2D62US', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('51f82254-4659-4578-bc6e-b9adc0b50d86', 'Frank Blue', '505 Willow St, Springfield, IL', '$2b$08$Z6czd9bf0rj/skC6KURFHO31dX9a.yI2EOx.oqwzNvvp/QNR2aJFy', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ed60c247-7e2b-4cfb-ae72-6ac58713566c', 'Grace Red', '606 Chestnut St, Springfield, IL', '$2b$08$oaFkPy2Oyq2aMpba2N44UesT7QuIVSiu0XGHnicPp.GrykiQyJi8W', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a1537c60-5e50-415c-a46f-58789049b688', 'Henry Violet', '707 Fir St, Springfield, IL', '$2b$08$9umnFhbRI4ylqIy6AQ3qNewtqf0vrZGUWjpfvaABvkZbqV5kJNyXy', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Membuat tabel candidates
CREATE TABLE IF NOT EXISTS "candidates" (
  "candidateNumber" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  party VARCHAR(255),
  description TEXT,
  photoUrl TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menyisipkan data ke dalam tabel candidates
INSERT INTO "candidates" ("candidateNumber", name, party, description, photoUrl, "createdAt", "updatedAt") VALUES
('3e4d0d91-1b75-4a2c-97a0-87cfdad10b3a', 'John Doe', 'Party A', 'Experienced candidate with a passion for reform.', '/assets/calon-1.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7f64bde3-9334-4b12-a9d1-5096d270f630', 'Jane Smith', 'Party B', 'Dedicated to improving education and healthcare.', '/assets/calon-2.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2cfa146-fb2e-4a3a-8c61-e02438e1c6e2', 'Alice Johnson', 'Party C', 'Focused on technology and innovation.', '/assets/calon-3.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Membuat tabel admin untuk PostgreSQL/PostgREST
CREATE TABLE IF NOT EXISTS "admins" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contoh insert data admin (password harus di-hash, contoh di bawah hanya placeholder)
INSERT INTO "admins" (id, username, password, "createdAt", "updatedAt") VALUES
('22d3e3dc-4043-4b66-a957-63152d7726d5', 'admin', '$2b$08$JqemsCGtXlLAkrqXp52nAucbJJyB44qu5h7ZUq.5lnbulGIQBCDNO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Membuat tabel TPS
CREATE TABLE IF NOT EXISTS "tps" (
  id SERIAL PRIMARY KEY,
  alamat VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "tps" (id, alamat, "createdAt", "updatedAt") VALUES
(1, 'http://app_sub_api_1:7000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'http://app_sub_api_2:7000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
