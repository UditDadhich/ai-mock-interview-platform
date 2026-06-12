# 🤖 AI Mock Interview Platform

An AI-powered interview preparation platform that simulates real interview experiences using AI-generated questions, intelligent feedback, and personalized interview sessions. The platform helps students, job seekers, and professionals improve their interview skills through realistic mock interview experiences.

## 🌐 Live Demo

**Live Application:** https://ai-mock-interview-platform-client.onrender.com

**GitHub Repository:** https://github.com/UditDadhich/ai-mock-interview-platform

---

# 📌 Overview

The AI Mock Interview Platform is a full-stack MERN application designed to help users prepare for technical and behavioral interviews.

The system leverages AI to generate interview questions, evaluate responses, provide feedback, and track interview performance over time.

Users can practice interviews anytime, receive constructive feedback, and identify areas for improvement before attending real interviews.

---

# ✨ Features

## 🔐 Authentication & User Management

* Secure user registration and login
* JWT-based authentication
* Protected routes
* Session management
* User profile management

## 🤖 AI-Powered Interview System

* AI-generated interview questions
* Role-specific interview sessions
* Dynamic question generation
* Technical and behavioral interview support
* Context-aware interview flow

## 📊 AI Feedback & Evaluation

* Detailed performance analysis
* AI-generated feedback
* Strength identification
* Improvement recommendations
* Answer quality assessment

## 📚 Interview History

* Track previous interviews
* Review past performance
* Monitor progress over time
* Access interview analytics

## 💳 Premium Features

* Razorpay payment integration
* Secure checkout experience
* Premium interview plans
* Subscription simulation using Razorpay Test Mode

## 📱 Responsive Design

* Mobile-friendly UI
* Tablet support
* Desktop optimized experience
* Modern user interface

---

# 🛠️ Tech Stack

## Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Axios
* React Router DOM

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose ODM

## Authentication

* JWT (JSON Web Tokens)
* bcrypt.js

## AI Integration

* Gemini API
* AI Question Generation
* AI Feedback Engine

## Payment Gateway

* Razorpay

## Deployment

* Render

---

# 🏗️ Project Architecture

```text
┌─────────────────────┐
│     React Client    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Express Server    │
└──────────┬──────────┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
Authentication AI Engine Razorpay
    │      │      │
    └──────┼──────┘
           ▼
┌─────────────────────┐
│      MongoDB        │
└─────────────────────┘
```

---

# 💳 Payment Testing Guide

> ⚠️ **Important Notice**
>
> This project integrates Razorpay in **Test Mode only**.
>
> * No real money is deducted.
> * No actual bank transaction occurs.
> * All payments are simulated for educational and demonstration purposes.
> * Please do not use real banking credentials while testing.

## Payment Testing Steps

### Step 1

Open the application:

```text
https://ai-mock-interview-platform-client.onrender.com
```

### Step 2

Create an account or log in.

### Step 3

Navigate to Premium Plans.

### Step 4

Select a plan and click:

```text
Pay Now
```

### Step 5

Razorpay Checkout will open.

### Step 6

Choose a payment method.

### Step 7

Use Razorpay Test Mode credentials.

### Step 8

Complete the payment flow.

### Step 9

Verify payment confirmation.

---

## Test UPI IDs

| Purpose            | UPI ID           |
| ------------------ | ---------------- |
| Successful Payment | success@razorpay |
| Failed Payment     | failure@razorpay |

---

## Test Cards

This application uses Razorpay Sandbox/Test Mode.

For the latest supported test cards and payment scenarios, refer to Razorpay's official documentation:

https://razorpay.com/docs/payments/payment-gateway/test-card-details/

| Network | Card Number | CVV & Expiry Date |
|----------|------------|------------------|
| Visa | 4100 2800 0000 1007 | Use any random CVV and any future expiry date |
| Mastercard | 5500 6700 0000 1002 | Use any random CVV and any future expiry date |
| RuPay | 6527 6589 0000 1005 | Use any random CVV and any future expiry date |
| Diners Club | 3608 280009 1007 | Use any random CVV and any future expiry date |
| American Express (Amex) | 3402 560004 01007 | Use any random CVV and any future expiry date |


---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/UditDadhich/ai-mock-interview-platform.git
cd ai-mock-interview-platform
```

## Install Client Dependencies

```bash
cd client
npm install
```

## Install Server Dependencies

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_SECRET=your_razorpay_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

# 🚀 Running the Project

## Start Backend

```bash
npm run server
```

or

```bash
node server.js
```

## Start Frontend

```bash
npm start
```

---

# 📂 Project Structure

```text
ai-mock-interview-platform
│
├── client
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── assets
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── services
│   └── config
│
├── package.json
└── README.md
```

---

# 🔄 Application Workflow

## User Registration

```text
User
 ↓
Register/Login
 ↓
JWT Authentication
 ↓
Dashboard Access
```

## Interview Generation

```text
User Selects Role
 ↓
AI Generates Questions
 ↓
User Answers Questions
 ↓
AI Evaluates Responses
 ↓
Feedback Generated
```

## Payment Flow

```text
Select Premium Plan
 ↓
Razorpay Checkout
 ↓
Test Payment
 ↓
Payment Verification
 ↓
Premium Access
```

---

# 🎯 Key Learning Outcomes

This project demonstrates:

* Full Stack MERN Development
* REST API Development
* JWT Authentication
* Database Design
* AI Integration
* Payment Gateway Integration
* Frontend State Management
* Backend Architecture
* Secure API Development
* Production Deployment

---

# 📈 Future Enhancements

* Video Interview Support
* Voice-Based Interviews
* AI Resume Analyzer
* AI Career Guidance
* Real-Time Interview Sessions
* Advanced Performance Analytics
* Interview Recommendation System
* Multi-Language Support
* Admin Dashboard

---

# 🎓 Use Cases

* Placement Preparation
* Technical Interview Practice
* Behavioral Interview Training
* Career Development
* Educational Institutions
* Professional Upskilling

---

# 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Udit Dadhich**

Full Stack Developer | MERN Developer | AI Enthusiast

GitHub:
https://github.com/UditDadhich

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Your support helps improve and maintain the project.
