# Smart Campus Frontend

A fully-featured React + Vite frontend for the Smart Campus Resource Management System. This modern web application allows users to browse resources, book facilities, manage support tickets, and provides an admin dashboard for system management.

## 🚀 Features

### User Features
- **Dashboard**: Overview of bookings, resources, and tickets with visual analytics
- **Resource Browsing**: Search and filter campus resources (lecture halls, labs, meeting rooms, equipment)
- **Resource Booking**: Book available resources with date/time selection
- **Support Tickets**: Create and track support tickets with image attachments
- **User Profile**: Manage personal information and preferences
- **Notifications**: Real-time notifications for booking approvals and ticket updates

### Admin Features
- **Admin Dashboard**: System-wide analytics and statistics
- **Resource Management**: Add, edit, delete campus resources
- **Booking Management**: Review and approve/reject booking requests
- **Ticket Management**: Handle support tickets with status tracking
- **User Management**: View and manage system users

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:8080`
- Google OAuth2 credentials (for authentication)

## 🛠️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── main.jsx              # Application entry point
├── App.jsx               # Main app with routing
├── index.css             # Global styles & Tailwind
├── services/
│   └── api.js            # API service layer with axios
├── store/
│   └── authStore.js      # Authentication state (Zustand)
├── components/
│   ├── Layout.jsx        # Main layout wrapper
│   ├── Navbar.jsx        # Top navigation
│   ├── Sidebar.jsx       # Side navigation
│   └── Common.jsx        # Reusable components
├── pages/
│   ├── Dashboard.jsx     # Main dashboard
│   ├── Resources.jsx     # Resource browsing
│   ├── ResourceDetail.jsx # Resource details
│   ├── Bookings.jsx      # User bookings list
│   ├── BookingForm.jsx   # Create/edit booking
│   ├── Tickets.jsx       # Support tickets list
│   ├── TicketDetail.jsx  # Ticket details with comments
│   ├── TicketForm.jsx    # Create ticket form
│   ├── Profile.jsx       # User profile
│   ├── Login.jsx         # Login page
│   ├── Admin.jsx         # Admin dashboard
│   ├── AdminResources.jsx # Resource management
│   ├── AdminBookings.jsx  # Booking management
│   ├── AdminTickets.jsx   # Ticket management
│   └── Unauthorized.jsx   # 403 error page
└── public/               # Static assets
```

## 🎨 Design & Styling

The application uses:
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide Icons**: Beautiful, consistent icon library
- **Recharts**: React charts for data visualization
- **Custom Components**: Reusable UI components for buttons, badges, modals, alerts

### Color Scheme
- Primary: Blue (#3b82f6)
- Secondary: Purple (#8b5cf6)
- Accent: Pink (#ec4899)
- Backgrounds: Light gray (#f9fafb)

## 🔐 Authentication

The application uses OAuth2 with Google authentication. The backend handles the authentication flow, and the frontend retrieves the current user from the `/api/auth/me` endpoint.

### Login Flow
1. User clicks "Sign in with Google"
2. Redirected to backend OAuth2 endpoint
3. Backend exchanges code for JWT token
4. Frontend stores authentication state
5. All API requests include credentials

## 🔌 API Integration

The API layer (`src/services/api.js`) provides organized methods for:

### Authentication
- `authAPI.getCurrentUser()` - Get logged-in user

### Resources
- `resourceAPI.getAll()` - List all resources
- `resourceAPI.search(type, capacity, location)` - Search resources
- `resourceAPI.create/update/delete()` - Resource CRUD

### Bookings
- `bookingAPI.create(data)` - Create booking
- `bookingAPI.getMyBookings()` - Get user bookings
- `bookingAPI.approve/reject/cancel()` - Manage bookings

### Tickets
- `ticketAPI.create(data, files)` - Create ticket with images
- `ticketAPI.updateStatus()` - Update ticket status
- `ticketAPI.addComment()` - Add comment

### Notifications
- `notificationAPI.getAll/getUnread()` - Get notifications

## 🧪 Component Highlights

### Layout System
- Responsive sidebar navigation (collapsible)
- Top navigation with user profile
- Protected routes for authenticated users
- Admin-only route protection

### Forms
- Booking form with resource selection and date/time picker
- Ticket form with file upload support
- Resource management forms (admin)
- Profile edit form

### Data Display
- Dashboard with charts (area, bar, pie)
- Resource cards with filtering
- Booking list with status badges
- Ticket tracking with comments

### Modals & Alerts
- Success/error alerts
- Confirmation modals
- Loading spinners
- Custom badges for status

## 📊 State Management

Uses Zustand for lightweight state management:
- Authentication store (`useAuthStore`)
- User information and permissions
- Error handling

## 🔄 API Proxying

Vite is configured to proxy API requests from `/api/*` to the backend server:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## 🚀 Deployment

### As a Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### On Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

### Manual Deployment
1. Build the project: `npm run build`
2. Copy `dist/` folder to your web server
3. Configure server to redirect all routes to `index.html`
4. Set appropriate CORS headers on backend

## 🛠️ Configuration

### Modifying API Endpoint
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
```

### Adding New Routes
Update `src/App.jsx` and create corresponding page component in `src/pages/`

### Customizing Colors
Edit `tailwind.config.js` or override in `src/index.css`

## 📚 Dependencies

- **react**: 18.2.0
- **react-dom**: 18.2.0
- **react-router-dom**: 6.20.0
- **axios**: 1.6.0
- **zustand**: 4.4.1
- **date-fns**: 2.30.0
- **lucide-react**: 0.294.0
- **tailwindcss**: 3.3.0
- **recharts**: 2.10.3

## 📝 Notes

- All API calls include `withCredentials: true` for secure cookie handling
- Date/time formatting uses `date-fns` for consistency
- Responsive design works on all screen sizes
- Admin features require `ROLE_ADMIN` authority

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the Smart Campus system. All rights reserved.

## 📞 Support

For issues or questions, please contact the development team or check the backend repository.
