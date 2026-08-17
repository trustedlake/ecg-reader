# Local Development Setup

## Prerequisites

- Node.js >= 20
- npm >= 9
- Docker (optional, for PostgreSQL)p

## Clone & Install

```bash
git clone https://github.com/tl-gmiler/leitor-ecg.git
cd leitor-ecg

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001
DATABASE_URL=postgresql://dev:dev@localhost:5432/leitor_ecg
```

## Database (Optional)

```bash
docker run -d \
  --name leitor-ecg-pg \
  -e POSTGRES_DB=leitor_ecg \
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
leitor-ecg/
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

> **Deploy pra prod (S3+CloudFront, `app.leitorecg.com.br`)**: `npm run build`
> usa `.env` por padrão, então crie um `.env.production` local (gitignored)
> com `VITE_API_BASE_URL=https://d1i155fprtk4at.cloudfront.net` (o proxy
> HTTPS do ecg-backend — HTTP puro dá mixed-content block) antes de buildar
> pra deploy, senão o build embarca a URL do seu `.env` de dev local.
