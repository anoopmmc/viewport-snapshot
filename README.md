# viewport-snapshot

Captures webpages as sequential viewport screenshots using Playwright.

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

```bash
node capture.js https://example.com
```

Screenshots are saved to `screenshots/<domain>/<date>/` as sequential PNG files.
