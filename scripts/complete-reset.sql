-- ============================================================================
-- COMPLETE DATABASE RESET
-- Removes all users and votes, then re-seeds with fresh data
-- ============================================================================

-- Step 1: Delete all votes (must do this first due to foreign keys)
DELETE FROM tie_resolutions;
DELETE FROM votes;

-- Step 2: Delete all users
DELETE FROM users;

-- Step 3: Reset the user ID sequence to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Step 4: Insert admin user (will get ID = 1)
INSERT INTO users (name, username, password, is_admin) VALUES
('Admin', 'admin', 'admin123', true);

-- Step 5: Insert all 17 employee users (will get IDs 2-18)
INSERT INTO users (name, username, password, is_admin) VALUES
('Kavya', 'kavya', 'kavya2847', false),
('Ganesh', 'ganesh', 'ganesh5921', false),
('Sahil', 'sahil', 'sahil1593', false),
('Prathiksha', 'prathiksha', 'prathiksha4571', false),
('Arpana', 'arpana', 'arpana9283', false),
('Hemanshu', 'hemanshu', 'hemanshu6142', false),
('Migom', 'migom', 'migom7395', false),
('Nikita', 'nikita', 'nikita4628', false),
('Sam', 'sam', 'sam1804', false),
('Satish', 'satish', 'satish5937', false),
('Sakshi', 'sakshi', 'sakshi2156', false),
('Sai Sidhardha', 'saisidhardha', 'saisidhardha6849', false),
('Abhinav', 'abhinav', 'abhinav3720', false),
('Shreya', 'shreya', 'shreya8514', false),
('Ramya', 'ramya', 'ramya9267', false),
('Chaitanya', 'chaitanya', 'chaitanya4083', false),
('Mrummayee', 'mrummayee', 'mrummayee1675', false),
('Mamatha', 'mamatha', 'mamatha7294', false);

-- Step 6: Verify the reset
SELECT 'Users created:' as status, COUNT(*) as count FROM users;
SELECT 'Admin users:' as status, COUNT(*) as count FROM users WHERE is_admin = true;
SELECT 'Employee users:' as status, COUNT(*) as count FROM users WHERE is_admin = false;
SELECT 'Total votes:' as status, COUNT(*) as count FROM votes;
