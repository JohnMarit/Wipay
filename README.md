# Wipay - WiFi Token Distribution System

A modern React-based WiFi token distribution system with Firebase backend for cafes, hotels, and businesses in South Sudan.

## 🚀 Features

### Frontend Features
- **Multi-language Support** (English/Arabic)
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Real-time Dashboard** - Live statistics and token management
- **PDF Report Generation** - Weekly, monthly, yearly reports with custom date ranges
- **Blue-themed UI** - Professional blue color scheme throughout

### Backend Features (Firebase)
- **User Authentication** - Secure email/password authentication
- **Real-time Database** - Firestore for storing tokens and user data
- **Data Security** - Firestore security rules for data protection
- **Cloud Hosting** - Scalable Firebase hosting
- **Analytics** - Built-in Firebase Analytics

### Business Features
- **WiFi Token Generation** - Create time-based access tokens
- **Payment Tracking** - Cash and MTN MoMo payment methods
- **Custom Pricing** - Configurable pricing per duration
- **User Management** - Track customers and usage patterns
- **Revenue Analytics** - Detailed financial reporting

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Analytics)
- **PDF**: jsPDF for report generation
- **Build Tool**: Vite
- **Testing**: React Testing Library, Vitest

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Modern web browser

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wipay.git
   cd wipay/wipay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**

   Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Get your Firebase configuration
   - Set up security rules

4. **Environment Configuration**

   Create a `.env` file in the `wipay` directory:
   ```env
   # Your Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Optional Settings
   VITE_DEBUG_MODE=true
   ```

5. **Start the development server**
   ```bash
npm run dev
```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Project Structure

```
wipay/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── WiFiTokenSystem.tsx  # Main token system
│   │   └── ...
│   ├── lib/
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── auth.ts          # Authentication helpers
│   │   ├── pdfGenerator.ts  # PDF report generation
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Index.tsx        # Main dashboard
│   │   └── NotFound.tsx     # 404 page
│   └── App.tsx              # Main app component
├── firestore.rules          # Firestore security rules
├── FIREBASE_SETUP.md        # Firebase setup guide
└── README.md                # This file
```

## 🔐 Security Features

- **Firebase Authentication** - Secure user registration and login
- **Firestore Security Rules** - Data isolation per user
- **Environment Variables** - Secure configuration management
- **Data Validation** - Input sanitization and validation
- **Session Management** - Automatic token refresh and logout

## 📱 Usage

### Initial Setup

1. **Create Account**: Register with email, password, name, and phone
2. **Configure WiFi**: Set up your WiFi network name (SSID)
3. **Set Pricing**: Configure token prices for different durations
4. **Generate Tokens**: Start creating WiFi access tokens for customers

### Daily Operations

1. **Generate Tokens**: Create tokens for customers with payment tracking
2. **Monitor Dashboard**: View real-time statistics and active users
3. **Generate Reports**: Create PDF reports for financial analysis
4. **Manage Tokens**: View, deactivate, or resend token details

### Report Generation

- **Quick Reports**: Weekly, Monthly, Yearly with one click
- **Custom Reports**: Choose specific date ranges
- **PDF Export**: Professional reports with revenue breakdown
- **Real-time Data**: Reports based on actual token transactions

## 🎨 UI/UX Features

- **Blue Color Scheme**: Professional blue palette throughout
- **Responsive Design**: Mobile-first approach with tablet/desktop optimization
- **Multi-language**: English and Arabic support with RTL layout
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Modern Components**: shadcn/ui components with Tailwind CSS

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run tests

# Firebase
npm run deploy       # Deploy to Firebase Hosting
```

### Adding New Features

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Implement responsive design
4. Add proper error handling
5. Update Firebase security rules if needed

## 🚀 Deployment

### Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

### Other Platforms

The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check your `.env` file configuration
   - Verify Firebase project settings
   - Ensure network connectivity

2. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check email/password provider is activated
   - Clear browser cache and cookies

3. **Build Errors**
   - Run `npm install` to ensure dependencies
   - Check TypeScript errors with `npm run type-check`
   - Verify environment variables are set

### Debug Mode

Enable debug mode for detailed logging:
```env
VITE_DEBUG_MODE=true
```

## 📊 Analytics

The system includes built-in analytics for:
- User registration and authentication
- Token generation patterns
- Revenue tracking
- Feature usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [Firebase Setup Guide](./FIREBASE_SETUP.md)
- Review the troubleshooting section

## 🌟 Acknowledgments

- Built with React and Firebase
- UI components by shadcn/ui
- Icons by Lucide React
- PDF generation by jsPDF

---

**Made with ❤️ for South Sudan's digital transformation**


