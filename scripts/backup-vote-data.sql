-- ============================================================================
-- COMPREHENSIVE VOTE DATA BACKUP SCRIPT
-- Exports all voting data from the database
-- Run this in Neon SQL Editor or via psql
-- ============================================================================

-- ============================================================================
-- 1. ALL VOTES WITH DETAILS
-- ============================================================================
-- This shows every vote cast with voter name, candidate name, and date
SELECT
    v.id as vote_id,
    v.voting_date,
    v.voter_id,
    voter.name as voter_name,
    voter.username as voter_username,
    v.voted_for_id,
    CASE
        WHEN v.is_null_vote = TRUE THEN 'NULL VOTE'
        ELSE candidate.name
    END as voted_for_name,
    v.is_null_vote,
    v.voted_at,
    TO_CHAR(v.voted_at, 'YYYY-MM-DD HH24:MI:SS') as voted_at_formatted
FROM votes v
JOIN users voter ON v.voter_id = voter.id
LEFT JOIN users candidate ON v.voted_for_id = candidate.id
ORDER BY v.voting_date ASC, v.voted_at ASC;

-- ============================================================================
-- 2. VOTE SUMMARY BY DATE
-- ============================================================================
-- Shows how many votes were cast each day
SELECT
    voting_date,
    COUNT(*) as total_votes,
    COUNT(*) FILTER (WHERE is_null_vote = TRUE) as null_votes,
    COUNT(*) FILTER (WHERE is_null_vote = FALSE) as regular_votes,
    COUNT(DISTINCT voter_id) as unique_voters
FROM votes
GROUP BY voting_date
ORDER BY voting_date ASC;

-- ============================================================================
-- 3. VOTES RECEIVED BY EACH CANDIDATE
-- ============================================================================
-- Shows how many votes each employee has received (all time)
SELECT
    u.id as candidate_id,
    u.name as candidate_name,
    COUNT(v.id) as total_votes_received,
    COUNT(DISTINCT v.voting_date) as dates_received_votes,
    MIN(v.voting_date) as first_vote_date,
    MAX(v.voting_date) as last_vote_date
FROM users u
LEFT JOIN votes v ON u.id = v.voted_for_id AND v.is_null_vote = FALSE
WHERE u.is_admin = FALSE
GROUP BY u.id, u.name
ORDER BY total_votes_received DESC, u.name ASC;

-- ============================================================================
-- 4. VOTING PARTICIPATION BY EMPLOYEE
-- ============================================================================
-- Shows which employees have voted on which dates
SELECT
    u.id as employee_id,
    u.name as employee_name,
    COUNT(v.id) as days_voted,
    STRING_AGG(TO_CHAR(v.voting_date, 'YYYY-MM-DD'), ', ' ORDER BY v.voting_date) as dates_voted
FROM users u
LEFT JOIN votes v ON u.id = v.voter_id
WHERE u.is_admin = FALSE
GROUP BY u.id, u.name
ORDER BY days_voted DESC, u.name ASC;

-- ============================================================================
-- 5. DAILY RESULTS (WINNERS/TIES)
-- ============================================================================
-- Shows the winner or tie situation for each voting date
WITH daily_vote_counts AS (
    SELECT
        voting_date,
        voted_for_id,
        u.name as candidate_name,
        COUNT(*) as vote_count,
        RANK() OVER (PARTITION BY voting_date ORDER BY COUNT(*) DESC) as rank
    FROM votes
    JOIN users u ON votes.voted_for_id = u.id
    WHERE is_null_vote = FALSE
    GROUP BY voting_date, voted_for_id, u.name
)
SELECT
    voting_date,
    CASE
        WHEN COUNT(*) FILTER (WHERE rank = 1) > 1 THEN 'TIE'
        ELSE 'WINNER'
    END as status,
    STRING_AGG(
        candidate_name || ' (' || vote_count || ' votes)',
        ', '
        ORDER BY vote_count DESC
    ) FILTER (WHERE rank = 1) as top_candidates
FROM daily_vote_counts
GROUP BY voting_date
ORDER BY voting_date ASC;

-- ============================================================================
-- 6. TIE RESOLUTIONS
-- ============================================================================
-- Shows all tie resolutions that have been made
SELECT
    tr.id as resolution_id,
    tr.voting_date,
    tr.winner_id,
    winner.name as winner_name,
    tr.resolved_at,
    TO_CHAR(tr.resolved_at, 'YYYY-MM-DD HH24:MI:SS') as resolved_at_formatted,
    tr.resolved_by as resolver_id,
    resolver.name as resolver_name
FROM tie_resolutions tr
JOIN users winner ON tr.winner_id = winner.id
LEFT JOIN users resolver ON tr.resolved_by = resolver.id
ORDER BY tr.voting_date ASC;

-- ============================================================================
-- 7. COMPLETE VOTE MATRIX (ALL EMPLOYEES X ALL DATES)
-- ============================================================================
-- Shows who voted for whom on each date
SELECT
    voter.name as voter,
    v.voting_date as date,
    CASE
        WHEN v.is_null_vote = TRUE THEN 'NULL VOTE'
        ELSE candidate.name
    END as voted_for
FROM users voter
LEFT JOIN votes v ON voter.id = v.voter_id
LEFT JOIN users candidate ON v.voted_for_id = candidate.id
WHERE voter.is_admin = FALSE
ORDER BY v.voting_date ASC, voter.name ASC;

-- ============================================================================
-- 8. EMPLOYEES WHO HAVEN'T VOTED YET (CURRENT ACTIVE DATES)
-- ============================================================================
-- Shows which employees haven't voted on active voting dates
SELECT
    vd.date as voting_date,
    u.id as employee_id,
    u.name as employee_name
FROM voting_dates vd
CROSS JOIN users u
WHERE vd.is_active = TRUE
  AND u.is_admin = FALSE
  AND NOT EXISTS (
      SELECT 1
      FROM votes v
      WHERE v.voter_id = u.id
        AND v.voting_date = vd.date
  )
ORDER BY vd.date ASC, u.name ASC;

-- ============================================================================
-- 9. EXPORT AS CSV FORMAT (MAIN VOTES TABLE)
-- ============================================================================
-- Copy this output to create a CSV file
\copy (SELECT v.id as vote_id, TO_CHAR(v.voting_date, 'YYYY-MM-DD') as date, v.voter_id, voter.name as voter_name, v.voted_for_id, COALESCE(candidate.name, 'NULL VOTE') as voted_for_name, v.is_null_vote, TO_CHAR(v.voted_at, 'YYYY-MM-DD HH24:MI:SS') as voted_at FROM votes v JOIN users voter ON v.voter_id = voter.id LEFT JOIN users candidate ON v.voted_for_id = candidate.id ORDER BY v.voting_date, v.voted_at) TO '/tmp/votes_backup.csv' WITH CSV HEADER;

-- ============================================================================
-- 10. DATABASE STATISTICS
-- ============================================================================
-- Overall statistics about the voting system
SELECT
    'Total Users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT
    'Admin Users',
    COUNT(*) FILTER (WHERE is_admin = TRUE)
FROM users
UNION ALL
SELECT
    'Employee Users',
    COUNT(*) FILTER (WHERE is_admin = FALSE)
FROM users
UNION ALL
SELECT
    'Total Votes Cast',
    COUNT(*)
FROM votes
UNION ALL
SELECT
    'Null Votes Cast',
    COUNT(*) FILTER (WHERE is_null_vote = TRUE)
FROM votes
UNION ALL
SELECT
    'Regular Votes Cast',
    COUNT(*) FILTER (WHERE is_null_vote = FALSE)
FROM votes
UNION ALL
SELECT
    'Total Voting Dates',
    COUNT(*)
FROM voting_dates
UNION ALL
SELECT
    'Active Voting Dates',
    COUNT(*) FILTER (WHERE is_active = TRUE)
FROM voting_dates
UNION ALL
SELECT
    'Tie Resolutions',
    COUNT(*)
FROM tie_resolutions;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Run these queries in Neon SQL Editor: https://console.neon.tech
-- 2. Each query section can be run independently
-- 3. Query #9 exports to CSV (requires file system access)
-- 4. For JSON export, use the admin dashboard or API endpoint
-- 5. Save results by copying from the query results table
-- 6. Queries are read-only and safe to run multiple times
-- ============================================================================
