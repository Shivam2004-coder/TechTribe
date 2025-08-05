# TechTribe Backend

TechTribe is a developer collaboration platform that enables users to connect with like-minded individuals, chat in real time, and access premium features. This repository contains the backend code for TechTribe, built using **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---

## 🚀 Features

- ✅ User Authentication (Manual + Google OAuth)
- ✅ Real-time One-on-One Chat using Socket.IO
- ✅ Premium Membership with Razorpay Integration
- ✅ Contact Form to Collect User Feedback
- ✅ Profile Management with Cloudinary Image Uploads
- ✅ Matchmaking and Connection Requests
- ✅ Role-Based Access & Middleware Authentication
- ✅ MongoDB Data Storage with Mongoose Models

---

## 🧾 API Endpoints Overview

### 1. **Authentication** (`/auth`)
| Method | Route           | Description                  |
|--------|------------------|------------------------------|
| POST   | `/signup`        | Manual user registration     |
| POST   | `/login`         | Manual user login            |
| GET    | `/auth/google`   | Google OAuth login           |
| POST   | `/logout`        | Logout the current user      |

---

### 2. **Chat** (`/chat`)
| Method | Route                 | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/chat/:targetUserId` | Fetch messages with user     |

- Uses `Socket.IO` for real-time communication.
- Room IDs are SHA-256 hashes of user pairs for secure one-on-one chat.

---

### 3. **Contact** (`/contact`)
| Method | Route             | Description                   |
|--------|--------------------|-------------------------------|
| POST   | `/contact/message` | Save contact form messages    |

---

### 4. **Payments** (`/payment`)
| Method | Route                       | Description                       |
|--------|------------------------------|-----------------------------------|
| POST   | `/payment/create`            | Create a Razorpay order           |
| POST   | `/payment/razorpay/webhook`  | Handle Razorpay payment webhooks |
| GET    | `/payment/verify`            | Verify user’s premium status     |

- Webhook uses signature validation to ensure authenticity.
- Updates user membership and expiry.

---

### 5. **Profile** (`/profile`)
| Method | Route                      | Description                            |
|--------|-----------------------------|----------------------------------------|
| GET    | `/profile/view`             | Fetch current user's profile           |
| PATCH  | `/profile/edit`             | Edit profile fields                    |
| POST   | `/profile/upload/image`     | Upload image to Cloudinary             |
| POST   | `/profile/delete/image`     | Delete a specific image                |
| POST   | `/profile/delete/savedImages` | Delete all saved images              |
| POST   | `/profile/check/image`      | Check image safety before upload       |

---

### 6. **Requests** (`/request`)
| Method | Route                                  | Description                              |
|--------|-----------------------------------------|------------------------------------------|
| POST   | `/request/send/:status/:toUserId`       | Send match request                        |
| POST   | `/request/review/:status/:requestId`    | Accept or reject a received request       |
| POST   | `/request/click`                        | Placeholder for future interaction logic |

---

### 7. **Users** (`/user`)
| Method | Route                                | Description                                   |
|--------|---------------------------------------|-----------------------------------------------|
| GET    | `/user/requests/received`            | Get pending connection requests               |
| GET    | `/user/sent/requests/:status`        | View sent request statuses                    |
| GET    | `/user/requests/connections`         | Get connected users                           |
| GET    | `/user/feed`                         | Fetch recommended users / connections         |
| DELETE | `/user/delete/account`               | Permanently delete the user account           |

---

## 🧱 Project Structure

TechTribe-Backend/
│
├── config/ # DB and Google OAuth configuration
├── controllers/ # Route logic (auth, chat, contact, payment, etc.)
├── middlewares/ # Authentication middleware
├── models/ # Mongoose schemas (User, Chat, Payment)
├── routes/ # Route handlers (modularized)
├── src/utils/ # Razorpay & constants
├── app.js # Entry point for Express app
└── package.json # Dependencies



---

## 🔐 Middleware

- **`userAuth`**: Verifies JWT token from client cookies and authenticates the user.
- Applies to all protected routes like chat, profile, payment, and connection requests.

---

## 💳 Payment Flow

**1.** User clicks a membership plan → Frontend sends POST to `/payment/create`.
**2.** Razorpay order is created and opened on frontend.
**3.** Razorpay sends webhook to `/payment/razorpay/webhook`.
**4.** Webhook validates signature, updates payment status and membership.
**5.** User can verify membership via `/payment/verify`.

---

## 📦 Tech Stack

- **Node.js**, **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** Authentication
- **Socket.IO** for chat
- **Razorpay** for payments
- **Cloudinary** for image storage
- **Google OAuth** integration
- **Dotenv**, **CORS**, **Axios**

---

## 🔧 Getting Started

### 1. Install dependencies

- **bash**
- **npm install**

### 2. Set up .env

- **env**
- **Copy**
- **Edit**
- **PORT=5000**
- **MONGO_URI=<your_mongo_connection_string>**
- **RAZORPAY_KEY_ID=<your_key>**
- **RAZORPAY_KEY_SECRET=<your_secret>**
- **RAZORPAY_WEBHOOK_SECRET=<your_webhook_secret>**
- **JWT_SECRET=<your_jwt_secret>**
- **GOOGLE_CLIENT_ID=<your_google_client_id>**
- **GOOGLE_CLIENT_SECRET=<your_google_client_secret>**   

### 3. Run the server
- **bash**
- **Copy**
- **Edit**
- **npm run dev**


### 👤 Author
Made with 💻 by Shivam Vaishnav
Feel free to reach out for collaboration or feedback.

### 📄 License
This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).


