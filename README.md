# 🏡 Rentify - Property Rental Marketplace

Rentify is a modern, full-stack property rental application that connects property owners with prospective tenants. Owners can list properties with pricing, specifications, furnishing details, geographical coordinates, and photos. Users can browse available rentals, filter by various options (BHK, price, location, furnishing), view properties on an interactive map, and add properties to their wishlist.

---

## ✨ Features

### 👤 User (Tenant) Features
- **Interactive Map**: View properties dynamically on an interactive map utilizing Leaflet and OpenStreetMap.
- **Search & Filters**: Filter properties by location, price range, BHK count, and furnishing type (Furnished, Semi-Furnished, Unfurnished).
- **Property Details**: View detailed property specifications, images, and owner contact information.
- **Personalized Wishlist**: Save favorite properties to a wishlist for easy access later.
- **User Profile**: Update profile details and manage account preferences.

### 🏢 Owner Features
- **Property Management Dashboard**: Create, view, update, and delete property listings.
- **Image Uploads**: Upload property images directly via Cloudinary integration.
- **Location Mapping**: Select or input precise coordinates (latitude & longitude) for property listings to display them accurately on the map.
- **Lead Contacting**: Direct contact details shown to users for quick rentals.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Zustand (State Management), React Router DOM v7, Leaflet & React Leaflet (Maps), Lucide React (Icons), Axios |
| **Backend** | Node.js, Express.js (v5), Mongoose / MongoDB Atlas, JWT (Authentication), BcryptJS, Multer, Cloudinary, Cors |

---

## 📁 Project Structure

```text
Rentify/
├── client/                 # React Frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # React Context files
│   │   ├── pages/          # View Pages (Home, Login, Dashboard, etc.)
│   │   ├── services/       # API integration services (Axios)
│   │   └── App.jsx         # App Routing and main component
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express Backend (Node.js + MongoDB)
│   ├── config/             # Database connection setup
│   ├── controllers/        # Route logic handlers
│   ├── middleware/         # Auth verification and file upload middleware
│   ├── models/             # Mongoose Schemas (User, Property)
│   ├── routes/             # Express API Endpoints
│   ├── utils/              # Helper functions (Cloudinary integration)
│   ├── seed.js             # Seed script to prepopulate properties
│   ├── server.js           # Server entrypoint
│   └── package.json
└── .gitignore              # Root Git ignore rules
```

---

## 🚀 Setup & Installation

### 📋 Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local database or MongoDB Atlas account)
- [Cloudinary Account](https://cloudinary.com/) (For storing uploaded property images)

---

### 1. Configure the Backend (Server)

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and define the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

4. *(Optional)* Seed the database with mock properties:
   ```bash
   node seed.js
   ```

5. Start the backend server:
   - **Development mode (using Nodemon)**:
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```
   The backend should now be running at `http://localhost:5000`.

---

### 2. Configure the Frontend (Client)

1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application should now be accessible at the address output in the terminal (typically `http://localhost:5173`).

---

## 🔑 Environment Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the Express server to listen on. | `5000` |
| `MONGO_URI` | Connection URI for the MongoDB Database. | `mongodb+srv://...` or `mongodb://localhost:27017/rentify` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens (auth). | `my_super_secret_key_123` |
| `CLOUD_NAME` | Cloudinary Account Cloud Name. | `drqvzz28i` |
| `CLOUD_API_KEY`| Cloudinary API Key. | `844962218894789` |
| `CLOUD_API_SECRET`| Cloudinary API Secret. | `0IKHj_23...` |

---

## 📜 License
This project is licensed under the ISC License.
<img width="1536" height="826" alt="Screenshot 2026-06-24 144533" src="https://github.com/user-attachments/assets/e75a45cf-3a4e-4b34-9877-6c9196121463" />

