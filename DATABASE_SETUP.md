# Database Setup Guide

This application now uses PostgreSQL to store decks and cards persistently. Follow these steps to set up the database.

## Prerequisites

- PostgreSQL database (local or cloud)
- Node.js and npm installed

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Configuration

Create a `.env.local` file in the project root with your database URL:

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/anki_cards_db"
```

#### Option A: Local PostgreSQL
If you have PostgreSQL installed locally:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/anki_cards_db"
```

#### Option B: Docker PostgreSQL
Run PostgreSQL in Docker:
```bash
docker run --name anki-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=anki_cards_db -p 5432:5432 -d postgres:15
```
Then use:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/anki_cards_db"
```

#### Option C: Cloud Services
- **Supabase**: Get connection string from your Supabase project
- **Railway**: Get connection string from your Railway PostgreSQL service
- **Heroku Postgres**: Use the DATABASE_URL from Heroku
- **Neon**: Get connection string from your Neon project

### 3. Initialize Database

Generate and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init
```

### 4. Verify Setup

Check that your database is working:

```bash
# View your database in Prisma Studio
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

## Database Schema

The application creates two main tables:

### Decks Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Cards Table
- `id` (UUID, Primary Key)
- `front` (String)
- `back` (String)
- `tags` (String Array)
- `deckId` (UUID, Foreign Key to Decks)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Features

### What's Now Possible

1. **Persistent Storage**: All decks and cards are stored in PostgreSQL
2. **Deck Management**: Create, view, edit, and delete decks
3. **CSV Import**: Import CSV files directly into database as new decks
4. **Card Editing**: Edit individual cards with database persistence
5. **Export**: Export any deck for Anki import

### Workflow

1. **Import CSV** → Creates a new deck in database
2. **View Decks** → Browse all your saved decks
3. **Edit Cards** → Modify cards with automatic database updates
4. **Export** → Generate Anki import files from database content

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check that PostgreSQL is running
- Ensure database exists and is accessible

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push
```

### Permission Issues
- Ensure your database user has CREATE/DROP privileges
- Check firewall settings for database access

## Production Deployment

For production, use a hosted PostgreSQL service:

1. **Vercel + Supabase**
2. **Netlify + Railway** 
3. **Heroku Postgres**
4. **AWS RDS**

Add your production DATABASE_URL to your deployment environment variables.
