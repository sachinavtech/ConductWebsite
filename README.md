# Conduct Finance Website

This is the official website for Conduct Finance, an embedded credit layer platform for B2B commerce. The site serves as a landing page that introduces Conduct's services and enables B2B marketplaces, distributors, and SaaS platforms to extend flexible net terms at checkout through automated underwriting, decisioning, and servicing infrastructure.

Built with [Next.js](https://nextjs.org) 15, React 19, TypeScript, and Tailwind CSS.

## What is Conduct?

Conduct Finance provides an embedded credit layer that enables B2B commerce platforms to:

- Extend flexible net terms at checkout
- Leverage automated underwriting and decisioning
- Use integrated servicing infrastructure
- Launch embedded credit programs in weeks without rebuilding lending infrastructure from scratch

## Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit the files. This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load fonts.

## Building

To create a production build:

```bash
npm run build
```

This will create an optimized production build in the `.next` directory. To start the production server locally:

```bash
npm start
```

## Deploying to Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com) from the creators of Next.js.

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI if you haven't already:

```bash
npm i -g vercel
```

2. Login to your Vercel account:

```bash
vercel login
```

3. Deploy to production:

```bash
vercel --prod
```

The CLI will guide you through the setup process if this is your first deployment.

### Option 2: Deploy via GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project and configure the build settings
5. Click "Deploy" - your site will be live in minutes!

### Build Configuration

Vercel will automatically use the following settings for Next.js:
- **Build Command**: `npm run build` (automatically detected)
- **Output Directory**: `.next` (automatically detected)
- **Install Command**: `npm install` (automatically detected)

### Environment Variables

If your site requires environment variables, you can add them in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add your variables for Production, Preview, and Development environments

### Custom Domain

After deployment, you can add a custom domain:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Project Structure

```
├── src/
│   └── app/          # Next.js App Router pages
├── public/           # Static assets
├── next.config.ts    # Next.js configuration
└── package.json      # Dependencies and scripts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) - learn more about deploying Next.js apps
