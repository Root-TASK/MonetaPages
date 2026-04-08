# Moneta Bank — Full-Stack Financial Ledger

A complete financial management platform built with **React + Vite** (frontend) and **FastAPI + SQLite** (backend).

---

## Features

- **Dashboard** — Balance overview, income/expense charts, balance trend, recent transactions
- **Ledger** — Full transaction table with monthly/daily/all-time views, search, sort, filters, CSV export
- **Reports** — Monthly and daily summaries with bar charts, client vs company expense breakdowns
- **Settings** — Configure opening balance
- **Transaction management** — Add, edit, delete with screenshot/receipt upload
- **Running balance** — Auto-computed after every transaction
- **Mobile responsive** — Works on all screen sizes

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, React Router, Recharts, Axios, Lucide React |
| Backend   | FastAPI, SQLAlchemy, SQLite, Pydantic v2, Python 3.11+ |
| Storage   | SQLite (swap to PostgreSQL with 1 line change) |

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Project Structure

```
moneta-bank/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # ORM models (Transaction, Settings)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── requirements.txt
│   └── routers/
│       ├── transactions.py  # CRUD + screenshot upload
│       ├── settings.py      # Opening balance management
│       └── reports.py       # Monthly & daily aggregations
│
└── frontend/
    ├── index.html
    ├── vite.config.js       # Vite + proxy to :8000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx           # Routes + layout
        ├── index.css         # Design system / CSS vars
        ├── components/
        │   ├── UI.jsx         # Badge, Card, StatCard, Button, Modal, Table…
        │   ├── Sidebar.jsx    # Navigation (desktop + mobile drawer)
        │   ├── TransactionForm.jsx   # Add/Edit modal
        │   └── TransactionDetail.jsx # Detail view + delete
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Ledger.jsx
        │   ├── Reports.jsx
        │   └── Settings.jsx
        └── utils/
            ├── api.js         # Axios API client
            └── format.js      # Currency, date formatters
```

---

## API Endpoints

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/transactions` | List with filters (month, day, type, category, search) |
| GET    | `/api/transactions/{id}` | Single transaction with balance |
| POST   | `/api/transactions` | Create transaction |
| POST   | `/api/transactions/with-screenshot` | Create with file upload |
| PUT    | `/api/transactions/{id}` | Update transaction |
| PATCH  | `/api/transactions/{id}/screenshot` | Update screenshot |
| DELETE | `/api/transactions/{id}` | Delete transaction |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/settings/opening-balance` | Get opening balance |
| PUT    | `/api/settings/opening-balance` | Set opening balance |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/reports/summary` | Overall financial summary |
| GET    | `/api/reports/monthly?year=2026` | Monthly breakdown |
| GET    | `/api/reports/daily?month=2026-04` | Daily breakdown |

---

## Switch to PostgreSQL

In `backend/database.py`, replace:

```python
SQLALCHEMY_DATABASE_URL = "sqlite:///./moneta.db"
```

with:

```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/moneta"
```

Then install: `pip install psycopg2-binary`

---

## Environment Variables (optional)

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./moneta.db
CORS_ORIGINS=http://localhost:5173
```

---

## License
MIT

Email: admin@moneta.com
Password: admin123

admin@123