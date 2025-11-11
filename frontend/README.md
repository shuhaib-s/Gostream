# GoStream Frontend

Modern, responsive streaming platform UI built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Design System

### Color Theme
- **Primary**: Purple/Blue gradient (#6366f1 to #4f46e5)
- **Dark Theme**: Modern dark UI inspired by leading streaming platforms
- **Accents**: Multiple accent colors for different states and platforms

### Components
All UI components are reusable and follow a consistent design pattern:
- `Button` - Multiple variants (primary, secondary, outline, ghost, danger)
- `Input` / `Select` - Form inputs with validation states
- `Card` - Container component with hover effects
- `Modal` - Accessible modal dialogs
- `Badge` - Status indicators and labels

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── projects/[id]/    # Project detail page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Navbar.tsx        # Navigation bar
│   ├── HLSPlayer.tsx     # Video player
│   ├── PlatformSelector.tsx  # Platform selector
│   └── StreamStats.tsx   # Stream statistics
├── lib/                   # Utilities and configs
│   ├── constants/        # Constants (platforms, URLs, theme)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── api.ts            # API client
└── public/               # Static assets
```

## 🎯 Key Features

### Constants Management
All configuration is centralized in `/lib/constants/`:
- **platforms.ts** - Streaming platform configurations (YouTube, Twitch, Facebook, etc.)
- **urls.ts** - API endpoints and external URLs
- **theme.ts** - Design system tokens (colors, spacing, animations)

### Reusable Components
Built with composition in mind:
- Full TypeScript support
- Consistent API across components
- Accessible by default
- Mobile responsive

### Design Patterns
- **Component Composition**: Small, focused components
- **Factory Pattern**: Platform configuration
- **Separation of Concerns**: Logic separated from presentation
- **Custom Hooks**: Reusable state logic

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production
```bash
npm run build
npm start
```

## 🎨 Customization

### Adding New Platforms
1. Add platform config to `/lib/constants/platforms.ts`
2. Include icon, color, and RTMP URL
3. Platform will automatically appear in the selector

### Theming
Modify colors in `/lib/constants/theme.ts` and `tailwind.config.ts`:
- Update primary colors
- Adjust dark theme colors
- Add new gradient combinations

### API Configuration
Update API URLs in `/lib/constants/urls.ts`:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

## 📱 Responsive Design

All pages are mobile-responsive:
- **Mobile First**: Designed for small screens first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large tap targets, swipe gestures

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Video Player**: HLS.js

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_HLS_URL=http://localhost:8080/hls
```

## 🎭 Component Examples

### Using the Button Component
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" loading={isLoading}>
  Click Me
</Button>
```

### Using the Card Component
```tsx
import { Card, CardHeader } from '@/components/ui';

<Card hover gradient>
  <CardHeader title="My Card" subtitle="Description" />
  <p>Card content</p>
</Card>
```

### Using Constants
```tsx
import { STREAMING_PLATFORMS, APP_ROUTES } from '@/lib/constants';

const youtube = STREAMING_PLATFORMS.youtube;
// Access: youtube.icon, youtube.rtmpUrl, youtube.displayName
```

## 🤝 Contributing

When adding new features:
1. Add constants to appropriate files
2. Create reusable components when possible
3. Follow existing naming conventions
4. Ensure mobile responsiveness
5. Add TypeScript types

## 📄 License

Part of the GoStream project.



