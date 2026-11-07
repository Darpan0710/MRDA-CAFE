# MRDĀ — Café Experience & Reservation Platform

A premium digital experience for MRDĀ, designed to bring together its menu, atmosphere, and table reservations through an elegant and responsive website.

MRDĀ is a full-stack café website built to showcase the brand's identity while providing customers with a convenient way to explore the menu, discover the space, and reserve a table.

---

## ✨ Overview

MRDĀ is more than a café website. It is a digital extension of the café's atmosphere and identity.

The platform combines an editorial-style frontend with a backend-powered reservation and menu management system. Customers can explore the café experience, while administrators can manage menu availability and reservations through a dedicated dashboard.

## 🌐 Project Links

| Resource | Link |
|---|---|
| Live Website | Coming soon |
| GitHub Repository | Add repository URL |
| Café Instagram | [@at.mrda](https://www.instagram.com/at.mrda/) |

---

## 📸 Preview

> Add screenshots or a short demo GIF of the website here.

<!--
Recommended:
Create a `docs/` folder and add screenshots.

![MRDĀ Website Preview](docs/preview.png)
-->

---

## 🚀 Features

### Customer Experience

- **Premium Editorial Design** — A refined visual experience inspired by modern café and hospitality brands.
- **Responsive Interface** — Designed to work across desktop, tablet, and mobile devices.
- **Menu Discovery** — Explore the café's food and beverage offerings through dedicated menu experiences.
- **Plated & Poured** — Separate menu categories with distinct visual identities.
- **The Space** — Discover the café's atmosphere and interiors.
- **Our Story** — Learn about the café and its identity.
- **Visit Us** — Access café information and visit details.
- **Table Reservations** — Customers can request reservations through the website.

### Admin Dashboard

- **Menu Management** — Add, update, and remove menu items.
- **Availability Control** — Mark menu items as available or out of stock.
- **Reservation Management** — View and manage customer reservations.
- **Booking Slot Controls** — Manage reservation availability and disable selected booking slots.
- **Centralized Management** — Manage café operations through a dedicated admin interface.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Language | TypeScript |
| Backend | Node.js |
| API | Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Admin authentication |
| Styling | Project's configured styling system |
| Version Control | Git & GitHub |
| Deployment | Vercel *(planned / configured as applicable)* |

---

## 🏗️ Architecture

MRDĀ follows a client-server architecture.

```text
                 ┌──────────────────────┐
                 │      Customer        │
                 │   Browser / Mobile   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   React + Vite UI    │
                 │     TypeScript       │
                 └──────────┬───────────┘
                            │ HTTP Requests
                            ▼
                 ┌──────────────────────┐
                 │    Express Server    │
                 │      REST API        │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Supabase Client    │
                 │   Server-side only   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Supabase PostgreSQL │
                 │       Database       │
                 └──────────────────────┘
```

The frontend communicates with the Express API. The backend handles data operations through the server-side Supabase client.

The Supabase service-role key is kept on the server and is never exposed to the browser.

---

## ⚙️ Getting Started

Follow these steps to run MRDĀ locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- Git
- A Supabase project

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the required environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key

SESSION_SECRET=your_secure_session_secret

ADMIN_ID=your_admin_id
ADMIN_PASSWORD=your_admin_password
```

Use the variable names required by the current application configuration.

**Important:** Never commit `.env.local` or expose your Supabase service-role key in frontend code.

### 4. Configure Supabase

1. Create a project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the SQL Editor.
3. Execute the database schema SQL included in the project.
4. Execute the seed SQL if demo data is required.
5. Copy the Project URL and server-side secret key into `.env.local`.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL shown in the terminal.

---

## 🔐 Security

MRDĀ uses server-side environment variables to protect sensitive configuration.

- Supabase secret keys must remain on the backend.
- `.env.local` must not be committed to Git.
- Admin credentials should be changed from any default values.
- Never expose secret keys through `VITE_` environment variables.
- Use a strong session secret.
- Do not share environment files or credentials publicly.

---

## 📁 Project Structure

The project is organized into frontend, backend, and database-related modules.

```text
project/
├── src/                  # Frontend application
├── server/               # Express backend
├── public/               # Static assets
├── data/                 # Local development data, if applicable
├── .env.local            # Local environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

*Update this structure if the actual project folders differ.*

---

## 🧪 Development & Quality Checks

The project has been checked during development using TypeScript validation and production build checks.

Run the available scripts from `package.json`:

```bash
npm run build
```

If a lint script is configured:

```bash
npm run lint
```

---

## 🚢 Deployment

The frontend is intended to be deployed using Vercel.

Before deployment:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables in the Vercel project settings.
4. Configure the backend deployment according to the server's hosting requirements.
5. Verify the production API URL and frontend API configuration.
6. Test menu loading, admin authentication, and reservation functionality.

> **Note:** The Express backend must be hosted in an environment that supports the server runtime. A frontend deployment alone does not automatically deploy a separate Express server.

---

## 🎯 Project Goals

- Create a distinctive digital identity for MRDĀ.
- Deliver a premium and responsive customer experience.
- Make menu discovery intuitive and visually engaging.
- Simplify reservation management for café administrators.
- Build a maintainable full-stack application using modern web technologies.

---

## 👨‍💻 Developer

Developed as a full-stack web development project.

**MRDĀ — Plated, Poured & Everything In Between.**

---

## 📄 License

This project is currently intended for demonstration and development purposes.

Add an appropriate license before permitting reuse or redistribution.
