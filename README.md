# DexElearning Frontend

DexElearning is a React-based learning platform frontend for Rwandan primary-school learners (Primary 1–6). It provides a responsive interface for browsing courses, studying lessons and PDFs, taking quizzes, tracking learning progress, and managing accounts. Administrative pages support course, lesson, and user management.

The application is built with React 19, Vite, React Router, and Axios. The live site is [dexelearning.vercel.app](https://dexelearning.vercel.app/).

## Features

- Browse courses and open course and lesson details.
- Register, sign in, and use password reset flows.
- View a learner dashboard, course enrollment, and lesson progress.
- Read lesson content, access lesson PDFs, and take quizzes.
- Provide administrative dashboards and lesson-management pages.
- Load route code on demand to reduce initial page loading.
- Include demo course and quiz data for selected demo flows and graceful admin fallbacks.
- Generate a sitemap containing public pages and available course pages.

## Tech stack

- [React](https://react.dev/) 19 and [React DOM](https://react.dev/)
- [Vite](https://vite.dev/) 8 with the React plugin
- [React Router](https://reactrouter.com/) 7
- [Axios](https://axios-http.com/) for API requests
- [ESLint](https://eslint.org/) for linting

## Getting started

### Requirements

- Node.js (use a current LTS release)
- npm
- The DexElearning backend for live authentication and learning data, unless you are using the frontend's available demo data

### Install and run

```bash
git clone https://github.com/Dervaux-dev/Dex_frontend.git
cd Dex_frontend
npm install
npm run dev
```

Vite prints the local development URL in the terminal (typically <http://localhost:5173>). In development, requests to `/api` and `/.well-known` are proxied to `http://localhost:5000`.

To use a different backend, create a `.env` file in the project root and set the API base URL:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_API_BASE_URL` should include the API prefix expected by the backend (for example, `/api`). Vite exposes `VITE_` variables to browser code, so do not put secrets in them.

Without this variable, the frontend uses `/api` in development and `https://dex-backend-14kj.onrender.com/api` in production builds. Set an appropriate API URL for your own deployment.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Generate `public/sitemap.xml`, then create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally for verification. |
| `npm run lint` | Run ESLint across the project. |
| `npm run sitemap` | Generate `public/sitemap.xml` without building the app. |

The sitemap script uses `VITE_API_BASE_URL` when supplied and otherwise requests course data from the configured default backend. Set `SITE_URL` when generating a sitemap for a different public domain:

```dotenv
SITE_URL=https://your-domain.example
VITE_API_BASE_URL=https://your-backend.example/api
```

## Application routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/courses` | Course catalog |
| `/courses/:id` | Course details and lessons |
| `/login` | Sign in |
| `/register` | Account registration |
| `/forgot-password` | Request a password reset |
| `/reset-password` | Reset a password |
| `/dashboard` | Learner dashboard |
| `/admin` | Admin dashboard |
| `/admin/lessons` | Admin lesson management |

The app uses React Router and lazy-loads page components. The Vercel configuration rewrites incoming paths to `index.html` so client-side routes can load directly.

## Project structure

```text
.
├── public/                 # Static assets and generated sitemap
├── scripts/
│   └── generate-sitemap.mjs
├── src/
│   ├── components/         # Pages and reusable UI components
│   ├── context/            # Authentication and toast providers
│   ├── hooks/              # Context hooks
│   ├── services/           # API client and demo data
│   ├── App.jsx             # Routes and shared layout
│   └── main.jsx            # React entry point and providers
├── index.html
├── vercel.json             # SPA rewrite configuration
└── vite.config.js
```

## Backend and authentication

The API client is in `src/services/api.js`. It groups requests for authentication, users, courses, lessons, quizzes, and admin operations. Requests include a bearer token from browser local storage when one is present. The frontend expects the backend to provide the corresponding API endpoints and handle authorization and role permissions.

For local development, the Vite proxy forwards `/api` to `http://localhost:5000`. Start the compatible backend separately or configure `VITE_API_BASE_URL` to point to a running API. The frontend repository does not include backend deployment or database setup instructions.

Demo entries are handled in the frontend API layer. Demo data and admin fallback responses are intended for demo/graceful fallback behavior; they do not replace a configured backend for real accounts or persistent data.

## Build and deployment

Build and check the production bundle locally:

```bash
npm run lint
npm run build
npm run preview
```

The production output is written to `dist/`. Deploy that directory with a static hosting provider. For Vercel, the included `vercel.json` sends all routes to `index.html` for SPA routing. Configure `VITE_API_BASE_URL` in the hosting provider's build environment if the deployment should use a backend other than the default. Use `SITE_URL` during the build if the sitemap should list a different canonical domain.

## Contributing

1. Create a branch for your change.
2. Install dependencies with `npm install`.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include a clear summary and screenshots for user-facing changes where helpful.

## License

No license is specified in this repository. Unless a license is added, the project should not be assumed to be available for redistribution or reuse.
