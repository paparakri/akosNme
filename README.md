#Nightclub Management System

TuneSync is a comprehensive web application for managing nightclub operations, reservations, and customer engagement. Built with modern web technologies, it provides a seamless experience for both club owners and customers.

## 🌟 Features

### For Customers
- **Club Discovery**: Browse and search for clubs with detailed profiles
- **Real-time Reservations**: Book tables and manage reservations
- **Event Calendar**: View upcoming events and special occasions
- **Social Features**: Follow clubs, write reviews, and connect with other users
- **Personalized Recommendations**: Get club suggestions based on preferences
- **Loyalty Program**: Earn points for visits and reservations

### For Club Owners
- **Profile Management**: Create and manage detailed club profiles
- **Table Layout Management**: Visual drag-and-drop seating arrangement tool
- **Reservation Management**: Handle booking requests and track capacity
- **Event Management**: Create and promote special events
- **Analytics Dashboard**: Track performance metrics and customer engagement
- **Customer Communication**: Direct messaging and notification system

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 13+ (React)
- **UI Library**: Chakra UI
- **State Management**: React Hooks
- **Maps Integration**: OpenStreetMap
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Firebase Storage
- **Geolocation**: Nominatim API

### Additional Tools
- **Image Processing**: Firebase Storage
- **Recommendation Engine**: Python with scikit-learn
- **Real-time Updates**: Server-Sent Events
- **Analytics**: Custom Python-based analytics engine

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB
- Python 3.8+
- Firebase account
- npm or yarn package manager

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tunesync.git
   cd tunesync
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install

   # Install Python dependencies
   cd ../analytics
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create `.env` files in both frontend and backend directories with the following variables:
   ```env
   # Frontend .env
   NEXT_PUBLIC_API_URL=http://localhost:3500
   NEXT_PUBLIC_FIREBASE_CONFIG={your-firebase-config}

   # Backend .env
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   ```

4. **Start the development servers**
   ```bash
   # Start frontend (from frontend directory)
   npm run dev

   # Start backend (from backend directory)
   npm run dev

   # Start analytics server (from analytics directory)
   python main.py
   ```

## 🔐 Authentication

The system uses a JWT-based authentication system with refresh tokens:
- Access tokens expire after 60 seconds
- Refresh tokens expire after 10 days
- Secure HTTP-only cookies for token storage

## 🎯 API Endpoints

### User Management
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: User login
- `GET /api/users/:id`: Get user profile
- `PUT /api/users/:id`: Update user profile

### Club Management
- `GET /api/clubs`: List all clubs
- `GET /api/clubs/:id`: Get club details
- `POST /api/clubs/:id/events`: Create new event
- `PUT /api/clubs/:id/layout`: Update seating layout

### Reservations
- `POST /api/reservations`: Create reservation
- `GET /api/reservations/:id`: Get reservation details
- `PUT /api/reservations/:id`: Update reservation
- `DELETE /api/reservations/:id`: Cancel reservation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Project Link: [https://github.com/yourusername/tunesync](https://github.com/yourusername/tunesync)
