# TODA GO Admin Dashboard

React/Vite admin web dashboard for the TODA GO tricycle booking system.

## Current Implemented Scope

- Supabase Auth admin login and session restore.
- Supabase-backed dashboard data for drivers, passengers, rides, earnings, fare settings, and notifications.
- Driver account creation through the `create-driver-account` Edge Function.
- Driver/passenger editing, activation/deactivation, driver verification, and optional Auth email/password update through the `admin-update-auth-user` Edge Function.
- Driver license image upload and private signed-url viewing through Supabase Storage.
- Realtime operational refreshes and notification dropdown.
- Fare settings panel for one-way/round-trip pricing and Student/PWD/Senior Citizen discounts.
- Header refresh action that reloads operational data, fare settings, and notifications.

## Recent Reliability/UI Updates

- Supabase table loads, fare updates, account edits, license uploads, driver creation, and Auth update Edge Function calls use bounded request timeouts.
- Operational load failures show a visible retry action.
- Admin build currently passes; Vite still reports a non-blocking bundle chunk-size warning.

## Main Verification Commands

```bash
npm install
npm run build
```

`npm run lint` is not currently ready because ESLint is not installed/configured.
