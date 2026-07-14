# 🚀 Rentify Vercel Deployment Guide

To deploy the full-stack Rentify project to Vercel, we deploy the frontend (`client/`) and backend (`server/`) as **two separate Vercel projects** pointing to the same Git repository. This is the official and most reliable Vercel practice for monorepos, avoiding routing and pathing issues.

---

## 🔑 Prerequisites

Before starting, make sure you have:
1. A **MongoDB Atlas** connection string (`MONGO_URI`).
2. A **Cloudinary** account to host property images (`CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`).
3. A **JWT Secret Key** to sign tokens (`JWT_SECRET`).

---

## 🛠️ Step 1: Deploy the Backend (Server)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your Rentify Git repository.
3. Configure the project settings:
   - **Project Name**: `rentify-backend` (or similar)
   - **Framework Preset**: **Other**
   - **Root Directory**: `server` (Click **Edit** next to Root Directory and select the `server` folder).
4. Under **Environment Variables**, add:
   - `MONGO_URI` = `your_mongodb_connection_string`
   - `JWT_SECRET` = `your_jwt_secret`
   - `CLOUD_NAME` = `your_cloudinary_cloud_name`
   - `CLOUD_API_KEY` = `your_cloudinary_api_key`
   - `CLOUD_API_SECRET` = `your_cloudinary_api_secret`
5. Click **Deploy**. Vercel will install dependencies, build the server, and provide a backend URL (e.g., `https://rentify-backend.vercel.app`).

---

## 🛠️ Step 2: Deploy the Frontend (Client)

1. Go back to your Vercel Dashboard and click **Add New > Project** again.
2. Import the same Rentify Git repository.
3. Configure the project settings:
   - **Project Name**: `rentify-frontend` (or similar)
   - **Framework Preset**: **Vite**
   - **Root Directory**: `client` (Click **Edit** next to Root Directory and select the `client` folder).
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://rentify-backend.vercel.app/api` (use the backend URL from Step 1, appending `/api` at the end).
5. Click **Deploy**. Vercel will build and host your frontend website.

---

## ⚡ Option B: Host Backend on Render/Railway (Alternative)

If you prefer to host your Express backend on a persistent platform (to avoid serverless cold starts or timeout limits):
1. Create a Web Service on Render or Railway.
2. Set the **Root Directory** to `server`.
3. Set the environment variables listed in Step 1.
4. Set the **VITE_API_URL** in your Vercel frontend project to point to your Render/Railway backend URL.
