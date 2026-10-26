# ECG Reader

Expo application for photographing paper ECGs, reviewing the extracted trace and viewing the automated result. It communicates with [trustedlake/ecg-backend](https://github.com/trustedlake/ecg-backend), which invokes the reader and interpretation components in [trustedlake/ecg-lambdas-v1](https://github.com/trustedlake/ecg-lambdas-v1).

The app is a research prototype. It preserves the reader's uncertainty and does not provide a clinical diagnosis.

## Run locally

Install dependencies from the repository root:

```bash
npm ci
```

Create `apps/mobile/.env` from `apps/mobile/.env.example`. For Expo Go, set the production API URL:

```text
EXPO_PUBLIC_API_BASE_URL=https://7y0j5a8yte.execute-api.us-east-1.amazonaws.com
RCT_METRO_PORT=8142
```

Then start Expo from `apps/mobile`:

```bash
npx expo start --lan
```

For web, an empty `EXPO_PUBLIC_API_BASE_URL` uses the same origin. On a phone, it must contain the backend URL. More detail is available in [`apps/mobile/docs/run-expo-locally.md`](apps/mobile/docs/run-expo-locally.md).

## Production

The web export is served by the backend at [ECG Reader](https://7y0j5a8yte.execute-api.us-east-1.amazonaws.com/). A push to `main` triggers the production backend pipeline through the authorized `ecg-github-frontend` connection in AWS `us-east-1`.

## Repositories

| Component | Repository |
| --- | --- |
| Backend and deployment helper | [trustedlake/ecg-backend](https://github.com/trustedlake/ecg-backend) |
| Reading, approved Selector and interpretation | [trustedlake/ecg-lambdas-v1](https://github.com/trustedlake/ecg-lambdas-v1) |
