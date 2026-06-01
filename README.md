# Cogniva Backend API

Complete Node.js + Express + MongoDB backend for the Cogniva Health AI app.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **AI**: Anthropic Claude API (proxied securely)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting, bcrypt

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `JWT_SECRET` — any long random string
- `MAIL_USER` / `MAIL_PASS` — Gmail credentials (optional)

### 3. Start MongoDB
- **Local**: `mongod` (make sure MongoDB is installed)
- **Cloud**: Use [MongoDB Atlas](https://cloud.mongodb.com) (free tier) and paste the URI in `.env`

### 4. Seed demo data (optional)
```bash
npm run seed
```
Creates a demo user: `titiksha@cogniva.app` / `cogniva123`

### 5. Run the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Vitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vitals` | Log new vitals |
| GET  | `/api/vitals/today` | Get today's log |
| GET  | `/api/vitals?days=7` | Get recent logs |
| PUT  | `/api/vitals/:id` | Update a log |
| DELETE | `/api/vitals/:id` | Delete a log |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/weekly?days=7` | Weekly summary |
| GET | `/api/analytics/insights` | AI insights |
| GET | `/api/analytics/healthscore` | Health score (0-100) |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI |
| GET  | `/api/chat/history` | All chat sessions |
| GET  | `/api/chat/:id` | Get a chat session |
| DELETE | `/api/chat/:id` | Delete session |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/meds` | All medications |
| GET  | `/api/meds/today` | Today's schedule |
| POST | `/api/meds` | Add medication |
| PUT  | `/api/meds/:id` | Update |
| POST | `/api/meds/:id/take` | Log dose taken |
| DELETE | `/api/meds/:id` | Remove |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/upload` | Upload report file |
| GET  | `/api/reports` | All reports |
| GET  | `/api/reports/:id` | Single report |
| DELETE | `/api/reports/:id` | Delete |

### Health Plan
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/plan/current` | Active plan |
| POST | `/api/plan/generate` | Generate AI plan |
| PATCH | `/api/plan/:planId/task/:taskId` | Toggle task done |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/user/profile` | Get profile |
| PUT  | `/api/user/profile` | Update profile |
| PUT  | `/api/user/password` | Change password |
| DELETE | `/api/user/account` | Delete account |

---

## Authentication
All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## Free MongoDB Options
1. **Local**: Install MongoDB Community — https://www.mongodb.com/try/download/community
2. **Cloud (free)**: MongoDB Atlas M0 — https://cloud.mongodb.com (512MB free forever)

## Free Hosting Options
1. **Railway** — https://railway.app (free tier, auto-deploys from GitHub)
2. **Render** — https://render.com (free tier)
3. **Cyclic** — https://cyclic.sh (free, Node.js focused)

---

## Project Structure
```
cogniva-backend/
├── server.js              # Entry point
├── .env.example           # Environment template
├── package.json
├── routes/
│   ├── auth.js
│   ├── vitals.js
│   ├── analytics.js
│   ├── chat.js
│   ├── medications.js
│   ├── reports.js
│   ├── plan.js
│   └── user.js
├── controllers/
│   ├── authController.js
│   ├── vitalsController.js
│   ├── analyticsController.js
│   ├── chatController.js
│   ├── medicationsController.js
│   ├── reportsController.js
│   └── planController.js
├── models/
│   ├── User.js
│   ├── VitalLog.js
│   ├── Medication.js
│   ├── Report.js
│   ├── Plan.js
│   └── Chat.js
├── middleware/
│   └── auth.js
└── utils/
    ├── jwt.js
    └── seed.js
```
