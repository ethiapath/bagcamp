# Bagcamp Database ER Diagram

This diagram represents the database schema for the Bagcamp application.

```
erDiagram
users ||--|| profiles : has
users ||--o| artists : has
artists ||--o{ releases : creates
releases ||--o{ tracks : contains
artists ||--o{ merchandise : sells
merchandise ||--o{ merchandise_variations : has

users {
    uuid id PK
    string email
    string password_hash
    timestamp created_at
    timestamp last_sign_in
}

profiles {
    uuid id PK, FK
    string email
    string name
    string avatar_url
    timestamp created_at
    timestamp updated_at
}

artists {
    uuid id PK, FK
    string name
    text bio
    string location
    string[] genres
    string image_url
    string website_url
    jsonb social_links
    timestamp created_at
    timestamp updated_at
}

releases {
    uuid id PK
    string title
    string type
    int year
    text description
    string cover_image_url
    uuid artist_id FK
    decimal price
    boolean allow_name_your_price
    decimal minimum_price
    boolean streaming_enabled
    int streaming_limit
    boolean published
    timestamp created_at
    timestamp updated_at
}

tracks {
    uuid id PK
    string title
    uuid release_id FK
    int track_number
    int duration
    string audio_url
    string preview_url
    int preview_duration
    text lyrics
    text credits
    timestamp created_at
    timestamp updated_at
}

merchandise {
    uuid id PK
    string title
    text description
    string type
    uuid artist_id FK
    decimal price
    string image_url
    int inventory_count
    boolean physical
    boolean has_variations
    timestamp created_at
    timestamp updated_at
}

merchandise_variations {
    uuid id PK
    uuid merchandise_id FK
    string attribute_name
    string attribute_value
    decimal price_adjustment
    int inventory_count
    timestamp created_at
    timestamp updated_at
}
```

## Notes on the Database Schema

1. **Authentication & Users**:
   - The `users` table is managed by Supabase Auth
   - Each user can have one profile
   - A user may optionally have an artist profile

2. **Profiles & Artists**:
   - `profiles` store basic user information
   - `artists` contain additional fields for musicians/creators
   - Artist profiles have a one-to-one relationship with users

3. **Music & Content**:
   - Artists can create multiple `releases` (albums, EPs, singles)
   - Each release contains multiple `tracks`
   - Release types include album, EP, single, and mix

4. **Merchandise**:
   - Artists can sell `merchandise` (physical or digital)
   - Merchandise items can have `variations` (sizes, colors, etc.)

5. **Security**:
   - All tables implement Row Level Security (RLS)
   - Policies ensure users can only access/modify their own data
   - Public data (like published releases) is accessible to all users

6. **Transactions**:
   - Future implementation will add tables for orders and transactions 