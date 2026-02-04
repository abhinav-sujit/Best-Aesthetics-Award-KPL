# Vote Data Backup Guide

This guide provides multiple methods to backup and export all voting data from the KlimArt Voting System.

---

## Quick Start (Recommended)

**Easiest method - Run the Node.js export script:**

```bash
node scripts/export-vote-data.js
```

This creates a complete JSON backup file: `scripts/vote-backup-YYYY-MM-DD.json`

---

## Method 1: Node.js Export Script (Recommended) ⭐

### Prerequisites
- Node.js installed
- `.env.local` file configured with `POSTGRES_URL`

### Steps

1. **Run the export script:**
   ```bash
   node scripts/export-vote-data.js
   ```

2. **Output location:**
   - File: `scripts/vote-backup-YYYY-MM-DD.json`
   - Contains: All votes, users, tie resolutions, and statistics

3. **What's included:**
   - Complete vote history (who voted for whom, when)
   - All user accounts (employees and admin)
   - Tie resolutions
   - Voting dates
   - Summary statistics
   - Candidate statistics (votes received)

### Example Output:
```
🔄 Starting vote data export...
📡 Testing database connection...
✅ Database connected
📊 Fetching all votes...
✅ Fetched 156 votes
🔀 Fetching tie resolutions...
✅ Fetched 3 tie resolutions
💾 Writing to file...
✅ Data exported successfully!

📋 Export Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 File: vote-backup-2026-02-02.json
📊 Total Votes: 156
👥 Total Users: 20
📅 Voting Dates: 21
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Method 2: SQL Queries (Manual Extraction)

### Prerequisites
- Access to Neon Console: https://console.neon.tech
- Or `psql` command-line tool

### Steps

1. **Open Neon SQL Editor:**
   - Go to https://console.neon.tech
   - Select your project
   - Click "SQL Editor"

2. **Run backup queries:**
   - Open `scripts/backup-vote-data.sql`
   - Copy and paste queries one section at a time
   - Export results manually from the interface

### Available Queries:

**Query 1: All Votes with Details**
```sql
SELECT
    v.id as vote_id,
    v.voting_date,
    voter.name as voter_name,
    candidate.name as voted_for_name,
    v.is_null_vote,
    v.voted_at
FROM votes v
JOIN users voter ON v.voter_id = voter.id
LEFT JOIN users candidate ON v.voted_for_id = candidate.id
ORDER BY v.voting_date ASC, v.voted_at ASC;
```

**Query 2: Vote Summary by Date**
```sql
SELECT
    voting_date,
    COUNT(*) as total_votes,
    COUNT(*) FILTER (WHERE is_null_vote = TRUE) as null_votes
FROM votes
GROUP BY voting_date
ORDER BY voting_date ASC;
```

**Query 3: Votes Received by Each Candidate**
```sql
SELECT
    u.name as candidate_name,
    COUNT(v.id) as total_votes_received
FROM users u
LEFT JOIN votes v ON u.id = v.voted_for_id
WHERE u.is_admin = FALSE
GROUP BY u.name
ORDER BY total_votes_received DESC;
```

**See `scripts/backup-vote-data.sql` for 10+ comprehensive queries!**

---

## Method 3: Admin Dashboard Export (If Working)

### Steps

1. **Login as admin:**
   - Go to your application URL
   - Username: `admin`
   - Password: `admin123`

2. **Navigate to Export:**
   - Click "Admin Dashboard" tab
   - Scroll to "Data Management" section
   - Click "Export Data as JSON" button

3. **Save the file:**
   - File will download as: `klimart_kpl_bestaesthetics_YYYY-MM-DD.json`

### If this doesn't work:
The export button might be calling the wrong function. Use **Method 1** or **Method 4** instead.

---

## Method 4: Direct API Call (Using curl)

### Prerequisites
- Admin login credentials
- Access token (JWT)

### Steps

1. **Get admin token:**
   ```bash
   # Login and get token
   TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}' \
     | jq -r '.token')
   ```

2. **Export data:**
   ```bash
   # Call export endpoint
   curl -X GET http://localhost:3000/api/admin/export \
     -H "Authorization: Bearer $TOKEN" \
     | jq '.' > vote-backup.json
   ```

3. **View the file:**
   ```bash
   cat vote-backup.json
   ```

### For Production (Vercel):
Replace `http://localhost:3000` with your production URL:
```bash
curl -X GET https://your-app.vercel.app/api/admin/export \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.' > vote-backup.json
```

---

## Method 5: Database Dump (Complete Backup)

### Full PostgreSQL Backup

**Using pg_dump (requires database access):**
```bash
# Backup entire database
pg_dump "$POSTGRES_URL" > database-backup-$(date +%Y-%m-%d).sql

# Backup specific tables only
pg_dump "$POSTGRES_URL" \
  -t votes \
  -t users \
  -t tie_resolutions \
  -t voting_dates \
  > tables-backup-$(date +%Y-%m-%d).sql
```

**Restore from backup:**
```bash
psql "$POSTGRES_URL" < database-backup-2026-02-02.sql
```

---

## What Data is Backed Up?

### Complete Data Structure:

```json
{
  "metadata": {
    "exportedAt": "2026-02-02T10:30:00.000Z",
    "version": "1.0.0"
  },
  "summary": {
    "totalUsers": 20,
    "totalEmployees": 19,
    "totalVotes": 156,
    "totalTieResolutions": 3
  },
  "users": [
    {
      "id": 1,
      "name": "Admin",
      "username": "admin",
      "isAdmin": true
    },
    {
      "id": 2,
      "name": "Kavya",
      "username": "kavya",
      "isAdmin": false
    }
    // ... more users
  ],
  "votes": [
    {
      "id": 1,
      "voterId": 2,
      "voterName": "Kavya",
      "date": "2026-01-02",
      "votedForId": 5,
      "votedForName": "Arpana",
      "isNullVote": false,
      "votedAt": "2026-01-02T09:15:30.000Z"
    }
    // ... more votes
  ],
  "tieResolutions": [
    {
      "id": 1,
      "date": "2026-01-05",
      "winnerId": 8,
      "winnerName": "Migom",
      "resolvedAt": "2026-01-05T18:00:00.000Z"
    }
    // ... more tie resolutions
  ],
  "voteSummaryByDate": [
    {
      "date": "2026-01-02",
      "totalVotes": 18,
      "nullVotes": 0,
      "regularVotes": 18
    }
    // ... more summaries
  ],
  "candidateStatistics": [
    {
      "candidateName": "Kavya",
      "totalVotesReceived": 15,
      "datesReceivedVotes": 8
    }
    // ... more candidates
  ]
}
```

---

## Backup Files Comparison

| Method | File Type | Size | Completeness | Ease of Use |
|--------|-----------|------|--------------|-------------|
| Node.js Script | JSON | ~50-200 KB | ⭐⭐⭐⭐⭐ Complete | ⭐⭐⭐⭐⭐ Very Easy |
| SQL Queries | Various | N/A | ⭐⭐⭐⭐ Customizable | ⭐⭐⭐ Medium |
| Admin Dashboard | JSON | ~30-100 KB | ⭐⭐⭐⭐ Complete | ⭐⭐⭐⭐⭐ Very Easy |
| API Call | JSON | ~30-100 KB | ⭐⭐⭐⭐ Complete | ⭐⭐⭐ Medium |
| Database Dump | SQL | ~500 KB+ | ⭐⭐⭐⭐⭐ Complete | ⭐⭐ Hard |

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check `.env.local` file exists
2. Verify `POSTGRES_URL` is set correctly
3. Test connection: `node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.POSTGRES_URL)"`

### Issue: "Admin dashboard export shows no data"
**Solution:**
1. Use **Method 1** (Node.js script) instead
2. Or try **Method 4** (Direct API call)
3. Check browser console for JavaScript errors

### Issue: "Permission denied"
**Solution:**
1. Make sure you're logged in as admin
2. Check token is valid: `localStorage.getItem('auth_token')`
3. Try logging out and back in

### Issue: "Script fails with module not found"
**Solution:**
```bash
# Install dependencies first
npm install

# Then run the script
node scripts/export-vote-data.js
```

---

## Automated Backups (Optional)

### Daily Backup via Cron (Linux/Mac)

1. **Create backup script:**
   ```bash
   #!/bin/bash
   cd /path/to/Best-Aesthetics-Award-KPL
   node scripts/export-vote-data.js
   ```

2. **Make executable:**
   ```bash
   chmod +x backup.sh
   ```

3. **Add to crontab:**
   ```bash
   crontab -e
   # Add: Run daily at 2 AM
   0 2 * * * /path/to/backup.sh
   ```

### Weekly Backup via GitHub Actions

Create `.github/workflows/backup.yml`:
```yaml
name: Weekly Vote Data Backup
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - name: Create backup
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
        run: node scripts/export-vote-data.js
      - name: Upload backup
        uses: actions/upload-artifact@v2
        with:
          name: vote-backup
          path: scripts/vote-backup-*.json
```

---

## Best Practices

✅ **DO:**
- Backup before making any database changes
- Store backups in multiple locations (local + cloud)
- Test restore process periodically
- Keep at least 3 recent backups
- Document backup schedule

❌ **DON'T:**
- Commit backup files to public repositories (contains passwords!)
- Delete old backups until you've verified new ones work
- Forget to backup before major updates
- Share backup files via insecure channels

---

## Quick Reference Commands

```bash
# 1. Quick JSON backup
node scripts/export-vote-data.js

# 2. View backup file
cat scripts/vote-backup-*.json | jq .

# 3. Check backup file size
ls -lh scripts/vote-backup-*.json

# 4. Count votes in backup
cat scripts/vote-backup-*.json | jq '.votes | length'

# 5. List all voters in backup
cat scripts/vote-backup-*.json | jq '.votes[].voterName' | sort -u

# 6. Get backup summary
cat scripts/vote-backup-*.json | jq '.summary'
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Verify database connection
4. Check `.env.local` configuration
5. Contact system administrator

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0
