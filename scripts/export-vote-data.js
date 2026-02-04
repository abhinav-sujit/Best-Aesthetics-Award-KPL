/**
 * Vote Data Export Script
 * Exports all voting data to a JSON file
 *
 * Usage:
 *   node scripts/export-vote-data.js
 *
 * Output:
 *   Creates: vote-backup-YYYY-MM-DD.json in the scripts directory
 */

require('dotenv').config({ path: '.env.local' });
const { query, testConnection } = require('../lib/db');
const fs = require('fs');
const path = require('path');

async function exportVoteData() {
    console.log('🔄 Starting vote data export...\n');

    try {
        // Test database connection
        console.log('📡 Testing database connection...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connected\n');

        // 1. Get all votes with details
        console.log('📊 Fetching all votes...');
        const votesResult = await query(
            `SELECT
                v.id,
                v.voter_id,
                voter.name as voter_name,
                voter.username as voter_username,
                v.voting_date,
                v.voted_for_id,
                candidate.name as voted_for_name,
                v.is_null_vote,
                v.voted_at
             FROM votes v
             JOIN users voter ON v.voter_id = voter.id
             LEFT JOIN users candidate ON v.voted_for_id = candidate.id
             ORDER BY v.voting_date ASC, v.voted_at ASC`
        );
        console.log(`✅ Fetched ${votesResult.rows.length} votes\n`);

        // 2. Get all tie resolutions
        console.log('🔀 Fetching tie resolutions...');
        const tiesResult = await query(
            `SELECT
                tr.id,
                tr.voting_date,
                tr.winner_id,
                u.name as winner_name,
                tr.resolved_at,
                tr.resolved_by,
                resolver.name as resolved_by_name
             FROM tie_resolutions tr
             JOIN users u ON tr.winner_id = u.id
             LEFT JOIN users resolver ON tr.resolved_by = resolver.id
             ORDER BY tr.voting_date ASC`
        );
        console.log(`✅ Fetched ${tiesResult.rows.length} tie resolutions\n`);

        // 3. Get all users
        console.log('👥 Fetching all users...');
        const usersResult = await query(
            `SELECT id, name, username, is_admin, created_at
             FROM users
             ORDER BY id ASC`
        );
        console.log(`✅ Fetched ${usersResult.rows.length} users\n`);

        // 4. Get all voting dates
        console.log('📅 Fetching voting dates...');
        const datesResult = await query(
            `SELECT date, is_active
             FROM voting_dates
             ORDER BY date ASC`
        );
        console.log(`✅ Fetched ${datesResult.rows.length} voting dates\n`);

        // 5. Get vote summary by date
        console.log('📈 Calculating vote summary...');
        const summaryResult = await query(
            `SELECT
                voting_date,
                COUNT(*) as total_votes,
                COUNT(*) FILTER (WHERE is_null_vote = TRUE) as null_votes,
                COUNT(*) FILTER (WHERE is_null_vote = FALSE) as regular_votes,
                COUNT(DISTINCT voter_id) as unique_voters
             FROM votes
             GROUP BY voting_date
             ORDER BY voting_date ASC`
        );
        console.log(`✅ Generated summary for ${summaryResult.rows.length} dates\n`);

        // 6. Get votes received by each candidate
        console.log('🎯 Calculating candidate statistics...');
        const candidateStatsResult = await query(
            `SELECT
                u.id as candidate_id,
                u.name as candidate_name,
                COUNT(v.id) as total_votes_received,
                COUNT(DISTINCT v.voting_date) as dates_received_votes
             FROM users u
             LEFT JOIN votes v ON u.id = v.voted_for_id AND v.is_null_vote = FALSE
             WHERE u.is_admin = FALSE
             GROUP BY u.id, u.name
             ORDER BY total_votes_received DESC, u.name ASC`
        );
        console.log(`✅ Generated stats for ${candidateStatsResult.rows.length} candidates\n`);

        // Format the data
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: 'vote-data-export-script',
                version: '1.0.0'
            },
            summary: {
                totalUsers: usersResult.rows.length,
                totalEmployees: usersResult.rows.filter(u => !u.is_admin).length,
                totalVotes: votesResult.rows.length,
                totalTieResolutions: tiesResult.rows.length,
                totalVotingDates: datesResult.rows.length,
                dateRange: {
                    earliest: datesResult.rows[0]?.date,
                    latest: datesResult.rows[datesResult.rows.length - 1]?.date
                }
            },
            users: usersResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                username: row.username,
                isAdmin: row.is_admin,
                createdAt: row.created_at
            })),
            votingDates: datesResult.rows.map(row => ({
                date: row.date.toISOString().split('T')[0],
                isActive: row.is_active
            })),
            votes: votesResult.rows.map(row => ({
                id: row.id,
                voterId: row.voter_id,
                voterName: row.voter_name,
                voterUsername: row.voter_username,
                date: row.voting_date.toISOString().split('T')[0],
                votedForId: row.voted_for_id,
                votedForName: row.voted_for_name || 'NULL VOTE',
                isNullVote: row.is_null_vote,
                votedAt: row.voted_at
            })),
            tieResolutions: tiesResult.rows.map(row => ({
                id: row.id,
                date: row.voting_date.toISOString().split('T')[0],
                winnerId: row.winner_id,
                winnerName: row.winner_name,
                resolvedAt: row.resolved_at,
                resolvedBy: row.resolved_by,
                resolvedByName: row.resolved_by_name
            })),
            voteSummaryByDate: summaryResult.rows.map(row => ({
                date: row.voting_date.toISOString().split('T')[0],
                totalVotes: parseInt(row.total_votes),
                nullVotes: parseInt(row.null_votes),
                regularVotes: parseInt(row.regular_votes),
                uniqueVoters: parseInt(row.unique_voters)
            })),
            candidateStatistics: candidateStatsResult.rows.map(row => ({
                candidateId: row.candidate_id,
                candidateName: row.candidate_name,
                totalVotesReceived: parseInt(row.total_votes_received),
                datesReceivedVotes: parseInt(row.dates_received_votes)
            }))
        };

        // Create filename with current date
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `vote-backup-${dateStr}.json`;
        const filepath = path.join(__dirname, filename);

        // Write to file
        console.log('💾 Writing to file...');
        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Data exported successfully!\n`);

        // Print summary
        console.log('📋 Export Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📄 File: ${filename}`);
        console.log(`📍 Location: ${filepath}`);
        console.log(`📊 Total Votes: ${exportData.votes.length}`);
        console.log(`👥 Total Users: ${exportData.users.length}`);
        console.log(`📅 Voting Dates: ${exportData.votingDates.length}`);
        console.log(`🔀 Tie Resolutions: ${exportData.tieResolutions.length}`);
        console.log(`📦 File Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✨ Backup complete! You can now safely store this file.\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Export failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run export
exportVoteData();
