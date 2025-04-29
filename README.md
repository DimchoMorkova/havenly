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


## Database Schema

The Havenly application uses a PostgreSQL database managed by Supabase. The database schema is designed to store information about users, listings, reservations, and favorites. The key tables are:

*   **profiles:** Stores user profile information.
    *   `id` (UUID, primary key): References the `auth.users` table.
    *   `username` (text, unique, not null): User's username.
    *   `created_at` (timestamp with time zone): Timestamp of when the profile was created.
    *   `updated_at` (timestamp with time zone): Timestamp of when the profile was last updated.
    *   *Row Level Security (RLS) is enabled to ensure users can only access their own profile data.*

*   **listings:** Stores information about property listings.
    *   `id` (UUID, primary key): Unique identifier for the listing.
    *   `user_id` (UUID, not null, foreign key): References the `profiles` table, indicating the owner of the listing.
    *   `title` (text): Title of the listing.
    *   `description` (text): Description of the listing.
    *   `property_type` (text, not null): Type of property (e.g., house, apartment).
    *   `access_type` (text, not null): Access type (e.g., entire place, private room).
    *   `address` (text, not null): Address of the listing.
    *   `latitude` (numeric): Latitude coordinate of the listing.
    *   `longitude` (numeric): Longitude coordinate of the listing.
    *   `max_guests` (integer, not null): Maximum number of guests allowed.
    *   `bedrooms` (integer, not null): Number of bedrooms.
    *   `beds` (integer, not null): Number of beds.
    *   `bathrooms` (numeric, not null): Number of bathrooms.
    *   `amenities` (text[]): Array of amenities offered.
    *   `photos` (text[]): Array of image URLs for the listing.
    *   `highlights` (text[]): Array of highlights for the listing.
    *   `price_per_night` (numeric, not null): Price per night for the listing.
    *   `currency` (text, not null, default 'USD'): Currency for the price.
    *   `status` (text, not null, default 'draft'): Status of the listing (e.g., draft, published).
    *   `created_at` (timestamp with time zone): Timestamp of when the listing was created.
    *   `updated_at` (timestamp with time zone): Timestamp of when the listing was last updated.
    *   *RLS is enabled to ensure users can only manage their own listings.*

*   **reservations:** Stores information about reservations.
    *   `id` (UUID, primary key): Unique identifier for the reservation.
    *   `listing_id` (UUID, not null, foreign key): References the `listings` table, indicating the listing being reserved.
    *   `user_id` (UUID, not null, foreign key): References the `profiles` table, indicating the user making the reservation.
    *   `check_in_date` (date, not null): Check-in date.
    *   `check_out_date` (date, not null): Check-out date.
    *   `guests` (integer, not null): Number of guests.
    *   `total_price` (numeric, not null): Total price for the reservation.
    *   `status` (text, not null, default 'pending'): Status of the reservation (e.g., pending, confirmed, cancelled).
    *   `created_at` (timestamp with time zone): Timestamp of when the reservation was created.
    *   `updated_at` (timestamp with time zone): Timestamp of when the reservation was last updated.
     *   *RLS is enabled to ensure users can only manage their own reservations, and hosts can view reservations for their listings.*

*   **favorites:** Stores user's favorite listings.
    *   `id` (UUID, primary key): Unique identifier for the favorite.
    *   `user_id` (UUID, not null, foreign key): References the `profiles` table, indicating the user who favorited the listing.
    *   `listing_id` (UUID, not null, foreign key): References the `listings` table, indicating the listing that was favorited.
    *   `created_at` (timestamp with time zone): Timestamp of when the listing was favorited.
    *   `updated_at` (timestamp with time zone): Timestamp of when the listing was last updated.
    *   *RLS is enabled to ensure users can only manage their own favorites.*

*   **listing\_interactions:** Stores data about how users interact with listings, used for tracking trending listings.
    *   `id` (UUID, primary key): Unique identifier for the interaction.
    *   `listing_id` (UUID, not null, foreign key): References the `listings` table.
    *   `interaction\_date` (date, not null): The date of the interaction.
    *   `click\_count` (integer, not null): Number of clicks on a listing for a given day.
    *   `created_at` (timestamp with time zone): Timestamp of when the interaction was created.
    *   `updated_at` (timestamp with time zone): Timestamp of when the interaction was last updated.

### Relationships

*   The `profiles` table is related to the `auth.users` table through the `id` column, which is a foreign key referencing the `auth.users` table.
*   The `listings` table is related to the `profiles` table through the `user_id` column, which is a foreign key referencing the `profiles` table.
*   The `reservations` table is related to the `listings` table through the `listing_id` column, which is a foreign key referencing the `listings` table.
*   The `reservations` table is related to the `profiles` table through the `user_id` column, which is a foreign key referencing the `profiles` table.
*   The `favorites` table is related to the `profiles` table through the `user_id` column, which is a foreign key referencing the `profiles` table.
*   The `favorites` table is related to the `listings` table through the `listing_id` column, which is a foreign key referencing the `listings` table.
*   The `listing_interactions` table is related to the `listings` table through the `listing_id` column, which is a foreign key referencing the `listings` table.


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
