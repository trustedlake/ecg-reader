# Local Development Setup

## Prerequisites

- Node.js >= 20
- npm >= 9
- Docker (optional, for PostgreSQL)

## Clone & Install

```bash
git clone https://github.com/trustedlake/ecg-reader.git
cd ecg-reader

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001
DATABASE_URL=postgresql://dev:dev@localhost:5432/ecg_reader
```

## Database (Optional)

```bash
docker run -d \
  --name ecg-reader-pg \
  -e POSTGRES_DB=ecg_reader \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:16
```

## Run

```bash
# Start dev server
npm run dev
```

Open [http://localhost:47535](http://localhost:47535).

## Project Structure

```
./
├── apps/                  # Application builds
├── docs/                  # Documentation
├── src/                   # React application
├── public/                # Static assets
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

> **Production deploy (S3 + CloudFront)**: `npm run build`
> uses `.env` by default, so create a local `.env.production` (gitignored)
> with `VITE_API_BASE_URL=https://d1i155fprtk4at.cloudfront.net` (the
> ecg-backend HTTPS proxy; plain HTTP triggers a mixed-content block) before
> building for deploy, otherwise the build embeds your local dev `.env` URL.
