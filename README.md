# Tomewise — Books in Order

A full-stack SaaS application for personal book collection management. Track your books, organise them by location, manage lending and listings, and scan barcodes with your phone camera.

Live at [www.tomewise.se](https://www.tomewise.se)

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Support on Ko-fi](https://img.shields.io/badge/support-Ko--fi-FF5E5B)](https://ko-fi.com/christerbengt)

---

## Features

- **Barcode scanning** — scan ISBNs with your phone camera or a USB barcode scanner
- **ISBN lookup** — automatic book data from Open Library, Libris (Swedish national library) and Google Books
- **Collection management** — track condition, status, location, tags and notes for every copy
- **Locations** — organise books by bookcase and shelf, with bulk creation (A–ZZZ)
- **Lending** — track who has borrowed your books and when they're due back
- **Listings** — list books for sale with asking price and platform
- **Export** — export your library to Goodreads CSV format
- **Admin panel** — user management and invite system
- **Multilingual** — full Swedish and English UI
- **PWA** — installable on mobile, works like a native app
- **Responsive** — works on desktop and mobile

---

## Tech stack

**Backend**
- .NET 10 (C#) with ASP.NET Core Web API
- Entity Framework Core with PostgreSQL
- ASP.NET Core Identity with JWT authentication

**Frontend**
- React 19 with TypeScript
- Vite, React Query, React Router, i18next
- @zxing/browser for barcode scanning

**Infrastructure**
- Railway (hosting for API, frontend and database)
- GitHub Actions (CI/CD)
- Caddy (web server)

---

## Getting started

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- PostgreSQL (or Docker)
- Git

### Clone the repo

```bash
git clone https://github.com/christerbengt/tomewise.git
cd tomewise
```

### Backend setup

```bash
cd src/Tomewise.Api
```

Create `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "BookTracker": "Host=localhost;Port=5433;Database=tomewise;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Secret": "your-secret-key-at-least-32-characters-long",
    "Issuer": "tomewise-api",
    "Audience": "tomewise-client",
    "ExpiryHours": "24"
  },
  "AllowedOrigins": ["http://localhost:5173"],
  "AdminEmail": "your-email@example.com"
}
```

Run migrations and start the API:

```bash
dotnet ef database update
dotnet run
```

### Frontend setup

```bash
cd src/tomewise-client
```

Create `.env.development`:

VITE_API_URL=http://localhost:5025/api

Install and run:

```bash
npm install
npm run dev
```

The app is now running at `http://localhost:5173`.

### Running tests

```bash
# Backend
dotnet test

# Frontend
cd src/tomewise-client
npm test
```

---

## Deploying to Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database service
3. Add two services from this GitHub repo — one for the API (`src/Tomewise.Api`) and one for the frontend (`src/tomewise-client`)
4. Set the following environment variables on the API service:

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__BookTracker` | PostgreSQL connection URL from Railway |
| `Jwt__Secret` | A long random string |
| `Jwt__Issuer` | `tomewise-api` |
| `Jwt__Audience` | `tomewise-client` |
| `Jwt__ExpiryHours` | `24` |
| `AllowedOrigins__0` | Your frontend URL |
| `AdminEmail` | Your email address (gets admin role on startup) |

5. Set `VITE_API_URL` on the frontend service pointing to your API URL
6. Enable **Wait for CI** on both services

Migrations run automatically on startup.

---

## Project structure

```
tomewise/
├── src/
│   ├── Tomewise.Api/          # .NET backend
│   │   ├── Controllers/       # API endpoints
│   │   ├── Data/              # DbContext and migrations
│   │   ├── Domain/            # Entities and enums
│   │   ├── DTOs/              # Request and response models
│   │   └── Services/          # Token, ISBN lookup services
│   ├── Tomewise.Api.Tests/    # Backend unit tests (xUnit)
│   └── tomewise-client/       # React frontend
│       └── src/
│           ├── api/           # API client functions
│           ├── components/    # Shared components
│           ├── context/       # Auth context
│           ├── pages/         # Page components
│           ├── styles/        # CSS files
│           ├── types/         # TypeScript types
│           └── utils/         # Utility functions and tests
└── .github/workflows/         # GitHub Actions CI/CD
```
---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request so we can discuss the change.

---

## Support

If you find Tomewise useful, consider supporting development:

- ☕ [Ko-fi](https://ko-fi.com/christerbengt)
- 📱 Swish: 0707-207182

---

## License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2025 Christer Bengtsson