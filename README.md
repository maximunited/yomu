# YomU - יום-You | Birthday Benefits Platform

YomU (יום-You) is a mobile-first web application that aggregates and displays personal birthday benefits, deals, and freebies for users in Israel. The platform helps users never miss a birthday deal again by consolidating information they would otherwise have to find manually.

## 🌟 Features

### Core Features
- **Birthday Benefits Tracking**: Centralized platform for all birthday benefits
- **Membership Management**: Easy management of loyalty program memberships
- **Real-time Notifications**: Push notifications for new benefits and expiring deals
- **Multi-language Support**: Full Hebrew and English interface
- **Dark Mode**: Global dark mode support
- **Mobile-First Design**: Responsive design optimized for mobile devices

### User Features
- **Onboarding & Profile Setup**: Simple sign-up with Date of Birth requirement
- **My Memberships Screen**: Checklist of popular Israeli brands and loyalty clubs
- **Dashboard**: Card-based layout showing active and upcoming benefits
- **Benefit Details**: Full descriptions, terms & conditions, and redemption methods
- **Search & Filter**: Advanced search and filtering capabilities
- **Custom Memberships**: Add and manage custom membership programs

### Supported Brands & Services
- **Food & Restaurants**: McDonald's, Starbucks, KFC, Bacaro, Shegev, James, Little Prague, Youmangus
- **Fashion**: Fox, H&M, Max, Shilav
- **Health & Beauty**: Super-Pharm LifeStyle
- **Transport**: Isracard
- **Home & DIY**: BBB, Manam DIY
- **Grocery**: Shufersal, Mika Convenience Stores
- **Entertainment**: Escape Room

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bday-benefits
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL=file:./dev.db
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker & Podman Support

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bday-benefits
   ```

2. **Run the setup script**
   ```bash
   ./scripts/docker-setup.sh setup
   ```

3. **Start the application**
   ```bash
   # Production mode
   ./scripts/docker-setup.sh start
   
   # Development mode (with hot reload)
   ./scripts/docker-setup.sh start-dev
   ```

4. **Initialize the database**
   ```bash
   ./scripts/docker-setup.sh init-db
   ```

5. **Access the application**
   - Production: [http://localhost:3000](http://localhost:3000)
   - Development: [http://localhost:3001](http://localhost:3001)

### Using Podman

The same commands work with Podman. The setup script automatically detects and uses Podman if Docker is not available.

### Docker Commands

```bash
# Start production services
docker-compose up -d

# Start development services
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

### Podman Commands

```bash
# Start production services
podman-compose up -d

# Start development services
podman-compose --profile dev up -d

# View logs
podman-compose logs -f app

# Stop services
podman-compose down
```

For detailed Docker/Podman documentation, see [docs/DOCKER.md](docs/DOCKER.md).

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **NextAuth.js**: Authentication solution

### Backend
- **Node.js**: JavaScript runtime
- **Prisma ORM**: Database toolkit
- **SQLite**: Local development database
- **bcryptjs**: Password hashing

### Database
- **SQLite**: Local development (can be switched to PostgreSQL for production)

### Authentication
- **NextAuth.js**: Email/password and Google OAuth
- **JWT**: Session management

## 📱 Features in Detail

### Authentication
- Email/password registration and login
- Google OAuth integration
- Secure session management
- Password hashing with bcrypt

### Membership Management
- Pre-configured popular Israeli brands
- Custom membership creation
- Search and filter functionality
- Free vs. paid membership indicators
- Cost details for paid memberships

### Benefits Dashboard
- Active benefits display
- Upcoming benefits preview
- Copy-to-clipboard functionality for promo codes
- Detailed benefit information
- Brand logos and descriptions

### Dark Mode
- Global dark mode support
- Persistent user preference
- System preference detection
- Toggle available on all pages

### Internationalization
- Full Hebrew and English support
- RTL (Right-to-Left) layout support
- Language switching functionality
- Context-based translation management

## 🎨 Design Principles

- **Mobile-First**: Designed for mobile screens first, then desktop
- **Clean & Intuitive**: Minimalist design avoiding clutter
- **Festive but Mature**: Pleasant color palette hinting at celebration
- **Visual Hierarchy**: Clear typography and brand logos
- **Accessibility**: Proper contrast ratios and screen reader support

## 📁 Project Structure

```
bday-benefits/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── memberships/       # Membership management
│   │   ├── settings/          # User settings
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   └── ui/               # UI components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema
├── public/                    # Static assets
│   └── images/               # Brand logos
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_URL`: NextAuth.js base URL
- `NEXTAUTH_SECRET`: JWT encryption secret
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### Database Schema
The application uses Prisma with the following main models:
- `User`: User accounts and profiles
- `Brand`: Brand information and logos
- `Benefit`: Birthday benefits and details
- `UserMembership`: User's active memberships
- `Notification`: User notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **Heroku**: Traditional hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Contributors**: The team behind YomU
- **Brand Partners**: All the brands providing birthday benefits
- **Open Source Community**: For the amazing tools and libraries used

## 📞 Support

For support, email support@yomu.app or create an issue in this repository.

---

**YomU** - Never miss a birthday deal again! 🎉
