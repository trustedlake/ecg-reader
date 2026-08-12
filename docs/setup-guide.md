# Local Development Setup

## Prerequisites

- Node.js >= 20
- npm >= 9
- Docker (optional, for PostgreSQL)

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

Open [http://localhost:5173](http://localhost:5173).

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
