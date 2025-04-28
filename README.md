# Havenly - Your Next Home Awaits

## Description

**Havenly** is a platform designed to connect users with available property listings. Users can search for properties based on location, dates, and number of guests. Hosts can also list their properties, manage reservations, and more — all in one streamlined experience.

Try out the website in real time here! -> **https://havenlybg.netlify.app/**

![Homepage Screenshot](https://i.imgur.com/nJV5HbJ.png)

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static typing for improved code maintainability and fewer runtime errors.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development, custom styling, and performance optimization.
- **Supabase**: An open-source backend-as-a-service providing database, authentication, and real-time updates.
- **Vite**: A build tool that offers lightning-fast development and optimized production builds.
- **React Router DOM**: For seamless client-side routing and navigation.
- **Lucide React**: A consistent and beautiful icon library.
- **use-places-autocomplete & @react-google-maps/api**: For integrating Google Maps and location autocomplete functionality.
- **Imgur Image Hosting**: Handles property image uploads using the Imgur API.
- **react-day-picker**: A flexible, customizable date picker component.
- **react-dropzone**: For drag-and-drop image uploading when creating property listings.

## Project Structure

```
.
├── .env                    # Environment variables
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project metadata and dependencies
├── postcss.config.js       # PostCSS (Tailwind) configuration
├── tailwind.config.js      # Tailwind CSS settings
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript config for Node.js environment
├── vite.config.ts          # Vite configuration
├── src/
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   ├── vite-env.d.ts       # TypeScript environment declarations
│   ├── index.css           # Global CSS
│   ├── components/         # Reusable UI components
│   │   ├── listing/        # Components for listing creation/editing
│   │   ├── reservation/    # Components for managing reservations
│   │   └── search/         # Components related to property search
│   ├── contexts/           # React Contexts (e.g., Google Maps API)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions (Supabase, Imgur, trending logic)
│   ├── pages/              # Application pages (CreateListing, Wishlist, etc.)
├── supabase/               # Database migrations
```

## Key Folders and Files

- **`.env`**: Stores environment variables like Supabase credentials.
- **`src/components`**: Houses all reusable UI components organized by functionality (listing, reservation, search).
- **`src/contexts`**: Contains global React contexts, like Google Maps integration.
- **`src/hooks`**: Custom React hooks for managing specific functionalities (e.g., favorites).
- **`src/lib`**: Utility scripts for Supabase client setup, image uploads via Imgur, and trending listing logic.
- **`src/pages`**: Top-level views like property details, create listing, manage homes, and wishlist.
- **`supabase/migrations`**: SQL files for initializing and updating the database schema.

## Additional Notes

- **Supabase** database migrations are located in the `supabase/migrations` folder.
- **Supabase client** setup is handled in `src/lib/supabase.ts`.
- **Image uploads** to Imgur are managed through `src/lib/imgur.ts`.
- **Trending listings** functionality is located in `src/lib/trending.ts`.

## Authors

- **Designed and made by** - Dimcho, Nikolai and Denislav
