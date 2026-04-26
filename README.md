# Tradex - Advanced E-commerce & Trade Management System

Tradex is a professional-grade, full-stack dashboard designed for comprehensive management of e-commerce operations. It provides a powerful interface for tracking products, managing orders, and monitoring business performance through a sophisticated real-time analytics suite.

## 🚀 Key Features

- **Robust Authentication**: Secure user login, signup, and password recovery system using JWT and Bcrypt.
- **Dynamic Dashboard**: Interactive overview of business metrics with real-time analytics.
- **Product Management**: Complete CRUD operations for products and categories with advanced filtering.
- **Order Tracking**: Efficient management of customer orders and fulfillment statuses.
- **Customer Insights**: Detailed database of customer history and interactions.
- **Responsive Management UI**: A premium, fully responsive interface built with Radix UI and Tailwind CSS 4.
- **Data Visualization**: Beautifully rendered charts and data tables for business intelligence.
- **System Settings**: Configurable system parameters and user profile management.

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### State & Data Management

- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Tables**: [TanStack Table v8](https://tanstack.com/table/latest) (React Table)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **API Client**: [Axios](https://axios-http.com/)

### Backend & Database

- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (via Neon Serverless)
- **Authentication**: JWT (JSON Web Tokens)
- **Caching/Queue**: [Redis](https://redis.io/) (via `ioredis`)
- **Security**: JWT & Bcrypt

## ⚙️ Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- Redis server (Running locally or accessible via URL)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Tradex
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the following:

   ```env
   # Get this from your Neon Dashboard
   DATABASE_URL="postgresql://user:password@hostname.neon.tech/neondb?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key"
   REDIS_URL="redis://localhost:6379"
   ```

4. **Database Initialization**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:

   ```bash
   npm run dev
   ```

6. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

1. Push your code to a GitHub repository.
2. Import the project into your [Vercel](https://vercel.com/) dashboard.
3. Go to **Settings > Environment Variables** and add your variables:
   - `DATABASE_URL` (Your Neon connection string)
   - `JWT_SECRET` (A secure random string)
   - `REDIS_URL` (If using Redis)
4. Click **Deploy**. Vercel will automatically run `prisma generate` during the build.

## 📁 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Shadcn/ui).
- `src/context`: React Context providers for global state (Auth, etc.).
- `src/hooks`: Custom React hooks for data fetching and logic.
- `src/lib`: Utility functions and client initializations (Prisma, Axios).
- `src/server`: Server-side logic and database interactions.
- `prisma`: Database schema and migration files.

## 📄 License

This project is licensed under the MIT License.
