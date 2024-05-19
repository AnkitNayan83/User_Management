# [User Management Application](https://user-management-87sm.onrender.com/)

This Node.js application provides user management functionalities, including creating user lists with custom fields, uploading CSV files to store users, sending emails to users in the list, and allowing users to unsubscribe from the list.

## Features

- Create user lists with custom fields.
- Upload CSV files to add users to the list.
- Send bulk emails to users in the list.
- Users can unsubscribe from the list via email links.

## Setup

To run this application locally, follow these steps:

### Prerequisites

- Node.js (v12 or higher)
- MongoDB

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/AnkitNayan83/User_Management.git
   cd User_Management
   npm install

2. Create a .env file in the root directory of the project with the following variables:
   
   ```bash
   DB_URL=<Your MongoDB connection URL>
   EMAIL=<Your admin email for sending emails>
   SENDGRID_API_KEY=<Your SendGrid API key>

## Running the Application

Start the Node.js server:

  ```bash
  npm start
  ```


## API Endpoints
```
POST /api/lists/ : Create a new list.
POST /api/lists/:id/user : Upload a CSV file to add users.
POST /api/lists/:id/send-email : Send emails to users in the list.

GET /api/user/unsubscribe/:id : To unsubscribe from emails.
GET /api/user/subscribe/:id : To subscribe to emails.
```

   ### [API DOCS](https://documenter.getpostman.com/view/18993037/2sA3QmCtrR)

## Author

[Ankit Nayan](https://github.com/AnkitNayan83)
