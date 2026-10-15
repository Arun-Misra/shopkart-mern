# ShopKart — MERN E-Commerce Application

A full-stack e-commerce application built with **MongoDB, Express, React, and Node.js**. ShopKart includes product browsing, customer authentication, wishlist and cart management, checkout, order history, and Razorpay payment integration.

**Live application:** https://shopkart-mern-eight.vercel.app  
**Repository:** https://github.com/Arun-Misra/shopkart-mern

> The live URL above is the production URL used during setup. If the project's production domain changes, update this link to match the domain shown in Vercel.

---

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started locally](#getting-started-locally)
- [Environment variables](#environment-variables)
- [Run the application](#run-the-application)
- [Application routes](#application-routes)
- [API overview](#api-overview)
- [Authentication and security](#authentication-and-security)
- [Razorpay setup](#razorpay-setup)
- [MongoDB setup](#mongodb-setup)
- [Deploy to Vercel](#deploy-to-vercel)
- [Troubleshooting](#troubleshooting)
- [Development checks](#development-checks)

## Features

### Customer experience
- Customer registration and login.
- Cookie-based authentication using JSON Web Tokens (JWT).
- Browse the product catalogue and view product details.
- Add products to and remove products from a wishlist.
- Add products to the shopping cart and update quantities.
- Checkout and order creation.
- Razorpay payment integration.
- View orders and individual order details.
- Responsive single-page application routing through React Router.

### Backend
- REST-style API built with Express.
- MongoDB persistence using Mongoose.
- Password hashing with bcrypt.
- Authentication middleware for protected customer, wishlist, cart, and order operations.
- CORS configuration with credentialed requests for cookie authentication.
- Health-check endpoints for deployment diagnostics.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT), bcrypt, HTTP-only cookies |
| Payments | Razorpay |
| Deployment | Vercel |

## Project structure

```text
shopkart-mern/
├── backend/
│   ├── controllers/       # Request handlers and application logic
│   ├── middlewares/       # Authentication middleware
│   ├── models/            # Mongoose data models
│   ├── routes/            # Customer, product, wishlist, cart and order routes
│   ├── index.js           # Express entry point
│   ├── package.json
│   └── .env.example       # Backend environment-variable template
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── context/       # Shared React context
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API client
│   │   ├── App.jsx        # Client-side routes
│   │   └── ...
│   ├── .env.example       # Frontend environment-variable template
│   └── package.json
└── vercel.json            # Vercel multi-service routing configuration
```

## Prerequisites

Install or prepare the following before running the project:

- **Node.js** (a current LTS release is recommended).
- **npm**, included with Node.js.
- **MongoDB**, either a local MongoDB server or a MongoDB Atlas cluster.
- **Razorpay test-mode credentials** if you want to test the payment flow.
- **Git** to clone the repository.

Check your installed versions:

```bash
node --version
npm --version
git --version
```

## Getting started locally

### 1. Clone the repository

```bash
git clone https://github.com/Arun-Misra/shopkart-mern.git
cd shopkart-mern
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure the backend

Create a file named `.env` inside `backend/`. You can use `.env.example` as a starting point, but make sure the MongoDB variable is named **`MONGO_URI`**; this is the variable read by the backend.

Example for a local MongoDB server:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Use your own values. Do not commit your real `.env` file or publish credentials.

If you use MongoDB Atlas, set `MONGO_URI` to the connection string provided by Atlas. Ensure your database user has the required permissions and that your network/IP access configuration permits the connection.

### 4. Install frontend dependencies

Open a **second terminal** at the repository root:

```bash
cd frontend
npm install
```

### 5. Configure the frontend

Create `frontend/.env` using `frontend/.env.example` as a starting point:

```dotenv
VITE_API_URL=http://localhost:3000
```

The frontend API client uses this URL in development. Keep the local API URL pointed at the backend port unless you have changed the backend configuration.

## Environment variables

### Backend

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Port for the Express server; defaults to `3000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Use a long, random value. |
| `FRONTEND_URL` | For deployed/cross-origin frontend | Allowed frontend origin(s) for credentialed CORS. Multiple origins can be comma-separated. |
| `RAZORPAY_KEY_ID` | For payments | Razorpay key ID. Use test credentials during development. |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay secret. Keep this private and server-side only. |

**CORS note:** An origin is the scheme + hostname + optional port, without a path or trailing slash. For local development, the backend allows `http://localhost:5173`. For production, set `FRONTEND_URL` to the actual frontend origin displayed in Vercel, for example `https://your-production-domain.vercel.app`. If more than one frontend origin must be supported, separate the origins with commas.

**Important:** The backend reads `MONGO_URI`, not `MONGODB_URI`. Use the exact variable name shown above.

### Frontend

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | Optional | API base URL. In development it defaults to `http://localhost:3000`; in production it defaults to the relative path `/api`. |

Vite exposes variables prefixed with `VITE_` to browser code. Never put private keys, database credentials, or server secrets in frontend environment variables.

## Run the application

Start the backend first.

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

The backend uses Node's watch mode. Alternatively, use `npm start` to run it without watch mode.

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Vite prints the local frontend URL in the terminal, normally:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API health check: http://localhost:3000/health

Open the frontend URL printed by Vite in your browser. The frontend sends API requests to the backend and uses credentialed requests for cookie-based authentication.

## Application routes

The React application defines the following client-side routes:

| Route | Purpose |
|---|---|
| `/` | Default/landing page |
| `/register` | Customer registration |
| `/login` | Customer login |
| `/home` | Home page |
| `/products` | Product catalogue |
| `/products/:id` | Product details |
| `/wishlist` | Customer wishlist |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/order-success/:id` | Order success page |
| `/orders` | Customer order history |
| `/orders/:id` | Order details |

Some routes require the customer to be authenticated.

## API overview

The backend exposes the route groups below. In local development, use the unprefixed paths. The deployed Vercel setup also routes `/api/*` requests to the backend.

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/health` | API health check | No |
| POST | `/customers/register` | Register a customer | No |
| POST | `/customers/login` | Log in | No |
| GET | `/customers/me` | Get the current customer | Yes |
| POST | `/customers/logout` | Log out | Yes |
| GET | `/products` | List products | No |
| GET | `/products/:id` | Get a product | No |
| POST | `/products` | Create a product | No route-level auth middleware is attached in the current route definition; secure this endpoint before public production use. |
| GET | `/wishlist` | Get the wishlist | Yes |
| POST | `/wishlist/:productId` | Add a product to the wishlist | Yes |
| DELETE | `/wishlist/:productId` | Remove a product from the wishlist | Yes |
| PATCH | `/wishlist/:productId/toggle` | Toggle wishlist membership | Yes |
| GET | `/cart` | Get the cart | Yes |
| POST | `/cart/:productId` | Add a product to the cart | Yes |
| PATCH | `/cart/:productId` | Update cart quantity | Yes |
| DELETE | `/cart/:productId` | Remove a product from the cart | Yes |

Order and payment endpoints are implemented in the order route group. Their exact paths and request payloads should be checked in `backend/routes/order.routes.js` and the corresponding controller before integrating another client.

For the deployed API health check, open:

```text
https://your-production-domain.vercel.app/api/health
```

A successful response should be JSON indicating that the ShopKart API is running.

## Authentication and security

- Customer passwords are hashed with bcrypt; passwords should never be stored as plaintext.
- The backend issues JWTs and stores the authentication token in an HTTP-only cookie.
- The frontend API client uses `withCredentials: true` so browser requests can send and receive authentication cookies.
- The backend enables CORS with credentials and checks requests against its allowed-origin list.
- In production, use HTTPS and ensure the cookie configuration is compatible with your deployment domain.
- Keep `MONGO_URI`, `JWT_SECRET`, and `RAZORPAY_KEY_SECRET` private.
- Do not commit `.env` files, real payment credentials, access tokens, or database connection strings.
- Use least-privilege database credentials and rotate any secret that has been accidentally exposed.
- Before exposing the app to real customers, review authorization on all write endpoints, validate request data, apply rate limiting where appropriate, and verify payment status on the server.

## Razorpay setup

1. Create or sign in to a Razorpay account.
2. Open the Razorpay dashboard and switch to **Test Mode**.
3. Generate or copy the test API key ID and secret.
4. Put them in `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
5. Restart the backend after changing environment variables.
6. Test the checkout flow using Razorpay's official test-mode instructions and test payment details.

Razorpay secrets must remain in the backend environment. Do not use live keys for development, and do not treat a client-side success screen alone as proof that a payment has been verified.

Official documentation: https://razorpay.com/docs/

## MongoDB setup

### Local MongoDB

1. Install and start MongoDB Community Server.
2. Create/use the `shopkart` database by setting `MONGO_URI=mongodb://127.0.0.1:27017/shopkart`.
3. Start the backend. Mongoose connects using `MONGO_URI`.

### MongoDB Atlas

1. Create a cluster and database user in Atlas.
2. Configure network access to allow the environment running the backend to connect.
3. Copy the application connection string.
4. Set it as `MONGO_URI` in your local backend `.env` or the deployment environment variables.
5. Restart or redeploy the backend after changing the variable.

The app may need product documents in the database to display a populated catalogue. Add or seed products using your project's supported workflow; do not assume a fresh database is automatically seeded.

## Deploy to Vercel

This repository is configured as a Vercel multi-service project using the root `vercel.json`. The frontend is served through the Vite service and `/api/*` requests are routed to the Express backend service.

### Deployment checklist

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Ensure the project uses the repository root so that Vercel can read the root `vercel.json`.
4. Configure the project/service setup to match the multi-service configuration in `vercel.json`.
5. Add the backend environment variables in Vercel:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
6. Set `FRONTEND_URL` to the actual production frontend origin, with no trailing slash. Confirm it matches the domain used in the browser.
7. If configuring a separate frontend environment, set `VITE_API_URL` only when you need to override the default `/api` base URL.
8. Deploy and wait for the build to complete.
9. Test `/api/health`, registration, login, cart, wishlist, orders, and the checkout flow.

Vercel environment-variable changes apply to new deployments. After changing a variable, redeploy the affected service. If login fails, check Vercel runtime logs for the request before changing code.

### Production CORS

The frontend origin must exactly match an origin in `FRONTEND_URL`. For example:

```dotenv
FRONTEND_URL=https://your-production-domain.vercel.app
```

If Vercel assigns or you select a different production domain, update this variable to the current domain and redeploy the backend. A deployment-specific preview URL can differ from the stable production domain; use the domain you actually intend customers to visit.

## Troubleshooting

### Login returns 500 or the UI says “Invalid Credentials”

1. Open browser DevTools → **Network** and inspect the login request and response.
2. Open Vercel → **Logs** and inspect the matching request.
3. Check whether the backend reports `Origin not allowed by CORS`. If so, correct `FRONTEND_URL` to the exact frontend origin and redeploy.
4. If the error is a database connection issue, verify `MONGO_URI`, Atlas network access, and database-user permissions.
5. If the API returns 401, verify the account exists and the supplied credentials are correct.

A generic frontend error message can hide the actual server response, so use the network response and backend logs to identify the cause.

### Cart or wishlist returns 401

These endpoints are protected. Log in first and verify that the browser is accepting the authentication cookie. The frontend API client should use `withCredentials: true`, and the backend CORS configuration must allow credentials from the frontend origin.

### CORS error in the browser

- Use the exact origin including `https://` in production.
- Do not add a path such as `/login` or a trailing slash to the origin value.
- Make sure `FRONTEND_URL` is set for the backend service and the correct deployment environment.
- Redeploy after changing the variable.
- Ensure the browser is using the domain configured in `FRONTEND_URL`.

### MongoDB connection fails

- Confirm the variable is named `MONGO_URI`.
- Check that the connection string is valid and credentials are current.
- For Atlas, check network access and database-user permissions.
- Inspect backend logs for the connection error; never paste a connection string containing credentials into a public issue.

### Products do not appear

Confirm the database has product documents and inspect the `GET /products` response in the Network tab. A newly created database may be empty until products are inserted.

### Frontend builds but routes fail after refreshing

Confirm the Vercel frontend service has a rewrite to `/index.html` for client-side routes, as configured in the root `vercel.json`.

### Razorpay checkout fails

Check that both Razorpay variables are set on the backend, the keys belong to the same mode (test/live), and the server logs show the actual failure. Never expose the key secret in frontend code or browser logs.

## Development checks

Run frontend linting and production build from the `frontend/` directory:

```bash
npm run lint
npm run build
```

Run the backend syntax check from the `backend/` directory:

```bash
node --check index.js
```

## Contributing

1. Create a branch for your change.
2. Keep changes focused and avoid committing secrets or generated build output.
3. Run the relevant checks before opening a pull request.
4. Describe the change and any setup or environment-variable changes.

## License

Check the repository's license and assignment requirements before redistributing or reusing this project. The backend package currently declares the ISC license, but confirm the intended license for the complete repository before adding a repository-wide license statement.