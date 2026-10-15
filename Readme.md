<div align="center">

# MeetSync

**Plan meetings. Invite participants. Track RSVPs. Stay in sync.**

A full-stack meeting scheduler built with Django REST Framework and React, featuring Google OAuth, automated email notifications, and Google Meet / Zoom integrations.

![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17-A30000?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-5.6-37814A?style=for-the-badge&logo=celery&logoColor=white)
![uv](https://img.shields.io/badge/uv-managed-DE5FE9?style=for-the-badge&logo=uv&logoColor=white)

![Auth](https://img.shields.io/badge/Auth-Google%20OAuth%20%2B%20JWT-blue?style=flat-square)
![Tasks](https://img.shields.io/badge/Background%20Tasks-Redis%20%2B%20Celery-red?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-18%20Django%20tests-success?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Engineering Highlights](#engineering-highlights)

## Overview

**MeetSync** simplifies meeting creation, participant invitations, and RSVP management in one interface. Organizers schedule meetings and track responses; invitees review details and accept or decline. Google OAuth provides passwordless sign-in, and Celery handles email delivery in the background so API requests never block.

**Highlights**

- **Complete invitation lifecycle**: create, invite, collect RSVPs, and let participants change their response.
- **Google OAuth + JWT**: custom social-auth pipeline with calendar handoff.
- **Async processing**: Celery + Redis send invitation and cancellation emails.
- **Pluggable video providers**: Google Meet and Zoom link provisioning.
- **Query-conscious API**: `select_related` and embedded organizer data avoid N+1 queries.
- **Tested**: 18 Django tests cover permissions, serializers, and models.

## Features

<table>
<tr>
<td width="50%" valign="top">

### Organizer
- Create, edit, cancel, complete, and delete meetings
- Invite participants (invitation flow or quick-invite)
- Remove attendees from existing meetings
- Accepted / pending / declined counts with a progress bar
- Seven-day upcoming dashboard
- Meeting analytics with Chart.js
- Meeting platform locked after creation (server-enforced)

</td>
<td width="50%" valign="top">

### Participant
- Dedicated **My RSVP** section
- Filter by All, Pending, Accepted, Declined
- Accept, decline, or change a response
- Agenda and meeting details preview
- Times converted to local timezone
- Google Calendar handoff

</td>
</tr>
<tr>
<td valign="top">

### Accounts
- Google OAuth 2.0 sign-in (passwordless)
- JWT-secured API
- Editable profile: username, names, avatar
- Self-service account deletion for passwordless users

</td>
<td valign="top">

### Notifications & Integrations
- Async invitation and cancellation emails
- Google Meet and Zoom link integrations
- Celery + Redis task processing
- Google Calendar integration

</td>
</tr>
</table>

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Django 6, Django REST Framework 3.17 |
| Auth | SimpleJWT, Djoser 2.3.3, Python Social Auth |
| Frontend | React 19, Vite, React Router 7 |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form, Zod |
| Database | PostgreSQL 16 |
| Background Tasks | Celery 5.6, Redis |
| Video | Google Meet, Zoom |
| Analytics / Icons | Chart.js, Lucide React |
| Tooling | **uv** (Python), Bun (frontend), Docker |

## Architecture

```text
                 ┌────────────────────────┐
                 │      React 19 SPA      │
                 │   Vite + Tailwind CSS  │
                 └───────────┬────────────┘
                             │  JWT / OAuth
                             ▼
                 ┌────────────────────────┐
                 │    Django REST API     │
                 │  accounts/  meeting/   │
                 │  notifications/        │
                 │  integrations/         │
                 └──────┬──────────┬──────┘
                        │          │
              ┌─────────▼──┐   ┌───▼────────────┐
              │ PostgreSQL │   │  Redis broker  │
              └────────────┘   └───┬────────────┘
                                   ▼
                          ┌─────────────────┐
                          │ Celery workers  │
                          │  (email tasks)  │
                          └─────────────────┘

            External: Google OAuth / Meet · Zoom
```

**Frontend layout**: `services/` (API calls), `context/` (auth, meeting, participant state), `schemas/` (Zod), `utils/format.js` (date/format helpers), plus `pages/` and `components/` for UI.

## Project Structure

```text
MeetSync/
├── backend-drf/
│   ├── accounts/            # users, auth, profile
│   │   └── tests/
│   ├── meeting/             # meetings, participants, RSVPs
│   │   └── tests/
│   │       ├── test_views.py
│   │       ├── test_serializers.py
│   │       └── test_model.py
│   ├── notifications/       # Celery email tasks
│   ├── integrations/        # Google Meet / Zoom providers
│   ├── meetscheduler/       # Django project settings
│   ├── manage.py
│   ├── pyproject.toml
│   ├── uv.lock
│   └── docker-compose.yml
│
├── frontend-react/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │  
│   ├── App.jsx
│   ├── Layout.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Getting Started

### Prerequisites

- [uv](https://docs.astral.sh/uv/) 
- [Bun](https://bun.sh/)
- Docker with Docker Compose
- A Google Cloud OAuth client
- SMTP credentials for email
- Zoom credentials (optional, for Zoom integration)

Install uv if needed:

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 1. Clone

```bash
git clone <your-repository-url>
 cd .\Meeting-Scheduler-App\
```

### 2. Start PostgreSQL and Redis

```bash
cd backend-drf
docker compose up -d
```

### 3. Install backend dependencies

```bash
uv sync
```

### 4. Configure environment

Create `backend-drf/.env` next to `manage.py` (see [Environment Variables](#environment-variables)).

### 5. Migrate and run the API

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

API: `http://localhost:8000/`

### 6. Start the Celery worker

In a second terminal:

```bash
cd backend-drf
uv run celery -A meetscheduler worker -l info
```

> On Windows, add `-P solo` (or `--pool=solo`) if the worker fails to start.

### 7. Start the frontend

In a third terminal:

```bash
cd frontend-react
bun install
bun run dev
```

App: `http://localhost:5173/`

### Common uv commands

| Task | Command |
|---|---|
| Install / sync dependencies | `uv sync` |
| Add a package | `uv add <package>` |
| Add a dev-only package | `uv add --dev <package>` |
| Remove a package | `uv remove <package>` |
| Run any command in the env | `uv run <command>` |
| Update the lockfile | `uv lock --upgrade` |

## Environment Variables

### Backend: `backend-drf/.env`

```dotenv
# Django
SECRET_KEY=
DEBUG=True

# PostgreSQL
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=

# Redis
REDIS_PORT=6379
REDIS_INSIGHT_PORT=

# Zoom (optional)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_HOST_EMAIL=

# Email / SMTP
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=
```

> Use `localhost` for DB/Redis hosts when Django runs on your machine, or the Compose service names when it runs inside Docker. Never commit real secrets.

### Frontend: `frontend-react/.env`

```dotenv
VITE_BACKEND_BASE_API=http://localhost:8000/
VITE_GOOGLE_REDIRECT_URI=
```

### Google OAuth setup

1. Create or select a project in Google Cloud Console.
2. Configure the OAuth consent screen.
3. Create an OAuth client (Web application).
4. Register `http://localhost:5173/auth/google/callback` as an authorized redirect URI.
5. Add the same URL to `SOCIAL_AUTH_ALLOWED_REDIRECT_URIS` in Django settings.
6. Enable the Google APIs and scopes your features need.

Redirect URIs must match exactly.

## API Reference

Base URL: `http://localhost:8000/`

### Meetings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/meeting/` | List meetings for the authenticated user |
| `POST` | `/api/v1/meeting/` | Create a meeting and invite participants |
| `GET` | `/api/v1/meeting/<id>/` | Retrieve meeting details |
| `PATCH` | `/api/v1/meeting/<id>/` | Update meeting details |
| `DELETE` | `/api/v1/meeting/<id>/` | Delete a meeting |
| `POST` | `/api/v1/meeting/<id>/cancel/` | Cancel a meeting |
| `POST` | `/api/v1/meeting/<id>/complete/` | Mark a meeting complete |

### Participants and RSVPs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/meeting/<id>/participants/` | List participants |
| `POST` | `/api/v1/meeting/<id>/participants/` | Invite more participants |
| `DELETE` | `/api/v1/meeting/<id>/participants/<pid>/` | Remove a participant |
| `PATCH` | `/api/v1/meeting/<id>/rsvp/` | Accept or decline an invitation |

Meeting creation takes an `invited_emails` list. Validation rejects empty lists, duplicates, and the organizer's own email.

```json
{ "rsvp_status": "accepted" }
```

### Authentication and Accounts

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/auth/o/google-oauth2/` | Google OAuth flow |
| `GET/PATCH/DELETE` | `/auth/users/me/` | Retrieve, update, or delete the current account |

Protected endpoints require a valid JWT. Organizer-only operations are enforced by backend permissions, not frontend checks.

## Testing

```bash
cd backend-drf
uv run python manage.py test
```

| Suite | Coverage |
|---|---|
| `meeting/tests/test_views.py` | Auth, list/detail, create, update, delete, cancel |
| `meeting/tests/test_serializers.py` | Creation, invitation validation, date rules, `user_role` |
| `meeting/tests/test_model.py` | Duration and participant behavior |
| `accounts/tests/test_model.py` | User/superuser creation, display names |

Tests run without live Google, Zoom, or SMTP services: email tasks are mocked, and SQLite can be used where the configuration allows.

## Engineering Highlights

1. **Passwordless Google accounts**: a custom deletion serializer skips the default password confirmation for accounts without a password.
2. **Server-side authorization**: organizer and participant-management permissions live in the API; the UI only reflects them.
3. **Async email**: Celery workers send invitation and cancellation emails via Redis, off the request cycle.
4. **Query optimization**: `select_related` plus embedded organizer data prevents N+1 patterns.
5. **Timezone-aware scheduling**: server timezone is `Asia/Kathmandu`, timestamps are stored in UTC, and the frontend converts for display.
6. **Pluggable conferencing**: Google Meet and Zoom logic is isolated from core meeting management.
7. **Testable boundaries**: side effects are mocked so core behavior is tested without external services.

---

<div align="center">

**MeetSync**: built to make meeting scheduling simpler, more reliable, and easier to manage.

</div>