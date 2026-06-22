# GadgetToyShop — The Ultimate Toy Store Manager 🧸

A powerful, all-in-one E-commerce and POS system build for toy businesses. This app manages everything from **Online Sales** and **Physical In-store Billing (POS)** to **Inventory Tracking** and **Home Delivery Handshakes**.

---

## 🚦 How to Start (Simple Guide)

If you are setting this up for the first time, follow these 4 simple steps:

1.  **Install the "Engine"**:
    Open your terminal and type:
    ```bash
    npm install
    ```
    *This downloads all the necessary parts the app needs to run.*

2.  **Connect the Database**:
    Open the `.env` file and make sure your `DATABASE_URL` is pointing to your PostgreSQL database.
    
3.  **Setup the Database (First Time Only)**:
    Run this command to create the "drawers" for your data and add some sample toys:
    ```bash
    npx prisma db push && npm run clean
    ```
    *This wipes any old junk and starts you fresh with a clean shop.*

4.  **Launch the App**:
    ```bash
    npm run dev
    ```
    Now, open your browser and go to: **[http://localhost:4028](http://localhost:4028)**

---

## 🎮 How to use the App (User Manual)

### 1. For the Shop Owner (Admin Dashboard)
-   **URL**: `/admin`
-   **Login**: `admin@toyshop.com` / `adminPassword123`
-   **What you can do**:
    -   **Inventory**: Add/Remove toys, update prices, and see who is changing stock.
    -   **Orders**: See all online orders and assign them to your Delivery team.
    -   **Settings**: Turn on/off Tax (GST) or make it mandatory for delivery boys to take photos.
    -   **Staff**: Create accounts for your Shopkeepers and Delivery Champions.

### 2. For the Delivery Team (Delivery Champion Terminal)
-   **URL**: `/delivery`
-   **Logic**: Delivery boys see orders assigned to them.
-   **Safety**: To finish a delivery, they MUST enter a 4-digit code provided by the Customer. If it's a Cash Order, they must confirm payment first!

### 3. For the Counter Staff (Shopkeeper POS)
-   **URL**: `/shopkeeper`
-   **Usage**: Real-time billing interface. Scan items, take cash, and print receipts immediately. Stock is subtracted from the database instantly.

### 4. For the Customers (The Storefront)
-   **URL**: `/`
-   **Usage**: Users can browse categories, apply coupons, track their orders, and request returns if a product is "Return Eligible".

---

## 🧹 Maintenance (The "Reset" Button)

If you ever mess up the data or just want to start the day with a clean slate:
```bash
npm run clean
```
**What this does**:
- ✅ Deletes all old orders and transactions.
- ✅ Deletes all fake user accounts.
- ✅ Cleans out the "Delivery Photos" folder.
- ✅ Re-seeds the shop with 3 sample toys and fresh categories.
- ✅ **Keeps** your Admin account safe.

---

## 📂 Key Technical Parts
- **`src/app/actions.ts`**: The "Brain" — handles all the math and database logic.
- **`prisma/schema.prisma`**: The "Blueprints" — defines how data is stored.
- **`public/uploads/delivery`**: Where we save photos taken by delivery boys.

---

## 🚀 Running the Application - Choose Your Setup

### ✅ Option 1: App in Docker + Database on Local Machine

**Best for:** Production-like environment with local database

**Prerequisites:**
- Docker installed
- PostgreSQL installed locally on your machine

**Step 1:** Setup Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# Mac
brew install postgresql
brew services start postgresql

# Linux
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows - Download from postgresql.org
```

**Step 2:** Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE shop_data;

# Exit
\q
```

**Step 3:** Configure PostgreSQL to Accept Docker Connections

Edit `postgresql.conf`:
```conf
listen_addresses = '*'
```

Edit `pg_hba.conf` (add this line):
```conf
host    all    all    0.0.0.0/0    md5
```

Restart PostgreSQL:
```bash
# Mac
brew services restart postgresql

# Linux
sudo systemctl restart postgresql

# Windows - Restart via Services app
```

**Step 4:** Build and Run App in Docker

**For Mac/Windows:**
```bash
# Build Docker image
docker build -t gadgettoyshop:latest .

# Run container
docker run -d \
  --name toy-shop-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:your_password@host.docker.internal:5432/shop_data" \
  gadgettoyshop:latest

# View logs
docker logs -f toy-shop-app
```

**For Linux:**
```bash
# Build Docker image
docker build -t gadgettoyshop:latest .

# Run container
docker run -d \
  --name toy-shop-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:your_password@172.17.0.1:5432/shop_data" \
  gadgettoyshop:latest

# View logs
docker logs -f toy-shop-app
```

**Access:** http://localhost:3000

**Stop app:**
```bash
docker stop toy-shop-app
docker rm toy-shop-app
```

---

### ✅ Option 2: App Running Locally + Database on Local Machine

**Best for:** Development and debugging

**Prerequisites:**
- Node.js 26+ installed
- PostgreSQL installed locally

**Step 1:** Setup Local PostgreSQL (same as Option 1 Step 1 & 2)

```bash
# Install PostgreSQL if needed
brew install postgresql  # Mac
sudo apt install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql  # Mac
sudo systemctl start postgresql  # Linux

# Create database
psql -U postgres
CREATE DATABASE shop_data;
\q
```

**Step 2:** Install Dependencies

```bash
cd /path/to/shop
npm install
```

**Step 3:** Configure Environment

Create `.env` file in project root:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shop_data"
```

**Step 4:** Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (clean slate)
npx tsx clean-slate.ts
```

**Step 5:** Start Development Server

```bash
npm run dev
```

**Access:** http://localhost:3000

---

### 🐳 Option 3: Full Stack with Docker Compose (App + Database Both in Docker)

**Best for:** Quick testing, no local PostgreSQL needed

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

**Access:** http://localhost:3000

---

### Option 4: App-Only Container with Cloud Database

If you want to use cloud PostgreSQL (AWS RDS, Supabase, DigitalOcean, Neon):

**Step 1:** Build and run app container


```bash
# Build image
docker build -t gadgettoyshop:latest .

# Run with external database URL
docker run -d \
  --name toy-shop-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@external-host:5432/dbname" \
  gadgettoyshop:latest
```

**Example connection strings:**
- AWS RDS: `postgresql://user:pass@db.abc123.us-east-1.rds.amazonaws.com:5432/shop_data`
- Supabase: `postgresql://postgres:pass@db.xxxx.supabase.co:5432/postgres`
- DigitalOcean: `postgresql://doadmin:pass@db-postgresql-nyc3-12345.ondigitalocean.com:25060/defaultdb`

---

### 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Application port | `3000` |
| `NEXT_PUBLIC_SHOP_NAME` | Shop name | `GiftShop` |

---

### 🛠️ Database Management

**View logs:**
```bash
docker logs -f toy-shop-app
```

**Run migrations manually:**
```bash
docker exec -it toy-shop-app npx prisma migrate deploy
```

**Reset database (clean slate):**
```bash
docker exec -it toy-shop-app npx tsx clean-slate.ts
```

**Backup database:**
```bash
# If using docker-compose database
docker exec toy-shop-postgres pg_dump -U postgres shop_data > backup.sql

# If using local PostgreSQL
pg_dump -U postgres shop_data > backup.sql
```

**Restore database:**
```bash
# Docker database
cat backup.sql | docker exec -i toy-shop-postgres psql -U postgres shop_data

# Local PostgreSQL
psql -U postgres shop_data < backup.sql
```

---

### 🚨 Troubleshooting

**App can't connect to local database:**
- Mac/Windows: Use `host.docker.internal` not `localhost`
- Linux: Use `172.17.0.1` or run with `--network host`
- Check PostgreSQL is running: `pg_isready`

**Database connection refused:**
```bash
# Check PostgreSQL status
brew services list | grep postgresql  # Mac
sudo systemctl status postgresql      # Linux

# Check port is open
netstat -an | grep 5432
```

**Container exits immediately:**
```bash
# Check logs for errors
docker logs toy-shop-app

# Common issues:
# - Invalid DATABASE_URL format
# - Database not accessible from container
# - Port 3000 already in use
```

---

Built with ❤️ for High-Performance Toy Retailers.
