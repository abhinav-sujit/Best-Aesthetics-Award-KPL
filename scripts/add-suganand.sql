-- ============================================================================
-- ADD NEW EMPLOYEE: Suganand
-- This script adds a single new employee without affecting existing data
-- ============================================================================

-- Insert Suganand as 19th employee
-- Note: ID will be auto-assigned by PostgreSQL (next available ID)
INSERT INTO users (name, username, password, is_admin) VALUES
('Suganand', 'suganand', 'suganand3847', false);

-- Verify the insert
SELECT 'User added successfully:' as status, id, name, username FROM users WHERE username = 'suganand';

-- Verify total employee count
SELECT 'Total employees:' as status, COUNT(*) as count FROM users WHERE is_admin = false;

-- Verify total user count (should be 20: 1 admin + 19 employees)
SELECT 'Total users:' as status, COUNT(*) as count FROM users;
