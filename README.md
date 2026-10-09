This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## WebSockets Integration

This project now uses Socket.io for real-time notifications.
The server runs on the same port as the Next.js application using a custom `server.mjs`.

To start the project with WebSocket support:

```bash
npm run dev
```

For production (on Windows):

```bash
npm run build
npm start
```

## Hansaria message API

Configure these server-side environment variables before using message delivery.
Keep the API key and admin password out of client-side code and source control:

```env
HANSARIA_API_BASE_URL=https://hfconnect.in
HANSARIA_API_KEY=
HANSARIA_ADMIN_ID=tradeconfirmation@hansariafood.com
HANSARIA_ADMIN_PASSWORD=
HANSARIA_RATE_TEMPLATE_ID=6ac76937c5d0a603f0d7e0f8
HANSARIA_SAUDA_TEMPLATE_ID=6ac76988c5d0a603f0d7e0f9
HANSARIA_OTP_TEMPLATE_ID=6ac7682dc5d0a603f0d7e0f7
```

`HANSARIA_API_BASE_URL` should be the API host only; the application appends
`/api/v1/messages/send` and sends one request per recipient.
`HANSARIA_ADMIN_ID` and `HANSARIA_ADMIN_PASSWORD` authenticate the sender;
add the API key and admin password to the deployment's server environment or
local `.env.local` file, and restart the server after changing them. Rate
notifications are sent to each registered user with a saved external app user
ID, using their saved message language. Users without an external app user ID
are skipped.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# hansariafood-rate-entry
