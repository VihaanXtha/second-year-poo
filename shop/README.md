# Circuit Bazaar Shop

Public shop frontend built with Next.js 15, React 19, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Icons:** Material Symbols Outlined, Lucide React
- **Package Manager:** npm

## Local Development

```bash
# Install dependencies
npm install

# Run development server on port 3003
npm run dev

# Open http://localhost:3003
```

## Environment Variables

Create a `.env` file in the root:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SHOP_URL=http://localhost:3003
```

## Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Deployment

This app is configured for deployment on **Vercel**.

The `vercel.json` in the root configures:
- Build command: `npm run build`
- Output directory: `.next`
- Framework: Next.js

## API Integration

All API calls use `NEXT_PUBLIC_API_URL` environment variable. In local development, this points to `http://localhost:8000/api`.

## Project Structure

```
shop/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx   # Root layout with AuthProvider
│   │   ├── page.tsx     # Homepage
│   │   ├── account/     # User account pages
│   │   └── auth/        # Auth callback pages
│   ├── components/      # React components
│   ├── context/         # Auth context
│   ├── lib/             # API client
│   └── types.ts         # TypeScript interfaces
├── public/              # Static assets
├── package.json
├── next.config.mjs
├── tailwind.config.cjs
└── .env
```

## Authentication

- Uses localStorage for auth persistence
- Token key: `shop-token`
- User key: `shop-auth`
- Handles Google OAuth callback with token in URL query params
- Cross-app auth from frontend via URL token pattern

## Documentation

- `FLOW_OF_SHOP.md` — Detailed shop app flow and pages
