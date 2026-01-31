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
| 4 | Shashidhar | shashidhar | shashidhar3764 |
| 5 | Sahil | sahil | sahil1593 |
| 6 | Chirag | chirag | chirag8206 |
| 7 | Prathiksha | prathiksha | prathiksha4571 |
| 8 | Arpana | arpana | arpana9283 |
| 9 | Migom | migom | migom6142 |
| 10 | Nikita | nikita | nikita7395 |
| 11 | Sam | sam | sam4628 |
| 12 | Kritesh | kritesh | kritesh1804 |
| 13 | Sakshi | sakshi | sakshi5937 |
| 14 | Sai Sidhardha | saisidhardha | saisidhardha2156 |
| 15 | Abhinav | abhinav | abhinav6849 |
| 16 | Satish | satish | satish3720 |
| 17 | Ramya | ramya | ramya8514 |
| 18 | Chaitanya | chaitanya | chaitanya9267 |
| 19 | Mrummayee | mrummayee | mrummayee4083 |
| 20 | Hemansh | hemansh | hemansh1675 |

---

## Total Users
- **Admin:** 1 (ID: 1)
- **Employees:** 19 (IDs: 2-20)
- **Total:** 20

---

## Database Reset Instructions

### To Reset Database to Clean State:

1. **Go to Neon Console:** https://console.neon.tech
2. **Open SQL Editor** for your project
3. **Copy and paste** the entire contents of `scripts/complete-reset.sql`
4. **Click "Run"**
5. **Verify output:**
   - Users created: 20
   - Admin users: 1
   - Employee users: 19
   - Total votes: 0

### After Reset:

1. **All old votes deleted** - Fresh start for voting
2. **User IDs are consistent** - IDs 1-20 as shown above
3. **No orphaned data** - Database is clean
4. **Ready to vote** - All employees can now log in and vote

---

## Quick Copy Format (CSV)

```csv
Name,Username,Password,Role,ID
Admin,admin,admin123,Admin,1
Kavya,kavya,kavya2847,Employee,2
Ganesh,ganesh,ganesh5921,Employee,3
Shashidhar,shashidhar,shashidhar3764,Employee,4
Sahil,sahil,sahil1593,Employee,5
Chirag,chirag,chirag8206,Employee,6
Prathiksha,prathiksha,prathiksha4571,Employee,7
Arpana,arpana,arpana9283,Employee,8
Migom,migom,migom6142,Employee,9
Nikita,nikita,nikita7395,Employee,10
Sam,sam,sam4628,Employee,11
Kritesh,kritesh,kritesh1804,Employee,12
Sakshi,sakshi,sakshi5937,Employee,13
Sai Sidhardha,saisidhardha,saisidhardha2156,Employee,14
Abhinav,abhinav,abhinav6849,Employee,15
Satish,satish,satish3720,Employee,16
Ramya,ramya,ramya8514,Employee,17
Chaitanya,chaitanya,chaitanya9267,Employee,18
Mrummayee,mrummayee,mrummayee4083,Employee,19
Hemansh,hemansh,hemansh1675,Employee,20
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
