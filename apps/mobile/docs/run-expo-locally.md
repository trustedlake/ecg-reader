# Run the mobile app (Expo) locally

Guide validated on 2026-10-20 (Windows). Expected result: the "ECG Reader" login screen in the browser and in Expo Go.

## 1. Prerequisites

| Item | Detail |
|---|---|
| Up-to-date repo | `git pull` on `main` (the V1 flow from PR #4 is already there) |
| Dependencies | `npm ci` at the repo **root** (never `npm install --prefix apps/mobile`, see "Pitfalls") |
| Phone | Expo Go, on the **same Wi-Fi network** as the PC |

## 2. Configuration: `apps/mobile/.env` (gitignored)

```
EXPO_PUBLIC_API_BASE_URL=https://d1i155fprtk4at.cloudfront.net
RCT_METRO_PORT=8142
```

- `EXPO_PUBLIC_API_BASE_URL` is required on the phone. It points to the **production backend** (CloudFront), not to a local backend.
- `RCT_METRO_PORT=8142` avoids the default port 8081 (each project has its own port).

## 3. Start

```powershell
cd apps\mobile
npx expo start --lan --clear
```

| Where to open | How |
|---|---|
| Browser | `http://localhost:8142` |
| Expo Go | "Enter URL manually" -> `exp://<PC-IP>:8142` (find it with `ipconfig`) |

If the phone does not connect, allow port 8142 in the Windows firewall (requires admin).
The first Metro build is slow; use `--clear` after touching `node_modules`.

## 4. Login

Login is the username/email and password of a backend account. Accounts are created by the system owner in the Django Admin. No test account is committed to the repo.

## 5. Pitfalls (real errors found)

| Symptom | Cause | Fix |
|---|---|---|
| Blank page in the browser; log: `Incompatible React versions` (react 19.2.3 x react-dom 19.2.8) | Monorepo: `apps/mobile` pins React 19.2.3, `apps/web` uses `^19.2.7`; the `react-dom` hoisted to the root diverges from the mobile app's nested `react` | `npm ci` at the root fixes it (`react-dom` 19.2.3 ends up in `apps/mobile/node_modules`). Native Expo Go is not affected. Permanent fix: align the React versions between web and mobile |
| `Unable to resolve "rsvp" from ...node_modules\shared\lib\shared.js` | `npm install --prefix apps/mobile` downloaded the **`shared` package from the npm registry** over the `packages/shared` workspace | `rm -rf apps/mobile/node_modules` and `npm ci` at the root. Check that `node_modules/shared` is a symlink to `packages/shared` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED ./rn-get-polyfills` | `npm install` at the root without a lockfile updated the hoisted `react-native` | `npm ci` (respects the lockfile) |

Rule: always install dependencies **with `npm ci` at the root**, no `--prefix`, no `--no-package-lock`.
