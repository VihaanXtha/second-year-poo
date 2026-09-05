# Circuit Bazaar Shop

Public marketplace frontend built with Next.js 15, React 19, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Icons:** Material Symbols Outlined, Lucide React
- **Package Manager:** npm

## Local Development

```bash
# Install dependencies
npm install

# Run development server on port 3000
npm run dev

# Open http://localhost:3000
```

## Environment Variables

Create a `.env` file in the root:

```
NEXT_PUBLIC_API_URL=https://backend.circuit.up.railway.app/api
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

All API calls use `NEXT_PUBLIC_API_URL` environment variable. In production, this points to the Railway-hosted backend at `https://backend.circuit.up.railway.app/api`.

## Project Structure

```
shop/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Homepage
│   ├── components/      # React components
│   ├── context/         # Auth context
│   ├── data/            # Mock product/vendor data
│   └── types.ts         # TypeScript interfaces
├── public/              # Static assets
├── package.json
├── next.config.mjs
├── tailwind.config.cjs
├── vercel.json
└── .env
```
