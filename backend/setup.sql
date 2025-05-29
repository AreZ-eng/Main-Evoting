CREATE USER "${POSTGRES_USER}" WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE "${POSTGRES_DB}" OWNER "${POSTGRES_USER}";

-- INSERT INTO "users" (nama, alamat, tiket, tps, createdAt, updatedAt) 
-- VALUES
-- ('John Doe', '123 Main St, Springfield, IL', '$2b$08$dU899fYSTFB5mA3WClB0POjeWj0qfENVdiLHqTJVrDOEQiUFs8sIi', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Jane Smith', '456 Oak St, Springfield, IL', '$2b$08$A74AmJm0RokL0hbvc.cnVeyH321qEL6fKSewzXZtHlJYPww2uIxTe', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Alice Johnson', '789 Pine St, Springfield, IL', '$2b$08$94WGemtRnLt.bbelvrNTnex3rin1zt9gmpSUG0KjWwZl4sllTzbg6', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Bob Brown', '101 Maple St, Springfield, IL', '$2b$08$kt31xVeHCeu7Tv01teMx1uKTueIYKB.t0nenUOvN8MAcYCG80XQpm', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Charlie Green', '202 Birch St, Springfield, IL', '$2b$08$/HAZO5FJiSJf0Cjt5BNDxu5anAjN/lqJ7jzS54bIth8BskdpFsL5K', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('David White', '303 Cedar St, Springfield, IL', '$2b$08$o1d1y91i9rw8kr/Z539QN.Y8NgYYBhkqz98mIYkI.dTjT6BV0kouW', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Eva Black', '404 Elm St, Springfield, IL', '$2b$08$KBhTGD7lbYoQHlpO8Livv.to9X38D5XnVGDQPdzWDSvKpuI2D62US', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Frank Blue', '505 Willow St, Springfield, IL', '$2b$08$Z6czd9bf0rj/skC6KURFHO31dX9a.yI2EOx.oqwzNvvp/QNR2aJFy', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Grace Red', '606 Chestnut St, Springfield, IL', '$2b$08$oaFkPy2Oyq2aMpba2N44UesT7QuIVSiu0XGHnicPp.GrykiQyJi8W', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- ('Henry Violet', '707 Fir St, Springfield, IL', '$2b$08$9umnFhbRI4ylqIy6AQ3qNewtqf0vrZGUWjpfvaABvkZbqV5kJNyXy', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- INSERT INTO "candidates" ("candidateNumber", "name", "party", "description", "photoUrl", "createdAt", "updatedAt") 
-- VALUES
-- (1, 'John Doe', 'Party A', 'Experienced candidate with a passion for reform.', 'https://drive.google.com/uc?export=view&id=1Co4duiOtZ9WnGhhsah9BDwD3ChvCBix6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- (2, 'Jane Smith', 'Party B', 'Dedicated to improving education and healthcare.', 'https://drive.google.com/uc?export=view&id=1hqiwDQd1Iyu8UVnby7jhcBaHfIXvDYcB', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- (3, 'Alice Johnson', 'Party C', 'Focused on technology and innovation.', 'https://drive.google.com/uc?export=view&id=1UTKMhJG8H7du34CGd3WpL0TwTw-nWsSk', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
