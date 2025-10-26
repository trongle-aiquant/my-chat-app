# MongoDB Storage - Quick Reference

## 📍 Where is My Data?

### Absolute Path
```
/Users/victor/codingspace/my-chat-app/.meteor/local/db/
```

### What's Inside?
```
.meteor/local/db/
├── collection-*.wt     ← Your messages & tasks (binary files)
├── index-*.wt          ← Indexes for fast queries
├── journal/            ← Transaction logs (crash recovery)
├── _mdb_catalog.wt     ← Database structure metadata
└── WiredTiger*         ← Storage engine files
```

## 💾 Your Data Files

| File Pattern | Contains | Size |
|-------------|----------|------|
| `collection-14-*.wt` | **Chat messages** | ~45 KB |
| `collection-19-*.wt` | **Todo tasks** | ~36 KB |
| `index-20-*.wt` | Message indexes | ~36 KB |
| `index-52-*.wt` | Task indexes | ~36 KB |

**Total Database Size**: ~1.6 MB

## 🔧 Common Commands

### View Database Size
```bash
du -sh .meteor/local/db/
```

### Connect to MongoDB
```bash
# While Meteor is running
meteor mongo
```

### List Collections
```javascript
// In meteor mongo shell
show collections
db.messages.count()
db.tasks.count()
```

### Backup Data
```bash
# Simple backup
cp -r .meteor/local/db .meteor/local/db.backup

# Or use mongodump
mongodump --port 3001 --db meteor --out ./backup
```

### Clear All Data
```bash
meteor reset
```

## 🔄 Data Flow

```
User Input
    ↓
React Component (ChatForm.tsx)
    ↓
Meteor Method (messages.insert)
    ↓
Collection (MessagesCollection)
    ↓
MongoDB Server (port 3001)
    ↓
WiredTiger Storage Engine
    ↓
Disk File (.meteor/local/db/collection-14-*.wt)
    ↓
Physical Storage (SSD/HDD)
```

## 🏗️ Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Location** | `.meteor/local/db/` | Remote MongoDB server |
| **Port** | 3001 | Custom (27017 or cloud) |
| **Access** | Localhost only | Network (authenticated) |
| **Reset** | `meteor reset` | Manual management |
| **Connection** | Automatic | `MONGO_URL` env variable |

## 📊 File Types Explained

| File | Purpose |
|------|---------|
| `collection-*.wt` | **Actual data** (messages, tasks) |
| `index-*.wt` | **Indexes** (for fast queries) |
| `journal/WiredTigerLog.*` | **Transaction log** (durability) |
| `_mdb_catalog.wt` | **Metadata** (collection info) |
| `mongod.lock` | **Lock file** (prevents multiple instances) |

## 🎯 Key Facts

- ✅ Data stored in **binary WiredTiger format** (not human-readable)
- ✅ Each collection gets its own `.wt` file
- ✅ MongoDB runs on **port 3001** during development
- ✅ Database name is **"meteor"** by default
- ✅ Total size: **~1.6 MB** (grows with data)
- ✅ Automatically managed by `meteor run`
- ⚠️ Deleted when you run `meteor reset`

## 🔍 Inspect Your Data

### Option 1: Meteor Mongo Shell
```bash
meteor run  # In one terminal
meteor mongo  # In another terminal

# Then:
> db.messages.find().pretty()
> db.tasks.find().pretty()
```

### Option 2: MongoDB Compass (GUI)
```bash
# Connection string:
mongodb://127.0.0.1:3001/meteor
```

### Option 3: Via Your App
```javascript
// In browser console (while app is running)
Meteor.call('messages.insert', 'Test', 'User', (err, result) => {
  console.log('Inserted:', result);
});
```

## 🧹 Maintenance

### When Database Gets Too Large
```bash
# Check size
du -sh .meteor/local/db/

# Clear old data
meteor mongo
> db.messages.remove({ createdAt: { $lt: new Date('2024-01-01') } })
```

### If Database is Corrupted
```bash
# Stop Meteor
Ctrl+C

# Reset database
meteor reset

# Restart
meteor run
```

### Backup Before Major Changes
```bash
# Backup
cp -r .meteor/local/db .meteor/local/db.backup.$(date +%Y%m%d)

# Restore if needed
rm -rf .meteor/local/db
mv .meteor/local/db.backup.20251026 .meteor/local/db
```

## 📚 Related Files

- **Documentation**: `MONGODB_STORAGE_ARCHITECTURE.md` (detailed guide)
- **Collections**: `imports/api/messages.ts`, `imports/api/tasks.ts`
- **Methods**: `imports/api/messagesMethods.ts`, `imports/api/tasksMethods.ts`
- **Publications**: `imports/api/messagesPublications.ts`, `imports/api/tasksPublications.ts`

---

**Your data is safely stored in `.meteor/local/db/` and managed automatically by Meteor!**

