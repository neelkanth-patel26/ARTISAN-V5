# 🎨 Museum Landing Page

A modern, feature-rich museum web application built with Next.js 16, featuring artist galleries, exhibitions, collections, and a comprehensive dashboard system.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🖼️ **Artist & Gallery Management** - Browse artists, exhibitions, and collections
- 🎯 **Advanced Search & Filters** - Find artworks with powerful filtering options
- 📱 **Progressive Web App (PWA)** - Install and use offline
- 🔔 **Push Notifications** - Stay updated with latest exhibitions
- 🎨 **Interactive UI** - Smooth animations with Framer Motion & GSAP
- 🌓 **Dark/Light Mode** - Theme switching support
- 💳 **Checkout System** - Integrated payment processing
- 📊 **Analytics Dashboard** - Comprehensive admin panel
- 🔐 **Authentication** - Secure login with Supabase
- 📧 **Email Integration** - Automated notifications with Nodemailer
- 📱 **Responsive Design** - Mobile-first approach

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd museum-landing-page

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Animations:** Framer Motion, GSAP

### Backend & Database
- **Database:** Supabase
- **Authentication:** Supabase Auth
- **Email:** Nodemailer, Resend
- **Push Notifications:** Web Push

### Additional Libraries
- **Forms:** React Hook Form + Zod
- **Charts:** Chart.js, Recharts
- **Drag & Drop:** DND Kit
- **QR Codes:** qrcode
- **Smooth Scroll:** Lenis

## 📁 Project Structure

```
museum-landing-page/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── artist/            # Artist pages
│   ├── checkout/          # Checkout flow
│   ├── dashboard/         # Admin dashboard
│   ├── exhibitions/       # Exhibitions
│   ├── gallery/           # Gallery views
│   └── ...
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── dashboard/        # Dashboard components
│   └── ...
├── element/              # Custom elements
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & configs
│   ├── auth.ts          # Authentication
│   ├── supabase.ts      # Supabase client
│   └── ...
├── public/               # Static assets
│   ├── images/          # Images
│   ├── fonts/           # Fonts
│   └── manifest.json    # PWA manifest
└── styles/              # Global styles
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup-https  # Setup HTTPS for local development
```

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 📱 PWA Features

- Offline support
- Install prompt
- Push notifications
- App-like experience
- Custom icons and splash screens

## 🎨 Key Pages

- `/` - Homepage with hero section
- `/gallery` - Browse artworks
- `/artist` - Artist profiles
- `/exhibitions` - Current and upcoming exhibitions
- `/collection` - Curated collections
- `/dashboard` - Admin panel
- `/checkout` - Purchase flow

## 👥 About

This is a college project developed by **Group-1** students from **LJ University** as part of their academic curriculum. The project showcases modern web development practices and technologies in creating a comprehensive museum management system.

### 🎓 Project Details

- **Institution:** LJ University
- **Team:** Group-1
- **Project Lead:** Neelkanth Patel
- **Organization:** Gaming Network Studio Media Group
- **Type:** Academic College Project

### 🎯 Project Goals

This project was created to:
- Demonstrate proficiency in modern web technologies
- Build a real-world application with practical features
- Implement best practices in full-stack development
- Create an interactive and user-friendly museum experience

### 👨‍💻 Team

**Group-1 Members:**
- Neelkanth Patel - Project Lead & Developer


- Dhruv Nayak       : 23012250210200
- Neelkanth Patel   : 23012250210201
- Dhruv Nirmal      : 23012250210202
- Dhyey Nirmal      : 23012250210203
- Nirmit Sheth      : 23012250210204
- Darshil Panchal   : 23012250210208

Developed under the guidance of **Gaming Network Studio Media Group**.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **LJ University** - For providing the opportunity and resources
- **Gaming Network Studio Media Group** - For guidance and support
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)

---

Made with ❤️ by LJ University Students | Group-1

Special Thanks to:
- Urmi Thakkar    : https://www.instagram.com/urmi_thakkar_26
- Reese Whiteman  : https://www.instagram.com/reese.whiteman28
- Jay Shah        : No public Account 
- Adity Panchal   : No public Account 

- Gaming Network Studio : https://gnstudioxrage.wixstudio.com/gamingnetworkstudio
