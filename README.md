# FoodRescue – Food Donation and Rescue Platform

## About the Project

FoodRescue is a full-stack web application designed to
reduce food waste by connecting food donors with people
or organizations that can use surplus food.

The application allows users to add food donations,
view available donations, search and filter donations,
update donation details, claim food, mark it as collected,
and delete donation records.

## Features

- Add new food donations
- View all available donations
- Search and filter donations
- Update donation information
- Claim available donations
- Mark donations as collected
- Delete donation records
- Input validation and error handling
- Persistent data storage using MongoDB

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Bootstrap
- Node.js
- Express.js
- MongoDB
- Mongoose
- Git and GitHub

## Project Structure

FoodRescue/
- config/
- controllers/
- models/
- routes/
- middleware/
- public/
- .env.example
- .gitignore
- package.json
- server.js

## Installation and Setup

1. Clone the repository:

   git clone https://github.com/AnushkaRoman/FoodRescue.git

2. Navigate to the project folder:

   cd FoodRescue

3. Install dependencies:

   npm install

4. Create a `.env` file using `.env.example` as a reference.

5. Configure your MongoDB connection string.

6. Start the application:

   npm run dev

7. Open the application:

   http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/donations | Create donation |
| GET | /api/donations | Get all donations |
| GET | /api/donations/:id | Get donation by ID |
| PUT | /api/donations/:id | Update donation |
| PATCH | /api/donations/:id/status | Update donation status |
| DELETE | /api/donations/:id | Delete donation |

## Database

Database: foodrescue

Collection: donations

## Project Purpose

The main objective of FoodRescue is to reduce food
wastage and encourage responsible food donation by
providing a simple digital platform for managing surplus
food donations.

## Developer

Anushka Roman