# 🎓 Learning Management System (LMS)

A full-stack Learning Management System built with **Node.js**, **Express**, **MongoDB**, **React**, and **Tailwind CSS**. Features course management, video lessons, Razorpay payments, Cloudinary media uploads, progress tracking, and certificate generation.

---

## ✨ Features

### 🎯 Student
- Browse & search courses by category
- Enroll in free or paid courses (Razorpay integration)
- Watch video lessons (YouTube, Vimeo, Dailymotion, Cloudinary, direct links)
- Track lesson progress with completion percentage
- Download PDF certificates on course completion
- Write, edit, and delete course reviews (⭐ 1–5 rating)
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

### 🔒 Security
- JWT-based authentication with protected routes
- Role-based access control (student / admin)
- Helmet, CORS, and rate limiting
- Input validation with express-validator

---

## 🏗️ Tech Stack

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

## 📁 Project Structure

```
Learning_Management_System/
├── backend/
│   ├── server.js                    # Entry point
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── src/
│       ├── app.js                   # Express app setup
│       ├── config/
│       │   ├── index.js             # Central config
│       │   ├── db.js                # MongoDB connection
│       │   └── cloudinary.js        # Cloudinary SDK setup
│       ├── middlewares/
│       │   ├── auth.js              # JWT protect & authorize
│       │   ├── upload.js            # Multer (memory storage)
│       │   ├── validate.js          # express-validator runner
│       │   └── errorHandler.js      # Global error handler
│       ├── modules/
│       │   ├── auth/                # Register, login, profile
│       │   ├── category/            # CRUD categories
│       │   ├── course/              # CRUD courses + thumbnail upload
│       │   ├── lesson/              # CRUD lessons + video upload
│       │   ├── enrollment/          # Enroll students
│       │   ├── payment/             # Razorpay create-order & verify
│       │   ├── progress/            # Lesson completion & certificates
│       │   ├── review/              # Course reviews & ratings
│       │   ├── wishlist/            # Wishlist management
│       │   ├── dashboard/           # Admin analytics
│       │   └── upload/              # Standalone Cloudinary upload
│       ├── routes/
│       │   └── index.js             # Route aggregator
│       └── utils/
│           ├── AppError.js          # Custom error class
│           ├── catchAsync.js        # Async error wrapper
│           ├── sendResponse.js      # Standardized JSON response
│           ├── uploadToCloudinary.js # Cloudinary upload helper
│           ├── emailService.js      # Email utilities
│           └── certificateService.js # PDF certificate generator
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                 # React entry
│       ├── App.jsx                  # Router & routes
│       ├── index.css                # Global styles
│       ├── api/
│       │   └── axios.js             # Axios instance with interceptors
│       ├── context/
│       │   └── AuthContext.jsx       # Auth state provider
│       ├── components/
│       │   ├── Layout.jsx           # Page layout wrapper
│       │   ├── Navbar.jsx           # Navigation bar
│       │   ├── ProtectedRoute.jsx   # Auth guard
│       │   └── ErrorBoundary.jsx    # Error boundary
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Courses.jsx
│           ├── CourseDetail.jsx      # Course view + video player
│           ├── CourseProgress.jsx    # Lesson tracker + video player
│           ├── StudentDashboard.jsx
│           ├── Wishlist.jsx
│           ├── Profile.jsx
│           ├── PaymentHistory.jsx
│           └── admin/
│               ├── AdminDashboard.jsx
│               ├── ManageCategories.jsx
│               ├── ManageCourses.jsx  # + thumbnail upload
│               ├── ManageLessons.jsx  # + video upload
│               └── AdminPayments.jsx
```

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

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/courses` | List courses (public) |
| GET | `/api/v1/courses/:id` | Get course + lessons |
| POST | `/api/v1/courses` | Create course (admin) |
| PUT | `/api/v1/courses/:id` | Update course (admin) |
| DELETE | `/api/v1/courses/:id` | Soft-delete course (admin) |
| POST | `/api/v1/courses/:id/thumbnail` | Upload thumbnail (admin) |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/courses/:courseId/lessons` | List lessons |
| POST | `/api/v1/courses/:courseId/lessons` | Create lesson (admin) |
| PUT | `/api/v1/courses/:courseId/lessons/:id` | Update lesson (admin) |
| DELETE | `/api/v1/courses/:courseId/lessons/:id` | Delete lesson (admin) |
| POST | `/api/v1/courses/:courseId/lessons/:id/upload-video` | Upload video (admin) |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/enrollments/:courseId` | Enroll (free courses) |
| GET | `/api/v1/enrollments/:courseId/check` | Check enrollment |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-order/:courseId` | Create Razorpay order |
| POST | `/api/v1/payments/verify` | Verify payment |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/progress/:courseId` | Get progress |
| POST | `/api/v1/progress/:courseId/lessons/:lessonId/complete` | Mark lesson done |
| GET | `/api/v1/progress/:courseId/certificate` | Get certificate |

### Reviews, Wishlist, Categories, Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reviews/:courseId` | Add/update review |
| POST | `/api/v1/wishlist/:courseId` | Add to wishlist |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/upload/video` | Standalone video upload |

---

## 🎨 Screenshots

> Add screenshots of your app here

---

## 📄 License

ISC

---

## 👨‍💻 Author

**Gaurav Raj** — [@gauravraj347](https://github.com/gauravraj347)
