# MongoDB Not Installed - Quick Solution

## Problem
MongoDB is not installed on your system. You have 2 options:

---

## ✅ OPTION 1: Use MongoDB Atlas (Cloud) - RECOMMENDED & FASTEST

This is the easiest option - no installation needed!

### Step 1: Create Free MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier available)
3. Create a cluster (choose free M0 tier)
4. Wait 3-5 minutes for cluster to be created

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 3: Update Backend Configuration

Edit `backend/.env` file:
```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/stockomni?retryWrites=true&w=majority
```

### Step 4: Restart Backend & Seed Database

The backend is already running, so just seed the database:

```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
node utils/seedData.js
```

**Done!** Login will work immediately.

---

## OPTION 2: Install MongoDB Locally

### Step 1: Download MongoDB

Go to: https://www.mongodb.com/try/download/community

- Choose: Windows
- Version: 7.0 or latest
- Package: MSI

### Step 2: Install

1. Run the installer
2. Choose "Complete" installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. Complete installation

### Step 3: Verify Installation

```powershell
mongod --version
```

Should show version number.

### Step 4: Start MongoDB Service

```powershell
# Run as Administrator
net start MongoBD
```

### Step 5: Seed Database

```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
node utils/seedData.js
```

---

## Which Option Should I Choose?

| Feature | MongoDB Atlas (Cloud) | Local MongoDB |
|---------|----------------------|---------------|
| Setup Time | 5 minutes | 15-20 minutes |
| Installation | None needed | Download & install |
| Free Tier | 512 MB storage | Unlimited |
| Internet Required | Yes | No |
| **Recommended** | ✅ **YES - Faster!** | For production |

---

## After MongoDB is Ready

Once you've set up MongoDB (either option), the login will work!

**Test it:**
1. Open login page
2. Email: `admin@stockomni.com`
3. Password: `admin123`
4. Click Login

You should be redirected to the dashboard!

---

## Current Status

✅ Backend server: Running on port 5000
✅ Frontend: Working
✅ Code: All fixed
❌ MongoDB: **Not installed** ← Fix this!

**Next Step:** Choose Option 1 (Atlas) or Option 2 (Local) above.
