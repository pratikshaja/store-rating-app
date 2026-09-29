# Store Rating Web Application

A full-stack web application where users can discover stores and submit ratings. The application supports three roles: System Administrator, Normal User, and Store Owner.

## Features

### System Administrator
- Log in to the application.
- View dashboard statistics, including total users, stores, and ratings.
- Add and manage stores and user accounts.
- View and filter users and stores.
- View store ratings and user details.

### Normal User
- Register and log in.
- Browse and search stores.
- View store details and overall ratings.
- Submit a rating from 1 to 5.
- Update an existing rating.
- Change password and log out.

### Store Owner
- Log in to the application.
- View ratings submitted for their store.
- View the average rating of their store.
- View users who rated their store.
- Change password and log out.

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML and CSS

### Backend
- Node.js
- Express.js
- MySQL

## Project Structure

```text
store-rating-app/
├── frontend/       # React frontend
├── backend/        # Express backend
├── database/       # Database scripts
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MySQL Server
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/pratikshaja/store-rating-app.git
cd store-rating-app
```

### 2. Set up the database

1. Start MySQL Server.
2. Create a database named `store_rating_db`.
3. Configure the database connection details in the backend environment file.
4. Run the database setup SQL script, if provided in the `database` folder.

### 3. Configure the backend

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add your local configuration:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
```

Replace the example database username and password with your own local MySQL credentials.

Start the backend:

```bash
npm run dev
```

If the project does not have a `dev` script, use the start command defined in `backend/package.json`.

### 4. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

## User Roles

The application has three roles:

| Role | Description |
|---|---|
| System Administrator | Manages users and stores |
| Normal User | Searches stores and submits ratings |
| Store Owner | Views ratings and store feedback |

Public registration is intended for Normal Users. Administrator and Store Owner accounts should be created or assigned through the appropriate administrator process.

## Validation

The application includes validation for user information, including:

- Name: 20–60 characters
- Address: Maximum 400 characters
- Email: Valid email format
- Password: 8–16 characters, including an uppercase letter and a special character
- Rating: 1–5

## Author

Pratiksha Jadhav

GitHub: https://github.com/pratikshaja
