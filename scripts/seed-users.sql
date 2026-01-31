-- Seed Users for KlimArt Voting Application
-- All users are non-admin (employees who can vote)
-- Password format: name + 4 random numbers

-- Insert all users
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
('Hemansh', 'hemansh', 'hemansh1675', false)
ON CONFLICT (username) DO NOTHING;
