# SupportDesk CRM

A full-stack customer support ticket management system built for the Datastraw Technologies hiring assessment.

**Live demo:** [your-app.onrender.com](https://your-app.onrender.com)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express.js |
| Frontend | EJS (server-side rendering) |
| Database | TiDB Cloud (MySQL-compatible) |
| Auth | express-session + bcrypt |
| Deploy | Render.com |

## Features

- **Authentication** — Register / Login / Logout with hashed passwords
- **Dashboard** — Live stats (Total / Open / In Progress / Closed) + recent tickets
- **Create Tickets** — Auto-generated IDs (TKT-001), timestamps, customer info
- **List All Tickets** — Paginated table with all ticket data
- **Live Search** — Real-time search across name, email, ID, subject, description
- **Filter by Status** — Open / In Progress / Closed
- **Ticket Detail** — Full info, status update, notes/comments with author + timestamp
- **REST API** — Full CRUD API endpoints alongside the UI
- **Dark / Light mode** — CSS variable theming with localStorage persistence

## Local Setup

### Prerequisites
- Node.js 18+
- A TiDB Cloud account (free tier works)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/crm-app.git
cd crm-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your TiDB credentials

# 4. Run the schema in TiDB Cloud SQL editor
# (copy contents of db/schema.sql and run it)

# 5. Start the dev server
npm run dev

# App runs at http://localhost:3000
```

## Database Setup (TiDB Cloud)

1. Go to [tidbcloud.com](https://tidbcloud.com) → Create a free Serverless cluster
2. Go to **Connect** → copy the host, port, user, password
3. Open the **SQL Editor** tab and paste + run `db/schema.sql`
4. Fill those values into your `.env` file

## API Endpoints

```
POST   /api/tickets          Create a ticket
GET    /api/tickets           List all tickets (?status=Open&search=query)
GET    /api/tickets/:id       Get single ticket + notes
PUT    /api/tickets/:id       Update status / add note
```

## Deployment (Render.com)

1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Set build command: `npm install`
4. Set start command: `node app.js`
5. Add environment variables (same as your `.env`) in the Render dashboard
6. Deploy!

## Project Structure

```
crm-app/
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── tickets.ejs
│   ├── new-ticket.ejs
│   ├── ticket-detail.ejs
│   └── 404.ejs
├── routes/
│   ├── auth.js
│   └── tickets.js
├── middleware/
│   └── auth.js
├── db/
│   ├── connection.js
│   └── schema.sql
├── public/
│   ├── css/style.css
│   └── js/app.js
├── .env.example
├── .gitignore
├── app.js
└── package.json
```

## Author

Kaif Ansari — [kaif.dev](https://kaif.dev) · [github.com/kaifansari-11](https://github.com/kaifansari-11)
