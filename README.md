# 🗓️ Ligma - Personal Event Planner: (Developer Guide)

This guide provides everything a developer needs to set up, run, and contribute to the **Ligma Personal Event Planner** project.



## 📘 Introduction

**Ligma** is a personal event planner app designed to help users — whether students, employees, or freelancers — manage their schedules with a simple and intuitive interface.  
It integrates with third-party calendars and provides core features such as event management, to-do lists, and real-time data synchronization.

**Repository:** [https://github.com/Exanperanto605/Ligma-PersonalEventPlanner](https://github.com/Exanperanto605/Ligma-PersonalEventPlanner)


## ⚙️ Prerequisites

Before you begin, make sure you have the following tools installed:

- [Node.js (LTS version)](https://nodejs.org/)
- npm or yarn
- [Git](https://git-scm.com/)

## 🚀 Getting Started (Local Setup)

Follow these steps to set up and run the project locally:

### 1. Clone the Repository
```sh
git clone https://github.com/Exanperanto605/Ligma-PersonalEventPlanner
cd Ligma-PersonalEventPlanner
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables

Create a file named .env.local in the root directory and add the following:
```sh
# Firebase Configuration (from your Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AI...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# 2FA/Email Service (e.g., SendGrid, for sending OTPs)
SENDGRID_API_KEY=SG...
```

### 4. Run the Development Server
```sh
npm run dev
```

The app will be available at http://localhost:3000

## 🧩 Technology Stack

| Category | Technology |
|-----------|-------------|
| **Framework** | [Next.js](https://nextjs.org/) |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Styling** | Tailwind CSS |
| **State Management** | React Context API |
| **Testing** | Playwright (E2E) |

## 🏗️ Architecture & Project Structure

Ligma follows a Layered Architecture within a modular-monolith design.
```sh
/
├── /pages/         # Next.js routes (e.g., index.tsx, /calendar/view.tsx)
│   ├── /api/       # API routes (e.g., /login, /verify-otp, /validate-password)
├── /components/    # Reusable React components (Calendar, EventModal, etc.)
├── /context/       # React Context for global state (e.g., AuthContext)
├── /styles/        # Global styles and Tailwind configuration
├── /tests/         # Playwright E2E tests
├── .env.local      # Local environment variables
├── ADR-001.pdf     # Architectural Decision Record (Auth system)
└── README.md       # (This file)
```

## ⚡ Core Features & Logic

### 🔐 Authentication

- Handled via Firebase Authentication using JWTs for session management.
- Users log in through Google Sign-In.
- JWTs are stored in HTTP-only cookies for protection against XSS.
- User data (email, name, UID) is stored in a users collection in Firestore.

### Event Management

- CRUD Operations: Events are created, read, updated, and deleted through API routes connected to Firestore.
- Manual Sync: syncs can be reloaded manually

## ☁️ Deployment
This project is configured for Vercel (recommended for Next.js) or Firebase Hosting.

### Steps
- Connect Git: Link your hosting provider to your GitHub repository.
- Add Environment Variables: Include all credentials from .env.local in your hosting provider’s dashboard.
- Deploy: The app will build and deploy automatically on pushes to the main branch.

## 🧭 Conclusion

This guide should help new developers quickly set up the project, understand its structure, and begin contributing effectively.
