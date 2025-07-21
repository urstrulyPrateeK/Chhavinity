# Chhavinity - Chat Application

A full-stack chat application built with React.js frontend and Node.js backend.

## Project Structure

```
Chhavinity/
├── backend/          # Node.js Express server
│   ├── package.json
│   └── package-lock.json
├── frontend/         # React.js application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html
└── README.md
```

## Features (Planned/In Development)

- Real-time messaging
- User authentication
- Modern React frontend with Vite
- Express.js backend with MongoDB
- JWT authentication
- Stream Chat integration

## Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stream Chat** - Chat functionality
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Chhavinity.git
cd Chhavinity
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Development

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Prateek

---

*Work in Progress - This is an active development project*
