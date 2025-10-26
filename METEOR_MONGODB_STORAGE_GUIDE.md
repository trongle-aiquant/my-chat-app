# Meteor MongoDB Storage Architecture Guide

## 📍 Where Your Data Lives

During development, Meteor stores all MongoDB database files in a local directory within your project:

### Complete File Path
```
/Users/victor/codingspace/my-chat-app/.meteor/local/db/
```

This is the **absolute path** where every message you send in the chat app and every task you create in the todo list is physically stored on your computer's disk.

**Relative path** from your project root:
```
.meteor/local/db/
```

**Current database size**: `1.6 MB` (72 files)

---

## 🗂️ Directory Structure

Here's what's inside the `.meteor/local/db/` directory:

```
.meteor/local/db/
│
├── 📦 Collection Files (Your Actual Data)
│   ├── collection-14--1779045515537650032.wt    (45 KB)  ← Chat messages
│   ├── collection-19--1779045515537650032.wt    (36 KB)  ← Todo tasks
│   ├── collection-2--1779045515537650032.wt     (36 KB)  ← System data
│   └── collection-*.wt                                   ← Other collections
│
├── 🔍 Index Files (For Fast Queries)
│   ├── index-20--1779045515537650032.wt         (36 KB)  ← Message indexes
│   ├── index-52--1779045515537650032.wt         (36 KB)  ← Task indexes
│   └── index-*.wt                                        ← Other indexes
│
├── 📝 Journal Files (Transaction Logs)
│   └── journal/
│       ├── WiredTigerLog.0000000003             (100 MB) ← Active log
│       ├── WiredTigerPreplog.0000000001         (100 MB) ← Prepared transactions
│       └── WiredTigerPreplog.0000000002         (100 MB) ← Prepared transactions
│
├── 🗄️ Metadata Files
│   ├── _mdb_catalog.wt                          (36 KB)  ← Database catalog
│   ├── WiredTiger                               (50 B)   ← Storage config
│   ├── WiredTiger.turtle                        (1.4 KB) ← Checkpoint metadata
│   ├── WiredTiger.wt                            (274 KB) ← Main metadata
│   ├── WiredTigerHS.wt                          (36 KB)  ← History store
│   └── sizeStorer.wt                            (36 KB)  ← Size tracking
│
├── 🔒 Lock Files
│   ├── mongod.lock                              (6 B)    ← MongoDB lock
│   └── WiredTiger.lock                          (21 B)   ← WiredTiger lock
│
├── 📊 Diagnostic Data
│   └── diagnostic.data/
│       └── metrics.*                                     ← Performance metrics
│
└── ⚙️ Configuration
    ├── storage.bson                             (114 B)  ← Storage engine config
    └── METEOR-PORT                              (4 B)    ← Port number (3001)
```

### File Type Descriptions

| File Pattern | Purpose | Contains |
|-------------|---------|----------|
| `collection-*.wt` | **Your actual data** | Documents (messages, tasks, users) stored in binary format |
| `index-*.wt` | **Database indexes** | B-tree indexes for fast queries on collections |
| `journal/WiredTigerLog.*` | **Transaction log** | Write-ahead log for crash recovery and durability |
| `_mdb_catalog.wt` | **Database catalog** | Metadata about databases, collections, and indexes |
| `WiredTiger*` | **Storage engine** | Configuration and metadata for WiredTiger |
| `mongod.lock` | **Lock file** | Prevents multiple MongoDB instances from using same data |
| `sizeStorer.wt` | **Size tracker** | Tracks collection and index sizes for statistics |
| `diagnostic.data/` | **Metrics** | Performance and diagnostic information |

---

## 🔄 Data Flow: From User Action to Disk

Let's trace what happens when you send a chat message "Hello World":

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                  │
│    User types "Hello World" and clicks Send button              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. REACT COMPONENT (imports/ui/components/ChatForm.tsx)        │
│    Calls: Meteor.call('messages.insert', 'Hello World', 'John')│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. METEOR METHOD (imports/api/messagesMethods.ts)              │
│    - Validates input with check() package                       │
│    - Creates document: { text, username, createdAt }            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. COLLECTION (imports/api/messages.ts)                        │
│    MessagesCollection.insert() called                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. MONGODB DRIVER                                               │
│    Sends insert command to MongoDB server via TCP (port 3001)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. MONGODB SERVER (MongoDB 7.0.16)                             │
│    Receives insert command and passes to storage engine         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. WIREDTIGER STORAGE ENGINE                                   │
│    - Writes to journal first (durability)                       │
│    - Writes to collection file (data)                           │
│    - Updates indexes (performance)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. PHYSICAL DISK STORAGE                                       │
│    ✓ journal/WiredTigerLog.0000000003                          │
│    ✓ collection-14--1779045515537650032.wt                     │
│    ✓ index-20--1779045515537650032.wt                          │
│                                                                 │
│    Location: /Users/victor/codingspace/my-chat-app/            │
│              .meteor/local/db/                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. REAL-TIME SYNC (DDP Protocol)                               │
│    MongoDB → Publication → All subscribed clients               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. UI UPDATE                                                   │
│     React component re-renders with new message                 │
│     User sees "Hello World" appear in chat                      │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Write Process

When data is written to MongoDB:

1. **Journal First** (Write-Ahead Logging)
   - Data is written to `journal/WiredTigerLog.*` first
   - Ensures durability - if system crashes, data can be recovered
   - Journal is flushed to disk every 50ms by default

2. **Collection File** (Actual Data)
   - Document is written to `collection-14--1779045515537650032.wt`
   - Data is compressed using Snappy compression
   - Written in binary BSON format

3. **Index Update** (Fast Queries)
   - Index entries updated in `index-20--1779045515537650032.wt`
   - Maintains B-tree structure for fast lookups
   - Indexes on `_id` and `createdAt` fields

4. **Metadata Update**
   - Collection size updated in `sizeStorer.wt`
   - Catalog updated if schema changes

---

## 🏗️ Development vs Production Storage

### Comparison Table

| Aspect | **Development** | **Production** |
|--------|----------------|----------------|
| **Storage Location** | `.meteor/local/db/` (local filesystem) | Remote MongoDB server (cloud/dedicated) |
| **Absolute Path** | `/Users/victor/codingspace/my-chat-app/.meteor/local/db/` | N/A (remote server) |
| **MongoDB Version** | 7.0.16 (bundled with Meteor) | Any compatible version (usually latest) |
| **Port** | `3001` (localhost only) | `27017` (default) or custom cloud port |
| **Connection String** | `mongodb://127.0.0.1:3001/meteor` | `mongodb+srv://user:pass@cluster.mongodb.net/myapp` |
| **Database Name** | `meteor` (default) | Custom (e.g., `myapp-production`) |
| **Access** | Localhost only (127.0.0.1) | Network accessible (with authentication) |
| **Authentication** | None (development only) | Required (username/password, SSL/TLS) |
| **Management** | Auto-started by `meteor run` | Separate MongoDB instance/service |
| **Configuration** | Automatic (no config needed) | Via `MONGO_URL` environment variable |
| **Persistence** | Deleted with `meteor reset` | Persists independently of app |
| **Backup** | Manual file copy | Automated cloud backups, replicas |
| **Scaling** | Single instance | Replica sets, sharding available |
| **Monitoring** | Basic (via `meteor mongo`) | Advanced (MongoDB Atlas, monitoring tools) |
| **Data Reset** | `meteor reset` (instant) | Manual database management |
| **Typical Use** | Local development and testing | Live application serving users |

### Connection Examples

**Development** (automatic):
```javascript
// No configuration needed - Meteor handles it
// Automatically connects to mongodb://127.0.0.1:3001/meteor
meteor run
```

**Production** (manual configuration):
```bash
# Set environment variable
export MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/myapp"
export MONGO_OPLOG_URL="mongodb+srv://username:password@cluster.mongodb.net/local"

# Deploy application
meteor build ../output --architecture os.linux.x86_64
```

---

## 📦 Your Data Files: Specific Examples

### Chat Messages Collection

**File**: `collection-14--1779045515537650032.wt`  
**Size**: 45 KB  
**Contains**: All chat messages from your application

**Structure**:
```javascript
{
  _id: "abc123...",
  text: "Hello World",
  username: "John",
  createdAt: ISODate("2025-10-26T07:30:00.000Z")
}
```

**Associated Index**: `index-20--1779045515537650032.wt` (36 KB)
- Primary index on `_id` field
- Secondary index on `createdAt` field (for sorting)

### Todo Tasks Collection

**File**: `collection-19--1779045515537650032.wt`  
**Size**: 36 KB  
**Contains**: All todo tasks from your application

**Structure**:
```javascript
{
  _id: "xyz789...",
  text: "Buy groceries",
  checked: false,
  createdAt: ISODate("2025-10-26T08:15:00.000Z")
}
```

**Associated Index**: `index-52--1779045515537650032.wt` (36 KB)
- Primary index on `_id` field
- Possible index on `checked` field (for filtering)

### System Collections

**File**: `collection-2--1779045515537650032.wt`  
**Size**: 36 KB  
**Contains**: Meteor system data (migrations, settings, etc.)

### File Naming Convention

The file names follow this pattern:
```
collection-[number]--[unique-identifier].wt
```

- `[number]`: Internal MongoDB collection identifier
- `[unique-identifier]`: Unique ID for this database instance
- `.wt`: WiredTiger file extension

**Note**: The specific number (14, 19, etc.) is assigned by MongoDB and may vary. To find which file corresponds to which collection, use:

```bash
meteor mongo
> db.messages.stats().wiredTiger.uri
# Output: "statistics:table:collection-14--1779045515537650032"
```

---

## 🔧 Practical Commands

### View Database Size

```bash
# Total database size
du -sh .meteor/local/db/
# Output: 1.6M

# Detailed breakdown
du -sh .meteor/local/db/*
```

### List All Collection Files

```bash
# List collection data files with sizes
ls -lh .meteor/local/db/collection-*.wt

# Output:
# -rw------- 1 victor staff  45K Oct 26 14:02 collection-14--1779045515537650032.wt
# -rw------- 1 victor staff  36K Oct 26 13:59 collection-19--1779045515537650032.wt
```

### Connect to MongoDB Shell

```bash
# Option 1: Using Meteor (recommended)
meteor mongo

# Option 2: Direct connection
mongo mongodb://127.0.0.1:3001/meteor

# Once connected, you can run queries:
> show collections
> db.messages.find().pretty()
> db.tasks.count()
```

### Backup Your Data

```bash
# Method 1: Simple file copy (Meteor must be stopped)
meteor stop  # or Ctrl+C
cp -r .meteor/local/db .meteor/local/db.backup.$(date +%Y%m%d)

# Method 2: Using mongodump (Meteor must be running)
mongodump --port 3001 --db meteor --out ./backup

# Method 3: Backup specific collection
mongodump --port 3001 --db meteor --collection messages --out ./backup
```

### Restore Data

```bash
# Method 1: Restore from file copy
rm -rf .meteor/local/db
mv .meteor/local/db.backup.20251026 .meteor/local/db
meteor run

# Method 2: Using mongorestore
mongorestore --port 3001 --db meteor ./backup/meteor

# Method 3: Restore specific collection
mongorestore --port 3001 --db meteor --collection messages ./backup/meteor/messages.bson
```

### Clear All Data

```bash
# Method 1: Meteor reset (recommended - safe and clean)
meteor reset

# Method 2: Manual deletion (Meteor must be stopped)
rm -rf .meteor/local/db/*

# Method 3: Drop specific collections (via mongo shell)
meteor mongo
> db.messages.drop()
> db.tasks.drop()
```

### Monitor Database in Real-Time

```bash
# Watch database size change
watch -n 1 'du -sh .meteor/local/db/'

# Monitor MongoDB logs (if available)
tail -f .meteor/local/db/mongod.log

# Check active connections
meteor mongo
> db.serverStatus().connections
```

### Query Your Data

```bash
meteor mongo

# Count documents
> db.messages.count()
> db.tasks.count()

# Find all messages
> db.messages.find().pretty()

# Find recent messages
> db.messages.find().sort({createdAt: -1}).limit(10)

# Find incomplete tasks
> db.tasks.find({checked: false})

# Get collection statistics
> db.messages.stats()
> db.tasks.stats()

# Check database size
> db.stats()
```

---

## 🔬 Understanding WiredTiger Storage Engine

### What is WiredTiger?

**WiredTiger** is MongoDB's default storage engine (since MongoDB 3.2). It's responsible for managing how data is stored on disk and retrieved from memory.

### Key Features

| Feature | Description |
|---------|-------------|
| **Document-Level Locking** | Multiple operations can modify different documents simultaneously |
| **Compression** | Data is compressed using Snappy (default) or zlib algorithms |
| **Checkpoints** | Automatic snapshots every 60 seconds for consistency |
| **Journaling** | Write-ahead logging for crash recovery |
| **Cache** | In-memory cache (default: 50% of RAM - 1GB) |
| **Concurrent Access** | High concurrency with MVCC (Multi-Version Concurrency Control) |

### What Does `.wt` Mean?

The `.wt` file extension stands for **WiredTiger**. These are binary files that store data in a proprietary format optimized for:

- **Fast reads and writes**
- **Compression** (typically 70-80% compression ratio)
- **Concurrent access** (multiple readers/writers)
- **Crash recovery** (via journaling)

**Important**: `.wt` files are **not human-readable**. You cannot open them in a text editor. You must use MongoDB tools to access the data.

### File Format Details

```
collection-14--1779045515537650032.wt
```

This file contains:
- **BSON documents** (Binary JSON) compressed with Snappy
- **B-tree structure** for efficient storage and retrieval
- **Metadata** about the collection
- **Free space tracking** for reuse

### How WiredTiger Stores Your Message

When you insert a message:

```javascript
{
  _id: ObjectId("67123abc..."),
  text: "Hello World",
  username: "John",
  createdAt: ISODate("2025-10-26T07:30:00.000Z")
}
```

WiredTiger:
1. **Serializes** to BSON format (binary)
2. **Compresses** using Snappy algorithm
3. **Writes** to B-tree structure in `collection-14-*.wt`
4. **Updates** index B-tree in `index-20-*.wt`
5. **Logs** operation in `journal/WiredTigerLog.*`

### Performance Characteristics

| Operation | Performance |
|-----------|-------------|
| **Insert** | O(log n) - logarithmic time |
| **Find by _id** | O(1) - constant time (indexed) |
| **Find by field** | O(n) - linear time (unless indexed) |
| **Update** | O(log n) - logarithmic time |
| **Delete** | O(log n) - logarithmic time |

### Memory Usage

WiredTiger uses a **cache** to keep frequently accessed data in memory:

```bash
# Check cache statistics
meteor mongo
> db.serverStatus().wiredTiger.cache

# Typical output:
# {
#   "bytes currently in the cache": 45678912,
#   "maximum bytes configured": 536870912,  # 512 MB
#   "pages read into cache": 1234,
#   "pages written from cache": 567
# }
```

---

## 📊 Database Statistics

### Current Database Overview

```
Total Size:        1.6 MB
Total Files:       72 files
Collections:       ~10 collections (including system)
Indexes:          ~15 indexes
```

### File Size Breakdown

| Category | Size | Percentage |
|----------|------|------------|
| Collection Data | ~500 KB | 31% |
| Indexes | ~300 KB | 19% |
| Journal (pre-allocated) | ~300 MB | N/A (sparse) |
| Metadata | ~100 KB | 6% |
| Other | ~700 KB | 44% |

**Note**: Journal files are pre-allocated to 100MB each but use sparse file allocation, so they don't actually consume that much disk space.

### Growth Estimation

Based on current data:

- **Average message size**: ~200 bytes (compressed)
- **Average task size**: ~150 bytes (compressed)
- **1,000 messages**: ~200 KB
- **10,000 messages**: ~2 MB
- **100,000 messages**: ~20 MB

---

## 🎯 Key Takeaways

1. **Your data is stored locally** in `/Users/victor/codingspace/my-chat-app/.meteor/local/db/`

2. **Chat messages** are in `collection-14--1779045515537650032.wt` (45 KB)

3. **Todo tasks** are in `collection-19--1779045515537650032.wt` (36 KB)

4. **Files are binary** (`.wt` = WiredTiger format) - not human-readable

5. **Total database size** is currently 1.6 MB

6. **Development storage** is local and temporary (cleared with `meteor reset`)

7. **Production storage** uses remote MongoDB servers with authentication

8. **WiredTiger** provides compression, journaling, and high performance

9. **Backup is simple**: just copy the `.meteor/local/db/` directory

10. **Access your data** via `meteor mongo` shell or MongoDB Compass

---

## 📚 Additional Resources

- **MongoDB Documentation**: https://docs.mongodb.com/manual/core/wiredtiger/
- **Meteor Guide - Collections**: https://guide.meteor.com/collections.html
- **WiredTiger Architecture**: https://source.wiredtiger.com/develop/arch-index.html

---

**Your data is safe, compressed, and efficiently stored in `.meteor/local/db/`!** 🎉

