# Wipay - WiFi Token Management System

A modern React-based WiFi token distribution system with Firebase backend for cafes, hotels, and businesses worldwide.

## 🌟 Features

### WiFi Token Management
- **Token Generation**: Create secure WiFi tokens with customizable durations
- **Token Distribution**: Distribute tokens via SMS, email, or printed receipts
- **Token Validation**: Real-time token verification and activation
- **Expiry Management**: Automatic token expiration and cleanup

### Customer Management
- **Customer Database**: Comprehensive customer information management
- **Purchase History**: Track customer token purchases and usage patterns
- **Customer Analytics**: Insights into customer behavior and preferences
- **Loyalty Programs**: Built-in support for customer loyalty and discounts

### Payment Integration
- **Multiple Payment Methods**: Support for mobile money, cash, and bank transfers
- **Receipt Generation**: Automatic receipt generation for all transactions
- **Payment Tracking**: Real-time payment status monitoring
- **Revenue Analytics**: Detailed revenue reporting and analytics

### Business Intelligence
- **Usage Analytics**: Track WiFi usage patterns and peak times
- **Revenue Reports**: Comprehensive financial reporting
- **Customer Insights**: Customer behavior and purchasing patterns
- **Performance Metrics**: System performance and uptime monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Firebase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wipay.git
   cd wipay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Configure Firebase**
   Update `src/lib/firebase.ts` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Start development server**
   ```bash
npm run dev
```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app-id
```

### Currency Configuration
The system supports multiple currencies. Default is SSP, but you can configure others in the settings.

### Payment Methods
Configure available payment methods in the admin panel:
- Mobile Money (MTN, Orange, Airtel)
- Bank Transfers
- Cash Payments
- Credit/Debit Cards

## 📱 Usage

### For Business Owners
1. **Setup**: Create your account and configure your business settings
2. **Token Pricing**: Set up token pricing for different durations
3. **Payment Methods**: Configure your preferred payment methods
4. **Start Selling**: Begin selling WiFi tokens to customers

### For Customers
1. **Purchase**: Buy WiFi tokens through various payment methods
2. **Receive**: Get token credentials via SMS, email, or receipt
3. **Connect**: Use provided credentials to connect to WiFi
4. **Enjoy**: Access internet for the purchased duration

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Firebase Authentication** for user management
- **Firestore Database** for data storage
- **Firebase Hosting** for deployment
- **Firebase Functions** for serverless operations

### Key Components
- **WiFiTokenSystem**: Core token management functionality
- **CustomerManagement**: Customer database and analytics
- **PaymentTracking**: Payment processing and tracking
- **ReportsAnalytics**: Business intelligence and reporting
- **BillingModule**: Invoice and billing management

## 🚀 Deployment

### Vercel (Recommended)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on push

### Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Role-based Access**: Different access levels for different users
- **Data Encryption**: All sensitive data is encrypted
- **Secure Tokens**: Cryptographically secure WiFi tokens
- **Audit Logging**: Complete audit trail of all operations

## 🌍 Internationalization

The system supports multiple languages:
- **English** (Default)
- **Arabic** (RTL support)
- Easily extensible for additional languages

## 📊 Analytics & Reporting

### Business Metrics
- Daily/Monthly revenue
- Token usage patterns
- Customer acquisition trends
- Payment method preferences

### Customer Analytics
- Purchase frequency
- Average spend per customer
- Usage duration patterns
- Geographic distribution

### System Performance
- Token generation speed
- Payment processing times
- System uptime monitoring
- Error rate tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Comprehensive guides and API documentation
- **Community**: Join our community forums
- **Issues**: Report bugs and request features on GitHub
- **Email**: Contact support for priority assistance

## 🙏 Acknowledgments

- **Firebase Team** for excellent backend services
- **Vercel Team** for seamless deployment platform
- **shadcn** for beautiful UI components
- **Tailwind CSS** for utility-first CSS framework

---

**Made with ❤️ for businesses worldwide**


