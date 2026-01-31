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

-- Step 5: Insert all 19 employee users (will get IDs 2-20)
INSERT INTO users (name, username, password, is_admin) VALUES
('Kavya', 'kavya', 'kavya2847', false),
('Ganesh', 'ganesh', 'ganesh5921', false),
('Shashidhar', 'shashidhar', 'shashidhar3764', false),
('Sahil', 'sahil', 'sahil1593', false),
('Chirag', 'chirag', 'chirag8206', false),
('Prathiksha', 'prathiksha', 'prathiksha4571', false),
('Arpana', 'arpana', 'arpana9283', false),
('Migom', 'migom', 'migom6142', false),
('Nikita', 'nikita', 'nikita7395', false),
('Sam', 'sam', 'sam4628', false),
('Kritesh', 'kritesh', 'kritesh1804', false),
('Sakshi', 'sakshi', 'sakshi5937', false),
('Sai Sidhardha', 'saisidhardha', 'saisidhardha2156', false),
('Abhinav', 'abhinav', 'abhinav6849', false),
('Satish', 'satish', 'satish3720', false),
('Ramya', 'ramya', 'ramya8514', false),
('Chaitanya', 'chaitanya', 'chaitanya9267', false),
('Mrummayee', 'mrummayee', 'mrummayee4083', false),
('Hemansh', 'hemansh', 'hemansh1675', false);

-- Step 6: Verify the reset
SELECT 'Users created:' as status, COUNT(*) as count FROM users;
SELECT 'Admin users:' as status, COUNT(*) as count FROM users WHERE is_admin = true;
SELECT 'Employee users:' as status, COUNT(*) as count FROM users WHERE is_admin = false;
SELECT 'Total votes:' as status, COUNT(*) as count FROM votes;
