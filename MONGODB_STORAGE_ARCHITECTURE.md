# Meteor MongoDB Storage Architecture

## 📍 Complete File Path to Local MongoDB Database

### Absolute Path
```
/Users/victor/codingspace/my-chat-app/.meteor/local/db/
```

### Relative Path (from project root)
```
.meteor/local/db/
```

## 🗂️ Directory Structure

```
my-chat-app/
└── .meteor/
    └── local/                          # Local development files
        ├── db/                         # ⭐ MONGODB DATABASE DIRECTORY
        │   ├── WiredTiger              # WiredTiger storage engine config
        │   ├── WiredTiger.lock         # Lock file (prevents multiple instances)
        │   ├── WiredTiger.turtle       # Metadata checkpoint file
        │   ├── WiredTiger.wt           # Main WiredTiger metadata
        │   ├── WiredTigerHS.wt         # History store
        │   ├── _mdb_catalog.wt         # MongoDB catalog (database/collection metadata)
        │   ├── mongod.lock             # MongoDB lock file
        │   ├── storage.bson            # Storage engine configuration
        │   ├── sizeStorer.wt           # Collection size tracking
        │   ├── METEOR-PORT             # Port number file (3001)
        │   │
        │   ├── collection-*.wt         # 📦 ACTUAL DATA FILES (your messages & tasks!)
        │   ├── index-*.wt              # 🔍 INDEX FILES (for fast queries)
        │   │
        │   ├── journal/                # Write-ahead log for durability
        │   │   ├── WiredTigerLog.*     # Transaction logs
        │   │   └── WiredTigerPreplog.* # Prepared transaction logs
        │   │
        │   └── diagnostic.data/        # Performance metrics
        │       └── metrics.*           # MongoDB diagnostic data
        │
        ├── build/                      # Compiled application code
        ├── bundler-cache/              # Build cache
        ├── plugin-cache/               # Meteor plugin cache
        ├── types/                      # TypeScript type definitions
        ├── shell/                      # Meteor shell data
        └── server-cache/               # Server-side cache
```

## 💾 Where Your Data is Actually Stored

### 1. **Collection Data Files** (`collection-*.wt`)

Your chat messages and todo tasks are stored in **WiredTiger collection files**:

```bash
# Example files from your database:
collection-14--1779045515537650032.wt  # 45 KB - Likely your messages collection
collection-19--1779045515537650032.wt  # 36 KB - Likely your tasks collection
collection-2--1779045515537650032.wt   # 36 KB - System collection
```

**Key Points**:
- Each MongoDB collection gets its own `.wt` (WiredTiger) file
- The number suffix is a unique identifier for the collection
- File size grows as you add more documents
- Binary format (not human-readable)

### 2. **Index Files** (`index-*.wt`)

Indexes for fast queries are stored separately:

```bash
index-20--1779045515537650032.wt  # Index for messages (e.g., _id index)
index-52--1779045515537650032.wt  # Index for tasks
```

### 3. **Database Metadata** (`_mdb_catalog.wt`)

Contains information about:
- Database names
- Collection names
- Collection options
- Index definitions

## 🔍 Understanding WiredTiger Storage Engine

MongoDB 7.0 (used by Meteor 3.3.2) uses **WiredTiger** as the storage engine.

### What is WiredTiger?

- **High-performance** storage engine
- **Document-level concurrency** (multiple operations can happen simultaneously)
- **Compression** (saves disk space)
- **Journaling** (crash recovery)

### File Types Explained

| File | Purpose | Contains |
|------|---------|----------|
| `collection-*.wt` | **Your actual data** | Messages, tasks, user documents |
| `index-*.wt` | **Indexes** | B-tree indexes for fast queries |
| `WiredTiger.wt` | **Metadata** | Storage engine configuration |
| `_mdb_catalog.wt` | **Catalog** | Database/collection structure |
| `journal/WiredTigerLog.*` | **Transaction log** | Write-ahead log for durability |
| `mongod.lock` | **Lock file** | Prevents multiple MongoDB instances |
| `sizeStorer.wt` | **Size tracking** | Collection and index sizes |

## 📊 Current Database Size

```bash
# Total size of your MongoDB database
$ du -sh .meteor/local/db/
1.6M    .meteor/local/db/

# Breakdown:
# - Collection data: ~500 KB
# - Indexes: ~300 KB
# - Journal: ~200 MB (pre-allocated, sparse files)
# - Metadata: ~100 KB
```

**Note**: Journal files are pre-allocated to 100MB each but don't actually use that much disk space (sparse files).

## 🔄 Data Flow: From Your App to Disk

### When You Insert a Message

```javascript
// In your app
Meteor.call('messages.insert', 'Hello World', 'John');
```

**What happens**:

1. **Client** → Sends method call to server via DDP (WebSocket)
2. **Server** → Validates input with `check` package
3. **Server** → Calls `MessagesCollection.insert()`
4. **MongoDB Driver** → Sends insert command to MongoDB
5. **MongoDB** → Writes to journal (`journal/WiredTigerLog.*`)
6. **MongoDB** → Writes to collection file (`collection-14-*.wt`)
7. **MongoDB** → Updates indexes (`index-20-*.wt`)
8. **MongoDB** → Returns inserted document ID
9. **Server** → Publishes change to all subscribed clients
10. **Client** → MiniMongo updates local cache
11. **React** → UI re-renders with new message

### Physical Storage Path

```
Your Message: { text: "Hello", username: "John", createdAt: Date }
      ↓
MongoDB Server (port 3001)
      ↓
WiredTiger Storage Engine
      ↓
/Users/victor/codingspace/my-chat-app/.meteor/local/db/collection-14-*.wt
      ↓
Disk (SSD/HDD)
```

## 🏗️ Development vs Production Storage

### Development (Local)

| Aspect | Development |
|--------|-------------|
| **Location** | `.meteor/local/db/` |
| **MongoDB Version** | 7.0.16 (bundled with Meteor) |
| **Port** | 3001 (default) |
| **Access** | Only localhost |
| **Persistence** | Local disk |
| **Command** | Managed by `meteor run` |
| **Reset** | `meteor reset` clears all data |

### Production (Deployed)

| Aspect | Production |
|--------|------------|
| **Location** | External MongoDB server (e.g., MongoDB Atlas, mLab) |
| **MongoDB Version** | Any compatible version (usually latest) |
| **Port** | Custom (usually 27017 or cloud URL) |
| **Access** | Network accessible (with authentication) |
| **Persistence** | Cloud storage / Remote server |
| **Command** | Separate MongoDB instance |
| **Reset** | Manual database management |

### Key Differences

1. **Location**:
   - **Dev**: Local filesystem (`.meteor/local/db/`)
   - **Prod**: Remote server (MongoDB Atlas, AWS, etc.)

2. **Connection String**:
   - **Dev**: `mongodb://127.0.0.1:3001/meteor`
   - **Prod**: `mongodb+srv://user:pass@cluster.mongodb.net/myapp`

3. **Data Persistence**:
   - **Dev**: Deleted with `meteor reset` or `.meteor/local/` removal
   - **Prod**: Persists independently of application deployment

4. **MongoDB Management**:
   - **Dev**: Automatically started/stopped by Meteor
   - **Prod**: Managed separately (MongoDB Atlas, Docker, etc.)

5. **Configuration**:
   - **Dev**: No configuration needed
   - **Prod**: Set via `MONGO_URL` environment variable

## 📂 Collection to File Mapping

To see which collection corresponds to which file, you would need to:

1. **Connect to MongoDB** while Meteor is running:
   ```bash
   # In one terminal
   meteor run
   
   # In another terminal
   meteor mongo
   ```

2. **List collections**:
   ```javascript
   show collections
   // Output:
   // messages
   // tasks
   // meteor_accounts_loginServiceConfiguration
   // meteor_oauth_pendingCredentials
   // users
   ```

3. **Check collection stats**:
   ```javascript
   db.messages.stats()
   db.tasks.stats()
   ```

### Typical Collections in Your App

| Collection Name | Purpose | File (approximate) |
|----------------|---------|-------------------|
| `messages` | Chat messages | `collection-14-*.wt` |
| `tasks` | Todo tasks | `collection-19-*.wt` |
| `users` | User accounts (if using accounts) | `collection-2-*.wt` |
| System collections | Meteor internals | Various `collection-*.wt` |

## 🔧 Useful Commands

### View Database Size
```bash
du -sh .meteor/local/db/
```

### List All Collection Files
```bash
ls -lh .meteor/local/db/collection-*.wt
```

### List All Index Files
```bash
ls -lh .meteor/local/db/index-*.wt
```

### Check MongoDB Port
```bash
cat .meteor/local/db/METEOR-PORT
# Output: 3001
```

### View MongoDB Logs (if available)
```bash
tail -f .meteor/local/db/mongod.log
# Note: May not exist in all Meteor versions
```

### Connect to MongoDB Shell
```bash
# While Meteor is running
meteor mongo

# Or directly
mongo mongodb://127.0.0.1:3001/meteor
```

### Backup Your Data
```bash
# Backup entire database directory
cp -r .meteor/local/db .meteor/local/db.backup

# Or use mongodump (while Meteor is running)
mongodump --port 3001 --db meteor --out ./backup
```

### Restore Data
```bash
# Restore from backup
mongorestore --port 3001 --db meteor ./backup/meteor
```

### Clear All Data
```bash
# Option 1: Meteor reset (recommended)
meteor reset

# Option 2: Manual deletion
rm -rf .meteor/local/db/*

# Option 3: Drop collections via mongo shell
meteor mongo
> db.messages.drop()
> db.tasks.drop()
```

## 🔐 Data Security

### Development
- ✅ Data is stored locally on your machine
- ✅ Only accessible via localhost (127.0.0.1)
- ⚠️ No authentication by default
- ⚠️ Deleted when you run `meteor reset`

### Production
- ✅ Should use authentication (username/password)
- ✅ Should use SSL/TLS encryption
- ✅ Should have backups
- ✅ Should have access control

## 📈 Monitoring Database Growth

### Check Current Size
```bash
# Total database size
du -sh .meteor/local/db/

# Individual collection sizes
ls -lh .meteor/local/db/collection-*.wt | awk '{print $5, $9}'
```

### Estimate Documents
```javascript
// In meteor mongo shell
db.messages.count()
db.tasks.count()
```

### Watch Growth in Real-Time
```bash
# Monitor database directory size
watch -n 1 'du -sh .meteor/local/db/'
```

## 🧹 Maintenance

### When to Clear Data

1. **Testing**: After running tests
2. **Schema Changes**: When changing collection structure
3. **Corruption**: If database becomes corrupted
4. **Fresh Start**: When you want to start clean

### How to Clear Data

```bash
# Stop Meteor
Ctrl+C

# Clear database
meteor reset

# Restart
meteor run
```

## 🎯 Summary

### Quick Answers to Your Questions

1. **Where does Meteor store MongoDB files?**
   - **Absolute**: `/Users/victor/codingspace/my-chat-app/.meteor/local/db/`
   - **Relative**: `.meteor/local/db/`

2. **Where are messages and tasks stored?**
   - In `collection-*.wt` files (WiredTiger format)
   - Binary format, not human-readable
   - Each collection has its own file

3. **What's in `.meteor/local/`?**
   - `db/` - MongoDB database files ⭐
   - `build/` - Compiled application
   - `plugin-cache/` - Meteor plugins
   - `types/` - TypeScript definitions

4. **Development vs Production?**
   - **Dev**: Local `.meteor/local/db/`, auto-managed
   - **Prod**: Remote server, configured via `MONGO_URL`

5. **How to access the data?**
   - Via Meteor methods (recommended)
   - Via `meteor mongo` shell
   - Via MongoDB drivers (port 3001)

---

**Your data is safe and stored locally in `.meteor/local/db/` during development!**

