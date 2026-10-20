# IssueHub API

Express and Mongoose API for IssueHub. The server requires a reachable MongoDB database and a `JWT_SECRET`; it exits with a clear message if configuration is missing or the database cannot be reached.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `MONGO_URI`, a random `JWT_SECRET` with at least 32 characters, and `CLIENT_URL`. Set `IMAGEKIT_PRIVATE_KEY` to enable optional report image uploads. Never commit `.env` or expose the ImageKit key to the frontend.

The report endpoint accepts an optional multipart `image` field. It validates JPEG, PNG, or WebP content up to 5 MB, uploads through the ImageKit Node SDK, and stores the returned URL and file ID with the MongoDB report. The image provider is only contacted when a report includes an image.

Create the first admin only after configuring MongoDB and the admin account environment variables:

```bash
npm run seed-admin
```

Student accounts can read a privacy-filtered campus-wide report feed; reporter email and internal ImageKit file IDs are not exposed in student responses. Authenticated students may add or remove their own urgency vote. Votes are stored in the `UrgencyVote` collection with a unique `(report, user)` index, and admins cannot modify them. Admin dashboard and insight APIs calculate report totals, repeated/unresolved problems, urgency, and long-pending reports from MongoDB only. `COMMUNITY_URGENCY_THRESHOLD` (default `10`) and `LONG_PENDING_DAYS` (default `7`) configure concern thresholds.

Optional admin self-signup uses `ADMIN_SIGNUP_KEY` in the backend environment; never expose that key to the frontend. Normal signup always creates a student. Routes are separated by authentication, student reports, admin reports, and profile. Controllers handle operations; middleware verifies cookie JWTs, student/admin roles, and report access.
