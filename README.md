# Learning Management System (LMS)

A full-stack Learning Management System built with **Node.js**, **Express**, **MongoDB**, **React**, and **Tailwind CSS**. Features course management, video lessons, Razorpay payments, Cloudinary media uploads, progress tracking, and certificate generation.

---

## Features

### Student
- Browse & search courses by category
- Enroll in free or paid courses (Razorpay integration)
- Watch video lessons (YouTube, Vimeo, Dailymotion, Cloudinary, direct links)
- Track lesson progress with completion percentage
- Download PDF certificates on course completion
- Write, edit, and delete course reviews (1–5 rating)
- Wishlist courses for later
- View payment history
- Profile management with password change

### 🛠️ Admin
- Dashboard with analytics (total courses, students, revenue)
- CRUD for categories, courses, and lessons
- Upload course thumbnails to Cloudinary
- Upload lesson videos to Cloudinary or paste external URLs
- Publish/unpublish courses (draft mode)
- View all payments

### Security
- JWT-based authentication with protected routes
- Role-based access control (student / admin)
- Helmet, CORS, and rate limiting
- Input validation with express-validator

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Tailwind CSS 4, Axios, React Hot Toast, React Icons |
| **Backend** | Node.js, Express 4, Mongoose (MongoDB ODM) |
| **Database** | MongoDB |
| **Payments** | Razorpay |
| **Media** | Cloudinary (images & videos), Multer (file handling) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Email** | Nodemailer (Ethereal for dev) |
| **Certificates** | PDFKit |
| **Dev Tools** | Vite 8, Nodemon, ESLint |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally or a MongoDB Atlas URI
- **Razorpay** account (for payments) — [dashboard.razorpay.com](https://dashboard.razorpay.com)
- **Cloudinary** account (for media uploads) — [console.cloudinary.com](https://console.cloudinary.com)

### 1. Clone the repository

```bash
git clone https://github.com/gauravraj347/Learning_Management_System.git
cd Learning_Management_System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or edit the existing one):

```env
# Application
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/lms_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---


---

## 👨‍💻 Author

**Gaurav Raj** — [@gauravraj347](https://github.com/gauravraj347)
