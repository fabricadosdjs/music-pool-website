# Music Pools by Nexor Records

This is a music pool website built with Next.js, Supabase, and Tailwind CSS.

## Features

- User authentication (Sign up, Login, Logout)
- User profiles with editable personal info and email preferences
- Admin panel for managing user roles, paid status, and download limits
- Music browsing by categories (Home, New, Liked, Trending, Charts)
- Search and filter functionality for music tracks
- Music playback and download (with subscription/admin control)
- Responsive design

## Setup

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-repo/music-pools-website.git
    cd music-pools-website
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to `Settings > API` and copy your `Project URL` and `anon public` key.
    *   Create a `.env.local` file in the root of your project and add:
