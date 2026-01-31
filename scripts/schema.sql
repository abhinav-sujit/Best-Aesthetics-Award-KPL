-- KlimArt Voting Application Database Schema
-- PostgreSQL Database Schema for Vercel Postgres

-- Users table (employees + admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voting dates table
CREATE TABLE IF NOT EXISTS voting_dates (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    voter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voting_date DATE NOT NULL REFERENCES voting_dates(date) ON DELETE CASCADE,
    voted_for_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_null_vote BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vote_per_date UNIQUE(voter_id, voting_date),
    CONSTRAINT valid_vote_check CHECK (
        (voted_for_id IS NOT NULL AND is_null_vote = FALSE) OR
        (voted_for_id IS NULL AND is_null_vote = TRUE)
    )
);

-- Tie resolutions table
CREATE TABLE IF NOT EXISTS tie_resolutions (
    id SERIAL PRIMARY KEY,
    voting_date DATE UNIQUE NOT NULL REFERENCES voting_dates(date) ON DELETE CASCADE,
    winner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voting_date ON votes(voting_date);
CREATE INDEX IF NOT EXISTS idx_votes_voted_for_id ON votes(voted_for_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_voting_dates_date ON voting_dates(date);
CREATE INDEX IF NOT EXISTS idx_tie_resolutions_date ON tie_resolutions(voting_date);

-- Update trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
