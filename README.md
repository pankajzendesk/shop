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
Built with ❤️ for High-Performance Toy Retailers.
