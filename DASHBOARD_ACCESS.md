# Dashboard Access Guide

## ✅ Correct URL

**Access the dashboard at: http://localhost:5000/dashboard**

## Why Port 5000?

The ShadowCheck application uses an **integrated architecture** where:

1. **Express Server** (port 5000) serves BOTH:
   - Backend API endpoints (`/api/v1/*`)
   - Frontend React app (via Vite middleware)

2. This means when you access `http://localhost:5000`:
   - You get the full React frontend
   - API calls to `/api/v1/*` work automatically
   - Everything is served from the same origin (no CORS issues)

## Common Mistake

❌ **Don't use**: http://localhost:5173/dashboard

Port 5173 is a standalone Vite dev server that runs separately. It can show the UI but **cannot reach the API** without proxy configuration.

## How It Works

```
┌─────────────────────────────────────────┐
│  Express Server (localhost:5000)        │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  Vite Middleware (HMR)         │   │
│  │  Serves React Frontend         │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  API Routes                     │   │
│  │  /api/v1/analytics              │   │
│  │  /api/v1/radio-stats            │   │
│  │  /api/v1/networks               │   │
│  │  etc...                         │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  PostgreSQL Connection Pool     │   │
│  └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Quick Start

1. **Start the dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   ```
   http://localhost:5000/dashboard
   ```

3. **You should see**:
   - ✅ WiFi observations: 52,877
   - ✅ BLE observations: 99,493
   - ✅ Bluetooth observations: 398
   - ✅ Cellular observations: 374
   - ✅ Total observations: 436,622
   - ✅ Distinct networks: 152,482
   - ✅ Charts with real data
   - ✅ 24-hour timeline
   - ✅ Security analysis

## Verification

Test the API directly:
```bash
curl http://localhost:5000/api/v1/analytics
```

Should return:
```json
{
  "ok": true,
  "data": {
    "overview": {
      "total_observations": 436622,
      "distinct_networks": 152482,
      ...
    }
  }
}
```

## Troubleshooting

### Dashboard shows loading forever

**Check:**
1. Is the server running? `ps aux | grep "tsx watch"`
2. Can you access the API? `curl http://localhost:5000/api/v1/analytics`
3. Are you using the correct URL? (port 5000, not 5173)

### "Connection refused" errors

**Solution:**
```bash
# Restart the dev server
# Press Ctrl+C to stop
npm run dev
```

### Using Port 5173 Instead

If you prefer to use the standalone Vite dev server on port 5173:

1. The proxy has been configured in `client/vite.config.ts`
2. Restart the Vite dev server to apply changes
3. Access: http://localhost:5173/dashboard

But **we recommend using port 5000** for the best development experience.

---

**Current Status**: All API endpoints operational with real data
**Last Updated**: October 16, 2025
