# WearWave — Full-Stack Fashion E-Shop

[![JavaScript](https://img.shields.io/badge/Language-JavaScript%20(ES6%2B)-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%26%20Express%205-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-7952B3.svg?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Course](https://img.shields.io/badge/Course-VAII-orange.svg)](https://fri.uniza.sk)

A full-stack web e-commerce application (**WearWave**) for browsing, managing, and purchasing fashion apparel. Built with a **React 18** + **Bootstrap 5** single-page frontend, a **Node.js / Express** REST API backend, **JWT & bcrypt** authentication, multi-image file uploads via **Multer**, and a relational **PostgreSQL** database.

This project was developed as a university semester project for the **Development of Applications for Internet and Intranet (`Vývoj aplikácií pre internet a intranet — VAII`)** course at the Faculty of Management Science and Informatics, University of Žilina (**FRI UNIZA**).

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Project Structure](#architecture--project-structure)
- [Database Schema](#database-schema)
- [REST API Endpoints](#rest-api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Installation & How to Run](#installation--how-to-run)
- [Usage & Admin Setup](#usage--admin-setup)
- [Screenshots](#screenshots)

---

## Overview

The repository is organized into three main parts representing the evolution of the semester project from a static responsive design to a complete client–server web application:

1. **React SPA Client (`client`):** Provides the interactive storefront, product catalog, multi-image product gallery, user authentication forms, profile management, shopping cart, and administrator controls.
2. **Express REST API Server (`server`):** Handles business logic, input validation, JWT authentication & role-based authorization middleware, PostgreSQL transactions (`pg`), and local image storage (`multer`).

---

## Key Features

- **Full CRUD Product Catalog & Multi-Image Uploads:** Administrators can create, edit, and delete store items (`polozka`) with a primary image (`mainImage`) and multiple gallery images (`otherImages[]`), backed by atomic PostgreSQL transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) and automatic filesystem cleanup on deletion.
- **JWT Authentication & Role-Based Access Control (RBAC):** Secure password hashing with `bcrypt`, stateless session management via JSON Web Tokens (`jsonwebtoken`), and route protection on both the frontend (`ProtectedRoute`) and backend (`userAuthentification` & `userAuthorize` middlewares).
- **Interactive Shopping Cart:** Authenticated users can add products to their personal cart (`kosik`), increment/decrement item quantities dynamically via AJAX (`Axios`), remove items, and view live order totals.
- **Account & User Management:** Users can view their profile, change their password (with current-password verification), or permanently delete their account (`ON DELETE CASCADE`). Administrators have access to a dedicated user management table (`/userstable`) to inspect and remove user accounts.
- **Client & Server-Side Validation:** Dual-layer validation for registration credentials (email format, password length `5–30` characters containing at least one digit) and product parameters (required fields, positive numeric price, integer stock quantity, and `JPG`/`PNG` MIME-type verification).
- **Responsive Bootstrap 5 UI:** Mobile-first layout featuring a hero promotional carousel, dynamically loaded latest arrivals (`NOVINKY`), interactive image switcher on product detail pages, modal confirmation dialogs, and an FAQ accordion section.

---

## Architecture & Project Structure

### Frontend (`client/src`)

| Component / Module | Path | Role in Application |
| :--- | :--- | :--- |
| **`App`** | `src/App.js` | Configures `react-router-dom` routes, wraps protected views in `ProtectedRoute`, and renders the persistent `Header` and `Footer`. |
| **`Header` & `Footer`** | `src/components/Header.js`, `Footer.js` | Navigation bar with dynamic auth state, user dropdown menu, shopping cart shortcut, and page title updates. |
| **`Home`** | `src/components/Home.js` | Landing page displaying the Bootstrap category carousel and the 3 newest catalog items (`/api/polozka/getNews`). |
| **`Catalogue` & `Item`** | `src/components/Catalogue.js`, `Item.js` | Product grid with category filter sidebar, cart quick-add action, and admin edit/delete modal controls. |
| **`ItemDetail`** | `src/components/ItemDetail.js` | Detailed product view with interactive thumbnail gallery switching, quantity selector, and admin actions. |
| **`AddItemForm` & `EditItemForm`** | `src/components/AddItemForm.js`, `EditItemForm.js` | Admin forms for creating and updating products, managing `FormData` image uploads, and toggling image deletion. |
| **`LoginForm` & `RegisterForm`** | `src/components/LoginForm.js`, `RegisterForm.js` | User authentication and registration forms with client-side regex and password strength validation. |
| **`ShoppingCart`** | `src/components/ShoppingCart.js` | Displays cart items for the logged-in user, handles live quantity updates (`+`/`-`), item removal, and total price calculation. |
| **`Account` & `UsersTable`** | `src/components/Account.js`, `UsersTable.js` | User profile settings (password change, self-deletion) and admin dashboard for managing registered users. |
| **`UserAuth`, `ProtectedRoute`, `AuthHeader`** | `src/hooks/*` | Decodes JWT payload from `localStorage` (`jwt-decode`), enforces route-level permissions, and builds `Authorization: Bearer <token>` headers. |

### Backend (`server`)

| File / Module | Path | Role in Application |
| :--- | :--- | :--- |
| **`server.js`** | `server/server.js` | Express application entry point; registers CORS, JSON body parsing, static `/uploads` serving, and API route prefixes on port `5000`. |
| **`db.js` & `dbSetup.js`** | `server/db.js`, `dbSetup.js` | Configures the `pg.Pool` connection using `.env` variables and initializes PostgreSQL tables and triggers. |
| **`itemController.js`** | `server/controllers/itemController.js` | Implements catalog CRUD operations, transactional multi-image insertion/updating, and file unlinking (`fs.unlink`). |
| **`imagesController.js`** | `server/controllers/imagesController.js` | Configures `multer.diskStorage` (`./uploads/images`) and serves primary/gallery image paths per product ID. |
| **`usersController.js`** | `server/controllers/usersController.js` | Handles user registration, `bcrypt` password comparison, JWT signing, password updates, and user deletion. |
| **`shoppingCartController.js`** | `server/controllers/shoppingCartController.js` | Manages per-user shopping cart items, duplicate checks (`409 Conflict`), and quantity increments/decrements. |
| **`validation.js` & `validators.js`** | `server/middlewares/validation.js`, `utils/validators.js` | Express middlewares for JWT verification, role authorization, and input/MIME-type validation with automatic orphan file cleanup. |

---

## Database Schema

The PostgreSQL database consists of 4 relational tables initialized via `server/dbSetup.js`:

| Table | Primary Key | Columns & Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`polozka`** | `id` (`SERIAL`) | `nazov` (`TEXT NOT NULL`), `popis` (`TEXT`), `cena` (`NUMERIC(10,2) NOT NULL`), `pocet_ks` (`INTEGER NOT NULL`) | Store catalog items (name, description, price, stock quantity). |
| **`pouzivatelia`** | `id` (`SERIAL`) | `email` (`TEXT NOT NULL UNIQUE`), `password` (`TEXT NOT NULL`), `role` (`TEXT NOT NULL`) | Registered accounts with `bcrypt` password hashes and role (`user` / `admin`). |
| **`obrazky`** | `id` (`SERIAL`) | `polozka_id` (`INTEGER REFERENCES polozka(id)`), `cesta` (`TEXT NOT NULL`) | File paths (`uploads/images/...`) associated with each product. |
| **`kosik`** | `(pouzivatel_id, polozka_id)` | `pouzivatel_id` (`REFERENCES pouzivatelia(id) ON DELETE CASCADE`), `polozka_id` (`REFERENCES polozka(id) ON DELETE CASCADE`), `pocet_ks` (`INTEGER DEFAULT 0`) | Junction table storing active shopping cart items and quantities per user. |

---

## REST API Endpoints

| Resource | Method | Endpoint | Access | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Items** | `GET` | `/api/polozka` | Public | Fetch all catalog items ordered by ID. |
| **Items** | `GET` | `/api/polozka/getNews` | Public | Fetch the 3 most recently added items with their main image. |
| **Items** | `GET` | `/api/polozka/getDetailsById/:id` | Public | Fetch name, description, price, and stock for a specific item. |
| **Items** | `POST` | `/api/polozka/add` | **Admin** | Create a new item with `mainImage` and `otherImages[]` (`multipart/form-data`). |
| **Items** | `PUT` | `/api/polozka/updateItemById/:id` | **Admin** | Update item details, replace main image, or add/remove gallery images. |
| **Items** | `DELETE` | `/api/polozka/deleteItemById/:id` | **Admin** | Delete an item and unlink all associated image files from disk. |
| **Images** | `GET` | `/api/obrazky/getPath/:id` | Public | Fetch the primary image path for item `:id`. |
| **Images** | `GET` | `/api/obrazky/getAllImagesByItemId/:id` | Public | Fetch all image records for item `:id`. |
| **Users** | `POST` | `/api/pouzivatelia/register` | Public | Register a new user account. |
| **Users** | `POST` | `/api/pouzivatelia/login` | Public | Authenticate user and return a signed JWT (`1h` expiration). |
| **Users** | `GET` | `/api/pouzivatelia/getEmail/:id` | Public | Retrieve email address for user `:id`. |
| **Users** | `PUT` | `/api/pouzivatelia/changePassword` | **Auth** | Verify old password and update to a new `bcrypt`-hashed password. |
| **Users** | `DELETE` | `/api/pouzivatelia/deleteUser/:id` | **Auth** | Delete user account (cascades to shopping cart). |
| **Users** | `GET` | `/api/pouzivatelia/getAllUsers` | **Admin** | List all registered non-admin users. |
| **Cart** | `GET` | `/api/kosik/getUserCart/:id` | Public | Retrieve all items currently in user `:id`'s shopping cart. |
| **Cart** | `POST` | `/api/kosik/addItem` | **Auth** | Add an item with specified quantity to the user's cart. |
| **Cart** | `PUT` | `/api/kosik/increaseQuantity` | **Auth** | Increment item quantity in the cart by `1`. |
| **Cart** | `PUT` | `/api/kosik/decreaseQuantity` | **Auth** | Decrement item quantity in the cart by `1` (minimum `1`). |
| **Cart** | `DELETE` | `/api/kosik/deleteItem` | **Auth** | Remove an item from the user's shopping cart. |

---

## User Roles & Permissions

| Capability | Guest (Unauthenticated) | Registered User (`user`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: |
| Browse home page, catalog, item details & FAQs | ✅ | ✅ | ✅ |
| Register & log in | ✅ | — | — |
| Add items to shopping cart & manage quantities | ❌ | ✅ | ✅ |
| Change password & delete own account (`/account`) | ❌ | ✅ | ✅ |
| Add, edit & delete catalog products | ❌ | ❌ | ✅ |
| View & delete registered users (`/userstable`) | ❌ | ❌ | ✅ |

---

## Installation & How to Run

### Prerequisites

- **Runtime:** [Node.js](https://nodejs.org/) (v18+ recommended) and `npm`
- **Database:** [PostgreSQL](https://www.postgresql.org/download/) (with **pgAdmin** or `psql` CLI)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lubomirbojda/Full-Stack-Fashion-E-Shop
   cd Full-Stack-Fashion-E-Shop
   ```

2. **Create the PostgreSQL database:**
   Open **pgAdmin** or `psql` and create an empty database (e.g., `vaiisem`):
   ```sql
   CREATE DATABASE vaiisem;
   ```

3. **Configure backend environment variables:**
   In the `server/` directory, create or edit the `.env` file (based on `.env.example`) with your PostgreSQL credentials:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_NAME=vaiisem
   DB_PORT=5432
   ```

4. **Install backend dependencies, initialize database tables & start the server:**
   ```bash
   cd server
   npm install
   node dbSetup.js
   node server.js
   ```
   The Express API server will start on **`http://localhost:5000`**.

5. **Install frontend dependencies & start the React client:**
   Open a **second terminal** in the project root and run:
   ```bash
   cd client
   npm install
   npm start
   ```
   The Vite development server will launch the application at **`http://localhost:3000`** with automatic API proxying to port `5000`.

---

## Usage & Admin Setup

### Promoting a User to Administrator

New accounts registered via `/registrovat` are assigned the `'user'` role by default. To grant administrator privileges:

1. Register a standard account through the web UI (`http://localhost:3000/registrovat`).
2. Run the following SQL query against your PostgreSQL database:
   ```sql
   UPDATE public.pouzivatelia
   SET role = 'admin'
   WHERE email = 'your_email@example.com';
   ```
3. **Log out and log back in** on the web interface so a new JWT token containing `role: 'admin'` is issued.

> **Note:** Source code identifiers, database table/column names, and UI labels are written in the **Slovak language**.

---

## Screenshots

<!-- Add your application screenshots below -->
<p align="center">
  <img width="1899" height="816" alt="image" src="https://github.com/user-attachments/assets/323b3eb5-802e-4a12-8e05-1103fa645c0d" />
  <img width="1900" height="908" alt="image" src="https://github.com/user-attachments/assets/e7bdbe95-aad2-46c8-87a7-acaedfe5ff4b" />
  <img width="1898" height="904" alt="image" src="https://github.com/user-attachments/assets/fdda8ff7-d954-4547-bd7e-6b2f5c51bf09" />

</p>