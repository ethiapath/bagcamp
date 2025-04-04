# Bagcamp

Bagcamp is an online music platform and community, serving as an alternative to Bandcamp. It prioritizes electronic music genres and aims to be a particularly supportive and visible space for trans, gender non-conforming (GNC), and LGBTQ+ artists, while welcoming all independent musicians.

## Features

- Artist profiles and customizable pages
- Music releases (singles, EPs, albums, mixes)
- Merchandise sales with inventory management
- Direct fan support with artist-controlled pricing
- Community features for discovery and interaction

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Supabase CLI (for database migrations)
- Vercel CLI (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bagcamp.git
   cd bagcamp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.development.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   POSTGRES_PASSWORD=your-postgres-password
   ```

4. Set up the database:
   ```bash
   npm run setup:db
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── public/                # Static assets
├── scripts/               # Utility scripts
│   ├── deploy.js          # Deployment script
│   └── setup-db.js        # Database setup script
├── src/                   # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utility functions and hooks
│   └── styles/            # Global styles
├── supabase/              # Supabase configuration
│   └── migrations/        # Database migrations
├── .env.development.local # Local environment variables
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── PLAN.md                # Development plan and roadmap
├── PRD.md                 # Product Requirements Document
└── README.md              # Project documentation
```

## Database Schema

The database includes the following main tables:

- **artists**: Stores artist profiles and information
- **releases**: Music releases (albums, EPs, singles)
- **tracks**: Individual tracks within releases
- **merchandise**: Physical and digital merchandise
- **merchandise_variations**: Variations of merchandise (sizes, colors)

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run setup:db`: Set up the database schema and sample data
- `npm run deploy`: Deploy to Vercel (preview)
- `npm run deploy:prod`: Deploy to Vercel (production)

## Development Plan

See [PLAN.md](PLAN.md) for the detailed development plan and roadmap.

## Product Requirements

See [PRD.md](PRD.md) for the detailed product requirements document.

## Deployment

See [DEPLOY.md](DEPLOY.md) for deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- DJ Bag Lady for the concept and vision
- All the independent artists inspiring this platform
