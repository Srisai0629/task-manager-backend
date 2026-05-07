# 🚀 Full-Stack Task Manager

A secure, full-stack task management application built with a Node.js/Express backend and a modern React (Vite) frontend. The application features secure JWT authentication, role-based access control, and a PostgreSQL database hosted on Railway.


## 🛠️ Tech Stack
* **Frontend:** React.js (Vite), React Router, Axios
* **Backend:** Node.js, Express.js, Node-Postgres (`pg`)
* **Database:** PostgreSQL (Hosted on Railway)
* **Security:** JWT (JSON Web Tokens), bcryptjs for password hashing

## ✨ Features
* **User Authentication:** Secure registration and login system.
* **Password Hashing:** Passwords are mathematically hashed via `bcrypt` before hitting the database.
* **Session Management:** Stateless authentication using JWTs stored in local storage.
* **Role-Based Access:** Users default to 'Member', with support for 'Admin' roles.
* **Protected Routes:** The frontend dashboard and backend data routes are inaccessible without a valid Golden Key (Token).

## 🚀 Local Setup Instructions

### Backend Setup
1. Clone the repository and navigate to the backend folder.
2. Run `npm install` to download dependencies.
3. Create a `.env` file with the following:
   ```env
   DATABASE_URL="postgresql://postgres:iwucjzFlecaGEakThEmFbCyHHEqRjKTH@turntable.proxy.rlwy.net:10212/railway"
   JWT_SECRET="my_super_secret_key_for_this_assessment_123"
   PORT=5000