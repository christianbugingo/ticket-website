# 🚌 ITIKE - Bus Ticket Booking Platform

**ITIKE** is a modern bus ticket booking platform specifically designed for Rwanda. It allows users to search, book, and manage bus tickets across all 30 districts of Rwanda with an intuitive interface and AI-powered recommendations.

## ✨ Features

### 🎯 **Core Features**

- **District-to-District Search**: Search bus routes between all Rwanda districts
- **Real-time Availability**: Live seat availability and pricing
- **Smart Booking Flow**: Multi-step booking process (Search → Results → Payment → Confirmation)
- **AI Recommendations**: Intelligent route and time suggestions using Google Genkit
- **Payment Integration**: Support for MTN Mobile Money and Credit Cards
- **User Management**: Role-based authentication (User, Admin, Bus Operator)

### 🎨 **Design**

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Design**: Mobile-first approach for all device sizes
- **Accessibility**: WCAG compliant interface
- **Custom Theme**: Rwanda-inspired color scheme with PT Sans typography

### 🔐 **Authentication & Security**

- **NextAuth Integration**: Secure authentication with database sessions
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Different access levels for users, admins, and operators
- **Input Validation**: Zod schema validation throughout

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.4.5** with App Router
- **React 19.1.0** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation
- **Lucide React** icons

### **Backend**

- **Next.js API Routes** (serverless)
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Google Genkit AI** for recommendations

### **Database**

- **PostgreSQL** with Prisma schema
- **Database migrations** for version control
- **Seed scripts** for sample data

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- PostgreSQL database
- Git

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/christianbugingo/ticket-website.git
   cd ticket-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database credentials:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/itike?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secure-secret-key"
   GOOGLE_GENAI_API_KEY="your-google-ai-key"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### **Core Tables**

- **User** - User accounts with roles (USER, ADMIN, BUS_OPERATOR)
- **BusCompany** - Bus operators and companies
- **Bus** - Individual buses with capacity and plate numbers
- **Route** - Routes between districts with distance/duration
- **Schedule** - Departure/arrival times with pricing
- **Booking** - User reservations with seat assignments

## 🔑 Test Accounts

After seeding the database, you can use these test accounts:

- **Admin**: `admin@itike.rw` / `admin123`
- **Regular User**: `user@itike.rw` / `user123`
- **Bus Operator**: `operator1@itike.rw` / `operator123`

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Create and run migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🏗️ Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── api/             # API routes
│   ├── admin/           # Admin dashboard
│   ├── dashboard/       # User dashboard
│   ├── sign-in/         # Authentication
│   └── sign-up/
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── ai/                 # AI/Genkit integration
└── types/              # TypeScript definitions

prisma/
├── schema.prisma       # Database schema
├── migrations/         # Migration files
└── seed.ts            # Database seeding
```

## 🤖 AI Integration

ITIKE uses Google Genkit AI to provide intelligent route recommendations:

- **Route Analysis**: Analyzes user search patterns
- **Alternative Suggestions**: Provides alternative routes and times
- **Availability Optimization**: Considers bus availability patterns
- **Smart Recommendations**: Context-aware travel suggestions

## 🚀 Deployment

### **Environment Variables for Production**

```env
DATABASE_URL="your-production-postgres-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_GENAI_API_KEY="your-google-ai-key"
```

### **Deploy to Vercel**

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:

- **Email**: support@itike.rw
- **GitHub Issues**: [Create an issue](https://github.com/christianbugingo/ticket-website/issues)

---

**Made with ❤️ for Rwanda's transportation system**