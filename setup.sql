
-- Enable Row Level Security (RLS)
-- Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  section TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Newsletter Table
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Agenda Table
CREATE TABLE IF NOT EXISTS agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Messages Table (Recadinhos)
CREATE TABLE IF NOT EXISTS recadinhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE recadinhos ENABLE ROW LEVEL SECURITY;

-- Simple Public Access Policy (Allow anyone to read)
CREATE POLICY "Public read access for articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read access for comments" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read access for agenda" ON agenda FOR SELECT USING (true);
CREATE POLICY "Public read access for recadinhos" ON recadinhos FOR SELECT USING (true);

-- Insert policy for public actions
CREATE POLICY "Allow public insert for newsletter" ON newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert for recadinhos" ON recadinhos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert for comments" ON comments FOR INSERT WITH CHECK (true);

-- Administrative Policies (For demo purposes, open for authenticated/all while in dev)
CREATE POLICY "Allow management for everyone" ON articles FOR ALL USING (true) WITH CHECK (true);
