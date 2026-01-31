-- Clear all existing votes to start fresh
-- Run this in Neon SQL Editor before users start voting

-- Delete all votes
DELETE FROM votes;

-- Delete all tie resolutions
DELETE FROM tie_resolutions;

-- Verify tables are empty
SELECT COUNT(*) as votes_count FROM votes;
SELECT COUNT(*) as ties_count FROM tie_resolutions;

-- You should see both counts as 0
