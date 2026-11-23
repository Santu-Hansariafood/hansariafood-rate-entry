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
Keep the API key out of client-side code and source control:

```env
HANSARIA_API_BASE_URL=https://hfconnect.in
HANSARIA_API_URL=https://hfconnect.in/api/v1/messages/send
HANSARIA_API_KEY=
HANSARIA_ADMIN_ID=
HANSARIA_TEMPLATE_NAME=hansaria_new_bid
HANSARIA_RATE_TEMPLATE_ID=6ac76937c5d0a603f0d7e0f8
HANSARIA_SAUDA_TEMPLATE_ID=6ac76988c5d0a603f0d7e0f9
HANSARIA_OTP_TEMPLATE_ID=6ac7682dc5d0a603f0d7e0f7
```

`HANSARIA_API_BASE_URL` should be the API host only; template-ID sends append
`/api/v1/messages/send` and send one request per recipient. Rate Management and
new-bid Sauda use `HANSARIA_API_URL` and `HANSARIA_TEMPLATE_NAME`. Configure the
URL with the `/api/v1/messages/send` path; the app changes the final path to
`/api/v1/messages/bulk` and sends one bulk request with a recipient entry per
employee and rate/Sauda entry.
`HANSARIA_API_KEY` authenticates the request. `HANSARIA_ADMIN_ID` must be the
sender's MongoDB user ID on hfconnect; it is sent as `adminId`. If the API
key is bound to a sender account, this ID must match that account.
The `HANSARIA_*_TEMPLATE_ID` values are hfconnect template MongoDB IDs and are
sent as `templateId` (not `templateName`); each template must be accessible to
the API key's workspace.
Add the API key and any required template IDs to the deployment's server
environment or local `.env.local` file, and restart the server after changing
them. Rate Management sends `HANSARIA_TEMPLATE_NAME` to every registered
employee with a valid mobile number, using `commodity`, `group` (company),
`consignee` (empty for rate entries), `origin` (location), `quantity`, `rate`,
and `endTime` (date and update time). Ten-digit Indian mobile numbers are
prefixed with `91` for `toUserId`. If there are no valid employee mobile
numbers, no request is sent. Other rate-history notifications continue to use
the configured `HANSARIA_RATE_TEMPLATE_ID` and registered users' saved
hfconnect IDs.
Sauda and OTP notifications continue to use registered users' saved external
app user IDs and message languages.
New-bid Sauda notifications use `HANSARIA_TEMPLATE_NAME` (defaults to
`hansaria_new_bid`). They are sent automatically when a Sauda is created or
updated, once per saved entry, to registered employees with a valid mobile
number in the employee list. These messages are in-app messages, not carrier
SMS.
The same save flow also sends `hansaria_bid_accepted` (overridable with
`HANSARIA_SAUDA_BID_ACCEPTED_TEMPLATE`) using the commodity, group, origin,
consignee, quantity, rate, saved Sauda mobile number, and notes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# hansariafood-rate-entry
