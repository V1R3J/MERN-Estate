# Nestora — MERN Real Estate Platform

**Live Demo:** https://mern-estate-37h8.onrender.com/

Nestora is a full-stack real estate platform built on the **MERN stack** (MongoDB, Express.js, React, Node.js) with **Tailwind CSS** for styling. It lets users browse, search, and list properties, while a dedicated admin system moderates content and keeps listing quality in check. The app is built for the Indian real estate market, with localized location data and currency formatting.

---

## Features

### For Users
- **Property Listings** — Create, update, and delete listings with rich details: images, floor plans (PDF/image), amenities, contact info, and pricing.
- **Advanced Search & Filtering** — Amazon-style search experience with a sticky search bar, desktop sidebar and mobile filter drawer, active filter chips, amenity filters, and loading skeletons.
- **Location-Aware Listings** — State and city selection driven by an Indian locations dataset, with listings indexed by state and city for fast filtering.
- **Indian Currency Formatting** — Prices are displayed in Lakhs/Crores using a custom INR formatter for a locally familiar reading experience.
- **Rich Listing Pages** — Image gallery (Swiper carousel), share modal, embedded Google Maps location, amenities breakdown, sticky price card, and a contact sidebar.
- **Authentication** — Email/password sign-up and sign-in with client-side validation and password visibility toggles, plus "Sign in with Google" powered by Firebase Authentication.
- **User Profiles** — Avatar upload, profile updates, and a "Danger Zone" for account management.
- **Reviews** — Users can leave reviews on the platform (with role and city context), displayed publicly on the homepage; anonymous reviews are masked before being returned by the API.
- **Responsive Design** — Fully responsive UI across desktop, tablet, and mobile.

### For Admins
- **Role-Based Access Control** — A dedicated `isAdmin` flag and `verifyAdmin` middleware protect admin-only routes.
- **Admin Dashboard** — A tabbed dashboard for managing listings and reviews from one place.
- **Listing Moderation Workflow** — Every listing goes through a `pending → approved / rejected` status flow before it's publicly visible.
- **Review Moderation** — Admins can oversee and manage submitted reviews alongside listings.
- **Superadmin Seeding** — A seed script provisions the first superadmin account for a fresh deployment.

---

## Tech Stack

**Frontend**
- React 19 (component-based UI)
- Vite (build tool & dev server)
- Redux Toolkit + Redux Persist (auth & app state, persisted across sessions)
- React Router v7 (client-side routing)
- Tailwind CSS (utility-first styling)
- Swiper (image carousels/collages)
- React Dropzone (drag-and-drop file uploads)
- Lottie / dotLottie (animations)
- Lucide React + React Icons (iconography)
- Firebase Authentication (Google sign-in)
- Appwrite Web SDK (file uploads directly from the client)

**Backend**
- Node.js + Express.js (REST API)
- MongoDB + Mongoose (data modeling)
- JWT authentication via httpOnly cookies
- bcryptjs (password hashing)
- cookie-parser (cookie handling)
- node-appwrite SDK (server-side file management, e.g. cleanup on listing deletion)

**Storage**
- Appwrite (image and floor-plan file storage)

---

## Admin Access

A demo admin account is available on the deployed instance for reviewers to explore the moderation dashboard:



```
Username: superadmin
Email: admin@nestora.com
Password: YourStrongPasswordHere123!
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB connection string (e.g., MongoDB Atlas)
- An Appwrite project (for file storage)
- A Firebase project with Google sign-in enabled (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/V1R3J/MERN-Estate.git
   cd MERN-Estate
   ```

2. **Install backend dependencies** (from the project root)
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   npm install --prefix client
   ```

   Or build both in one step, exactly as it's deployed on Render:
   ```bash
   npm run build
   ```

4. **Configure environment variables**

   Root `.env` (used by the Express server):
   ```
   MONGO=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   APPWRITE_ENDPOINT=<your-appwrite-endpoint>
   APPWRITE_PROJECT_ID=<your-appwrite-project-id>
   APPWRITE_API_KEY=<your-appwrite-server-api-key>
   APPWRITE_BUCKET_ID=<your-appwrite-bucket-id>
   ```

   `client/.env`:
   ```
   VITE_APPWRITE_ENDPOINT=<your-appwrite-endpoint>
   VITE_APPWRITE_PROJECT_ID=<your-appwrite-project-id>
   VITE_APPWRITE_BUCKET_ID=<your-appwrite-bucket-id>
   VITE_FIREBASE_API_KEY=<your-firebase-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
   ```

5. **Superadmin account**

   The superadmin was provisioned via a one-off `createSuperAdmin` seed script, run once during initial setup and then removed from the codebase (it's not meant to be re-run against a live database). If you're setting this project up fresh, you'll need to write a similar script or insert an admin user directly into your `users` collection with `isAdmin: true`.

6. **Run the app locally**

   Backend (from the project root — runs `api/index.js` via nodemon):
   ```bash
   npm run dev
   ```

   Frontend (in a separate terminal):
   ```bash
   cd client
   npm run dev
   ```

7. Open `http://localhost:5173` in your browser.

---

## Project Structure

```
MERN-Estate/
├── api/          # Express backend — routes, controllers, models, middleware
└── client/       # React frontend — pages, components, Redux store
```

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

This project is open source and available for learning and personal use.
