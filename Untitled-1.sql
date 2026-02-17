-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.artworks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artist_id uuid NOT NULL,
  category_id uuid,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  is_featured boolean DEFAULT false,
  is_sold boolean DEFAULT false,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  dimensions text,
  medium text,
  year_created integer,
  tags ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid,
  CONSTRAINT artworks_pkey PRIMARY KEY (id),
  CONSTRAINT artworks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.users(id),
  CONSTRAINT artworks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT artworks_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  artwork_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chat_id uuid,
  sender_id uuid,
  message text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.support_chats(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.collaboration_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  collaboration_id uuid,
  user_id uuid,
  role character varying DEFAULT 'collaborator'::character varying,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT collaboration_members_pkey PRIMARY KEY (id),
  CONSTRAINT collaboration_members_collaboration_id_fkey FOREIGN KEY (collaboration_id) REFERENCES public.collaborations(id),
  CONSTRAINT collaboration_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.collaborations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  creator_id uuid,
  title character varying NOT NULL,
  description text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'completed'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT collaborations_pkey PRIMARY KEY (id),
  CONSTRAINT collaborations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.collection_artworks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  collection_id uuid,
  artwork_id uuid,
  added_at timestamp without time zone DEFAULT now(),
  CONSTRAINT collection_artworks_pkey PRIMARY KEY (id),
  CONSTRAINT collection_artworks_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id),
  CONSTRAINT collection_artworks_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id)
);
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name character varying NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  cover_image_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.email_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])),
  error_message text,
  attempts integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_queue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exhibitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  image_url text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'completed'::text, 'cancelled'::text])),
  visitors_count integer DEFAULT 0,
  artworks_count integer DEFAULT 0,
  hours text,
  artist text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exhibitions_pkey PRIMARY KEY (id),
  CONSTRAINT exhibitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  artwork_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT likes_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reviewer_id uuid NOT NULL,
  artwork_id uuid,
  artist_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id),
  CONSTRAINT reviews_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id),
  CONSTRAINT reviews_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.users(id)
);
CREATE TABLE public.support_chats (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'closed'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT support_chats_pkey PRIMARY KEY (id),
  CONSTRAINT support_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  transaction_code text NOT NULL UNIQUE,
  buyer_id uuid NOT NULL,
  artwork_id uuid,
  artist_id uuid NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  artist_earnings numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['credit_card'::text, 'debit_card'::text, 'upi'::text, 'net_banking'::text, 'wallet'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
  payment_gateway_id text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  transaction_type text DEFAULT 'purchase'::text CHECK (transaction_type = ANY (ARRAY['purchase'::text, 'support'::text])),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id),
  CONSTRAINT transactions_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id),
  CONSTRAINT transactions_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  location text,
  avatar_url text,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'artist'::text, 'collector'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text, 'banned'::text])),
  bio text,
  website text,
  upi_id text,
  upi_qr_code text,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_active_at timestamp with time zone DEFAULT now(),
  is_verified boolean DEFAULT false,
  verification_date timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.visit_bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  visitor_name text NOT NULL,
  visitor_email text NOT NULL,
  visitor_phone text NOT NULL,
  visit_date date NOT NULL,
  visit_time time without time zone NOT NULL,
  number_of_visitors integer NOT NULL CHECK (number_of_visitors > 0),
  special_requirements text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT visit_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT visit_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);