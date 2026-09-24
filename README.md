# Swifty Companion

A mobile app for looking up 42 students: enter a login and see their profile,
level, skills, projects and events, pulled from the
[42 intra API](https://api.intra.42.fr/apidoc).

Built with Expo (SDK 57), Expo Router and TypeScript. Targets iOS and Android.

## Features

- **Search** by login, with validation and clear errors (unknown login, network
  failure, timeout, rate limiting…). The last ten searches are saved on the
  device.
- **Profile**: avatar, level and progress, contact details, wallet and
  evaluation points, a cursus picker, and tabs for projects (passed or failed),
  skills and events.
- **Session** tab showing the OAuth2 token and its expiry, with buttons that
  expire or corrupt it to show the app renewing it automatically.

## Setup

1. Create an application on the intra:
   <https://profile.intra.42.fr/oauth/applications>.
2. Copy `.env.example` to `.env` and fill in the application's UID and secret.
3. Install dependencies and start the dev server:

   ```bash
   bun install
   bunx expo start
   ```

Restart the dev server after changing `.env`.

## Scripts

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `bun run start`     | Start the Expo dev server           |
| `bun run test`      | Run the unit tests (Jest)           |
| `bun run check`     | Lint, format and sort imports       |
| `bunx tsc --noEmit` | Typecheck                           |

## Project layout

```
src/
  app/          Routes (Expo Router): search, user/[login], session
  components/   UI components, profile sections under profile/
  hooks/        useUser, useTheme, …
  lib/api/      42 API client: OAuth2 token, retries, typed endpoints
  lib/          Level maths, persisted recent searches
tests/          Unit tests (Jest)
```

### How the API client works

- One OAuth2 token (client-credentials flow) is cached and shared by every
  request. It's renewed 30 seconds before it expires, and when several requests
  need a new token at once they share a single request.
- A `401` drops the token and retries once with a new one.
- A `429` waits for `Retry-After` (or 1 second) and retries, up to 3 times.
- Requests time out after 15 seconds.
