# Store Rating App

## About the Project

This is a Store Rating App developed as a coding challenge. It allows users to rate stores, store owners to view ratings, and administrators to manage users and stores.

I built this project to practice backend development, database management, and frontend integration.

## Technologies Used

- Frontend:React.js
- Backend: Node.js and Express.js
- Database: MySQL
- ORM: Sequelize
- Authentication: JWT
- Password Security: bcrypt

## Main Features

### Admin
- View dashboard statistics.
- Create and manage users and stores.
- View users, stores, and their ratings.
- Search, filter, and sort records.

### Normal User
- Create an account and log in.
- View and search stores.
- Submit a rating from 1 to 5.
- Update an existing rating.
- Change password.

### Store Owner
- View store rating statistics.
- View users who rated their stores.
- Change password.

## Project Setup

### 1. Clone the Repository

git clone https://github.com/pratikshaja/store-rating-app.git
cd store_rating_app

Replace the repository URL and folder name with your actual details.

### 2. Set Up the Database

- Start MySQL.
- Create the database using the provided `backend/database/schema.sql` file.
- Check that the database and tables are created successfully.

### 3. Set Up the Backend

Open the backend folder:

```bash
cd backend
npm install
```
Start the backend:

```bash
npm run dev
```

### 4. Set Up the Frontend

Open a new terminal and navigate to the frontend folder.

```bash
cd frontend
npm install
npm run dev
```

Make sure the frontend API URL points to the running backend server.

## Database

The `backend/database/schema.sql` file contains the SQL statements needed to create the database tables and their relationships.

Run this file before starting the application for the first time.

## Notes

- MySQL must be running before starting the backend.
- The backend requires valid database credentials and a JWT secret.
- An admin account must be available in the database to access admin features.
- Do not commit passwords, secret keys, or other sensitive information to GitHub.

## Learning Outcome

Through this project, I practiced building REST APIs, using Sequelize with MySQL, implementing JWT authentication, validating user input, and connecting a React frontend to an Express backend.
