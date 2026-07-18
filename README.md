# DRIFT

> Reclaim attention before distraction becomes a habit.

DRIFT is a mobile-first behavioral coaching app that helps people notice and
interrupt **attention drift**: the movement from intentional phone use to
unconscious digital habits. Instead of rewarding screen-time streaks, it offers
personalized coaching, reflections, and offline-life recommendations.

## Why DRIFT

- Explains *why* a pattern may be happening rather than judging the user.
- Uses deterministic behavior logic for drift analysis; Gemini is used only for
  personalized language, coaching, and reflection.
- Keeps AI credentials on the server and encourages meaningful time away from
  the app.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS
- Express API server
- Google Gen AI SDK with Gemini on Vertex AI
- Node.js built-in test runner
- Docker / Cloud Run-ready deployment

## Architecture

```text
React client
    │  POST /api/coach
    ▼
Express server
    │  Application Default Credentials
    ▼
Vertex AI (Gemini)
```

The browser never receives a Gemini API key or service-account credential.

## Quick start

### Prerequisites

- Node.js 20 or later
- A Google Cloud project with billing enabled
- Google Cloud CLI (`gcloud`) for local Vertex AI authentication

Install dependencies and create local configuration:

```powershell
npm ci
Copy-Item .env.example .env
```

The default project is `drift-502807`. To use another project, update the
ignored `.env` file:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
```

### Configure Vertex AI

Enable Vertex AI and authenticate locally with Application Default Credentials:

```powershell
gcloud config set project drift-502807
gcloud services enable aiplatform.googleapis.com
gcloud auth application-default login
```

Your Google account needs the **Vertex AI User** role
(`roles/aiplatform.user`) in the project.

### Run locally

Start the API server:

```powershell
npm run build
npm run start
```

For hot-reloading UI development, run this in a second terminal:

```powershell
npm run dev
```

Vite proxies `/api` requests to the Express server at `http://localhost:8080`.

## Security

- Uses Vertex AI Application Default Credentials locally and an attached
  service account in production—no Gemini key is stored in the repository.
