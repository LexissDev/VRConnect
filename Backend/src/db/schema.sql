-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles Table (Users)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Worlds Table (Cache of VRChat worlds or Custom worlds)
create table if not exists worlds (
  id text primary key, -- VRChat World ID (wrld_...) or UUID
  name text not null,
  description text,
  image_url text,
  creator_id uuid references profiles(id), -- If it's a locally created world
  favorites int default 0,
  occupants int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Confessions Table
create table if not exists confessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  content text not null,
  is_anonymous boolean default true,
  category text,
  community text,
  is_hidden boolean default false,
  likes_count int default 0,
  dislikes_count int default 0,
  reports_count int default 0,
  reaction_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Confession Reactions
create table if not exists confession_reactions (
  confession_id uuid references confessions(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  reaction_type text not null, -- 'like', 'love', 'haha', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (confession_id, user_id)
);

-- Confession Comments
create table if not exists confession_comments (
  id uuid default uuid_generate_v4() primary key,
  confession_id uuid references confessions(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  is_anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Confession Reports
create table if not exists confession_reports (
  id uuid default uuid_generate_v4() primary key,
  confession_id uuid references confessions(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events Table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  world_id text references worlds(id), -- Nullable if generic event? But enforced in UI logic
  creator_id uuid references profiles(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  image_url text, -- Custom event image or world thumbnail
  is_custom_image boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Likes Table (For Worlds)
create table if not exists likes (
  user_id uuid references profiles(id) on delete cascade not null,
  world_id text references worlds(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, world_id)
);

-- RLS Policies (Row Level Security) - Examples
-- alter table profiles enable row level security;
-- create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
-- create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
-- create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );
