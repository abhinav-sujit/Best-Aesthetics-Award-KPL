# User Login Credentials - KlimArt Voting Application

⚠️ **IMPORTANT:** Run `scripts/complete-reset.sql` in Neon before distributing these credentials to ensure the database matches these users.

## Admin Login
- **Username:** admin
- **Password:** admin123
- **Role:** Administrator
- **Database ID:** 1

---

## Employee Logins (All users who can vote)

| ID | Name | Username | Password |
|----|------|----------|----------|
| 2 | Kavya | kavya | kavya2847 |
| 3 | Ganesh | ganesh | ganesh5921 |
| 4 | Sahil | sahil | sahil1593 |
| 5 | Prathiksha | prathiksha | prathiksha4571 |
| 6 | Arpana | arpana | arpana9283 |
| 7 | Hemanshu | hemanshu | hemanshu6142 |
| 8 | Migom | migom | migom7395 |
| 9 | Nikita | nikita | nikita4628 |
| 10 | Sam | sam | sam1804 |
| 11 | Satish | satish | satish5937 |
| 12 | Sakshi | sakshi | sakshi2156 |
| 13 | Sai Sidhardha | saisidhardha | saisidhardha6849 |
| 14 | Abhinav | abhinav | abhinav3720 |
| 15 | Shreya | shreya | shreya8514 |
| 16 | Ramya | ramya | ramya9267 |
| 17 | Chaitanya | chaitanya | chaitanya4083 |
| 18 | Mrummayee | mrummayee | mrummayee1675 |
| 19 | Mamatha | mamatha | mamatha7294 |

---

## Total Users
- **Admin:** 1 (ID: 1)
- **Employees:** 17 (IDs: 2-18)
- **Total:** 18

---

## Database Reset Instructions

### To Reset Database to Clean State:

1. **Go to Neon Console:** https://console.neon.tech
2. **Open SQL Editor** for your project
3. **Copy and paste** the entire contents of `scripts/complete-reset.sql`
4. **Click "Run"**
5. **Verify output:**
   - Users created: 18
   - Admin users: 1
   - Employee users: 17
   - Total votes: 0

### After Reset:

1. **All old votes deleted** - Fresh start for voting
2. **User IDs are consistent** - IDs 1-18 as shown above
3. **No orphaned data** - Database is clean
4. **Ready to vote** - All employees can now log in and vote

---

## Quick Copy Format (CSV)

```csv
Name,Username,Password,Role,ID
Admin,admin,admin123,Admin,1
Kavya,kavya,kavya2847,Employee,2
Ganesh,ganesh,ganesh5921,Employee,3
Sahil,sahil,sahil1593,Employee,4
Prathiksha,prathiksha,prathiksha4571,Employee,5
Arpana,arpana,arpana9283,Employee,6
Hemanshu,hemanshu,hemanshu6142,Employee,7
Migom,migom,migom7395,Employee,8
Nikita,nikita,nikita4628,Employee,9
Sam,sam,sam1804,Employee,10
Satish,satish,satish5937,Employee,11
Sakshi,sakshi,sakshi2156,Employee,12
Sai Sidhardha,saisidhardha,saisidhardha6849,Employee,13
Abhinav,abhinav,abhinav3720,Employee,14
Shreya,shreya,shreya8514,Employee,15
Ramya,ramya,ramya9267,Employee,16
Chaitanya,chaitanya,chaitanya4083,Employee,17
Mrummayee,mrummayee,mrummayee1675,Employee,18
Mamatha,mamatha,mamatha7294,Employee,19
```

---

## How Voting Works
- Each employee can vote for ONE other employee per voting date
- Employees vote for who has the "Best Aesthetics" for that day
- Employees CANNOT vote for themselves
- Each employee can only vote once per date

---

## Notes

⚠️ **Security Notice:** Passwords are currently stored as plain text. This is for demonstration purposes only. In production, passwords should be hashed using bcrypt or similar.

📝 **Distribute Carefully:** Share credentials securely with each employee. Do not post in public channels.

🔄 **Clean State:** After running `complete-reset.sql`, this database will be in a clean state ready for fresh voting with no "undefined" errors.
