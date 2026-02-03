# B2C App - Frontend

This is a [Next.js](https://nextjs.org) project for the B2C automotive service booking platform.

## Important: Backend Dependency

This frontend application requires the Express backend to be running on port 5001.

**Before starting the frontend, make sure the backend is running:**

```bash
# In a separate terminal
cd "../backend"
npm run dev
```

Backend must be available at: `http://localhost:5001`

## Getting Started

1. Make sure the backend is running (see above)

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Architecture

This application uses a **single backend architecture**:

- **No Next.js API Routes**: All API calls go directly to the Express backend
- **Direct Backend Communication**: Frontend communicates with Express on port 5001
- **Simple & Clear**: One backend, one source of truth

See [API-ARCHITECTURE.md](./API-ARCHITECTURE.md) for detailed documentation.

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
