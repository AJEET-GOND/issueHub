# IssueHub frontend

The React/Vite client uses React Router and Tailwind CSS. All API requests use the shared Axios instance with `withCredentials: true`. The signed-in user is restored from `/api/auth/me` and held in React memory; the JWT and application data are never written to `localStorage`.

## Run

```bash
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` if the backend API is not at `http://localhost:3000/api`.
Students can optionally attach one JPEG, PNG, or WebP photo (up to 5 MB) to a report. The browser sends it to the authenticated backend; ImageKit credentials remain server-side.
Authenticated students can browse the shared campus problem feed, filter/search/sort reports, and add or remove one urgency vote per report. Vote state comes from the API/MongoDB, not browser storage.

## Source structure

- `pages/public`: landing, login, and signup.
- `pages/student` and `pages/admin`: role-specific dashboards, campus problems, report management, and admin insights.
- `layouts`: separate student and admin navigation layouts.
- `components`: shared forms, report cards, status badges, loading, and empty states.
- `routes`: authenticated and admin-only route guards.
- `context`, `hooks`, and `services`: session state and API clients.
