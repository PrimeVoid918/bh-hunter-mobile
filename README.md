# BH View (React Native App)

BH View is the React Native (Expo + TypeScript) mobile application for BH Hunter, a boarding house discovery, booking, and stay-management platform.

It serves as the primary mobile interface for tenants, owners, and administrators, providing role-based access to booking workflows, property management, payments, and platform interactions.

---

## Platform Overview

The mobile app is a multi-role system with three main user experiences:

- Tenant application (discovery, booking, stay tracking)
- Owner application (property management, bookings, analytics)

It communicates with the BH Hunter NestJS backend via REST APIs and event-driven updates.

---

## Tech Stack

- Expo (SDK 52)
- React Native 0.76
- TypeScript
- Redux Toolkit (state management)
- React Query (server state)
- React Navigation (navigation system)
- MapLibre / React Native Maps (geospatial discovery)
- Gluestack UI (component system)
- EAS Build (production builds)
- PayMongo integration (payments)

---

## Project Structure Overview

The app follows a feature-based modular architecture:

- application/ → app bootstrap, navigation, config, global store
- features/ → role-based modules (tenant, owner, admin, auth, guest)
- infrastructure/ → API layer, Redux slices, services, schemas
- components/ → reusable UI components (shared system)
- shared/ → cross-feature business components (booking, maps, verification)
- assets/ → images, fonts, static files
- constants/ → theme, styles, icons, global configs

Each feature is isolated to maintain scalability and separation of concerns.

---

## Role-Based Architecture

The application supports three primary roles:

### Tenant

- Browse boarding houses
- View maps and listings
- Book rooms
- Manage stays and bookings
- View booking history and bookmarks

### Owner

- Create and manage properties
- Manage rooms and pricing
- Handle bookings and approvals
- View analytics dashboard

### Admin

- User and owner management
- Verification approval system
- Audit logs and system monitoring

NOTE: The legacy "admin" module still exists in the codebase but is deprecated and no longer actively used in routing.

---

## Navigation System

- React Navigation (stack + tabs + nested navigators)
- Role-based routing guards
- Centralized route definitions in application/navigation/
- Deep linking ready structure (partial implementation)

---

## State Management

- Redux Toolkit for global application state
- RTK Query-style API slices in infrastructure/
- React Query for server synchronization
- Event bus utility for cross-module communication

---

## Maps & Location System

- MapLibre for rendering interactive maps
- Geolocation via Expo Location
- Backend-powered geospatial search (PostGIS integration)
- Custom map sheets and property markers

---

## Authentication

- JWT-based authentication
- Secure storage via Expo SecureStore
- Role-based session hydration
- Persistent login sessions

---

## Payments

- PayMongo integration
- Booking-based payment lifecycle
- Supports:
  - reservation fees
  - advance payments
  - deposits
  - extensions
  - refunds (policy-based)

---

## Build & Deployment

### Development

- expo start --dev-client

### Android Build

- eas build --profile production --platform android

### iOS

- iOS project exists for Expo compatibility and potential App Store deployment

### Web (optional)

- expo start --web (for debugging only)

---

## Screenshots (UI Documentation)

### Important

These screenshots are part of the user manual documentation layer, not core architecture.

Recommended folder:

/docs/screenshots/

or

/assets/docs/screenshots/

---

### Suggested Structure

/docs/screenshots/
  /tenant/
    home.png
    map.png
    booking-flow.png
    booking-details.png

  /owner/
    dashboard.png
    property-management.png
    booking-management.png

  /auth/
    login.png
    signup.png

  /admin/
    admin-dashboard.png
    user-verification.png
    logs.png

---

### How to reference them in README

### Tenant Home Screen

![Tenant Home Screen](./docs/screenshots/tenant/home.png)

Shows the main discovery interface for tenants.

---

### Owner Dashboard

![Owner Dashboard](./docs/screenshots/owner/dashboard.png)

Displays analytics and property management tools.

---

### Admin Verification Panel

![Admin Panel](./docs/screenshots/admin/user-verification.png)

Used for verification of users and documents.

---

## Notes on Architecture Decisions

- Feature-first modular design
- Clear separation of domain logic and UI
- Infrastructure layer isolates API complexity
- Shared components reused across roles
- Admin module is legacy and will be removed later

---

## Known Limitations

- Admin module is deprecated but still present
- Some navigation flows are deeply nested
- Some legacy Redux patterns remain
- Deep linking not fully standardized

---

## Why This Project Exists

This system was built iteratively to simulate a real-world boarding house booking platform with:

- discovery
- booking workflows
- payment lifecycle tracking
- role-based property management
- localized deployment context

## Related Repositories

This mobile application is part of the broader BH Hunter ecosystem.

### Backend API (NestJS)

Responsible for core business logic, booking workflows, payments, authentication, and platform services.

Repository:

- [BH Hunter Backend](https://github.com/PrimeVoid918/bh-hunter-core)

### Web Frontend (React + Vite)

Provides the public website, admin dashboard, and role-based web application.

Repository:

- [BH Hunter Web Frontend](https://github.com/PrimeVoid918/bh-hunter-core/tree/main/frontend)

### Mobile App (React Native - this repo)

This repository:

- BH View (Mobile Application)
- Primary user-facing mobile platform for tenants and owners
- Handles maps, booking flows, and mobile interactions
