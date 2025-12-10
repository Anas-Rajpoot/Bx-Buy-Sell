# Making Listings Dynamic

This guide explains how to connect the listing cards to a live database.

## Current Setup

The listing cards are currently using static data in `src/components/Listings.tsx`. The data structure is ready for dynamic fetching.

## Steps to Make it Dynamic with Lovable Cloud

### 1. Enable Lovable Cloud

Click "Connect Lovable Cloud" to set up your backend database.

### 2. Create Database Table

Create a `listings` table with these columns:
- `id` (uuid, primary key)
- `image` (text) - URL to image
- `category` (text)
- `name` (text)
- `description` (text)
- `price` (text)
- `profit_multiple` (text)
- `revenue_multiple` (text)
- `location` (text)
- `location_flag` (text) - Country flag emoji
- `business_age` (integer)
- `net_profit` (text)
- `revenue` (text)
- `seller_id` (uuid, foreign key to users)
- `is_verified` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3. Update the Listings Component

Replace the static data in `src/components/Listings.tsx`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Listings = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(listing => ({
        id: listing.id,
        image: listing.image,
        category: listing.category,
        name: listing.name,
        description: listing.description,
        price: listing.price,
        profitMultiple: listing.profit_multiple,
        revenueMultiple: listing.revenue_multiple,
        location: listing.location,
        locationFlag: listing.location_flag,
        businessAge: listing.business_age,
        netProfit: listing.net_profit,
        revenue: listing.revenue,
      }));
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Rest of component...
}
```

### 4. Add RLS Policies

Set up Row Level Security policies:
- Allow public read access to listings
- Allow authenticated sellers to create/update their own listings
- Allow admins to manage all listings

### 5. Create Add Listing Form

Create a form component where users can submit new listings. The form should:
- Upload images to Supabase Storage
- Insert listing data into the database
- Include all required fields

## Country Flags

The app uses emoji flags. Common mappings:
- 🇮🇳 India
- 🇺🇸 USA
- 🇬🇧 UK
- 🇸🇬 Singapore
- 🇨🇦 Canada
- 🇦🇺 Australia

You can use the `country-flag-emoji` npm package for automatic flag generation.

## Type Safety

The `src/types/listing.ts` file contains TypeScript interfaces for type safety when working with listing data.
