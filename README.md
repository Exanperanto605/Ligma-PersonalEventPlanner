Ligma - Personal Event Planner: Developer Guide
This document provides all the necessary information for a developer to set up, run, and contribute to the Ligma Personal Event Planner project.

1. Introduction
  Ligma is a personal event planner application designed to help users (students, employees, freelancers) manage their schedules with a simple and intuitive interface. It integrates with third-party calendars and provides core features like event management, a to-do list, and data synchronization.
  
  Repository: https://github.com/Exanperanto605/Ligma-PersonalEventPlanner 

2. Prerequisites
  Before you begin, ensure you have the following tools installed on your local machine:
  Node.js (LTS version)
  npm or yarn
  Git

3. Getting Started (Local Setup)
Follow these steps to get the project running on your local machine.
  3.1.Clone the Repository:
  git clone https://github.com/Exanperanto605/Ligma-PersonalEventPlanner
  cd Ligma-PersonalEventPlanner

  3.2.Install Dependencies:
  npm install

  3.3.Set Up Environment Variables: Create a file named .env.local in the root of the project and add your Firebase and other service credentials.
  # Firebase Configuration (from your Firebase project settings)
  NEXT_PUBLIC_FIREBASE_API_KEY=AI...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
  NEXT_PUBLIC_FIREBASE_APP_ID=...
  
  # 2FA/Email Service (e.g., SendGrid, for sending OTPs)
  # [cite: 2805]
  SENDGRID_API_KEY=SG... 
  
  3.4.Run the Development Server:
  npm run dev
  The application will be available at http://localhost:3000.

4. Technology Stack
  This project uses a modern web stack:
  Framework: Next.js (for server-side rendering and API routes) 
  Authentication: Firebase Authentication (handles third-party Google login and JWTs) 
  Database: Firebase Firestore (a NoSQL database for storing user records and events) 
  Styling: Tailwind CSS 
  State Management: React Context API (for managing auth state) 
  Testing: Playwright (for End-to-End testing) 

5. Architecture & Project Structure
The project follows a Layered Architecture within a modular-monolith structure.
  /
  ├── /pages/         # Next.js routes (e.g., index.tsx, /calendar/view.tsx)
  │   ├── /api/       # API routes (e.g., /login, /verify-otp, /validate-password)
  ├── /components/    # Reusable React components (e.g., Calendar, EventModal)
  ├── /context/       # React Context for global state (e.g., AuthContext)
  ├── /styles/        # Global styles and Tailwind config
  ├── /tests/         # Playwright E2E tests 
  ├── .env.local      # Local environment variables (see Configuration)
  ├── ADR-001.pdf     # Architectural Decision Record for Auth
  └── README.md       # (This file)

6. Core Features & Logic
Authentication Flow (ADR-001) 
Authentication is handled via Firebase, using JWTs for session management.
  6.1Login: A user logs in via Google. Firebase Authentication generates an ID token (JWT).
  6.2Session: The JWT is stored in an HTTP-only cookie for security against XSS attacks.
  6.3User Records: User data (email, name, UID) is stored in a users collection in Firestore .
  6.4Redirects:
    Unauthenticated users visiting a protected page are redirected to the login page (/).
    After login, users are sent to /calendar/view.
    Auth errors redirect to /401.

Event Management
  CRUD: Event logic (Create, Read, Update, Delete) is handled via API routes that interact with the Firestore database.
  Offline Sync: The client is designed to store changes locally when offline and sync with Firestore when a connection is restored.

7. Running Tests
This project uses Playwright for End-to-End testing.
  7.1Run Tests:
    npx playwright test
    Note: The demo video shows tests being run with npx playwright test ui, which is also a valid command to open the test runner UI. 

  7.2Test Scenarios: Key E2E tests include:
    E2E-001: User login and calendar access .
    E2E-002: Redirect unauthenticated users from protected pages .
    E2E-003: Access calendar and add an event with a mocked session .

8. Deployment
The application is configured for deployment on Vercel (recommended for Next.js) or Firebase Hosting.
  8.1Connect Git: Link your hosting provider to your GitHub repository.
  8.2Add Environment Variables: Ensure all secrets from your .env.local file are added to the environment variable settings in your hosting provider's dashboard.
  8.3Deploy: The project will build and deploy automatically on pushes to the main branch.
