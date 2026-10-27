# SkillBridge – Skill Sharing Platform

## 📌 Project Overview

SkillBridge is a web-based skill-sharing platform that connects people who want to learn new skills with people who can share their knowledge. Users can explore available skills, add skills they can teach, and send requests to learn from others.

The project uses a React frontend and AWS services for backend operations, authentication, and data storage.

## ✨ Features

- **User Authentication:** User authentication using Amazon Cognito.
- **Browse Skills:** View available skills on the platform.
- **Add Skills:** Add skills that users are willing to teach.
- **Request to Learn:** Send requests to learn a selected skill.
- **Request Management:** View and manage learning requests.
- **Cloud Backend:** Handle application operations through AWS Lambda.
- **Database Integration:** Store and retrieve application data using Amazon DynamoDB.

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend and Cloud Services
- AWS Lambda
- Amazon DynamoDB
- Amazon Cognito
- AWS Lambda Function URL

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Node.js and npm

## 🏗️ System Architecture

The application follows a frontend-and-serverless-backend architecture.

1. The user interacts with the React frontend.
2. Amazon Cognito handles user authentication.
3. The frontend communicates with AWS Lambda APIs.
4. AWS Lambda processes requests and interacts with DynamoDB.
5. The results are returned to the frontend and displayed to the user.

## 📂 Project Structure

```text
SkillBridgeApp/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── Auth.jsx
│   └── api.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above represents the main frontend files. Your actual folder may contain additional files.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### Step 2: Open the Project

```bash
cd SkillBridgeApp
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure AWS

Configure the required AWS resources and frontend settings:

- Amazon Cognito User Pool and App Client
- AWS Lambda backend and Function URL
- Amazon DynamoDB table
- Appropriate CORS settings and authentication configuration

Ensure the frontend API configuration points to the correct backend endpoint.

### Step 5: Run the Application

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

*Note: This command assumes the project uses Vite. Check your `package.json` for the correct development command.*

## 🔐 Security

- Do not commit AWS secret access keys, passwords, or private credentials.
- Keep environment files and other sensitive configuration out of the public repository.
- Validate and authorize backend requests.
- Configure AWS permissions and CORS according to the application's requirements.

## 🚀 Future Enhancements

- Real-time communication between learners and skill providers.
- User profiles and skill-provider ratings.
- Skill search, filtering, and categorization.
- Notifications for learning requests.
- Scheduling and session management.
- Improved mobile responsiveness and user experience.

## 🎯 Project Objective

The main objective of SkillBridge is to make skill sharing more accessible by providing a platform where people can discover learning opportunities, connect through shared interests, and exchange knowledge.

## 👨‍💻 Developer

**Project:** SkillBridge  
**Category:** Web Development / Cloud-Based Application  
**Frontend:** React.js  
**Backend:** AWS Serverless Services

## 📄 License

This project is intended for educational and portfolio purposes unless another license is specified.
