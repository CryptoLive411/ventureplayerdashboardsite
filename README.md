# Venture Player Hub

Project: Venture Soccer Athlete & Admin Portal
1. High-Level Overview

We want a secure, fully functional web application for Venture Soccer (Venture Sports USA) that serves two main user groups:

Athletes (Venture players) – After they sign with us, they get access to their own portal where they can:

View/update their personal profile and recruiting information

Track their recruiting progress (colleges contacted, interest, offers, etc.)

See what tasks Venture has completed for them and what’s pending

Admin Staff – Venture staff members will have an admin panel where they can:

See all active players being worked on

See archived players who have already been placed

Manage player profiles and recruiting data

Use checklists per player and mark items as completed

Trigger email notifications to players automatically when items are completed

The portal must include frontend and backend, be fully responsive (desktop + mobile), and follow modern security best practices.

We use Venture branding (colors, logo, fonts) and want the design to look modern, clean, and professional.

2. User Types & Permissions

User Type 1: Athlete (Player)

Can sign up / sign in

Can view their profile and recruiting dashboard

Can upload / edit certain personal information (GPA, budget, target schools, etc.) – depending on fields we define as player-editable

Can view, but not edit, admin-only fields such as internal notes and status (unless otherwise specified)

Can see checklist items and which ones have been completed

Can see recruiting activity: colleges contacted, colleges interested, coaches who have made offers, etc.

User Type 2: Admin (Venture Staff)

Has access to an admin login and admin dashboard

Can view all players and individual player profiles

Can create new player accounts (or send invite links for players to sign up)

Can update all player details and statuses

Can manage recruiting checklist items and mark them as completed

When a checklist item is marked completed, the player automatically gets an email notification

Can manage recruiting pipeline per player (colleges contacted, interest level, offers, etc.)

Can move players from “Active” to “Archived” once they are placed

Optional (Nice-to-have, if feasible):
User Type 3: Super Admin

Can manage admin accounts (add/remove staff, reset passwords)

Can manage global settings like default checklist templates, email templates, etc.

3. Authentication & Security

Sign Up / Sign In pages for:

Athletes

Admins (can be a separate route or separated by role)

Secure authentication (e.g., email + password with hashed passwords)

Email verification for new accounts (nice-to-have)

Password reset flow via email

Role-based access control (RBAC) so that:

Players can only see their own data

Admins can see all players

Protect all private routes (no access without login)

Basic protections: input validation, CSRF protection, rate limiting on auth endpoints if possible, and secure session handling.

4. Athlete Portal – Features & Layout
4.1 Athlete Dashboard (After Login)

Main elements on the athlete dashboard:

Welcome / Overview Panel

“Welcome, [Player Name]”

Short status summary (e.g., “Status: Active / In Placement / Placed”)

Quick view of key data:

Target intake (e.g., January 2026)

Division target (NCAA D1/D2/D3, NAIA, NJCAA)

Current stage (e.g., Profile Complete, Outreach in Progress, Offers, etc.)

Profile Information Section
Fields we want to store and display (editable by player where appropriate, otherwise admin-only):

Full name

Email

Phone number

Nationality

Date of birth / Age

Position

Current club

Height

Weight

Graduation year / Class of

GPA (with country/scale if needed)

Test scores (SAT/ACT/TOEFL/IELTS, optional)

Budget (family budget for college per year)

Target divisions (NCAA D1, D2, D3, NAIA, NJCAA, etc.)

Target schools / target regions (list or tags)

Any additional notes (free text field)

We want:

A clean, card-based layout.

Clear separation between “Personal Info,” “Academic Info,” and “Athletic Info.”

Document & Media Uploads (Optional if feasible in v1)

Ability for players to upload:

Transcripts

Highlight videos (as links, e.g., YouTube/Vimeo, and/or file uploads)

Passport copy or ID

Admins should be able to see and download these from the admin panel.

Checklist View (Player Side)

A visible checklist of tasks/status items specific to that player such as:

“Profile completed”

“Video reviewed”

“Clubs/Colleges list created”

“Initial outreach sent”

“Follow-up emails sent”

“Zoom calls scheduled”

“Offers received”

Each item should show:

Title

Description (optional)

Status (Not started / In progress / Completed)

Date completed (if completed)

When admins mark items as completed, players see that update in real time (or on refresh).

Recruiting Activity Timeline / College Status Section

A dedicated section where players can clearly see:

Colleges reached out to
For each college:

College name

Division (NCAA D1/D2/D3, NAIA, NJCAA)

Location (State, City)

Status:

“Contacted”

“Interested”

“In communication”

“Offer made”

“Not interested”

Date of last action

Notes (e.g., “Coach requested full game footage”, “Financial package being discussed”)

Coach name and email (if available)

Offers Section

A summarized table/list of offers:

College name

Scholarship amount / % (if available)

Type (Athletic/Academic/Combined)

Deadline (if given)

Status (Considering / Accepted / Declined)

Players should be able to view this information but not necessarily edit it (admins manage it).

5. Admin Panel – Features & Layout

The admin panel should be very easy to use, with clear navigation and filters.

5.1 Admin Dashboard (Main View)

High-level metrics (optional but nice):

Number of active players

Number of archived players

Players by intake (e.g., January 2026, Fall 2026)

Players by status (e.g., In Outreach, In Offer, Placed)

Player List Table

Columns:

Player name

Position

Graduation year

Division target(s)

Status (Active / In Process / Placed / Archived)

Assigned admin (if relevant)

Search by name, email, or club

Filters: by intake year, status, division, etc.

Click on a player row to open that player’s detailed profile page.

5.2 Player Detail Page (Admin View)

When an admin clicks a player, they should see a detailed view with:

Player Profile Info (all fields listed in Athlete section, but fully editable)

Admin Notes – internal notes not visible to the player (simple text or a comment log).

Checklist Management

For this player, show a checklist of tasks.

Ability to:

Add custom checklist items

Edit item titles/descriptions

Set a due date (optional)

Mark items as “Not started / In progress / Completed”

When marked as Completed, the system should:

Store date completed

Automatically send an email notification to the player:

Subject/Body can be based on a simple, configurable template (e.g., “Hi [Name], [Checklist Item] has just been completed by your Venture team. Log into your portal to see the update.”)

Recruiting Pipeline / College Tracking (Admin-Side)

Admins should be able to:

Add colleges to the player’s list:

College name

Division

Country/State

Coach contact info (name, email, phone)

Set the status for each college (dropdown or tags):

Not contacted

Contacted

Interested

Communication ongoing

Offer made

Not interested / Rejected

Log key events:

Date contacted

Date of response

Notes on conversations, meetings, calls

Mark offers with:

Scholarship value (% or amount)

Offer notes

Deadlines

Whether accepted/declined

All of this should sync to the read-only view the player sees in their portal.

Archiving Players

Admins can change a player’s status to “Placed / Completed”

This moves them from the Active Players section to an Archive section

Archived players are still viewable but read-only by default (configurable).

6. Notifications & Email Logic

We want basic automation around emails:

When a checklist item is marked as Completed for a player:

An email is sent to the player:

Example:

Subject: “Update from Venture: [Checklist Item Name] Completed”

Body: “Hi [First Name], we’ve just completed: [Checklist Item]. Log into your Venture portal to see your full progress.”

Optional (Nice-to-have)

When a new college is added with status “Offer made,” send a notification email to the player.

When a player account is created, send them a welcome email with login instructions.

Please implement using a flexible email system (e.g., templates we can adjust later).

7. Design & Branding Requirements

Use Venture Soccer / Venture Sports branding:

Our navy / dark blue as primary color

Clean white/neutral backgrounds

Consistent logo in header or sidebar

The UI should feel:

Modern, minimal, and professional

Simple navigation (sidebar or top nav)

Card-based layouts, clear typography, good spacing

Fully responsive:

Works smoothly on desktop, tablet, and mobile

Responsive layouts for tables (e.g., collapsing columns or using stacked views on mobile)

8. Technical & Implementation Requirements

We need both frontend and backend fully built:

Frontend

Modern JavaScript framework (React, Next.js, etc.) – open to your recommendation

Responsive design with a modern component library or custom styling

Form validation on client side for key fields (emails, required fields, etc.)

Backend / API

Secure REST or GraphQL API

User authentication (JWT or session-based) with proper security

Role-based access control (player vs admin)

Database design to handle:

Users (players & admins)

Player profiles

Checklists & checklist items

College entries & recruiting statuses

Notifications / emails log (optional)

Database

Relational DB preferred (e.g., PostgreSQL), but open to suggestion

Proper indexing for searching/filtering players

Security

OWASP best practices (at least the basics)

Encrypted passwords

Secure handling of file uploads (if implemented)

HTTPS enforced in production

Deployment

We want this to be deployable to a production-ready environment (e.g., Vercel + managed DB, or similar)

Admin credentials configurable via environment variables at first login or bootstrap process.

9. Admin Usability & Automation

Admin panel must be very intuitive:

Clear tabs: “Active Players”, “Archived Players”, “Settings” (optional), etc.

Simple forms with validation

Filters and search on player list

As much automation as possible around:

Email notifications (driven by status changes / checklist completion)

Default checklist template applied to every new player (we can tweak items per player)

10. Summary

Deliverable:
A fully functional, secure, responsive web application for Venture Soccer with:

Player sign-up / login + profile dashboard

Admin login + admin panel

Player profiles with detailed info

Per-player checklists managed by admins

Automated email notifications when tasks are completed

Recruiting pipeline tracking (colleges contacted, interest, offers)

Active vs archived player management

Fully branded, aesthetically pleasing UI aligned with Venture’s colors

Complete backend & frontend implementation with proper security and responsive design

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ventureplayerdashboardsite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0649a2f-60a4-4911-9795-dc774217c2ca).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
